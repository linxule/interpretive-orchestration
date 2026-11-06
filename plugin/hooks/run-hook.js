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

// The agents and skills each hook was written for. stopHook marks a script
// that is also a skill's own Stop hook, and says how it speaks at Stop (see
// quietAtStop): 'quiet', or 'quiet-after-first-run'.
const TRIGGERS = {
  'check-stage1-complete.js': {
    agents: ['dialogical-coder'],
    skills: ['qual-parallel-streams', 'qual-synthesize', 'qual-code-deductive', 'qual-characterize-patterns']
  },
  'interpretive-pause.js': { agents: ['dialogical-coder'], skills: [] },
  'check-coherence.js': { agents: ['dialogical-coder'], skills: [] },
  'generate-audit-trail.js': { agents: [], skills: ['qual-synthesize'], stopHook: 'quiet-after-first-run' },
  'post-phase-transition.js': {
    agents: ['dialogical-coder'],
    skills: ['qual-advance-stage', 'qual-complete-stage1', 'qual-parallel-streams', 'qual-synthesize', 'qual-characterize-patterns'],
    stopHook: 'quiet'
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

// Codex, Copilot CLI and Kimi Code ignore the hooks in a skill's frontmatter.
// There the plugin's own Stop hook stands in for them, and runs after one of
// the hook's skills was loaded. In hooks.json and codex-hooks.json these
// stand-in hooks pass "after-skill"; Kimi is detected, so its manifest does not.
const SKILL_STOP_SCRIPTS = new Set(Object.keys(TRIGGERS).filter(script => TRIGGERS[script].stopHook));
const AFTER_SKILL = process.argv[3] === 'after-skill';

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
    return raw.trim() ? normalize(JSON.parse(raw)) : null;
  } catch (error) {
    return null;
  }
}

// Copilot CLI's userPromptTransformed event, a typed slash command that
// arrives already expanded, has no hook_event_name and names the session
// sessionId. Give it the names the other events use.
function normalize(payload) {
  if (!payload.hook_event_name && typeof payload.transformedPrompt === 'string') {
    payload.hook_event_name = 'userPromptTransformed';
  }
  if (!payload.session_id && payload.sessionId) payload.session_id = payload.sessionId;
  return payload;
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
  if (event === 'userPromptTransformed') {
    const match = payload.transformedPrompt.match(/<skill-context name="([^"]+)">/);
    return { kind: 'skill', name: match ? baseName(match[1]) : '' };
  }
  if (event === 'SubagentStop') {
    return { kind: 'agent', name: baseName(payload.agent_type || payload.agent_name) };
  }
  return { kind: 'other', name: '' };
}

// Marker files are named from a session or agent ID and parts such as the
// script name, kept to safe characters.
function markerPath(id, ...parts) {
  const name = [String(id).replace(/[^\w-]/g, ''), ...parts.map(part => String(part).replace(/[^\w.-]/g, ''))];
  return path.join(PENDING_DIR, name.join('.'));
}

