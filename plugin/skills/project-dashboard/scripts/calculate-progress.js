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
const T = require('../../_shared/scripts/stage1-thresholds.js');

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

function calculateStage1Progress(config, projectPath) {
  // Progress aims for the required documents and the recommended memos
  // (stage1-thresholds.js); readiness needs the required counts and a tradition.
  // Recorded counts only: manual-codes/ also holds raw transcripts.
  const readiness = T.stage1Readiness(config);
  const documents = readiness.documents;
  const memosWritten = readiness.memos;

  const docScore = Math.min(documents / T.DOCUMENTS_REQUIRED, 1) * T.DOCUMENTS_WEIGHT;
  const memoScore = Math.min(memosWritten / T.MEMOS_RECOMMENDED, 1) * T.MEMOS_WEIGHT;

  return {
    progress: Math.round(docScore + memoScore),
    documents,
    memos: memosWritten,
    ready: readiness.ready,
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
    const value = status === true ? 1 : (statusValue[status] || 0);
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
