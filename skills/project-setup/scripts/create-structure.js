#!/usr/bin/env node
/**
 * create-structure.js
 * Creates the project folder hierarchy for Interpretive Orchestration
 *
 * Usage:
 *   node create-structure.js --project-path /path/to/project --project-name "My Research"
 *   node create-structure.js --project-path /path/to/project --research-design '{"cases":[...],"waves":[...]}'
 *
 * Options:
 *   --force           Overwrite existing files (DANGEROUS - will destroy user content)
 *   --research-design JSON string with cases/waves configuration for folder creation
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

/**
 * Safely write a file - only if it doesn't exist or force is true
 */
function safeWriteFile(filePath, content, force) {
  if (fs.existsSync(filePath) && !force) {
    return { action: 'skipped', reason: 'File exists (use --force to overwrite)' };
  }
  try {
    fs.writeFileSync(filePath, content);
    return { action: force && fs.existsSync(filePath) ? 'overwritten' : 'created' };
  } catch (error) {
    return { action: 'error', error: error.message };
  }
}

/**
 * Create a README for a case folder
 */
function createCaseReadme(caseDef) {
  return `# Case: ${caseDef.name}

**ID:** ${caseDef.id}
${caseDef.description ? `**Description:** ${caseDef.description}` : ''}

## Methodological Note

This folder contains data for a single case in your comparative study.

**During open coding:** Analyze this case independently. Let themes emerge from THIS case's data without reference to other cases.

**Why isolation matters:** Cross-case contamination during open coding prevents genuine pattern emergence. Each case deserves analytical fresh eyes.

**When this changes:** Case isolation relaxes during synthesis phases, when cross-case comparison becomes methodologically appropriate.

---

*This folder is part of a multi-case study managed by Interpretive Orchestration.*
`;
}

/**
 * Create a README for a wave folder
 */
function createWaveReadme(waveDef) {
  return `# Wave: ${waveDef.name}

**ID:** ${waveDef.id}
${waveDef.collection_period ? `**Collection Period:** ${waveDef.collection_period}` : ''}

## Methodological Note

This folder contains data from a specific time point in your longitudinal study.

**During analysis:** Keep this wave's analysis separate from other waves. Track how concepts emerge and evolve without projecting later developments onto earlier data.

**Why isolation matters:** Wave isolation preserves the temporal integrity of your data. Analyzing waves separately allows you to trace genuine conceptual evolution.

**When this changes:** Wave isolation relaxes during cross-wave analysis, when examining change over time becomes the focus.

---

*This folder is part of a longitudinal study managed by Interpretive Orchestration.*
`;
}

