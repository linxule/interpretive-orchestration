#!/usr/bin/env node
/**
 * generate-dashboard.js
 * Generate a formatted dashboard view of project progress
 *
 * Usage:
 *   node generate-dashboard.js --project-path /path/to/project --format ascii|json|markdown
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

function calculateAllProgress(config, projectPath) {
  // Stage 1
  const stage1Details = config.sandwich_status?.stage1_details || {};
  let docs = stage1Details.documents_manually_coded || 0;
  let memos = stage1Details.memos_written || 0;

  if (docs === 0) {
    docs = countFiles(path.join(projectPath, 'stage1-foundation', 'manual-codes'), ['.md', '.json', '.txt']);
  }
  if (memos === 0) {
    memos = countFiles(path.join(projectPath, 'stage1-foundation', 'memos'), ['.md']);
  }

  const stage1Progress = Math.round(Math.min(docs / 10, 1) * 70 + Math.min(memos / 3, 1) * 30);

  // Stage 2
  const stage2Progress = config.sandwich_status?.stage2_progress || {};
  const phaseStatus = {
    phase1: stage2Progress.phase1_parallel_streams || 'not_started',
    phase2: stage2Progress.phase2_synthesis || 'not_started',
    phase3: stage2Progress.phase3_pattern_characterization || 'not_started'
  };

  const statusValue = { 'not_started': 0, 'in_progress': 0.5, 'complete': 1 };
  const s2Progress = Math.round(
    (statusValue[phaseStatus.phase1] || 0) * 33 +
    (statusValue[phaseStatus.phase2] || 0) * 33 +
    (statusValue[phaseStatus.phase3] || 0) * 34
  );

  // Stage 3
  const stage3Progress = config.sandwich_status?.stage3_progress || {};
  const s3Components = {
    evidence: stage3Progress.evidence_organized || 'not_started',
    theory: stage3Progress.theory_developed || 'not_started',
    manuscript: stage3Progress.manuscript_drafted || 'not_started'
  };

  const s3Progress = Math.round(
    (statusValue[s3Components.evidence] || 0) * 33 +
    (statusValue[s3Components.theory] || 0) * 33 +
    (statusValue[s3Components.manuscript] || 0) * 34
  );

  return {
    stage1: {
      progress: stage1Progress,
      complete: config.sandwich_status?.stage1_complete || false,
      documents: docs,
      memos: memos
    },
    stage2: {
      progress: s2Progress,
      phases: phaseStatus,
      documents_processed: config.coding_progress?.documents_coded || 0,
      quotes_extracted: config.coding_progress?.quotes_extracted || 0,
      concepts: config.coding_progress?.concepts_in_framework || 0
    },
    stage3: {
      progress: s3Progress,
      components: s3Components,
      locked: !config.sandwich_status?.stage2_complete
    },
    overall: Math.round(stage1Progress * 0.25 + s2Progress * 0.50 + s3Progress * 0.25)
  };
}

function generateProgressBar(percent, width = 10) {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  return '[' + '='.repeat(filled) + ' '.repeat(empty) + ']';
}

function getPhaseSymbol(status) {
  switch (status) {
    case 'complete': return '\u2713';  // checkmark
    case 'in_progress': return '\u2192';  // arrow
    default: return '\u25CB';  // circle
  }
}

function generateAsciiDashboard(config, progress, projectPath) {
  const projectName = config.project_info?.name || 'Qualitative Research Project';
  const tradition = config.philosophical_stance?.tradition || 'Not specified';

  let output = `
The Sandwich Methodology
========================
Project: ${projectName}
Tradition: ${tradition}

     Stage 1: Human Foundation
     ${generateProgressBar(progress.stage1.progress)} ${progress.stage1.progress}%
     ${progress.stage1.documents} documents coded | ${progress.stage1.memos} memos written
     Status: ${progress.stage1.complete ? 'Ready for Stage 2!' : 'In progress'}

     Stage 2: Human-AI Partnership
     ${generateProgressBar(progress.stage2.progress)} ${progress.stage2.progress}%
     Phase 1: ${getPhaseSymbol(progress.stage2.phases.phase1)} Parallel streams
     Phase 2: ${getPhaseSymbol(progress.stage2.phases.phase2)} Synthesis
     Phase 3: ${getPhaseSymbol(progress.stage2.phases.phase3)} Pattern characterization
     ${progress.stage2.documents_processed} documents | ${progress.stage2.quotes_extracted} quotes | ${progress.stage2.concepts} concepts

     Stage 3: Human Synthesis
     ${progress.stage3.locked ? '[LOCKED    ]' : generateProgressBar(progress.stage3.progress) + ' ' + progress.stage3.progress + '%'}
     ${progress.stage3.locked ? 'Complete Stage 2 to unlock' : 'Evidence, Theory, Manuscript'}

Overall Progress: ${generateProgressBar(progress.overall, 20)} ${progress.overall}%
`;

  // Add next steps
  output += '\nNext Steps:\n';
  if (!progress.stage1.complete) {
    if (progress.stage1.documents < 10) {
      output += `- Code ${10 - progress.stage1.documents} more documents manually\n`;
    }
    if (progress.stage1.memos < 3) {
      output += `- Write ${3 - progress.stage1.memos} more analytical memos\n`;
    }
  } else if (progress.stage2.progress < 100) {
    if (progress.stage2.phases.phase1 !== 'complete') {
      output += '- Complete Phase 1: Parallel Streams (theoretical + empirical)\n';
    } else if (progress.stage2.phases.phase2 !== 'complete') {
      output += '- Continue Phase 2: Synthesis work\n';
    } else if (progress.stage2.phases.phase3 !== 'complete') {
      output += '- Begin Phase 3: Pattern Characterization\n';
    }
  } else if (!progress.stage3.locked) {
    output += '- Organize evidence for theory building\n';
    output += '- Develop theoretical contribution\n';
  }

  return output;
}

function generateMarkdownDashboard(config, progress, projectPath) {
  const projectName = config.project_info?.name || 'Qualitative Research Project';
  const tradition = config.philosophical_stance?.tradition || 'Not specified';
  const generated = new Date().toISOString();

  return `# Project Dashboard: ${projectName}

**Generated:** ${generated}
**Tradition:** ${tradition}
**Overall Progress:** ${progress.overall}%

---

## Stage 1: Human Foundation ${progress.stage1.complete ? '(Complete)' : '(In Progress)'}

| Metric | Current | Target | Progress |
|--------|---------|--------|----------|
| Documents Coded | ${progress.stage1.documents} | 10 | ${Math.min(progress.stage1.documents * 10, 100)}% |
| Memos Written | ${progress.stage1.memos} | 3 | ${Math.min(Math.round(progress.stage1.memos / 3 * 100), 100)}% |
| **Overall** | | | **${progress.stage1.progress}%** |

---

## Stage 2: Human-AI Partnership

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1: Parallel Streams | ${progress.stage2.phases.phase1} | ${progress.stage2.phases.phase1 === 'complete' ? '100%' : progress.stage2.phases.phase1 === 'in_progress' ? '50%' : '0%'} |
| Phase 2: Synthesis | ${progress.stage2.phases.phase2} | ${progress.stage2.phases.phase2 === 'complete' ? '100%' : progress.stage2.phases.phase2 === 'in_progress' ? '50%' : '0%'} |
| Phase 3: Pattern Characterization | ${progress.stage2.phases.phase3} | ${progress.stage2.phases.phase3 === 'complete' ? '100%' : progress.stage2.phases.phase3 === 'in_progress' ? '50%' : '0%'} |

**Statistics:**
- Documents Processed: ${progress.stage2.documents_processed}
- Quotes Extracted: ${progress.stage2.quotes_extracted}
- Concepts in Framework: ${progress.stage2.concepts}

---

## Stage 3: Human Synthesis ${progress.stage3.locked ? '(Locked)' : ''}

${progress.stage3.locked ? '> Complete Stage 2 to unlock Stage 3' : `
| Component | Status |
|-----------|--------|
| Evidence Organized | ${progress.stage3.components.evidence} |
| Theory Developed | ${progress.stage3.components.theory} |
| Manuscript Drafted | ${progress.stage3.components.manuscript} |
`}

---

*Generated by Interpretive Orchestration - Epistemic Partnership System*
`;
}

function generateJsonDashboard(config, progress, projectPath) {
  return {
    success: true,
    project: {
      name: config.project_info?.name || 'Untitled',
      research_question: config.project_info?.research_question || '',
      tradition: config.philosophical_stance?.tradition || ''
    },
    progress: progress,
    generated_at: new Date().toISOString()
  };
}

function generateDashboard(projectPath, format) {
  const config = readConfig(projectPath);

  if (!config) {
    return {
      success: false,
      error: 'Project not initialized',
      suggestion: 'Run /qual-init to initialize your project'
    };
  }

  const progress = calculateAllProgress(config, projectPath);

  switch (format) {
    case 'markdown':
    case 'md':
      return {
        success: true,
        format: 'markdown',
        dashboard: generateMarkdownDashboard(config, progress, projectPath)
      };
    case 'json':
      return generateJsonDashboard(config, progress, projectPath);
    case 'ascii':
    default:
      return {
        success: true,
        format: 'ascii',
        dashboard: generateAsciiDashboard(config, progress, projectPath)
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

const format = args.format || 'ascii';
const result = generateDashboard(resolvedPath, format);

if (result.success && result.dashboard) {
  console.log(result.dashboard);
} else {
  console.log(JSON.stringify(result, null, 2));
}

process.exit(result.success ? 0 : 1);
