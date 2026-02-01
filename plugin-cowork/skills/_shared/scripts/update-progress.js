#!/usr/bin/env node
/**
 * update-progress.js
 * Updates stage/document/memo counts in config.json with atomic write
 *
 * Usage:
 *   node update-progress.js --project-path /path/to/project [options]
 *
 * Options:
 *   --documents-coded N         Set documents_manually_coded count
 *   --increment-documents       Increment documents_manually_coded by 1
 *   --memos-written N           Set memos_written count
 *   --increment-memos           Increment memos_written by 1
 *   --stage1-complete           Mark Stage 1 as complete
 *   --current-stage STAGE       Set current stage (stage1_foundation, stage2_collaboration, stage3_synthesis)
 *   --phase PHASE               Set current Stage 2 phase progress
 *   --quotes-extracted N        Set quotes_extracted count
 *   --concepts-count N          Set concepts_in_framework count
 */

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].replace('--', '');
      const nextArg = args[i + 1];

      // Check if next arg is a value or another flag
      if (nextArg && !nextArg.startsWith('--')) {
        parsed[key] = nextArg;
        i++;
      } else {
        parsed[key] = true;
      }
    }
  }

  return parsed;
}

function atomicWrite(filePath, content) {
  const tempPath = filePath + '.tmp.' + process.pid;

  try {
    fs.writeFileSync(tempPath, content);
    fs.renameSync(tempPath, filePath);
    return { success: true };
  } catch (error) {
    try {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    return { success: false, error: error.message };
  }
}

function updateProgress(projectPath, args) {
  const configPath = path.join(projectPath, '.interpretive-orchestration', 'config.json');

  // Read current config
  if (!fs.existsSync(configPath)) {
    return {
      success: false,
      error: 'Config not found',
      suggestion: 'Initialize project first'
    };
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse config: ${error.message}`
    };
  }

  // Ensure required structures exist
  config.sandwich_status = config.sandwich_status || {};
  config.sandwich_status.stage1_details = config.sandwich_status.stage1_details || {};
  config.sandwich_status.stage2_progress = config.sandwich_status.stage2_progress || {};
  config.coding_progress = config.coding_progress || {};

  const changes = [];

  // Handle document count updates
  if (args['documents-coded'] !== undefined) {
    const count = parseInt(args['documents-coded'], 10);
    if (isNaN(count) || count < 0) {
      return {
        success: false,
        error: `Invalid documents-coded value: ${args['documents-coded']}. Must be a non-negative integer.`
      };
    }
    config.sandwich_status.stage1_details.documents_manually_coded = count;
    // CRITICAL: Also update coding_progress.documents_coded for hook compatibility
    config.coding_progress.documents_coded = count;
    changes.push(`documents_manually_coded set to ${count}`);
    changes.push(`coding_progress.documents_coded synced to ${count}`);
  }

  if (args['increment-documents']) {
    const current = config.sandwich_status.stage1_details.documents_manually_coded || 0;
    const newCount = current + 1;
    config.sandwich_status.stage1_details.documents_manually_coded = newCount;
    // CRITICAL: Also update coding_progress.documents_coded for hook compatibility
    config.coding_progress.documents_coded = newCount;
    changes.push(`documents_manually_coded incremented to ${newCount}`);
    changes.push(`coding_progress.documents_coded synced to ${newCount}`);
  }

  // Handle memo count updates
  if (args['memos-written'] !== undefined) {
    const count = parseInt(args['memos-written'], 10);
    if (isNaN(count) || count < 0) {
      return {
        success: false,
        error: `Invalid memos-written value: ${args['memos-written']}. Must be a non-negative integer.`
      };
    }
    config.sandwich_status.stage1_details.memos_written = count;
    changes.push(`memos_written set to ${count}`);
  }

  if (args['increment-memos']) {
    const current = config.sandwich_status.stage1_details.memos_written || 0;
    config.sandwich_status.stage1_details.memos_written = current + 1;
    changes.push(`memos_written incremented to ${current + 1}`);
  }

  // Handle Stage 1 completion
  if (args['stage1-complete']) {
    config.sandwich_status.stage1_complete = true;
    changes.push('stage1_complete set to true');
  }

  // Handle current stage
  if (args['current-stage']) {
    const validStages = ['stage1_foundation', 'stage2_collaboration', 'stage3_synthesis'];
    if (validStages.includes(args['current-stage'])) {
      config.sandwich_status.current_stage = args['current-stage'];
      changes.push(`current_stage set to ${args['current-stage']}`);
    } else {
      return {
        success: false,
        error: `Invalid stage: ${args['current-stage']}. Valid options: ${validStages.join(', ')}`
      };
    }
  }

  // Handle Stage 2 phase progress
  if (args.phase) {
    const [phaseName, phaseValue] = args.phase.split('=');
    const validPhases = ['phase1_parallel_streams', 'phase2_synthesis', 'phase3_pattern_characterization'];
    const validValues = ['not_started', 'in_progress', 'complete'];

    if (validPhases.includes(phaseName) && validValues.includes(phaseValue)) {
      config.sandwich_status.stage2_progress[phaseName] = phaseValue;
      changes.push(`${phaseName} set to ${phaseValue}`);
    } else {
      return {
        success: false,
        error: `Invalid phase format. Use: phase1_parallel_streams=in_progress`
      };
    }
  }

  // Handle coding progress
  if (args['quotes-extracted'] !== undefined) {
    const count = parseInt(args['quotes-extracted'], 10);
    if (isNaN(count) || count < 0) {
      return {
        success: false,
        error: `Invalid quotes-extracted value: ${args['quotes-extracted']}. Must be a non-negative integer.`
      };
    }
    config.coding_progress.quotes_extracted = count;
    changes.push(`quotes_extracted set to ${count}`);
  }

  if (args['concepts-count'] !== undefined) {
    const count = parseInt(args['concepts-count'], 10);
    if (isNaN(count) || count < 0) {
      return {
        success: false,
        error: `Invalid concepts-count value: ${args['concepts-count']}. Must be a non-negative integer.`
      };
    }
    config.coding_progress.concepts_in_framework = count;
    changes.push(`concepts_in_framework set to ${count}`);
  }

  // Update last coding session timestamp
  if (changes.length > 0) {
    config.coding_progress.last_coding_session = new Date().toISOString();
  }

  // Validate config against schema before writing
  const { validateConfig } = require('./validate-config.js');
  const validation = validateConfig(config);

  if (!validation.valid && !validation.warning) {
    // BLOCKING: Invalid config should not be written
    console.error(JSON.stringify({
      success: false,
      error: 'Configuration validation failed - refusing to write invalid config',
      validation_errors: validation.errors.slice(0, 5)
    }));
    process.exit(1);
  }

  // Write updated config (only if valid)
  const content = JSON.stringify(config, null, 2);
  const writeResult = atomicWrite(configPath, content);

  if (!writeResult.success) {
    return {
      success: false,
      error: `Failed to write config: ${writeResult.error}`
    };
  }

  return {
    success: true,
    changes: changes,
    current_state: {
      current_stage: config.sandwich_status.current_stage,
      stage1_complete: config.sandwich_status.stage1_complete,
      documents_manually_coded: config.sandwich_status.stage1_details.documents_manually_coded,
      memos_written: config.sandwich_status.stage1_details.memos_written
    }
  };
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

// Path traversal protection
const resolvedPath = path.resolve(args['project-path']);
const configTarget = path.join(resolvedPath, '.interpretive-orchestration', 'config.json');
if (!configTarget.startsWith(resolvedPath + path.sep) && configTarget !== resolvedPath) {
  console.error(JSON.stringify({
    success: false,
    error: 'Path traversal detected - invalid project path'
  }));
  process.exit(1);
}

const result = updateProgress(resolvedPath, args);
console.log(JSON.stringify(result, null, 2));

process.exit(result.success ? 0 : 1);
