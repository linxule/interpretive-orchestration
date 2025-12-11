#!/usr/bin/env node
/**
 * read-config.js
 * Reads and returns the current project configuration
 *
 * Usage:
 *   node read-config.js --project-path /path/to/project
 *
 * Returns JSON with:
 * - success: boolean
 * - config: the full config object (if success)
 * - error: error message (if failure)
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

function readConfig(projectPath) {
  const configPath = path.join(projectPath, '.interpretive-orchestration', 'config.json');

  // Check if config exists
  if (!fs.existsSync(configPath)) {
    return {
      success: false,
      error: 'Config not found',
      path: configPath,
      suggestion: 'Run project initialization first: use project-setup skill or /qual-init'
    };
  }

  try {
    const content = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(content);

    return {
      success: true,
      path: configPath,
      config: config,
      summary: {
        project_name: config.project_info?.name,
        current_stage: config.sandwich_status?.current_stage,
        stage1_complete: config.sandwich_status?.stage1_complete,
        documents_coded: config.sandwich_status?.stage1_details?.documents_manually_coded || 0,
        memos_written: config.sandwich_status?.stage1_details?.memos_written || 0,
        philosophical_stance: {
          ontology: config.philosophical_stance?.ontology,
          tradition: config.philosophical_stance?.tradition,
          ai_relationship: config.philosophical_stance?.ai_relationship
        }
      }
    };

  } catch (error) {
    return {
      success: false,
      error: `Failed to parse config: ${error.message}`,
      path: configPath
    };
  }
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

if (!fs.existsSync(projectPath)) {
  console.error(JSON.stringify({
    success: false,
    error: `Project path does not exist: ${projectPath}`
  }));
  process.exit(1);
}

const result = readConfig(resolvedPath);
console.log(JSON.stringify(result, null, 2));

process.exit(result.success ? 0 : 1);
