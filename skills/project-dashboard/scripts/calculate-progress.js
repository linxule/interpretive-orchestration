#!/usr/bin/env node
/**
 * calculate-progress.js
 * Calculate progress percentages for each stage of the sandwich methodology
 *
 * Usage:
 *   node calculate-progress.js --project-path /path/to/project
 *
 * Returns:
 *   {
 *     "stage1_progress": 85,
 *     "stage2_progress": 30,
 *     "stage3_progress": 0,
 *     "overall_progress": 38
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

function calculateStage1Progress(config, projectPath) {
  // Stage 1 formula: (docs/10 * 70) + (min(memos,3)/3 * 30)
  // Target: 10 documents, 3 memos

  const stage1Details = config.sandwich_status?.stage1_details || {};

  // Get document count from config or count files
  let docsManuallyCodeded = stage1Details.documents_manually_coded || 0;
  if (docsManuallyCodeded === 0) {
    // Try counting files in manual-codes directory
    const manualCodesDir = path.join(projectPath, 'stage1-foundation', 'manual-codes');
    docsManuallyCodeded = countFiles(manualCodesDir, ['.md', '.json', '.txt']);
  }

  // Get memo count
  let memosWritten = stage1Details.memos_written || 0;
  if (memosWritten === 0) {
    // Try counting files in memos directory
    const memosDir = path.join(projectPath, 'stage1-foundation', 'memos');
    memosWritten = countFiles(memosDir, ['.md']);
  }

  const docScore = Math.min(docsManuallyCodeded / 10, 1) * 70;
  const memoScore = Math.min(memosWritten / 3, 1) * 30;

  return {
    progress: Math.round(docScore + memoScore),
    documents: docsManuallyCodeded,
    memos: memosWritten,
    complete: config.sandwich_status?.stage1_complete || false
  };
}

function calculateStage2Progress(config) {
  // Stage 2: Phase 1 (33%), Phase 2 (33%), Phase 3 (34%)
  // Each phase: not_started=0, in_progress=50%, complete=100%

  const stage2Progress = config.sandwich_status?.stage2_progress || {};

  const phaseWeight = {
    phase1_parallel_streams: 33,
    phase2_synthesis: 33,
    phase3_pattern_characterization: 34
  };

  const statusValue = {
    'not_started': 0,
    'in_progress': 0.5,
    'complete': 1
  };

  let totalProgress = 0;
  const phases = {};

  for (const [phase, weight] of Object.entries(phaseWeight)) {
    const status = stage2Progress[phase] || 'not_started';
    const value = statusValue[status] || 0;
    phases[phase] = { status, contribution: Math.round(value * weight) };
    totalProgress += value * weight;
  }

  // Also get document counts
  const documentsProcessed = config.coding_progress?.documents_coded || 0;
  const quotesExtracted = config.coding_progress?.quotes_extracted || 0;

  return {
    progress: Math.round(totalProgress),
    phases,
    documents_processed: documentsProcessed,
    quotes_extracted: quotesExtracted
  };
}

function calculateStage3Progress(config) {
  // Stage 3: Evidence organized (33%), Theory developed (33%), Manuscript drafted (34%)

  const stage3Progress = config.sandwich_status?.stage3_progress || {};

  const componentWeight = {
    evidence_organized: 33,
    theory_developed: 33,
    manuscript_drafted: 34
  };

  const statusValue = {
    'not_started': 0,
    'in_progress': 0.5,
    'complete': 1
  };

  let totalProgress = 0;
  const components = {};

  for (const [component, weight] of Object.entries(componentWeight)) {
    const status = stage3Progress[component] || 'not_started';
    const value = statusValue[status] || 0;
    components[component] = { status, contribution: Math.round(value * weight) };
    totalProgress += value * weight;
  }

  return {
    progress: Math.round(totalProgress),
    components,
    locked: !config.sandwich_status?.stage2_complete
  };
}

function calculateProgress(projectPath) {
  const config = readConfig(projectPath);

  if (!config) {
    return {
      success: false,
      error: 'Project not initialized',
      suggestion: 'Run /qual-init to initialize your project'
    };
  }

  const stage1 = calculateStage1Progress(config, projectPath);
  const stage2 = calculateStage2Progress(config);
  const stage3 = calculateStage3Progress(config);

  // Overall progress: weighted average
  // Stage 1 = 25%, Stage 2 = 50%, Stage 3 = 25%
  const overallProgress = Math.round(
    (stage1.progress * 0.25) +
    (stage2.progress * 0.50) +
    (stage3.progress * 0.25)
  );

  return {
    success: true,
    stage1_progress: stage1.progress,
    stage2_progress: stage2.progress,
    stage3_progress: stage3.progress,
    overall_progress: overallProgress,
    details: {
      stage1,
      stage2,
      stage3
    },
    project_name: config.project_info?.name || 'Untitled Project',
    last_updated: new Date().toISOString()
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

const result = calculateProgress(resolvedPath);
console.log(JSON.stringify(result, null, 2));

process.exit(result.success ? 0 : 1);
