#!/usr/bin/env node

/**
 * Hook adapter: connects the methodology hooks to Claude Code's hook protocol.
 *
 * Claude Code matches hooks by tool name (Agent, Skill) and sends a JSON
 * payload on stdin. The methodology hooks were written for specific agents and
 * commands, and print plain text for the researcher. This adapter:
 *
 *   1. reads the payload and works out which agent or skill the call targets
 *   2. skips quietly unless that target is one the hook was written for
 *   3. runs the original hook script from the researcher's project directory
 *   4. turns its output into the JSON Claude Code reads
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
  'session-reflect.js': { agents: [], skills: [] }
};

// Stop hooks are registered in a skill's own frontmatter, so the skill has
// already scoped them. SessionEnd hooks apply to every session.
const ALWAYS_EVENTS = new Set(['Stop', 'SessionEnd']);

// A background agent returns from its tool call as soon as it launches. Its
// after-agent hooks wait for SubagentStop, matched by agent ID.
const PENDING_DIR = path.join(os.tmpdir(), 'interpretive-orchestration-hooks');

const CONFIRM_NOTE =
  'Interpretive Orchestration: the Stage 1 check did not pass for this command. ' +
  'Before doing anything else, tell the researcher what the check found (below) and ask ' +
  'whether they want to proceed anyway, and why. Continue only if they confirm.';

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

function targetOf(payload) {
  const event = payload.hook_event_name;
  const input = payload.tool_input || {};
  if (event === 'PreToolUse' || event === 'PostToolUse') {
    if (payload.tool_name === 'Agent' || payload.tool_name === 'Task') {
      return { kind: 'agent', name: baseName(input.subagent_type) };
    }
    if (payload.tool_name === 'Skill') {
      return { kind: 'skill', name: baseName(input.skill) };
    }
  }
  if (event === 'UserPromptExpansion') {
    return { kind: 'skill', name: baseName(payload.command_name) };
  }
  if (event === 'SubagentStop') {
    return { kind: 'agent', name: baseName(payload.agent_type) };
  }
  return { kind: 'other', name: '' };
}

function backgroundAgentId(payload) {
  const response = payload.tool_response;
  if (!response || typeof response !== 'object') return null;
  return response.status === 'async_launched' && response.agentId ? String(response.agentId) : null;
}

function pendingMarker(agentId, script) {
  return path.join(PENDING_DIR, `${String(agentId).replace(/[^\w-]/g, '')}.${script}`);
}

// Returns true when this call should wait for, or was waiting for, SubagentStop.
function deferForBackgroundAgent(script, payload) {
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
  if (target.kind === 'agent') return triggers.agents.includes(target.name);
  if (target.kind === 'skill') return triggers.skills.includes(target.name);
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
  if (payload && !isTriggered(script, payload)) process.exit(0);
  if (payload && deferForBackgroundAgent(script, payload)) process.exit(0);

  const result = spawnSync(process.execPath, [path.join(__dirname, script)], {
    cwd: projectDir(payload),
    input: '',
    encoding: 'utf8'
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

  if (event === 'PreToolUse') {
    if (flagged) {
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
  } else if (event === 'UserPromptExpansion') {
    if (flagged) {
      emit({
        systemMessage: text || details,
        hookSpecificOutput: {
          hookEventName: 'UserPromptExpansion',
          additionalContext: `${CONFIRM_NOTE}\n\n${forClaude}`
        }
      });
    } else if (text) {
      emit({ systemMessage: text });
    }
  } else if (event === 'PostToolUse') {
    if (text || details) {
      emit({
        systemMessage: text || details,
        hookSpecificOutput: {
          hookEventName: 'PostToolUse',
          additionalContext: `Interpretive Orchestration showed the researcher this methodology notice:\n\n${forClaude}`
        }
      });
    }
  } else if (event === 'Stop' || event === 'SubagentStop') {
    // Claude has finished this turn, or the background agent has finished,
    // so the notice goes to the researcher.
    if (text || details) emit({ systemMessage: text || details });
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
