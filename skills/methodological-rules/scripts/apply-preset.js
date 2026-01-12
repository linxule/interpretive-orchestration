#!/usr/bin/env node
/**
 * apply-preset.js
 * Applies a methodology preset to configure rules, prompts, and defaults
 *
 * Usage:
 *   node apply-preset.js --project-path /path/to/project --preset gioia_corley
 *   node apply-preset.js --project-path /path/to/project --list-presets
 *
 * Presets configure:
 * - Isolation rule defaults (case, wave, stream)
 * - Proactive prompts appropriate for the methodology
 * - Philosophical defaults (if not already set)
 * - Coding vocabulary
 */

const fs = require('fs');
const path = require('path');

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

function loadPresets() {
  const presetsPath = path.join(__dirname, '..', 'templates', 'methodology-presets.json');
  return JSON.parse(fs.readFileSync(presetsPath, 'utf8'));
}

function loadProactivePrompts() {
  const promptsPath = path.join(__dirname, '..', 'templates', 'proactive-prompts.json');
  return JSON.parse(fs.readFileSync(promptsPath, 'utf8'));
}

function loadConfig(projectPath) {
  const configPath = path.join(projectPath, '.interpretive-orchestration', 'config.json');
  if (!fs.existsSync(configPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function saveConfig(projectPath, config) {
  const configPath = path.join(projectPath, '.interpretive-orchestration', 'config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function logToJournal(projectPath, message) {
  const journalPath = path.join(projectPath, '.interpretive-orchestration', 'reflexivity-journal.md');
  if (!fs.existsSync(journalPath)) return;

  const entry = `
---

### Methodology Preset Applied
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

function applyPreset(config, presetName, presetsData, promptsData) {
  const preset = presetsData.presets[presetName];
  if (!preset) {
    return { success: false, error: `Unknown preset: ${presetName}` };
  }

  // Initialize research_design if needed
  if (!config.research_design) {
    config.research_design = {};
  }

  // Apply methodology preset
  config.research_design.methodology_preset = presetName;

  // Apply isolation defaults (only if not already configured)
  if (!config.research_design.isolation_config) {
    config.research_design.isolation_config = {};
  }

  const isolation = config.research_design.isolation_config;
  const presetIsolation = preset.isolation_defaults;

  // Apply each isolation type if not already set
  for (const [key, defaults] of Object.entries(presetIsolation)) {
    if (!isolation[key] || isolation[key].enabled === undefined) {
      isolation[key] = { ...defaults };
    }
  }

  // Apply proactive prompts configuration
  if (!config.research_design.proactive_prompts) {
    config.research_design.proactive_prompts = {
      enabled: true,
      cooldown_turns: 5,
      suppressed_prompts: [],
      prompt_history: []
    };
  }

  // Set which prompts are active for this methodology
  config.research_design.proactive_prompts.active_prompts = preset.proactive_prompts || [];

  // Apply philosophical defaults (only if not already set)
  if (preset.philosophical_defaults && Object.keys(preset.philosophical_defaults).length > 0) {
    if (!config.philosophical_stance) {
      config.philosophical_stance = {};
    }

    for (const [key, value] of Object.entries(preset.philosophical_defaults)) {
      if (config.philosophical_stance[key] === undefined) {
        config.philosophical_stance[key] = value;
      }
    }
  }

  // Apply coding vocabulary (only if not already set)
  if (preset.coding_verbs && preset.coding_verbs.length > 0) {
    if (!config.philosophical_stance.coding_verbs || config.philosophical_stance.coding_verbs.length === 0) {
      config.philosophical_stance.coding_verbs = preset.coding_verbs;
    }
  }

  if (preset.avoid_verbs && preset.avoid_verbs.length > 0) {
    if (!config.philosophical_stance.avoid_verbs || config.philosophical_stance.avoid_verbs.length === 0) {
      config.philosophical_stance.avoid_verbs = preset.avoid_verbs;
    }
  }

  return {
    success: true,
    preset: presetName,
    preset_name: preset.name,
    description: preset.description,
    applied: {
      isolation_rules: Object.keys(presetIsolation).filter(k => presetIsolation[k].enabled),
      proactive_prompts: preset.proactive_prompts?.length || 0,
      key_practices: preset.key_practices
    }
  };
}

// Main execution
const args = parseArgs();

// List presets mode
if (args['list-presets']) {
  const presetsData = loadPresets();
  const presetList = Object.entries(presetsData.presets).map(([id, preset]) => ({
    id,
    name: preset.name,
    description: preset.description,
    key_practices: preset.key_practices?.slice(0, 3) || []
  }));

  console.log(JSON.stringify({
    success: true,
    presets: presetList,
    selection_guide: presetsData.preset_selection_guide
  }, null, 2));
  process.exit(0);
}

// Apply preset mode
if (!args['project-path']) {
  console.error(JSON.stringify({
    success: false,
    error: 'Missing required argument: --project-path'
  }));
  process.exit(1);
}

if (!args.preset) {
  console.error(JSON.stringify({
    success: false,
    error: 'Missing required argument: --preset',
    hint: 'Use --list-presets to see available presets'
  }));
  process.exit(1);
}

const projectPath = path.resolve(args['project-path']);
const config = loadConfig(projectPath);

if (!config) {
  console.error(JSON.stringify({
    success: false,
    error: 'Config not found. Run /qual-init first.'
  }));
  process.exit(1);
}

const presetsData = loadPresets();
const promptsData = loadProactivePrompts();
const result = applyPreset(config, args.preset, presetsData, promptsData);

if (result.success) {
  saveConfig(projectPath, config);

  // Log to journal
  logToJournal(projectPath, `**Applied Methodology Preset: ${result.preset_name}**

${result.description}

**Configured:**
- Isolation rules: ${result.applied.isolation_rules.join(', ') || 'None'}
- Proactive prompts: ${result.applied.proactive_prompts}

**Key Practices for ${result.preset_name}:**
${result.applied.key_practices.map(p => `- ${p}`).join('\n')}`);

  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
} else {
  console.error(JSON.stringify(result));
  process.exit(1);
}