function createStructure(projectPath, projectName, force = false, researchDesign = null) {
  const directories = [
    '.interpretive-orchestration',
    'stage1-foundation/manual-codes',
    'stage1-foundation/memos',
    'stage2-collaboration/stream-a-theoretical',
    'stage2-collaboration/stream-b-empirical',
    'stage2-collaboration/synthesis',
    'stage3-synthesis/evidence-tables',
    'stage3-synthesis/theoretical-integration',
    'outputs'
  ];

  // Add case folders if specified in research design
  if (researchDesign && researchDesign.cases && researchDesign.cases.length > 0) {
    for (const caseDef of researchDesign.cases) {
      if (caseDef.folder_path) {
        directories.push(caseDef.folder_path);
      }
    }
  }

  // Add wave folders if specified in research design
  if (researchDesign && researchDesign.waves && researchDesign.waves.length > 0) {
    for (const waveDef of researchDesign.waves) {
      if (waveDef.folder_path) {
        directories.push(waveDef.folder_path);
      }
    }
  }

  // Add stream folders if specified
  if (researchDesign && researchDesign.streams) {
    if (researchDesign.streams.theoretical && researchDesign.streams.theoretical.folder_path) {
      directories.push(researchDesign.streams.theoretical.folder_path);
    }
    if (researchDesign.streams.empirical && researchDesign.streams.empirical.folder_path) {
      directories.push(researchDesign.streams.empirical.folder_path);
    }
  }

  const results = {
    success: true,
    created: [],
    skipped: [],
    errors: []
  };

  // Create directories
  for (const dir of directories) {
    const fullPath = path.join(projectPath, dir);
    try {
      fs.mkdirSync(fullPath, { recursive: true });
      results.created.push(fullPath);
    } catch (error) {
      results.errors.push({ path: fullPath, error: error.message });
      results.success = false;
    }
  }

  // Initialize reflexivity journal
  const journalPath = path.join(projectPath, '.interpretive-orchestration', 'reflexivity-journal.md');
  const journalContent = `# Reflexivity Journal
## ${projectName}

This journal tracks your evolving understanding of interpretation throughout the research process.

---

### Entry 1: Project Initialization
**Date:** ${new Date().toISOString().split('T')[0]}

**Initial Reflection:**
What drew you to this research question? What assumptions might you bring?

[Your reflection here]

---

*Add new entries as insights emerge. The plugin will prompt you at key moments.*
`;

  const journalResult = safeWriteFile(journalPath, journalContent, force);
  if (journalResult.action === 'created' || journalResult.action === 'overwritten') {
    results.created.push(journalPath);
  } else if (journalResult.action === 'skipped') {
    results.skipped.push({ path: journalPath, reason: journalResult.reason });
  } else if (journalResult.action === 'error') {
    results.errors.push({ path: journalPath, error: journalResult.error });
  }

  // Initialize empty conversation log (special case - always safe to create if missing)
  const logPath = path.join(projectPath, '.interpretive-orchestration', 'conversation-log.jsonl');
  if (!fs.existsSync(logPath)) {
    try {
      fs.writeFileSync(logPath, '');
      results.created.push(logPath);
    } catch (error) {
      results.errors.push({ path: logPath, error: error.message });
    }
  } else {
    results.skipped.push({ path: logPath, reason: 'Log file exists (preserved)' });
  }

  // Initialize decision history
  const decisionPath = path.join(projectPath, '.interpretive-orchestration', 'decision-history.md');
  const decisionContent = `# Decision History
## ${projectName}

This document tracks significant analytical decisions and their rationale.

---

### Decision 1: Project Initialization
**Date:** ${new Date().toISOString().split('T')[0]}
**Decision:** Created project with Interpretive Orchestration plugin
**Rationale:** [Your rationale here]

---

*Document each major analytical decision here for audit trail.*
`;

  const decisionResult = safeWriteFile(decisionPath, decisionContent, force);
  if (decisionResult.action === 'created' || decisionResult.action === 'overwritten') {
    results.created.push(decisionPath);
  } else if (decisionResult.action === 'skipped') {
    results.skipped.push({ path: decisionPath, reason: decisionResult.reason });
  } else if (decisionResult.action === 'error') {
    results.errors.push({ path: decisionPath, error: decisionResult.error });
  }

  // Create Stage 1 README
  const stage1ReadmePath = path.join(projectPath, 'stage1-foundation', 'README.md');
  const stage1Content = `# Stage 1: Human Foundation

This is the first slice of bread in the sandwich methodology.

## Purpose
Build theoretical sensitivity through manual engagement with data.

## What Goes Here
- **manual-codes/**: Your hand-coded documents
- **memos/**: Analytical memos capturing emergent insights

## Requirements Before Stage 2
- [ ] Manually code 10-15 documents
- [ ] Write analytical memos for key insights
- [ ] Develop initial conceptual framework
- [ ] Reflect on your interpretive approach

## Why This Matters
AI cannot develop YOUR theoretical sensitivity. This stage creates the interpretive depth that makes partnership meaningful.

The sandwich starts with human bread!
`;

  const stage1Result = safeWriteFile(stage1ReadmePath, stage1Content, force);
  if (stage1Result.action === 'created' || stage1Result.action === 'overwritten') {
    results.created.push(stage1ReadmePath);
  } else if (stage1Result.action === 'skipped') {
    results.skipped.push({ path: stage1ReadmePath, reason: stage1Result.reason });
  } else if (stage1Result.action === 'error') {
    results.errors.push({ path: stage1ReadmePath, error: stage1Result.error });
  }

  // Create README files for case folders
  if (researchDesign && researchDesign.cases && researchDesign.cases.length > 0) {
    for (const caseDef of researchDesign.cases) {
      if (caseDef.folder_path) {
        const caseReadmePath = path.join(projectPath, caseDef.folder_path, 'README.md');
        const caseReadmeContent = createCaseReadme(caseDef);
        const caseResult = safeWriteFile(caseReadmePath, caseReadmeContent, force);
        if (caseResult.action === 'created' || caseResult.action === 'overwritten') {
          results.created.push(caseReadmePath);
        } else if (caseResult.action === 'skipped') {
          results.skipped.push({ path: caseReadmePath, reason: caseResult.reason });
        } else if (caseResult.action === 'error') {
          results.errors.push({ path: caseReadmePath, error: caseResult.error });
        }
      }
    }
    // Track research design info
    results.researchDesign = results.researchDesign || {};
    results.researchDesign.casesCreated = researchDesign.cases.length;
  }

  // Create README files for wave folders
  if (researchDesign && researchDesign.waves && researchDesign.waves.length > 0) {
    for (const waveDef of researchDesign.waves) {
      if (waveDef.folder_path) {
        const waveReadmePath = path.join(projectPath, waveDef.folder_path, 'README.md');
        const waveReadmeContent = createWaveReadme(waveDef);
        const waveResult = safeWriteFile(waveReadmePath, waveReadmeContent, force);
        if (waveResult.action === 'created' || waveResult.action === 'overwritten') {
          results.created.push(waveReadmePath);
        } else if (waveResult.action === 'skipped') {
          results.skipped.push({ path: waveReadmePath, reason: waveResult.reason });
        } else if (waveResult.action === 'error') {
          results.errors.push({ path: waveReadmePath, error: waveResult.error });
        }
      }
    }
    // Track research design info
    results.researchDesign = results.researchDesign || {};
    results.researchDesign.wavesCreated = researchDesign.waves.length;
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
const projectName = args['project-name'] || 'Qualitative Research Project';
const force = args.force === true;

// Parse research design if provided
let researchDesign = null;
if (args['research-design']) {
  try {
    researchDesign = JSON.parse(args['research-design']);
  } catch (e) {
    console.error(JSON.stringify({
      success: false,
      error: `Invalid JSON in --research-design: ${e.message}`
    }));
    process.exit(1);
  }
}

// Path traversal protection
const resolvedPath = path.resolve(projectPath);
const configTarget = path.join(resolvedPath, '.interpretive-orchestration');
if (!configTarget.startsWith(resolvedPath + path.sep) && configTarget !== resolvedPath) {
  console.error(JSON.stringify({
    success: false,
    error: 'Path traversal detected - invalid project path'
  }));
  process.exit(1);
}

const results = createStructure(resolvedPath, projectName, force, researchDesign);

// Add warning if files were skipped
if (results.skipped.length > 0) {
  results.warning = `${results.skipped.length} file(s) skipped to preserve existing content. Use --force to overwrite.`;
}

console.log(JSON.stringify(results, null, 2));

process.exit(results.success ? 0 : 1);
