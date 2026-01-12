#!/usr/bin/env node

/**
 * PostPhaseTransition Hook: Updates Methodological Rules
 *
 * Triggered after phase-changing commands to update rule statuses.
 * Rules automatically relax when their relaxes_at phase is reached.
 *
 * Philosophy: Methodological rules should adapt to your analytical phase.
 * What's forbidden during open coding becomes appropriate at synthesis.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find project root by looking for .interpretive-orchestration/ directory
function findProjectRoot(startPath) {
  let currentPath = startPath;
  while (currentPath !== path.parse(currentPath).root) {
    if (fs.existsSync(path.join(currentPath, '.interpretive-orchestration'))) {
      return currentPath;
    }
    currentPath = path.dirname(currentPath);
  }
  return null;
}

// Get plugin root (where this hook script lives)
function getPluginRoot() {
  // This script is in hooks/, so plugin root is parent
  return path.dirname(__dirname);
}

// Main hook logic
function handlePhaseTransition() {
  const projectRoot = findProjectRoot(process.cwd());

  if (!projectRoot) {
    // No project - nothing to do
    console.log('ℹ️  No Interpretive Orchestration project found. Skipping rule update.');
    process.exit(0);
  }

  const configPath = path.join(projectRoot, '.interpretive-orchestration', 'config.json');
  const rulesDir = path.join(projectRoot, '.claude', 'rules');

  if (!fs.existsSync(configPath)) {
    console.log('ℹ️  No config found. Skipping rule update.');
    process.exit(0);
  }

  // Check if rules exist (if not, nothing to update)
  if (!fs.existsSync(rulesDir)) {
    console.log('ℹ️  No rules directory. Consider running /qual-design to configure research design.');
    process.exit(0);
  }

  const ruleFiles = fs.readdirSync(rulesDir).filter(f => f.endsWith('.md'));
  if (ruleFiles.length === 0) {
    console.log('ℹ️  No rules to update.');
    process.exit(0);
  }

  // Run the update-rules script
  const pluginRoot = getPluginRoot();
  const updateScript = path.join(pluginRoot, 'skills', 'methodological-rules', 'scripts', 'update-rules.js');

  if (!fs.existsSync(updateScript)) {
    console.log('⚠️  update-rules.js not found. Rules not updated.');
    process.exit(0);
  }

  try {
    const output = execSync(`node "${updateScript}" --project-path "${projectRoot}"`, {
      encoding: 'utf8',
      timeout: 10000
    });

    const result = JSON.parse(output);

    if (result.rules_updated && result.rules_updated.length > 0) {
      console.log('');
      console.log('📋 METHODOLOGICAL RULES UPDATED');
      console.log('');
      console.log(`   Phase transition to: ${result.current_phase}`);
      console.log('');
      console.log('   Rules relaxed:');
      for (const rule of result.rules_updated) {
        console.log(`   • ${rule} - now RELAXED`);
      }
      console.log('');
      console.log('   What this means:');
      console.log('   Previously restricted analytical moves are now appropriate.');
      console.log('   This is part of your natural methodological progression.');
      console.log('');
      console.log('   📓 Change logged to reflexivity journal.');
      console.log('');
    } else {
      // Silent exit if no changes
      console.log(`ℹ️  Phase: ${result.current_phase}. No rule updates needed.`);
    }

    process.exit(0);
  } catch (error) {
    // Non-blocking - rule updates are advisory
    console.log('⚠️  Could not update rules:', error.message);
    console.log('   This is non-blocking. Continuing with your work.');
    process.exit(0);
  }
}

// Run the hook
try {
  handlePhaseTransition();
} catch (error) {
  console.error('⚠️  Error in phase transition hook:', error.message);
  // Non-blocking
  process.exit(0);
}
