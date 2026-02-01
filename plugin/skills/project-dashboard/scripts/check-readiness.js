#!/usr/bin/env node
/**
 * check-readiness.js
 * Check readiness for stage transitions in the sandwich methodology
 *
 * Usage:
 *   node check-readiness.js --project-path /path/to/project --target-stage stage2
 *
 * Returns:
 *   {
 *     "ready": true,
 *     "requirements_met": ["10+ documents", "memos written"],
 *     "requirements_missing": [],
 *     "recommendations": ["Consider more memos for depth"]
 *   }
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

function readConfig(projectPath) {
  const configPath = path.join(projectPath, '.interpretive-orchestration', 'config.json');
  if (!fs.existsSync(configPath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (error) {
    return null;
  }
}

function countFiles(dirPath, extensions = []) {
  if (!fs.existsSync(dirPath)) return 0;
  try {
    const files = fs.readdirSync(dirPath).filter(f => !f.startsWith('.'));
    if (extensions.length === 0) return files.length;
    return files.filter(f => extensions.some(ext => f.endsWith(ext))).length;
  } catch (error) {
    return 0;
  }
}

function checkStage2Readiness(config, projectPath) {
  const requirements_met = [];
  const requirements_missing = [];
  const recommendations = [];

  // Get actual counts
  const stage1Details = config.sandwich_status?.stage1_details || {};
  let docsManuallyCodeded = stage1Details.documents_manually_coded || 0;
  let memosWritten = stage1Details.memos_written || 0;

  // Fallback to file counting
  if (docsManuallyCodeded === 0) {
    docsManuallyCodeded = countFiles(path.join(projectPath, 'stage1-foundation', 'manual-codes'), ['.md', '.json', '.txt']);
  }
  if (memosWritten === 0) {
    memosWritten = countFiles(path.join(projectPath, 'stage1-foundation', 'memos'), ['.md']);
  }

  // Requirement 1: Minimum 10 documents manually coded
  if (docsManuallyCodeded >= 10) {
    requirements_met.push(`${docsManuallyCodeded} documents manually coded (minimum: 10)`);
  } else {
    requirements_missing.push(`Only ${docsManuallyCodeded} documents coded (need 10 minimum)`);
  }

  // Requirement 2: At least 1 memo
  if (memosWritten >= 1) {
    requirements_met.push(`${memosWritten} analytical memo(s) written`);
  } else {
    requirements_missing.push('No analytical memos written (need at least 1)');
  }

  // Requirement 3: Philosophical stance declared
  if (config.philosophical_stance?.tradition) {
    requirements_met.push(`Philosophical stance declared: ${config.philosophical_stance.tradition}`);
  } else {
    requirements_missing.push('No philosophical stance declared');
  }

  // Recommendations (not blocking)
  if (docsManuallyCodeded < 15) {
    recommendations.push(`Consider coding ${15 - docsManuallyCodeded} more documents for stronger foundation`);
  }
  if (memosWritten < 3) {
    recommendations.push(`Consider writing ${3 - memosWritten} more memos for deeper reflection`);
  }
  if (!config.project_info?.research_question) {
    recommendations.push('Document your research question for clarity');
  }

  const ready = requirements_missing.length === 0;

  return {
    ready,
    target_stage: 'stage2',
    current_status: {
      documents_coded: docsManuallyCodeded,
      memos_written: memosWritten,
      philosophical_stance: config.philosophical_stance?.tradition || null
    },
    requirements_met,
    requirements_missing,
    recommendations,
    action_if_not_ready: ready ? null : 'Complete Stage 1 foundation before proceeding to AI-assisted coding'
  };
}

function checkStage3Readiness(config, projectPath) {
  const requirements_met = [];
  const requirements_missing = [];
  const recommendations = [];

  // Requirement 1: Stage 2 must be complete
  const stage2Progress = config.sandwich_status?.stage2_progress || {};
  const phase1Complete = stage2Progress.phase1_parallel_streams === 'complete';
  const phase2Complete = stage2Progress.phase2_synthesis === 'complete';
  const phase3Complete = stage2Progress.phase3_pattern_characterization === 'complete';

  if (phase1Complete) {
    requirements_met.push('Phase 1 (Parallel Streams) complete');
  } else {
    requirements_missing.push('Phase 1 (Parallel Streams) not complete');
  }

  if (phase2Complete) {
    requirements_met.push('Phase 2 (Synthesis) complete');
  } else {
    requirements_missing.push('Phase 2 (Synthesis) not complete');
  }

  if (phase3Complete) {
    requirements_met.push('Phase 3 (Pattern Characterization) complete');
  } else {
    requirements_missing.push('Phase 3 (Pattern Characterization) not complete');
  }

  // Requirement 2: Sufficient quotes extracted
  const quotesExtracted = config.coding_progress?.quotes_extracted || 0;
  if (quotesExtracted >= 50) {
    requirements_met.push(`${quotesExtracted} quotes extracted (sufficient for analysis)`);
  } else {
    requirements_missing.push(`Only ${quotesExtracted} quotes extracted (recommend 50+ for robust analysis)`);
  }

  // Requirement 3: Data structure populated
  const conceptsCount = config.coding_progress?.concepts_in_framework || 0;
  if (conceptsCount >= 10) {
    requirements_met.push(`${conceptsCount} concepts in data structure`);
  } else {
    requirements_missing.push(`Only ${conceptsCount} concepts in data structure (recommend 10+)`);
  }

  // Recommendations
  if (quotesExtracted < 100) {
    recommendations.push('Consider extracting more quotes for richer evidence tables');
  }
  if (!config.data_structure || Object.keys(config.data_structure || {}).length === 0) {
    recommendations.push('Review and refine your Gioia data structure before synthesis');
  }

  const ready = requirements_missing.length === 0;

  return {
    ready,
    target_stage: 'stage3',
    current_status: {
      phase1: phase1Complete ? 'complete' : 'incomplete',
      phase2: phase2Complete ? 'complete' : 'incomplete',
      phase3: phase3Complete ? 'complete' : 'incomplete',
      quotes_extracted: quotesExtracted,
      concepts_count: conceptsCount
    },
    requirements_met,
    requirements_missing,
    recommendations,
    action_if_not_ready: ready ? null : 'Complete all Stage 2 phases before human synthesis'
  };
}

function checkPhase2Readiness(config, projectPath) {
  const requirements_met = [];
  const requirements_missing = [];
  const recommendations = [];

  // Check Phase 1 completion
  const phase1Status = config.sandwich_status?.stage2_progress?.phase1_parallel_streams;

  if (phase1Status === 'complete') {
    requirements_met.push('Phase 1 (Parallel Streams) complete');
  } else {
    requirements_missing.push('Phase 1 (Parallel Streams) not complete');
  }

  // Check for theoretical stream work
  const theoreticalDir = path.join(projectPath, 'stage2-collaboration', 'stream-a-theoretical');
  const theoreticalFiles = countFiles(theoreticalDir, ['.md']);
  if (theoreticalFiles >= 3) {
    requirements_met.push(`${theoreticalFiles} theoretical documents analyzed`);
  } else {
    requirements_missing.push(`Only ${theoreticalFiles} theoretical documents (recommend 3+)`);
  }

  // Check for empirical stream work
  const empiricalDir = path.join(projectPath, 'stage2-collaboration', 'stream-b-empirical');
  const empiricalFiles = countFiles(empiricalDir, ['.md', '.json']);
  if (empiricalFiles >= 5) {
    requirements_met.push(`${empiricalFiles} empirical documents coded`);
  } else {
    requirements_missing.push(`Only ${empiricalFiles} empirical documents coded (recommend 5+)`);
  }

  recommendations.push('Review patterns from both streams before synthesis');
  recommendations.push('Consider writing a synthesis memo to capture initial thoughts');

  const ready = requirements_missing.length === 0;

  return {
    ready,
    target_stage: 'phase2_synthesis',
    current_status: {
      phase1_status: phase1Status || 'not_started',
      theoretical_documents: theoreticalFiles,
      empirical_documents: empiricalFiles
    },
    requirements_met,
    requirements_missing,
    recommendations,
    action_if_not_ready: ready ? null : 'Complete parallel streams work before synthesis'
  };
}

function checkReadiness(projectPath, targetStage) {
  const config = readConfig(projectPath);

  if (!config) {
    return {
      success: false,
      error: 'Project not initialized',
      suggestion: 'Run /qual-init to initialize your project'
    };
  }

  let result;

  switch (targetStage) {
    case 'stage2':
    case 'stage_2':
      result = checkStage2Readiness(config, projectPath);
      break;
    case 'stage3':
    case 'stage_3':
      result = checkStage3Readiness(config, projectPath);
      break;
    case 'phase2':
    case 'phase_2':
    case 'synthesis':
      result = checkPhase2Readiness(config, projectPath);
      break;
    default:
      return {
        success: false,
        error: `Unknown target stage: ${targetStage}`,
        valid_targets: ['stage2', 'stage3', 'phase2']
      };
  }

  return {
    success: true,
    ...result
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

if (!args['target-stage']) {
  console.error(JSON.stringify({
    success: false,
    error: 'Missing required argument: --target-stage',
    valid_targets: ['stage2', 'stage3', 'phase2']
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

const result = checkReadiness(resolvedPath, args['target-stage']);
console.log(JSON.stringify(result, null, 2));

process.exit(result.success ? 0 : 1);
