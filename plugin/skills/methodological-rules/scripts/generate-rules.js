#!/usr/bin/env node
/**
 * generate-rules.js
 * Generates Claude Code rules from research design configuration
 *
 * Usage:
 *   node generate-rules.js --project-path /path/to/project
 *
 * Reads:
 *   - .interpretive-orchestration/config.json (research_design section)
 *   - skills/methodological-rules/templates/*.template.md
 *
 * Writes:
 *   - .claude/rules/*.md (auto-discovered by Claude Code)
 *   - .interpretive-orchestration/reflexivity-journal.md (logs changes)
 */

const fs = require('fs');
const path = require('path');
const { getCurrentPhase, shouldRelax } = require('./phase.js');

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

/**
 * Simple template rendering (Mustache-lite)
 */
function renderTemplate(template, data) {
  let result = template;

  // Handle simple {{variable}} replacements
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value || '');
  }

  // Handle {{#array}}...{{/array}} blocks (simple iteration)
  const blockRegex = /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g;
  result = result.replace(blockRegex, (match, arrayName, blockContent) => {
    const array = data[arrayName];
    if (!Array.isArray(array)) return '';
    return array.map(item => {
      let itemResult = blockContent;
      for (const [key, value] of Object.entries(item)) {
        const itemRegex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        itemResult = itemResult.replace(itemRegex, value || '');
      }
      return itemResult;
    }).join('');
  });

  return result;
}

function generateCaseIsolationRule(config, templatesDir, currentPhase) {
  const design = config.research_design;
  if (!design || !design.cases || design.cases.length === 0) return null;

  const isolation = design.isolation_config?.case_isolation || {};
  if (isolation.enabled === false) return null;

  const templatePath = path.join(templatesDir, 'case-isolation.template.md');
  if (!fs.existsSync(templatePath)) {
    return { error: 'Template not found: case-isolation.template.md' };
  }

  const template = fs.readFileSync(templatePath, 'utf8');
  const relaxesAt = isolation.relaxes_at || 'phase3_pattern_characterization';
  const isRelaxed = shouldRelax(relaxesAt, currentPhase);

  const data = {
    study_type: design.study_type,
    case_count: design.cases.length,
    case_names: design.cases.map(c => c.name).join(', '),
    case_paths: design.cases.map(c => c.folder_path).filter(Boolean).join(', ') || 'not set',
    current_phase: currentPhase,
    rule_status: isRelaxed ? 'RELAXED' : 'ACTIVE',
    friction_level: isRelaxed ? 'SILENT' : (isolation.friction_level || 'challenge').toUpperCase(),
    relaxes_at_phase: relaxesAt,
    timestamp: new Date().toISOString()
  };

  return {
    filename: 'case-isolation.md',
    content: renderTemplate(template, data),
    status: data.rule_status,
    friction: data.friction_level
  };
}

function generateWaveIsolationRule(config, templatesDir, currentPhase) {
  const design = config.research_design;
  if (!design || !design.waves || design.waves.length === 0) return null;

  const isolation = design.isolation_config?.wave_isolation || {};
  if (isolation.enabled === false) return null;

  const templatePath = path.join(templatesDir, 'wave-isolation.template.md');
  if (!fs.existsSync(templatePath)) {
    return { error: 'Template not found: wave-isolation.template.md' };
  }

  const template = fs.readFileSync(templatePath, 'utf8');
  const relaxesAt = isolation.relaxes_at || 'cross_wave_analysis';
  const isRelaxed = shouldRelax(relaxesAt, currentPhase);

  const data = {
    study_type: design.study_type,
    wave_count: design.waves.length,
    wave_names: design.waves.map(w => w.name).join(', '),
    wave_paths: design.waves.map(w => w.folder_path).filter(Boolean).join(', ') || 'not set',
    waves: design.waves,
    current_phase: currentPhase,
    rule_status: isRelaxed ? 'RELAXED' : 'ACTIVE',
    friction_level: isRelaxed ? 'SILENT' : (isolation.friction_level || 'challenge').toUpperCase(),
    relaxes_at_phase: relaxesAt,
    timestamp: new Date().toISOString()
  };

  return {
    filename: 'wave-isolation.md',
    content: renderTemplate(template, data),
    status: data.rule_status,
    friction: data.friction_level
  };
}

function generateStreamSeparationRule(config, templatesDir, currentPhase) {
  const design = config.research_design;
  if (!design) return null;

  const isolation = design.isolation_config?.stream_separation || {};
  if (isolation.enabled === false) return null;

  const templatePath = path.join(templatesDir, 'stream-separation.template.md');
  if (!fs.existsSync(templatePath)) {
    return { error: 'Template not found: stream-separation.template.md' };
  }

  const template = fs.readFileSync(templatePath, 'utf8');
  const relaxesAt = isolation.relaxes_at || 'phase2_synthesis';
  const isRelaxed = shouldRelax(relaxesAt, currentPhase);

  const streams = design.streams || {};
  const theoretical = streams.theoretical || {};
  const empirical = streams.empirical || {};

  const data = {
    study_type: design.study_type || 'single_case',
    theoretical_path: theoretical.folder_path || 'literature',
    empirical_path: empirical.folder_path || 'data',
    theoretical_sources: (theoretical.sources || []).join(', ') || 'Not specified',
    empirical_sources: (empirical.sources || []).join(', ') || 'Not specified',
    current_phase: currentPhase,
    rule_status: isRelaxed ? 'RELAXED' : 'ACTIVE',
    friction_level: isRelaxed ? 'SILENT' : (isolation.friction_level || 'nudge').toUpperCase(),
    relaxes_at_phase: relaxesAt,
    timestamp: new Date().toISOString()
  };

  return {
    filename: 'stream-separation.md',
    content: renderTemplate(template, data),
    status: data.rule_status,
    friction: data.friction_level
  };
}

