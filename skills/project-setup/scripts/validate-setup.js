#!/usr/bin/env node
/**
 * validate-setup.js
 * Validates project setup completeness
 *
 * Usage:
 *   node validate-setup.js --project-path /path/to/project
 */

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    parsed[key] = value;
  }

  return parsed;
}

function validateSetup(projectPath) {
  const results = {
    valid: true,
    checks: [],
    missing: [],
    warnings: []
  };

  // Required directories
  const requiredDirs = [
    '.interpretive-orchestration',
    'stage1-foundation',
    'stage1-foundation/manual-codes',
    'stage1-foundation/memos',
    'stage2-collaboration',
    'stage3-synthesis',
    'outputs'
  ];

  // Required files
  const requiredFiles = [
    '.interpretive-orchestration/config.json',
    '.interpretive-orchestration/reflexivity-journal.md'
  ];

  // Check directories
  for (const dir of requiredDirs) {
    const fullPath = path.join(projectPath, dir);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
      results.checks.push({ type: 'directory', path: dir, status: 'ok' });
    } else {
      results.checks.push({ type: 'directory', path: dir, status: 'missing' });
      results.missing.push(dir);
      results.valid = false;
    }
  }

  // Check files
  for (const file of requiredFiles) {
    const fullPath = path.join(projectPath, file);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      results.checks.push({ type: 'file', path: file, status: 'ok' });
    } else {
      results.checks.push({ type: 'file', path: file, status: 'missing' });
      results.missing.push(file);
      results.valid = false;
    }
  }

  // Validate config.json if it exists
  const configPath = path.join(projectPath, '.interpretive-orchestration', 'config.json');
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

      // Check required fields
      if (!config.project_info?.name) {
        results.warnings.push('config.json missing project_info.name');
      }
      if (!config.project_info?.research_question) {
        results.warnings.push('config.json missing project_info.research_question');
      }
      if (!config.philosophical_stance?.ontology) {
        results.warnings.push('config.json missing philosophical_stance.ontology');
      }
      if (!config.sandwich_status) {
        results.warnings.push('config.json missing sandwich_status');
      }

      // Check Stage 1 status for warnings
      if (config.sandwich_status?.stage1_complete === false) {
        results.warnings.push('Stage 1 not yet complete - manual coding required before Stage 2');
      }

      results.checks.push({ type: 'config_validation', status: 'ok', warnings: results.warnings.length });

    } catch (error) {
      results.checks.push({ type: 'config_validation', status: 'error', error: error.message });
      results.valid = false;
    }
  }

  // Check for Stage 1 progress
  const manualCodesPath = path.join(projectPath, 'stage1-foundation', 'manual-codes');
  const memosPath = path.join(projectPath, 'stage1-foundation', 'memos');

  if (fs.existsSync(manualCodesPath)) {
    const codeFiles = fs.readdirSync(manualCodesPath).filter(f => !f.startsWith('.'));
    results.stage1_progress = {
      manual_code_files: codeFiles.length
    };

    if (codeFiles.length < 10) {
      results.warnings.push(`Only ${codeFiles.length} files in manual-codes/ - recommend 10-15 for Stage 1`);
    }
  }

  if (fs.existsSync(memosPath)) {
    const memoFiles = fs.readdirSync(memosPath).filter(f => !f.startsWith('.'));
    results.stage1_progress = results.stage1_progress || {};
    results.stage1_progress.memo_files = memoFiles.length;

    if (memoFiles.length === 0) {
      results.warnings.push('No memos found in stage1-foundation/memos/ - writing memos deepens analysis');
    }
  }

  return results;
}

// Main execution
const args = parseArgs();

if (!args['project-path']) {
  console.error(JSON.stringify({
    success: false,
    error: 'Missing required argument: --project-path'
  }));
  process.exit(1);
}

const projectPath = args['project-path'];

// Path traversal protection
const resolvedPath = path.resolve(projectPath);
const configTarget = path.join(resolvedPath, '.interpretive-orchestration', 'config.json');
if (!configTarget.startsWith(resolvedPath + path.sep) && configTarget !== resolvedPath) {
  console.error(JSON.stringify({
    success: false,
    error: 'Path traversal detected - invalid project path'
  }));
  process.exit(1);
}

if (!fs.existsSync(resolvedPath)) {
  console.error(JSON.stringify({
    success: false,
    error: `Project path does not exist: ${projectPath}`
  }));
  process.exit(1);
}

const results = validateSetup(resolvedPath);
console.log(JSON.stringify(results, null, 2));

process.exit(results.valid ? 0 : 1);
