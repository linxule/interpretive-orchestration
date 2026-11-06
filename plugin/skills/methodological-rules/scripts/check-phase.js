#!/usr/bin/env node
/**
 * check-phase.js
 * Returns current phase and which rules should be relaxed
 *
 * Usage:
 *   node check-phase.js --project-path /path/to/project
 *
 * Returns JSON with:
 *   - current_phase
 *   - rules_should_relax (array of rule names)
 *   - phase_details
 */

const fs = require('fs');
const path = require('path');
const { checkPhase } = require('./phase.js');

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].replace('--', '');
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true;
      parsed[key] = value;
    }
  }
  return parsed;
}

const args = parseArgs();

if (!args['project-path']) {
  console.error(JSON.stringify({
    success: false,
    error: 'Missing required argument: --project-path'
  }));
  process.exit(1);
}

const projectPath = path.resolve(args['project-path']);
const configPath = path.join(projectPath, '.interpretive-orchestration', 'config.json');

if (!fs.existsSync(configPath)) {
  console.error(JSON.stringify({
    success: false,
    error: 'Config not found'
  }));
  process.exit(1);
}

let config;
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (e) {
  console.error(JSON.stringify({
    success: false,
    error: `Failed to parse config: ${e.message}`
  }));
  process.exit(1);
}

const result = checkPhase(config);

console.log(JSON.stringify(result, null, 2));
process.exit(0);
