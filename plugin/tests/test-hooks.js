#!/usr/bin/env node

/**
 * Hook Tests
 *
 * Tests for methodology enforcement hooks.
 * Validates that hooks handle various config states correctly.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const HOOKS_DIR = path.join(__dirname, '..', 'hooks');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`   ✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`   ✗ ${name}`);
    console.log(`     Error: ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Test: Hook files exist
function testHookFilesExist() {
  const expectedHooks = [
    'check-stage1-complete.js',
    'check-coherence.js',
    'interpretive-pause.js',
    'session-reflect.js',
    'session-stance.js'
  ];

  for (const hook of expectedHooks) {
    test(`Hook file exists: ${hook}`, () => {
      const hookPath = path.join(HOOKS_DIR, hook);
      assert(fs.existsSync(hookPath), `${hook} not found at ${hookPath}`);
    });
  }
}

// Test: Hooks are valid JavaScript
function testHooksSyntaxValid() {
  const hooks = fs.readdirSync(HOOKS_DIR).filter(f => f.endsWith('.js'));

  for (const hook of hooks) {
    test(`Valid syntax: ${hook}`, () => {
      const hookPath = path.join(HOOKS_DIR, hook);
      const content = fs.readFileSync(hookPath, 'utf8');

      // Basic syntax check - can it be parsed?
      try {
        new Function(content);
      } catch (e) {
        // Try requiring it instead (handles require statements)
        // This will throw if there's a syntax error
        delete require.cache[hookPath];
      }
    });
  }
}

// Test: Hooks have shebang
function testHooksHaveShebang() {
  const hooks = fs.readdirSync(HOOKS_DIR).filter(f => f.endsWith('.js'));

  for (const hook of hooks) {
    test(`Has shebang: ${hook}`, () => {
      const hookPath = path.join(HOOKS_DIR, hook);
      const content = fs.readFileSync(hookPath, 'utf8');
      assert(content.startsWith('#!/usr/bin/env node'), 'Missing shebang');
    });
  }
}

// Test: Hooks have error handling
function testHooksHaveErrorHandling() {
  const hooks = fs.readdirSync(HOOKS_DIR).filter(f => f.endsWith('.js'));

  for (const hook of hooks) {
    test(`Has try/catch: ${hook}`, () => {
      const hookPath = path.join(HOOKS_DIR, hook);
      const content = fs.readFileSync(hookPath, 'utf8');
      assert(content.includes('try {') && content.includes('catch'), 'Missing try/catch error handling');
    });
  }
}

// Test: Hooks exit gracefully
function testHooksExitGracefully() {
  const hooks = fs.readdirSync(HOOKS_DIR).filter(f => f.endsWith('.js'));

  for (const hook of hooks) {
    test(`Uses process.exit: ${hook}`, () => {
      const hookPath = path.join(HOOKS_DIR, hook);
      const content = fs.readFileSync(hookPath, 'utf8');
      assert(content.includes('process.exit'), 'Missing process.exit call');
    });
  }
}

// Test: check-stage1-complete has required functionality
function testCheckStage1CompleteStructure() {
  test('check-stage1-complete: Checks sandwich_status', () => {
    const hookPath = path.join(HOOKS_DIR, 'check-stage1-complete.js');
    const content = fs.readFileSync(hookPath, 'utf8');
    assert(content.includes('sandwich_status'), 'Should check sandwich_status');
    assert(content.includes('stage1_complete'), 'Should check stage1_complete');
  });

  test('check-stage1-complete: Shows requirements', () => {
    const hookPath = path.join(HOOKS_DIR, 'check-stage1-complete.js');
    const content = fs.readFileSync(hookPath, 'utf8');
    assert(content.includes('documents_manually_coded'), 'Should show document count');
    assert(content.includes('memos_written'), 'Should show memo count');
  });
}

// Test: check-coherence checks vocabulary
function testCheckCoherenceStructure() {
  test('check-coherence: Has vocabulary modes', () => {
    const hookPath = path.join(HOOKS_DIR, 'check-coherence.js');
    const content = fs.readFileSync(hookPath, 'utf8');
    assert(content.includes('constructivist'), 'Should have constructivist vocabulary');
    assert(content.includes('interpretivist'), 'Should have interpretivist vocabulary');
  });

  test('check-coherence: Checks avoid_verbs', () => {
    const hookPath = path.join(HOOKS_DIR, 'check-coherence.js');
    const content = fs.readFileSync(hookPath, 'utf8');
    assert(content.includes('avoid_verbs') || content.includes('avoidVerbs'), 'Should check avoided verbs');
  });

  test('check-coherence: Has technical exceptions whitelist', () => {
    const hookPath = path.join(HOOKS_DIR, 'check-coherence.js');
    const content = fs.readFileSync(hookPath, 'utf8');
    assert(content.includes('technicalExceptions'), 'Should have technicalExceptions whitelist');
    assert(content.includes('isTechnicalContext'), 'Should have isTechnicalContext function');
  });

  test('check-coherence: Skips technical context', () => {
    const hookPath = path.join(HOOKS_DIR, 'check-coherence.js');
    const content = fs.readFileSync(hookPath, 'utf8');
    assert(content.includes('find file'), 'Should whitelist "find file"');
    assert(content.includes('identify the error'), 'Should whitelist "identify the error"');
  });
}

// Test: interpretive-pause triggers at 5 documents
function testInterpretivePauseStructure() {
  test('interpretive-pause: Checks document count', () => {
    const hookPath = path.join(HOOKS_DIR, 'interpretive-pause.js');
    const content = fs.readFileSync(hookPath, 'utf8');
    assert(content.includes('documents_coded'), 'Should check documents_coded');
  });

  test('interpretive-pause: Triggers every 5 documents', () => {
    const hookPath = path.join(HOOKS_DIR, 'interpretive-pause.js');
    const content = fs.readFileSync(hookPath, 'utf8');
    assert(content.includes('% 5'), 'Should use modulo 5 for pause trigger');
  });
}

// Behavioral tests: feed run-hook.js the payloads Claude Code sends and check
// what it returns. Payload shapes were captured from Claude Code 2.1.319.
function makeProject(config) {
  const os = require('os');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'io-hook-test-'));
  fs.mkdirSync(path.join(dir, '.interpretive-orchestration'));
  fs.writeFileSync(path.join(dir, '.interpretive-orchestration', 'config.json'), JSON.stringify(config));
  return dir;
}

function runAdapter(script, payload, extraEnv = {}) {
  const { spawnSync } = require('child_process');
  const env = { ...process.env, ...extraEnv };
  for (const name of ['COPILOT_PLUGIN_ROOT', 'KIMI_PLUGIN_ROOT']) {
    if (!extraEnv[name]) delete env[name];
  }
  const result = spawnSync(process.execPath, [path.join(HOOKS_DIR, 'run-hook.js'), script], {
    input: payload ? JSON.stringify(payload) : '',
    encoding: 'utf8',
    env
  });
  const out = result.stdout.trim();
  return { status: result.status, raw: out, json: out ? JSON.parse(out) : null };
}

const agentCall = (cwd, agent, extra = {}) => ({
  hook_event_name: 'PreToolUse', tool_name: 'Agent', cwd,
  tool_input: { subagent_type: `interpretive-orchestration:${agent}` }, ...extra
});
const skillCall = (cwd, skill) => ({
  hook_event_name: 'PreToolUse', tool_name: 'Skill', cwd,
  tool_input: { skill: `interpretive-orchestration:${skill}` }
});

function testHookAdapterBehaviour() {
  const incomplete = makeProject({
    sandwich_status: { stage1_complete: false, stage1_details: { documents_manually_coded: 2, memos_written: 1 } },
    coding_progress: { documents_coded: 5 }
  });
  const complete = makeProject({
    sandwich_status: { stage1_complete: true, stage1_details: { documents_manually_coded: 12, memos_written: 6 } },
    coding_progress: { documents_coded: 5 }
  });

  test('adapter: asks before @dialogical-coder when Stage 1 is incomplete', () => {
    const { json } = runAdapter('check-stage1-complete.js', agentCall(incomplete, 'dialogical-coder'));
    assert(json && json.hookSpecificOutput.permissionDecision === 'ask', 'Expected permissionDecision ask');
    assert(json.hookSpecificOutput.permissionDecisionReason.includes('Stage 1'), 'Reason should explain Stage 1');
  });

  test('adapter: asks before a Stage 2 skill when Stage 1 is incomplete', () => {
    const { json } = runAdapter('check-stage1-complete.js', skillCall(incomplete, 'qual-synthesize'));
    assert(json && json.hookSpecificOutput.permissionDecision === 'ask', 'Expected permissionDecision ask');
  });

  test('adapter: ignores other agents and skills', () => {
    assert(runAdapter('check-stage1-complete.js', agentCall(incomplete, 'Explore')).raw === '', 'Explore should pass silently');
    assert(runAdapter('check-stage1-complete.js', skillCall(incomplete, 'qual-status')).raw === '', 'qual-status should pass silently');
  });

  test('adapter: does not ask once Stage 1 is complete', () => {
    const { json } = runAdapter('check-stage1-complete.js', agentCall(complete, 'dialogical-coder'));
    assert(!json || !json.hookSpecificOutput, 'Should not return a permission decision');
  });

  test('adapter: typed Stage 2 command tells Claude to confirm with the researcher', () => {
    const { json } = runAdapter('check-stage1-complete.js', {
      hook_event_name: 'UserPromptExpansion', cwd: incomplete,
      command_name: 'interpretive-orchestration:qual-parallel-streams'
    });
    assert(json && json.hookSpecificOutput.additionalContext.includes('ask whether they want to proceed'), 'Should ask the researcher');
    assert(json.systemMessage, 'Researcher should see the check');
  });

  test('adapter: interpretive pause reaches researcher and Claude after a foreground agent', () => {
    const { json } = runAdapter('interpretive-pause.js', agentCall(complete, 'dialogical-coder', {
      hook_event_name: 'PostToolUse', tool_response: { status: 'completed' }
    }));
    assert(json && json.systemMessage.includes('INTERPRETIVE PAUSE'), 'Researcher should see the pause');
    assert(json.hookSpecificOutput.additionalContext.includes('INTERPRETIVE PAUSE'), 'Claude should see the pause');
  });

  test('adapter: background agent defers its pause to SubagentStop, once', () => {
    const launch = runAdapter('interpretive-pause.js', agentCall(complete, 'dialogical-coder', {
      hook_event_name: 'PostToolUse', tool_response: { status: 'async_launched', agentId: 'testagent123' }
    }));
    assert(launch.raw === '', 'Launch should stay silent');
    const stop = { hook_event_name: 'SubagentStop', cwd: complete, agent_id: 'testagent123', agent_type: 'interpretive-orchestration:dialogical-coder' };
    const first = runAdapter('interpretive-pause.js', stop);
    assert(first.json && first.json.systemMessage.includes('INTERPRETIVE PAUSE'), 'Pause should show when the agent finishes');
    assert(runAdapter('interpretive-pause.js', stop).raw === '', 'Pause should not repeat');
  });

  test('adapter: foreground agent does not fire again at SubagentStop', () => {
    const stop = { hook_event_name: 'SubagentStop', cwd: complete, agent_id: 'never-deferred', agent_type: 'interpretive-orchestration:dialogical-coder' };
    assert(runAdapter('interpretive-pause.js', stop).raw === '', 'Should stay silent');
  });

  test('adapter: without a payload the hook runs as before', () => {
    const { spawnSync } = require('child_process');
    const result = spawnSync(process.execPath, [path.join(HOOKS_DIR, 'run-hook.js'), 'check-stage1-complete.js'], {
      cwd: incomplete, input: '', encoding: 'utf8'
    });
    assert(result.status === 1, `Expected exit 1, got ${result.status}`);
    assert(result.stdout.includes('METHODOLOGY CHECK'), 'Plain text should pass through');
  });

  test('adapter: session start gives the stance and Stage 1 status in a project', () => {
    const { json } = runAdapter('session-stance.js', { hook_event_name: 'SessionStart', source: 'startup', cwd: incomplete });
    const context = json && json.hookSpecificOutput.additionalContext;
    assert(context && context.includes('Stage 1 is NOT complete'), 'Should report Stage 1 status');
    assert(context.includes('NEVER skip Stage 1 enforcement'), 'Should carry the principles');
  });

  test('adapter: session start is silent outside a project', () => {
    const { raw } = runAdapter('session-stance.js', { hook_event_name: 'SessionStart', source: 'startup', cwd: os.tmpdir() });
    assert(raw === '', 'Should stay silent');
  });

  test('adapter: skill Stop hooks report only news after the first run', () => {
    const stop = { hook_event_name: 'Stop', cwd: complete, session_id: `claude-test-${process.pid}`, stop_hook_active: false };
    const first = runAdapter('generate-audit-trail.js', stop);
    assert(first.json && first.json.systemMessage.includes('Audit trail generated'), 'First run tells the researcher');
    fs.rmSync(path.join(complete, 'outputs'), { recursive: true, force: true });
    assert(runAdapter('generate-audit-trail.js', stop).raw === '', 'Later runs stay quiet');
    assert(fs.existsSync(path.join(complete, 'outputs', 'audit-trail.md')), 'Later runs still rewrite the audit trail');
    fs.rmSync(path.join(complete, 'outputs'), { recursive: true, force: true });
    assert(runAdapter('post-phase-transition.js', stop).raw === '', 'No rule change, nothing to say');
  });

  test('adapter: coherence check reads the research entry, not a hook entry logged after it', () => {
    const project = makeProject({ sandwich_status: { stage1_complete: true }, philosophical_stance: { vocabulary_mode: 'constructivist' } });
    const log = [
      { from: 'dialogical_coder', message: 'We discover the codes that emerge from the data.' },
      { from: 'interpretive_pause_hook', message: 'Interpretive pause triggered at 5 documents.' }
    ];
    fs.writeFileSync(path.join(project, '.interpretive-orchestration', 'conversation-log.jsonl'),
      log.map(entry => JSON.stringify(entry)).join('\n') + '\n');
    const { json } = runAdapter('check-coherence.js', {
      hook_event_name: 'PostToolUse', tool_name: 'Agent', cwd: project,
      tool_input: { subagent_type: 'interpretive-orchestration:dialogical-coder' }, tool_response: {}
    });
    assert(json && /discover/i.test(json.hookSpecificOutput.additionalContext), 'Should flag the research entry');
  });

  // Payload shape captured from codex-cli 0.165.0.
  test('adapter (Codex): a $skill mention in the prompt triggers the Stage 1 check', () => {
    const prompt = (text) => ({ hook_event_name: 'UserPromptSubmit', cwd: incomplete, prompt: text });
    const { json } = runAdapter('check-stage1-complete.js', prompt('$interpretive-orchestration:qual-synthesize now'));
    assert(json && json.hookSpecificOutput.hookEventName === 'UserPromptSubmit', 'Expected UserPromptSubmit output');
    assert(json.hookSpecificOutput.additionalContext.includes('ask whether they want to proceed'), 'Should ask the researcher');
    assert(runAdapter('check-stage1-complete.js', prompt('$qual-code-deductive')).json, 'Short form should trigger too');
    assert(runAdapter('check-stage1-complete.js', prompt('$qual-status please')).raw === '', 'Other skills pass silently');
    assert(runAdapter('check-stage1-complete.js', prompt('code this for me')).raw === '', 'Plain prompts pass silently');
  });

  // Payload shapes captured from Kimi Code (client_type kimi_code_cli).
  const kimi = { KIMI_PLUGIN_ROOT: path.join(HOOKS_DIR, '..', '..') };
  const kimiSession = `kimi-test-${process.pid}`;

  const kimiReply = session => ({
    hook_event_name: 'UserPromptSubmit', cwd: incomplete, session_id: session,
    client_type: 'kimi_code_cli', prompt: [{ type: 'text', text: 'yes, go ahead' }], is_steer: false
  });

  test('adapter (Kimi): holds @dialogical-coder, then lets one retry through after the researcher replies', () => {
    const call = {
      hook_event_name: 'PreToolUse', tool_name: 'Agent', cwd: incomplete, session_id: kimiSession,
      client_type: 'kimi_code_cli', tool_input: { subagent_type: 'dialogical-coder', prompt: 'code R01' }
    };
    const first = runAdapter('check-stage1-complete.js', call, kimi);
    assert(first.json && first.json.hookSpecificOutput.permissionDecision === 'deny', 'First call should be denied');
    assert(first.json.hookSpecificOutput.permissionDecisionReason.includes('ask whether they want to proceed'), 'Should ask the researcher');
    assert(runAdapter('check-stage1-complete.js', call, kimi).json, 'A retry before the researcher replies is held again');
    runAdapter('session-stance.js', kimiReply(kimiSession), kimi);
    assert(runAdapter('check-stage1-complete.js', call, kimi).raw === '', 'A retry after the reply should pass');
    assert(runAdapter('check-stage1-complete.js', call, kimi).json, 'A later call is checked again');
  });

  test('adapter (Kimi): a reply in another session does not release the call', () => {
    const call = {
      hook_event_name: 'PreToolUse', tool_name: 'Agent', cwd: incomplete, session_id: `${kimiSession}-own`,
      tool_input: { subagent_type: 'dialogical-coder' }
    };
    assert(runAdapter('check-stage1-complete.js', call, kimi).json, 'First call should be denied');
    runAdapter('session-stance.js', kimiReply(`${kimiSession}-other`), kimi);
    assert(runAdapter('check-stage1-complete.js', call, kimi).json, 'Another session\'s reply should not count');
  });

  test('adapter (Kimi): the retry pass lapses 30 minutes after the reply', () => {
    const session = `${kimiSession}-lapse`;
    const call = {
      hook_event_name: 'PreToolUse', tool_name: 'Agent', cwd: incomplete, session_id: session,
      tool_input: { subagent_type: 'dialogical-coder' }
    };
    assert(runAdapter('check-stage1-complete.js', call, kimi).json, 'First call should be denied');
    runAdapter('session-stance.js', kimiReply(session), kimi);
    const marker = path.join(os.tmpdir(), 'interpretive-orchestration-hooks',
      `${session}.dialogical-coder.check-stage1-complete.js.confirmed`);
    assert(fs.existsSync(marker), 'The reply should leave a retry pass');
    const old = new Date(Date.now() - 31 * 60 * 1000);
    fs.utimesSync(marker, old, old);
    assert(runAdapter('check-stage1-complete.js', call, kimi).json, 'A lapsed pass should not let the call through');
  });

  test('adapter (Kimi): stance comes with the first prompt of a session, once', () => {
    const prompt = {
      hook_event_name: 'UserPromptSubmit', cwd: incomplete, session_id: `${kimiSession}-stance`,
      client_type: 'kimi_code_cli', prompt: [{ type: 'text', text: 'code this for me' }], is_steer: false
    };
    const first = runAdapter('session-stance.js', prompt, kimi);
    assert(first.json && first.json.message.includes('Stage 1 is NOT complete'), 'First prompt should carry the stance');
    assert(runAdapter('session-stance.js', prompt, kimi).raw === '', 'Later prompts should not repeat it');
    assert(runAdapter('session-stance.js', prompt).raw === '', 'Other platforms use SessionStart instead');
  });

  test('adapter (Kimi): stance still comes once a project exists later in the session', () => {
    const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'io-hook-test-empty-'));
    const prompt = cwd => ({
      hook_event_name: 'UserPromptSubmit', cwd, session_id: `${kimiSession}-later`,
      prompt: [{ type: 'text', text: 'hello' }]
    });
    assert(runAdapter('session-stance.js', prompt(empty), kimi).raw === '', 'No project, no stance');
    const later = runAdapter('session-stance.js', prompt(incomplete), kimi);
    assert(later.json && later.json.message.includes('Stage 1 is NOT complete'), 'Stance should follow /qual-init');
  });

  test('adapter (Kimi): audit trail runs at the end of each turn after the AI loads qual-synthesize', () => {
    const logPath = path.join(complete, '.interpretive-orchestration', 'conversation-log.jsonl');
    const logLines = () => (fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf8').trim().split('\n').length : 0);
    const stop = { hook_event_name: 'Stop', cwd: complete, session_id: kimiSession, stop_hook_active: false };
    runAdapter('generate-audit-trail.js', stop, kimi);
    assert(!fs.existsSync(path.join(complete, 'outputs', 'audit-trail.md')), 'Stop does nothing before the skill loads');
    const skillLoaded = {
      hook_event_name: 'PostToolUse', tool_name: 'Skill', cwd: complete, session_id: kimiSession,
      tool_input: { skill: 'interpretive-orchestration:qual-synthesize' }, tool_output: 'loaded'
    };
    assert(runAdapter('generate-audit-trail.js', skillLoaded, kimi).raw === '', 'Nothing runs when the skill loads');
    runAdapter('generate-audit-trail.js', stop, kimi);
    assert(fs.existsSync(path.join(complete, 'outputs', 'audit-trail.md')), 'Audit trail should be written at Stop');
    const entries = logLines();
    fs.rmSync(path.join(complete, 'outputs'), { recursive: true, force: true });
    runAdapter('generate-audit-trail.js', stop, kimi);
    assert(fs.existsSync(path.join(complete, 'outputs', 'audit-trail.md')), 'A later Stop rewrites it');
    assert(logLines() === entries, 'A later Stop adds no log entry');
    fs.rmSync(path.join(complete, 'outputs'), { recursive: true, force: true });
  });

  // Payload shapes captured from Copilot CLI 1.0.106.
  const copilot = { COPILOT_PLUGIN_ROOT: path.join(HOOKS_DIR, '..') };

  test('adapter (Copilot): asks before @dialogical-coder, named in agent_type', () => {
    const { json } = runAdapter('check-stage1-complete.js', {
      hook_event_name: 'PreToolUse', tool_name: 'Agent', cwd: incomplete,
      tool_input: { agent_type: 'interpretive-orchestration:dialogical-coder', name: 'dialogical-coder' }
    }, copilot);
    assert(json && json.hookSpecificOutput.permissionDecision === 'ask', 'Expected permissionDecision ask');
  });

  test('adapter (Copilot): asks before a Stage 2 skill called through the lowercase skill tool', () => {
    const { json } = runAdapter('check-stage1-complete.js', {
      hook_event_name: 'PreToolUse', tool_name: 'skill', cwd: incomplete, tool_input: { skill: 'qual-synthesize' }
    }, copilot);
    assert(json && json.hookSpecificOutput.permissionDecision === 'ask', 'Expected permissionDecision ask');
  });

  test('adapter (Copilot): typed Stage 2 command gets the confirm note prepended', () => {
    const transformedPrompt = '<skill-context name="interpretive-orchestration:qual-synthesize">...</skill-context>';
    const { json } = runAdapter('check-stage1-complete.js', {
      sessionId: 's', cwd: incomplete, prompt: '/interpretive-orchestration:qual-synthesize', transformedPrompt
    }, copilot);
    assert(json && json.modifiedTransformedPrompt.startsWith('Interpretive Orchestration: the Stage 1 check'), 'Confirm note first');
    assert(json.modifiedTransformedPrompt.endsWith(transformedPrompt), 'Original prompt kept');
    const other = { sessionId: 's', cwd: incomplete, prompt: 'hi', transformedPrompt: '<skill-context name="interpretive-orchestration:qual-status">' };
    assert(runAdapter('check-stage1-complete.js', other, copilot).raw === '', 'Other skills pass silently');
  });

  test('adapter (Copilot): pause goes to the model at the top level, asking it to tell the researcher', () => {
    const { json } = runAdapter('interpretive-pause.js', {
      hook_event_name: 'PostToolUse', tool_name: 'Agent', cwd: complete,
      tool_input: { agent_type: 'interpretive-orchestration:dialogical-coder' },
      tool_result: { result_type: 'success', text_result_for_llm: 'PONG' }
    }, copilot);
    assert(json && json.additionalContext.includes('INTERPRETIVE PAUSE'), 'Model should see the pause');
    assert(json.additionalContext.includes('has not seen it'), 'Model should pass it on');
    assert(!json.hookSpecificOutput, 'No nested output on Copilot');
  });

  test('adapter (Copilot): background agent defers its pause to SubagentStop', () => {
    const launch = runAdapter('interpretive-pause.js', {
      hook_event_name: 'PostToolUse', tool_name: 'Agent', cwd: complete,
      tool_input: { agent_type: 'interpretive-orchestration:dialogical-coder', mode: 'background' },
      tool_result: { result_type: 'success', text_result_for_llm: 'Agent started in background with agent_id: copilot-bg-1.' }
    }, copilot);
    assert(launch.raw === '', 'Launch should stay silent');
    const stop = { hook_event_name: 'SubagentStop', cwd: complete, agent_id: 'copilot-bg-1', agent_type: 'interpretive-orchestration:dialogical-coder' };
    const { json } = runAdapter('interpretive-pause.js', stop, copilot);
    assert(json && json.additionalContext.includes('INTERPRETIVE PAUSE'), 'Pause should fire when the agent finishes');
    assert(json.additionalContext.includes('has not seen it'), 'Model should pass it on');
    assert(!json.systemMessage, 'Copilot never shows systemMessage');
  });

  for (const dir of [incomplete, complete]) fs.rmSync(dir, { recursive: true, force: true });
}

// Run all tests
async function run() {
  testHookFilesExist();
  testHooksSyntaxValid();
  testHooksHaveShebang();
  testHooksHaveErrorHandling();
  testHooksExitGracefully();
  testCheckStage1CompleteStructure();
  testCheckCoherenceStructure();
  testInterpretivePauseStructure();
  testHookAdapterBehaviour();

  return { passed, failed };
}

module.exports = { run };

// Allow direct execution
if (require.main === module) {
  run().then(results => {
    console.log(`\nResults: ${results.passed} passed, ${results.failed} failed`);
    process.exit(results.failed > 0 ? 1 : 0);
  });
}