function logToJournal(projectPath, message) {
  const journalPath = path.join(projectPath, '.interpretive-orchestration', 'reflexivity-journal.md');

  if (!fs.existsSync(journalPath)) return;

  const entry = `
---

### Methodological Rules Update
**Date:** ${new Date().toISOString().split('T')[0]}
**Time:** ${new Date().toTimeString().split(' ')[0]}

${message}

---
`;

  try {
    fs.appendFileSync(journalPath, entry);
  } catch (e) {
    // Journal update is non-critical
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
const configPath = path.join(projectPath, '.interpretive-orchestration', 'config.json');
const rulesDir = path.join(projectPath, '.claude', 'rules');

// Find templates directory (relative to this script)
const templatesDir = path.join(__dirname, '..', 'templates');

if (!fs.existsSync(configPath)) {
  console.error(JSON.stringify({
    success: false,
    error: 'Config not found. Run /qual-init first.',
    path: configPath
  }));
  process.exit(1);
}

let config;
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (e) {
  console.error(JSON.stringify({
    success: false,
    error: `Failed to parse config: ${e.message}`
  }));
  process.exit(1);
}

if (!config.research_design) {
  console.log(JSON.stringify({
    success: true,
    message: 'No research_design configured. No rules generated.',
    rules_generated: 0
  }));
  process.exit(0);
}

const currentPhase = getCurrentPhase(config.sandwich_status);

try {
  fs.mkdirSync(rulesDir, { recursive: true });
} catch (e) {
  // Directory might exist
}

const results = {
  success: true,
  current_phase: currentPhase,
  rules_generated: [],
  rules_skipped: [],
  errors: []
};

const GENERATED_MARKER = '<!-- Generated by Interpretive Orchestration -->';

// Remove only disabled rules identifiable as generated, including the original template footer.
function removeDisabledRule(name, intent) {
  const rulePath = path.join(rulesDir, name + '.md');
  try {
    if (!fs.existsSync(rulePath)) return;
    const content = fs.readFileSync(rulePath, 'utf8');
    if (content.includes(GENERATED_MARKER) ||
        (content.includes(`*Rule Intent: ${intent}*`) && /\*Generated: [^\n]+\*/.test(content) && content.includes('*Relaxes at: '))) {
      fs.unlinkSync(rulePath);
    }
  } catch (e) {
    results.errors.push(`Failed to remove ${name}.md: ${e.message}`);
  }
}

// The intent is each template's original footer, so a rule file made from an
// older template is still recognized as generated.
const RULES = [
  { name: 'case-isolation', key: 'case_isolation', generate: generateCaseIsolationRule,
    intent: 'Preserve phenomenological distinctness of each case', skipped: 'no cases or disabled' },
  { name: 'wave-isolation', key: 'wave_isolation', generate: generateWaveIsolationRule,
    intent: 'Preserve temporal integrity and track genuine conceptual evolution', skipped: 'no waves or disabled' },
  { name: 'stream-separation', key: 'stream_separation', generate: generateStreamSeparationRule,
    intent: 'Preserve productive tension between theory and data', skipped: 'disabled' }
];

const isolation = config.research_design.isolation_config || {};
for (const rule of RULES) {
  if (isolation[rule.key]?.enabled === false) removeDisabledRule(rule.name, rule.intent);
}

for (const rule of RULES) {
  const generated = rule.generate(config, templatesDir, currentPhase);
  if (!generated) {
    results.rules_skipped.push(`${rule.name} (${rule.skipped})`);
    continue;
  }
  if (generated.error) {
    results.errors.push(generated.error);
    continue;
  }
  const rulePath = path.join(rulesDir, generated.filename);
  try {
    fs.writeFileSync(rulePath, generated.content + '\n' + GENERATED_MARKER + '\n');
    results.rules_generated.push({
      name: rule.name,
      path: rulePath,
      status: generated.status,
      friction: generated.friction
    });
  } catch (e) {
    results.errors.push(`Failed to write ${generated.filename}: ${e.message}`);
  }
}

if (results.rules_generated.length > 0) {
  const rulesSummary = results.rules_generated
    .map(r => `- **${r.name}**: ${r.status} (friction: ${r.friction})`)
    .join('\n');

  logToJournal(projectPath, `**Rules Generated/Updated:**\n${rulesSummary}\n\n**Current Phase:** ${currentPhase}`);
}

results.success = results.errors.length === 0;

console.log(JSON.stringify(results, null, 2));
process.exit(results.success ? 0 : 1);