function sessionMarker(payload, ...parts) {
  return markerPath(payload.session_id || 'session', ...parts);
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

// Kimi only: true when the researcher has replied since this call was held
// back, so it goes through without the check.
function kimiPass(script, payload, target) {
  return payload.hook_event_name === 'PreToolUse' &&
    takeMarker(sessionMarker(payload, target.name, script, 'confirmed'), KIMI_CONFIRM_WINDOW_MS);
}

// Stand-in for a skill's frontmatter Stop hook: true when the call should exit
// without running the script. Loading one of the script's skills leaves a
// marker for the session, and from then on Stop runs the script. The Skill tool
// returns once the instructions load, before the skill's work is done, so the
// script never runs at the load itself.
//   Kimi:    the Skill tool (PostToolUse)
//   Copilot: the lowercase skill tool (PostToolUse) or a typed slash command
//   Codex:   a $skill mention in the prompt (UserPromptSubmit, registered only
//            in codex-hooks.json)
// Claude Code runs the frontmatter hooks itself. It never leaves the marker,
// since it is none of the above, so there the stand-ins in hooks.json do nothing.
function skillStopSkip(script, payload, target) {
  if (!SKILL_STOP_SCRIPTS.has(script) || !(ON_KIMI || AFTER_SKILL)) return false;
  const event = payload.hook_event_name;
  const marker = sessionMarker(payload, script, 'stop');
  if (event === 'Stop') return !fs.existsSync(marker);
  // On Kimi the phase transition also follows @dialogical-coder, as everywhere.
  if (target.kind !== 'skill') return AFTER_SKILL;
  // Copilot reports a skill that failed to load as a non-success result.
  const result = payload.tool_result && payload.tool_result.result_type;
  const failed = Boolean(result) && result !== 'success';
  const loaded = (event === 'PostToolUse' && (ON_KIMI || ON_COPILOT) && !failed) ||
    (ON_COPILOT && event === 'userPromptTransformed') ||
    (AFTER_SKILL && event === 'UserPromptSubmit');
  if (loaded) putMarker(marker);
  return true;
}

// A skill's Stop hooks run at the end of every turn once the skill has
// started, because its work can span several turns. So at Stop they report
// only news: rules that changed, a problem, or the audit trail's first run.
// The audit trail is rewritten each time, so it covers the whole synthesis.
// Only a run that wrote the audit trail counts as its first run (see main).
function quietAtStop(script, payload) {
  const stopHook = TRIGGERS[script].stopHook;
  if (payload.hook_event_name !== 'Stop' || !stopHook) return false;
  return stopHook === 'quiet' ||
    (Boolean(payload.session_id) && fs.existsSync(sessionMarker(payload, script, 'ran')));
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

// Returns true when this call should wait for, or was waiting for, SubagentStop.
function deferForBackgroundAgent(script, payload) {
  // The Kimi manifest registers no SubagentStop, so a deferred hook would never run.
  if (ON_KIMI) return false;
  const event = payload.hook_event_name;
  if (event === 'PostToolUse') {
    const agentId = backgroundAgentId(payload);
    if (!agentId) return false;
    putMarker(markerPath(agentId, script));
    return true;
  }
  // Only the SubagentStop of an agent this hook deferred runs it.
  return event === 'SubagentStop' && !takeMarker(markerPath(payload.agent_id, script));
}

function isTriggered(script, payload, target) {
  if (ALWAYS_EVENTS.has(payload.hook_event_name)) return true;
  const listed = { agent: TRIGGERS[script].agents, skill: TRIGGERS[script].skills }[target.kind] || [];
  return [].concat(target.name).some(name => listed.includes(name));
}

// Runs the hook script from the researcher's project directory.
function runScript(script, cwd, quiet) {
  return spawnSync(process.execPath, [path.join(__dirname, script)], {
    cwd: [cwd, process.env.CLAUDE_PROJECT_DIR, process.cwd()].find(dir => dir && fs.existsSync(dir)),
    input: '',
    encoding: 'utf8',
    env: { ...process.env, INTERPRETIVE_ORCHESTRATION_QUIET: quiet ? '1' : '' }
  });
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
  if (!payload) {
    // Run by hand: the script runs as before and its output passes straight through.
    const result = runScript(script, null, false);
    process.stdout.write(result.stdout || '');
    process.stderr.write(result.stderr || '');
    process.exit(result.status === null ? 1 : result.status);
  }

  const event = payload.hook_event_name;
  const target = targetOf(payload);
  if (ON_KIMI && event === 'UserPromptSubmit') armKimiPasses(payload);
  const kimiStance = isKimiStance(script, payload);
  const stanceShown = kimiStance && sessionMarker(payload, script, 'shown');
  if (stanceShown && fs.existsSync(stanceShown)) process.exit(0);
  if (!kimiStance && !isTriggered(script, payload, target)) process.exit(0);
  if (skillStopSkip(script, payload, target)) process.exit(0);
  if (ON_KIMI && kimiPass(script, payload, target)) process.exit(0);
  if (deferForBackgroundAgent(script, payload)) process.exit(0);

  const quiet = quietAtStop(script, payload);
  const result = runScript(script, payload.cwd, quiet);
  const text = tidy(result.stdout);
  const details = tidy(result.stderr);
  const flagged = result.status !== 0;
  const notice = text || details;
  const forClaude = details ? `${text}\n\nStructured details: ${details}` : text;
  const copilotNotice = { additionalContext: `${COPILOT_NOTICE}\n\n${forClaude}` };

  // An audit trail that was written makes later runs in the session quiet. A
  // run outside a project prints nothing, and a failed one exits non-zero.
  if (event === 'Stop' && TRIGGERS[script].stopHook === 'quiet-after-first-run' &&
      !quiet && !flagged && text && payload.session_id) {
    putMarker(sessionMarker(payload, script, 'ran'));
  }

  if (kimiStance) {
    // Outside a project the stance prints nothing, so it can still come
    // later in the session, once /qual-init has made one.
    if (text) {
      putMarker(stanceShown);
      emit({ message: text });
    }
  } else if (event === 'PreToolUse') {
    if (flagged && ON_KIMI) {
      putMarker(sessionMarker(payload, target.name, script, 'held'));
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
          permissionDecisionReason: notice
        }
      });
    } else if (text) {
      emit({ systemMessage: text });
    }
  } else if (event === 'UserPromptExpansion' || event === 'UserPromptSubmit') {
    if (flagged) {
      emit({
        systemMessage: notice,
        hookSpecificOutput: {
          hookEventName: event,
          additionalContext: `${CONFIRM_NOTE}\n\n${forClaude}`
        }
      });
    } else if (text) {
      emit({ systemMessage: text });
    }
  } else if (event === 'userPromptTransformed') {
    if (flagged) {
      emit({ modifiedTransformedPrompt: `${CONFIRM_NOTE}\n\n${forClaude}\n\n${payload.transformedPrompt}` });
    }
  } else if (event === 'PostToolUse') {
    if (notice) {
      emit(ON_COPILOT ? copilotNotice : {
        systemMessage: notice,
        hookSpecificOutput: {
          hookEventName: 'PostToolUse',
          additionalContext: `Interpretive Orchestration showed the researcher this methodology notice:\n\n${forClaude}`
        }
      });
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
    if (notice) emit(ON_COPILOT ? copilotNotice : { systemMessage: notice });
  }

  process.exit(0);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    // A broken adapter must never block the researcher's work.
    console.error(`run-hook: ${error.message}`);
    process.exit(0);
  }
}

// For the tests.
module.exports = { TRIGGERS, SKILL_STOP_SCRIPTS };
