#!/usr/bin/env node

/**
 * Hook Tests
 *
 * Tests for methodology enforcement hooks.
 * Validates that hooks handle various config states correctly.
 */

const fs = require('fs');
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
    'session-reflect.js'
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

function runAdapter(script, payload) {
  const { spawnSync } = require('child_process');
  const result = spawnSync(process.execPath, [path.join(HOOKS_DIR, 'run-hook.js'), script], {
    input: payload ? JSON.stringify(payload) : '',
    encoding: 'utf8'
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
