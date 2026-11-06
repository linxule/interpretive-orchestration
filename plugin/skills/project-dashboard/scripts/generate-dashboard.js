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

function countVisibleFiles(dirPath, extensions = null) {
  try {
    return fs.readdirSync(dirPath, { withFileTypes: true })
      .filter(entry => entry.isFile() && !entry.name.startsWith('.'))
      .filter(entry => !extensions || extensions.some(ext => entry.name.endsWith(ext)))
      .length;
  } catch (error) {
    return 0;
  }
}

// Progress uses recorded counts, so a project that never recorded them shows
// nothing, however many files it has. Say so, and say how to record them.
function recordCountsHint(config, projectPath, docs, memos) {
  if (config.sandwich_status?.stage1_complete) return null;
  const files = countVisibleFiles(path.join(projectPath, 'stage1-foundation', 'manual-codes'));
  const memoFiles = countVisibleFiles(path.join(projectPath, 'stage1-foundation', 'memos'), ['.md', '.txt']);
  if (!(docs === 0 && files > 0) && !(memos === 0 && memoFiles > 0)) return null;
  return `Record your Stage 1 counts: ${files} file(s) in manual-codes and ${memoFiles} in memos, ` +
    `but ${docs} documents and ${memos} memos recorded. Progress uses recorded counts, because ` +
    'manual-codes also holds raw transcripts. Record them with update-progress.js ' +
    '(--documents-coded, --memos-written).';
}

function calculateAllProgress(config, projectPath) {
  // Recorded counts only: manual-codes/ also holds raw transcripts.
  const readiness = T.stage1Readiness(config);
  const docs = readiness.documents;
  const memos = readiness.memos;

  const stage1Progress = Math.round(
    Math.min(docs / T.DOCUMENTS_REQUIRED, 1) * T.DOCUMENTS_WEIGHT +
    Math.min(memos / T.MEMOS_RECOMMENDED, 1) * T.MEMOS_WEIGHT
  );

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

  statusValue.true = 1;
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
      memos: memos,
      ready: readiness.ready,
      tradition_missing: readiness.missing.includes('tradition'),
      record_counts_hint: recordCountsHint(config, projectPath, docs, memos)
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
     Status: ${progress.stage1.complete ? 'Ready for Stage 2!' : progress.stage1.ready ? 'Counts met; /qual-complete-stage1 checks the rest' : 'In progress'}

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

  output += '\nNext Steps:\n';
  if (progress.stage1.record_counts_hint) {
    output += `- ${progress.stage1.record_counts_hint}\n`;
  }
  if (!progress.stage1.complete) {
    if (progress.stage1.documents < T.DOCUMENTS_REQUIRED) {
      output += `- Code ${T.DOCUMENTS_REQUIRED - progress.stage1.documents} more documents manually\n`;
    }
    if (progress.stage1.memos < T.MEMOS_REQUIRED) {
      output += `- Write at least one analytical memo (${T.MEMOS_RECOMMENDED} recommended)\n`;
    } else if (progress.stage1.memos < T.MEMOS_RECOMMENDED) {
      output += `- Consider writing ${T.MEMOS_RECOMMENDED - progress.stage1.memos} more analytical memos (${T.MEMOS_RECOMMENDED} recommended)\n`;
    }
    if (progress.stage1.tradition_missing) {
      output += '- Declare your research tradition (project-setup, --tradition)\n';
    }
    if (progress.stage1.ready) {
      output += '- Run /qual-complete-stage1 when your foundation feels solid. It also checks your reflexivity journal and data structure\n';
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
| Documents Coded | ${progress.stage1.documents} | ${T.DOCUMENTS_REQUIRED} | ${Math.min(Math.round(progress.stage1.documents / T.DOCUMENTS_REQUIRED * 100), 100)}% |
| Memos Written | ${progress.stage1.memos} | ${T.MEMOS_REQUIRED} required, ${T.MEMOS_RECOMMENDED} recommended | ${Math.min(Math.round(progress.stage1.memos / T.MEMOS_RECOMMENDED * 100), 100)}% |
| **Overall** | | | **${progress.stage1.progress}%** |
${progress.stage1.record_counts_hint ? `\n> ${progress.stage1.record_counts_hint}\n` : ''}
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
