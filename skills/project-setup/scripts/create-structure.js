#!/usr/bin/env node
/**
 * create-structure.js
 * Creates the project folder hierarchy for Interpretive Orchestration
 *
 * Usage:
 *   node create-structure.js --project-path /path/to/project --project-name "My Research"
 *
 * Options:
 *   --force    Overwrite existing files (DANGEROUS - will destroy user content)
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

function createStructure(projectPath, projectName, force = false) {
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

const results = createStructure(resolvedPath, projectName, force);

// Add warning if files were skipped
if (results.skipped.length > 0) {
  results.warning = `${results.skipped.length} file(s) skipped to preserve existing content. Use --force to overwrite.`;
}

console.log(JSON.stringify(results, null, 2));

process.exit(results.success ? 0 : 1);
