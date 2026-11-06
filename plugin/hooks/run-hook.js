#!/usr/bin/env node

/**
 * Hook adapter: connects the methodology hooks to each platform's hook protocol.
 *
 * Claude Code, Codex, Copilot CLI and Kimi Code send a JSON payload on stdin.
 * The methodology hooks were written for specific agents and commands, and
 * print plain text for the researcher. This adapter:
 *
 *   1. reads the payload and works out which agent or skill the call targets
 *   2. skips quietly unless that target is one the hook was written for
 *   3. runs the original hook script from the researcher's project directory
 *   4. turns its output into the JSON the platform reads
 *
 * Platform differences are handled next to the code they affect, under
 * ON_COPILOT, ON_KIMI and the Codex prompt check.
 *
 * Run without a payload (for example from a terminal), the hook script runs
 * exactly as before and its output passes straight through.
 *
 * Usage: node run-hook.js <hook-script.js>
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

// The agents and skills each hook was written for.
const TRIGGERS = {
  'check-stage1-complete.js': {
    agents: ['dialogical-coder'],
    skills: ['qual-parallel-streams', 'qual-synthesize', 'qual-code-deductive', 'qual-characterize-patterns']
  },
  'interpretive-pause.js': { agents: ['dialogical-coder'], skills: [] },
  'check-coherence.js': { agents: ['dialogical-coder'], skills: [] },
  'generate-audit-trail.js': { agents: [], skills: ['qual-synthesize'] },
  'post-phase-transition.js': {
    agents: ['dialogical-coder'],
    skills: ['qual-advance-stage', 'qual-complete-stage1', 'qual-parallel-streams', 'qual-synthesize', 'qual-characterize-patterns']
  },
  'session-reflect.js': { agents: [], skills: [] },
  'session-stance.js': { agents: [], skills: [] }
};

// Stop hooks are registered in a skill's own frontmatter, so the skill has
// already scoped them. Session hooks apply to every session.
const ALWAYS_EVENTS = new Set(['Stop', 'SessionStart', 'SessionEnd']);

// A background agent returns from its tool call as soon as it launches. Its
// after-agent hooks wait for SubagentStop, matched by agent ID.
const PENDING_DIR = path.join(os.tmpdir(), 'interpretive-orchestration-hooks');

// Copilot CLI never shows systemMessage to the researcher, and reads
// additionalContext only at the top level of the hook output.
const ON_COPILOT = Boolean(process.env.COPILOT_PLUGIN_ROOT);

// Kimi Code's PreToolUse hooks can only allow or deny ("ask" counts as allow),
// and no other hook output reaches the model or the researcher. So the Stage 1
// check denies the call, and lets one retry through after the researcher replies.
const ON_KIMI = Boolean(process.env.KIMI_PLUGIN_ROOT);

const KIMI_HOLD_NOTE =
  'Interpretive Orchestration held this call back: the Stage 1 check did not pass. ' +
  'Tell the researcher what the check found (below) and ask whether they want to proceed ' +
  'anyway, and why. If they confirm, make the same call again. The check lets one call for this ' +
  'agent or skill through after the researcher has replied, within 30 minutes of their reply.';

// When the researcher declines, the pass is never used, so it lapses rather
// than waiting for an unrelated call later in the session.
const KIMI_CONFIRM_WINDOW_MS = 30 * 60 * 1000;

// Kimi ignores the hooks in a skill's frontmatter. The plugin's Stop hook stands
// in for them, and runs after one of the hook's skills was loaded.
const SKILL_STOP_SCRIPTS = new Set(['generate-audit-trail.js', 'post-phase-transition.js']);

const COPILOT_NOTICE =
  'Interpretive Orchestration methodology notice. The researcher has not seen it yet, ' +
  'so pass it on to them in your reply:';

// Codex has no Skill tool: a skill is named in the prompt as $name or
// $interpretive-orchestration:name.
const SKILL_MENTION = /\$(?:interpretive-orchestration:)?([a-z0-9-]+)/g;

const CONFIRM_NOTE =
  'Interpretive Orchestration: the Stage 1 check did not pass for this command. ' +
  'Before doing anything else, tell the researcher what the check found (below) and ask ' +
  'whether they want to proceed anyway, and why. The command itself is not that confirmation: ' +
  'ask, then wait for their answer. Continue only if they confirm.';

function readPayload() {
  if (process.stdin.isTTY) return null;
  try {
    const raw = fs.readFileSync(0, 'utf8');
    return raw.trim() ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

// "interpretive-orchestration:dialogical-coder" -> "dialogical-coder"
function baseName(name) {
  return String(name || '').split(':').pop();
}

// Kimi Code sends the prompt as content parts: [{ type: 'text', text }].
function promptText(payload) {
  const prompt = payload.prompt;
  if (Array.isArray(prompt)) return prompt.map(part => (part && part.text) || '').join('\n');
  return String(prompt || '');
}

// Kimi Code discards SessionStart output, so there the stance runs on the
// first prompt of each session, the one event whose output Kimi shows.
function isKimiStance(script, payload) {
  return ON_KIMI && script === 'session-stance.js' && payload.hook_event_name === 'UserPromptSubmit';
}

function targetOf(payload) {
  const event = payload.hook_event_name;
  const input = payload.tool_input || {};
  if (event === 'PreToolUse' || event === 'PostToolUse') {
    // Copilot CLI sends agent_type and a lowercase skill tool.
    if (['Agent', 'Task', 'AgentSwarm'].includes(payload.tool_name)) {
      return { kind: 'agent', name: baseName(input.subagent_type || input.agent_type) };
    }
    if (payload.tool_name === 'Skill' || payload.tool_name === 'skill') {
      return { kind: 'skill', name: baseName(input.skill) };
    }
  }
  if (event === 'UserPromptExpansion') {
    return { kind: 'skill', name: baseName(payload.command_name) };
  }
  if (event === 'UserPromptSubmit') {
    const names = [...promptText(payload).matchAll(SKILL_MENTION)].map(match => match[1]);
    return { kind: 'skill', name: names };
  }
  if (isCopilotSlashCommand(payload)) {
    const match = payload.transformedPrompt.match(/<skill-context name="([^"]+)">/);
    return { kind: 'skill', name: match ? baseName(match[1]) : '' };
  }
  if (event === 'SubagentStop') {
    return { kind: 'agent', name: baseName(payload.agent_type || payload.agent_name) };
  }
  return { kind: 'other', name: '' };
}

function sessionMarker(payload, ...parts) {
  const session = String(payload.session_id || 'session').replace(/[^\w-]/g, '');
  return path.join(PENDING_DIR, [session, ...parts.map(part => String(part).replace(/[^\w.-]/g, ''))].join('.'));
}

// Consumes a one-use marker and says whether it was there and fresh.
function takeMarker(marker, maxAgeMs = Infinity) {
  if (!fs.existsSync(marker)) return false;
  const fresh = Date.now() - fs.statSync(marker).mtimeMs < maxAgeMs;
  fs.unlinkSync(marker);
  return fresh;
}

function putMarker(marker) {
  fs.mkdirSync(PENDING_DIR, { recursive: true });
  fs.writeFileSync(marker, '');
}

// Kimi only: the researcher's next prompt turns each call held back in this
// session into a pass, so a retry made without asking them is held again.
function armKimiPasses(payload) {
  if (!fs.existsSync(PENDING_DIR)) return;
  const prefix = `${path.basename(sessionMarker(payload))}.`;
  for (const file of fs.readdirSync(PENDING_DIR)) {
    if (!file.startsWith(prefix) || !file.endsWith('.held')) continue;
    putMarker(path.join(PENDING_DIR, `${file.slice(0, -'.held'.length)}.confirmed`));
    fs.unlinkSync(path.join(PENDING_DIR, file));
  }
}

// Kimi only: true when a triggered call should exit without running the script.
function kimiSkip(script, payload) {
  const event = payload.hook_event_name;
  const target = targetOf(payload);
  if (event === 'PreToolUse') {
    return takeMarker(sessionMarker(payload, target.name, script, 'confirmed'), KIMI_CONFIRM_WINDOW_MS);
  }
  // The Skill tool returns once the instructions load, before the skill's work is done.
  if (event === 'PostToolUse' && target.kind === 'skill' && SKILL_STOP_SCRIPTS.has(script)) {
    putMarker(sessionMarker(payload, script, 'stop'));
    return true;
  }
  if (event === 'Stop') {
    return !(SKILL_STOP_SCRIPTS.has(script) && fs.existsSync(sessionMarker(payload, script, 'stop')));
  }
  return false;
}

// A skill's Stop hooks run at the end of every turn once the skill has
// started, because its work can span several turns. So at Stop they report
// only news: rules that changed, a problem, or the audit trail's first run.
// The audit trail is rewritten each time, so it covers the whole synthesis.
function quietAtStop(script, payload) {
  if (payload.hook_event_name !== 'Stop') return false;
  if (script === 'post-phase-transition.js') return true;
  if (script !== 'generate-audit-trail.js' || !payload.session_id) return false;
  const marker = sessionMarker(payload, script, 'ran');
  if (fs.existsSync(marker)) return true;
  putMarker(marker);
  return false;
}

// Copilot CLI's userPromptTransformed event: a typed slash command arrives
// already expanded, with no hook_event_name.
function isCopilotSlashCommand(payload) {
  return !payload.hook_event_name && typeof payload.transformedPrompt === 'string';
}

function backgroundAgentId(payload) {
  const response = payload.tool_response;
  if (response && typeof response === 'object' && response.status === 'async_launched' && response.agentId) {
    return String(response.agentId);
  }
  // Copilot CLI marks the launch in tool_input and puts the ID in the result text.
  const result = payload.tool_result && payload.tool_result.text_result_for_llm;
  const match = (payload.tool_input || {}).mode === 'background' && typeof result === 'string' &&
    result.match(/agent_id: ([\w-]+)/);
  return match ? match[1] : null;
}

function pendingMarker(agentId, script) {
  return path.join(PENDING_DIR, `${String(agentId).replace(/[^\w-]/g, '')}.${script}`);
}

// Returns true when this call should wait for, or was waiting for, SubagentStop.
function deferForBackgroundAgent(script, payload) {
  // The Kimi manifest registers no SubagentStop, so a deferred hook would never run.
  if (ON_KIMI) return false;
  const event = payload.hook_event_name;
  if (event === 'PostToolUse') {
    const agentId = backgroundAgentId(payload);
    if (!agentId) return false;
    fs.mkdirSync(PENDING_DIR, { recursive: true });
    fs.writeFileSync(pendingMarker(agentId, script), '');
    return true;
  }
  if (event === 'SubagentStop') {
    const marker = pendingMarker(payload.agent_id, script);
    if (!fs.existsSync(marker)) return true;
    fs.unlinkSync(marker);
    return false;
  }
  return false;
}

function isTriggered(script, payload) {
  if (ALWAYS_EVENTS.has(payload.hook_event_name)) return true;
  const triggers = TRIGGERS[script];
  const target = targetOf(payload);
  const names = [].concat(target.name);
  if (target.kind === 'agent') return names.some(name => triggers.agents.includes(name));
  if (target.kind === 'skill') return names.some(name => triggers.skills.includes(name));
  return false;
}

function projectDir(payload) {
  const candidates = [payload && payload.cwd, process.env.CLAUDE_PROJECT_DIR, process.cwd()];
  return candidates.find(dir => dir && fs.existsSync(dir));
}

// Trim blank lines at either end but keep the script's indentation.
function tidy(text) {
  return String(text || '').replace(/^(\s*\n)+/, '').replace(/\s+$/, '');
}

function emit(output) {
  process.stdout.write(JSON.stringify(output) + '\n');
}

function main() {
  const script = path.basename(process.argv[2] || '');
  if (!TRIGGERS[script]) {
    console.error(`run-hook: unknown hook script "${process.argv[2] || ''}"`);
    process.exit(0);
  }

  const payload = readPayload();
  if (payload && ON_KIMI && payload.hook_event_name === 'UserPromptSubmit') armKimiPasses(payload);
  const kimiStance = Boolean(payload) && isKimiStance(script, payload);
  const stanceShown = kimiStance && sessionMarker(payload, script, 'shown');
  if (stanceShown && fs.existsSync(stanceShown)) process.exit(0);
  if (payload && !kimiStance && !isTriggered(script, payload)) process.exit(0);
  if (payload && ON_KIMI && kimiSkip(script, payload)) process.exit(0);
  if (payload && deferForBackgroundAgent(script, payload)) process.exit(0);

  const quiet = Boolean(payload) && quietAtStop(script, payload);
  const result = spawnSync(process.execPath, [path.join(__dirname, script)], {
    cwd: projectDir(payload),
    input: '',
    encoding: 'utf8',
    env: { ...process.env, INTERPRETIVE_ORCHESTRATION_QUIET: quiet ? '1' : '' }
  });

  if (!payload) {
    process.stdout.write(result.stdout || '');
    process.stderr.write(result.stderr || '');
    process.exit(result.status === null ? 1 : result.status);
  }

  const text = tidy(result.stdout);
  const details = tidy(result.stderr);
  const flagged = result.status !== 0;
  const forClaude = details ? `${text}\n\nStructured details: ${details}` : text;
  const event = payload.hook_event_name;

  if (kimiStance) {
    // Outside a project the stance prints nothing, so it can still come
    // later in the session, once /qual-init has made one.
    if (text) {
      putMarker(stanceShown);
      emit({ message: text });
    }
  } else if (event === 'PreToolUse') {
    if (flagged && ON_KIMI) {
      putMarker(sessionMarker(payload, targetOf(payload).name, script, 'held'));
      emit({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason: `${KIMI_HOLD_NOTE}\n\n${forClaude}`
        }
      });
    } else if (flagged) {
      emit({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'ask',
          permissionDecisionReason: text || details
        }
      });
    } else if (text) {
      emit({ systemMessage: text });
    }
  } else if (event === 'UserPromptExpansion' || event === 'UserPromptSubmit') {
    if (flagged) {
      emit({
        systemMessage: text || details,
        hookSpecificOutput: {
          hookEventName: event,
          additionalContext: `${CONFIRM_NOTE}\n\n${forClaude}`
        }
      });
    } else if (text) {
      emit({ systemMessage: text });
    }
  } else if (isCopilotSlashCommand(payload)) {
    if (flagged) {
      emit({ modifiedTransformedPrompt: `${CONFIRM_NOTE}\n\n${forClaude}\n\n${payload.transformedPrompt}` });
    }
  } else if (event === 'PostToolUse') {
    if (text || details) {
      if (ON_COPILOT) {
        emit({ additionalContext: `${COPILOT_NOTICE}\n\n${forClaude}` });
      } else {
        emit({
          systemMessage: text || details,
          hookSpecificOutput: {
            hookEventName: 'PostToolUse',
            additionalContext: `Interpretive Orchestration showed the researcher this methodology notice:\n\n${forClaude}`
          }
        });
      }
    }
  } else if (event === 'SessionStart') {
    if (text) {
      emit(ON_COPILOT
        ? { additionalContext: text }
        : { hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: text } });
    }
  } else if (event === 'Stop' || event === 'SubagentStop') {
    // Claude has finished this turn, or the background agent has finished,
    // so the notice goes to the researcher.
    if (text || details) {
      emit(ON_COPILOT
        ? { additionalContext: `${COPILOT_NOTICE}\n\n${forClaude}` }
        : { systemMessage: text || details });
    }
  }

  process.exit(0);
}

try {
  main();
} catch (error) {
  // A broken adapter must never block the researcher's work.
  console.error(`run-hook: ${error.message}`);
  process.exit(0);
}
