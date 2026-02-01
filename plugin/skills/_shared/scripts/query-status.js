#!/usr/bin/env node
/**
 * query-status.js
 * Returns structured progress data for the project dashboard
 *
 * Usage:
 *   node query-status.js --project-path /path/to/project
 *
 * Returns comprehensive status including:
 * - Project info and philosophical stance
 * - Stage progress with readiness indicators
 * - Coding statistics
 * - Recommendations for next steps
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

function countFiles(dirPath, extensions = null) {
  if (!fs.existsSync(dirPath)) return 0;

  try {
    const files = fs.readdirSync(dirPath).filter(f => {
      if (f.startsWith('.')) return false;
      if (!extensions) return true;
      return extensions.some(ext => f.endsWith(ext));
    });
    return files.length;
  } catch (error) {
    return 0;
  }
}

function queryStatus(projectPath) {
  const configPath = path.join(projectPath, '.interpretive-orchestration', 'config.json');

  // Check if project is initialized
  if (!fs.existsSync(configPath)) {
    return {
      success: false,
      initialized: false,
      error: 'Project not initialized',
      recommendation: 'Use project-setup skill or /qual-init to initialize'
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

  // Count actual files in directories
  const manualCodesDir = path.join(projectPath, 'stage1-foundation', 'manual-codes');
  const memosDir = path.join(projectPath, 'stage1-foundation', 'memos');

  const actualCodes = countFiles(manualCodesDir);
  const actualMemos = countFiles(memosDir, ['.md', '.txt']);

  // Calculate Stage 1 readiness
  const stage1 = config.sandwich_status?.stage1_details || {};
  const documentsCount = Math.max(stage1.documents_manually_coded || 0, actualCodes);
  const memosCount = Math.max(stage1.memos_written || 0, actualMemos);

  const stage1Ready = documentsCount >= 10 && memosCount >= 3;
  const stage1Progress = Math.min(100, Math.round((documentsCount / 10) * 70 + (Math.min(memosCount, 3) / 3) * 30));

  // Calculate Stage 2 progress
  const stage2 = config.sandwich_status?.stage2_progress || {};
  const phase1Done = stage2.phase1_parallel_streams === 'complete';
  const phase2Done = stage2.phase2_synthesis === 'complete';
  const phase3Done = stage2.phase3_pattern_characterization === 'complete';

  const stage2Progress = (phase1Done ? 33 : (stage2.phase1_parallel_streams === 'in_progress' ? 15 : 0)) +
                        (phase2Done ? 33 : (stage2.phase2_synthesis === 'in_progress' ? 15 : 0)) +
                        (phase3Done ? 34 : (stage2.phase3_pattern_characterization === 'in_progress' ? 15 : 0));

  // Calculate Stage 3 progress
  const stage3 = config.sandwich_status?.stage3_progress || {};
  const stage3Progress = (stage3.evidence_organized ? 33 : 0) +
                        (stage3.theory_developed ? 33 : 0) +
                        (stage3.manuscript_drafted ? 34 : 0);

  // Determine overall status and recommendations
  const recommendations = [];

  if (!config.sandwich_status?.stage1_complete && !stage1Ready) {
    if (documentsCount < 10) {
      recommendations.push({
        priority: 'high',
        action: `Code ${10 - documentsCount} more documents manually`,
        reason: 'Stage 1 requires manual coding of 10-15 documents for theoretical sensitivity'
      });
    }
    if (memosCount < 3) {
      recommendations.push({
        priority: 'medium',
        action: `Write ${3 - memosCount} more analytical memos`,
        reason: 'Memos capture emerging insights and build reflexive awareness'
      });
    }
  }

  if (stage1Ready && !config.sandwich_status?.stage1_complete) {
    recommendations.push({
      priority: 'high',
      action: 'Mark Stage 1 as complete to unlock Stage 2',
      reason: 'You have sufficient foundation - ready for AI collaboration'
    });
  }

  if (config.sandwich_status?.stage1_complete && stage2Progress < 100) {
    if (stage2.phase1_parallel_streams !== 'complete') {
      recommendations.push({
        priority: 'medium',
        action: 'Begin Phase 1: Parallel Streams analysis',
        reason: 'Use @dialogical-coder for systematic coding'
      });
    }
  }

  // Build status response
  const status = {
    success: true,
    initialized: true,

    project: {
      name: config.project_info?.name || 'Unnamed Project',
      research_question: config.project_info?.research_question,
      created: config.project_info?.created_date
    },

    philosophical_stance: {
      ontology: config.philosophical_stance?.ontology,
      epistemology: config.philosophical_stance?.epistemology,
      tradition: config.philosophical_stance?.tradition,
      ai_relationship: config.philosophical_stance?.ai_relationship
    },

    sandwich: {
      current_stage: config.sandwich_status?.current_stage || 'stage1_foundation',

      stage1: {
        status: config.sandwich_status?.stage1_complete ? 'complete' : (stage1Progress > 0 ? 'in_progress' : 'not_started'),
        progress_percent: stage1Progress,
        documents_coded: documentsCount,
        documents_required: 10,
        memos_written: memosCount,
        memos_recommended: 3,
        ready_for_stage2: stage1Ready
      },

      stage2: {
        status: stage2Progress === 100 ? 'complete' : (stage2Progress > 0 ? 'in_progress' : 'locked'),
        progress_percent: stage2Progress,
        locked: !config.sandwich_status?.stage1_complete,
        phases: {
          phase1_parallel_streams: stage2.phase1_parallel_streams || 'not_started',
          phase2_synthesis: stage2.phase2_synthesis || 'not_started',
          phase3_pattern_characterization: stage2.phase3_pattern_characterization || 'not_started'
        }
      },

      stage3: {
        status: stage3Progress === 100 ? 'complete' : (stage3Progress > 0 ? 'in_progress' : 'locked'),
        progress_percent: stage3Progress,
        locked: stage2Progress < 100
      }
    },

    coding: {
      total_documents_coded: config.coding_progress?.documents_coded || 0,
      quotes_extracted: config.coding_progress?.quotes_extracted || 0,
      concepts_in_framework: config.coding_progress?.concepts_in_framework || 0,
      last_session: config.coding_progress?.last_coding_session
    },

    recommendations: recommendations,

    visualization: generateAsciiDashboard(stage1Progress, stage2Progress, stage3Progress, config.sandwich_status?.stage1_complete)
  };

  return status;
}

function generateAsciiDashboard(s1, s2, s3, s1Complete) {
  const bar = (pct, locked = false) => {
    if (locked) return '[LOCKED]    ';
    const filled = Math.round(pct / 10);
    return '[' + '='.repeat(filled) + ' '.repeat(10 - filled) + '] ' + pct + '%';
  };

  return `
The Sandwich Methodology Progress
=================================

Stage 1 (Human Foundation)     ${bar(s1)}
  ${s1Complete ? '[COMPLETE]' : s1 >= 100 ? '[READY]' : ''}

Stage 2 (Human-AI Partnership) ${bar(s2, !s1Complete)}
  ${!s1Complete ? 'Complete Stage 1 to unlock' : ''}

Stage 3 (Human Synthesis)      ${bar(s3, s2 < 100)}
  ${s2 < 100 ? 'Complete Stage 2 to unlock' : ''}
`;
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

const result = queryStatus(resolvedPath);
console.log(JSON.stringify(result, null, 2));

process.exit(result.success ? 0 : 1);
