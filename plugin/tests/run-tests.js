#!/usr/bin/env node

/**
 * Interpretive Orchestration Plugin - Test Runner
 *
 * Simple test runner for hooks and schema validation.
 * Run with: npm test
 */

const path = require('path');

console.log('');
console.log('='.repeat(60));
console.log('  Interpretive Orchestration - Test Suite');
console.log('='.repeat(60));
console.log('');

const tests = [
  { name: 'Hook Tests', file: './test-hooks.js' },
  { name: 'Schema Tests', file: './test-schemas.js' }
];

let totalPassed = 0;
let totalFailed = 0;

async function runTests() {
  for (const test of tests) {
    console.log(`\n📋 Running: ${test.name}`);
    console.log('-'.repeat(40));

    try {
      const testModule = require(test.file);
      const results = await testModule.run();

      totalPassed += results.passed;
      totalFailed += results.failed;

      console.log(`   ✓ Passed: ${results.passed}`);
      if (results.failed > 0) {
        console.log(`   ✗ Failed: ${results.failed}`);
      }
    } catch (error) {
      console.log(`   ✗ Error loading test: ${error.message}`);
      totalFailed += 1;
    }
  }

  console.log('');
  console.log('='.repeat(60));
  console.log(`  Total: ${totalPassed} passed, ${totalFailed} failed`);
  console.log('='.repeat(60));
  console.log('');

  process.exit(totalFailed > 0 ? 1 : 0);
}

runTests();
