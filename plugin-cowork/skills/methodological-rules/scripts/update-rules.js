#!/usr/bin/env node
/**
 * update-rules.js
 * Called by PostPhaseTransition hook to update rule statuses
 *
 * Usage:
 *   node update-rules.js --project-path /path/to/project
 *
 * This script:
 * 1. Checks current phase
 * 2. Determines which rules need status updates
 * 3. Regenerates affected rules
 * 4. Logs changes to reflexivity journal
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].replace('--', '');
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true;
      parsed[key] = value;
    }
  }
  return parsed;
}

function logToJournal(projectPath, message) {
  const journalPath = path.join(projectPath, '.interpretive-orchestration', 'reflexivity-journal.md');
  if (!fs.existsSync(journalPath)) return;

  const entry = `
---

### Phase Transition - Rules Updated
**Date:** ${new Date().toISOString().split('T')[0]}
**Time:** ${new Date().toTimeString().split(' ')[0]}

${message}

---
`;

  try {
    fs.appendFileSync(journalPath, entry);
  } catch (e) {
    // Non-critical
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

const projectPath = path.resolve(args['project-path']);
const rulesDir = path.join(projectPath, '.claude', 'rules');

// First, check current phase status
const checkPhaseScript = path.join(__dirname, 'check-phase.js');
let phaseInfo;

try {
  const output = execSync(`node "${checkPhaseScript}" --project-path "${projectPath}"`, {
    encoding: 'utf8'
  });
  phaseInfo = JSON.parse(output);
} catch (e) {
  console.error(JSON.stringify({
    success: false,
    error: `Failed to check phase: ${e.message}`
  }));
  process.exit(1);
}

// Check if any rules exist that need updating
const existingRules = [];
if (fs.existsSync(rulesDir)) {
  const files = fs.readdirSync(rulesDir);
  for (const file of files) {
    if (file.endsWith('.md')) {
      existingRules.push(file.replace('.md', ''));
    }
  }
}

// Determine what changed
const relaxedRules = phaseInfo.rules_should_relax.map(r => r.name);
const rulesNeedingUpdate = existingRules.filter(ruleName => {
  // Read current rule to check its status
  const rulePath = path.join(rulesDir, `${ruleName}.md`);
  try {
    const content = fs.readFileSync(rulePath, 'utf8');
    const isCurrentlyActive = content.includes('**Rule Status:** ACTIVE');
    const shouldBeRelaxed = relaxedRules.includes(ruleName);

    // Need update if status mismatch
    return isCurrentlyActive && shouldBeRelaxed;
  } catch (e) {
    return false;
  }
});

if (rulesNeedingUpdate.length === 0) {
  console.log(JSON.stringify({
    success: true,
    message: 'No rules need updating',
    current_phase: phaseInfo.current_phase,
    rules_checked: existingRules.length
  }));
  process.exit(0);
}

// Regenerate all rules (simplest approach - ensures consistency)
const generateScript = path.join(__dirname, 'generate-rules.js');
let generateResult;

try {
  const output = execSync(`node "${generateScript}" --project-path "${projectPath}"`, {
    encoding: 'utf8'
  });
  generateResult = JSON.parse(output);
} catch (e) {
  console.error(JSON.stringify({
    success: false,
    error: `Failed to regenerate rules: ${e.message}`
  }));
  process.exit(1);
}

// Log the transition
const transitionMessage = `**Phase Transition Detected**

**New Phase:** ${phaseInfo.current_phase}

**Rules Relaxed:**
${rulesNeedingUpdate.map(r => `- ${r}`).join('\n') || '- None'}

**Rules Still Active:**
${phaseInfo.rules_still_active.map(r => `- ${r.name} (until ${r.relaxes_at})`).join('\n') || '- None'}

This is a natural part of your analytical progression. Rules relax when methodologically appropriate.`;

logToJournal(projectPath, transitionMessage);

// Output result
console.log(JSON.stringify({
  success: true,
  current_phase: phaseInfo.current_phase,
  rules_updated: rulesNeedingUpdate,
  rules_regenerated: generateResult.rules_generated?.length || 0,
  message: `Phase transition: ${rulesNeedingUpdate.length} rule(s) relaxed`
}, null, 2));

process.exit(0);
