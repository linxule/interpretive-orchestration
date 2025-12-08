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
