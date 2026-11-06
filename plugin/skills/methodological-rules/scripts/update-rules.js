#!/usr/bin/env node
/**
 * update-rules.js
 * Called by PostPhaseTransition hook to update rule statuses
 *
 * Usage:
 *   node update-rules.js --project-path /path/to/project
 *
 * This script:
 * 1. Checks current phase (phase.js)
 * 2. Determines which rules need status updates
 * 3. Regenerates affected rules
 * 4. Logs changes to reflexivity journal
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { checkPhase } = require('./phase.js');

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

let phaseInfo;

try {
  const configPath = path.join(projectPath, '.interpretive-orchestration', 'config.json');
  phaseInfo = checkPhase(JSON.parse(fs.readFileSync(configPath, 'utf8')));
} catch (e) {
  console.error(JSON.stringify({
    success: false,
    error: `Failed to check phase: ${e.message}`
  }));
  process.exit(1);
}

const existingRules = [];
if (fs.existsSync(rulesDir)) {
  const files = fs.readdirSync(rulesDir);
  for (const file of files) {
    if (file.endsWith('.md')) {
      existingRules.push(file.replace('.md', ''));
    }
  }
}

function ruleStatus(ruleName) {
  try {
    const content = fs.readFileSync(path.join(rulesDir, `${ruleName}.md`), 'utf8');
    if (content.includes('**Rule Status:** ACTIVE')) return 'ACTIVE';
    if (content.includes('**Rule Status:** RELAXED')) return 'RELAXED';
  } catch (e) {
    // A missing or unreadable rule file has no status.
  }
  return null;
}

function noUpdates() {
  console.log(JSON.stringify({
    success: true,
    message: 'No rules need updating',
    current_phase: phaseInfo.current_phase,
    rules_checked: existingRules.length
  }));
  process.exit(0);
}

const relaxedRules = phaseInfo.rules_should_relax.map(r => r.name);
const rulesNeedingUpdate = existingRules.filter(ruleName =>
  ruleStatus(ruleName) === 'ACTIVE' && relaxedRules.includes(ruleName));

if (rulesNeedingUpdate.length === 0) noUpdates();

// Regenerate all rules (simplest approach - ensures consistency)
const generateScript = path.join(__dirname, 'generate-rules.js');
let generateResult;

try {
  const output = execFileSync(process.execPath, [generateScript, '--project-path', projectPath], {
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

// Report only rules the regeneration actually relaxed. Without a research
// design, for example, nothing is regenerated (rules_generated is 0) and the
// file stays ACTIVE.
const regenerated = Array.isArray(generateResult.rules_generated) ? generateResult.rules_generated : [];
const rulesRelaxed = rulesNeedingUpdate.filter(ruleName =>
  regenerated.some(rule => rule.name === ruleName && rule.status === 'RELAXED'));
if (rulesRelaxed.length === 0) noUpdates();

const transitionMessage = `**Phase Transition Detected**

**New Phase:** ${phaseInfo.current_phase}

**Rules Relaxed:**
${rulesRelaxed.map(r => `- ${r}`).join('\n')}

**Rules Still Active:**
${phaseInfo.rules_still_active.map(r => `- ${r.name} (until ${r.relaxes_at})`).join('\n') || '- None'}

This is a natural part of your analytical progression. Rules relax when methodologically appropriate.`;

logToJournal(projectPath, transitionMessage);

console.log(JSON.stringify({
  success: true,
  current_phase: phaseInfo.current_phase,
  rules_updated: rulesRelaxed,
  rules_regenerated: regenerated.length,
  message: `Phase transition: ${rulesRelaxed.length} rule(s) relaxed`
}, null, 2));

process.exit(0);
