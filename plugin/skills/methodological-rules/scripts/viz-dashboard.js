#!/usr/bin/env node
/**
 * viz-dashboard.js
 * CLI visualization suite for methodological status
 *
 * Provides visual dashboards for:
 * - Saturation tracking (ASCII curve, indicators)
 * - Rule status (active rules, strain levels)
 * - Workspace branches (tree view)
 * - Overall project status (combined view)
 *
 * Usage:
 *   node viz-dashboard.js --project-path /path/to/project --view saturation
 *   node viz-dashboard.js --project-path /path/to/project --view rules
 *   node viz-dashboard.js --project-path /path/to/project --view branches
 *   node viz-dashboard.js --project-path /path/to/project --view all
 *   node viz-dashboard.js --project-path /path/to/project --mermaid lineage
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

function loadConfig(projectPath) {
  const configPath = path.join(projectPath, '.interpretive-orchestration', 'config.json');
  if (!fs.existsSync(configPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

// ═══════════════════════════════════════════════════════════════════════════
// ASCII Art & Formatting Helpers
// ═══════════════════════════════════════════════════════════════════════════

const BOX = {
  topLeft: '┌',
  topRight: '┐',
  bottomLeft: '└',
  bottomRight: '┘',
  horizontal: '─',
  vertical: '│',
  teeRight: '├',
  teeLeft: '┤',
  cross: '┼',
  teeDown: '┬',
  teeUp: '┴'
};

const INDICATORS = {
  full: '█',
  threeQuarters: '▓',
  half: '▒',
  quarter: '░',
  empty: ' ',
  bullet: '●',
  circle: '○',
  check: '✓',
  cross: '✗',
  arrow: '→',
  star: '★'
};

function repeat(char, count) {
  return char.repeat(Math.max(0, count));
}

function padRight(str, len) {
  return str.substring(0, len).padEnd(len);
}

function padLeft(str, len) {
  return str.substring(0, len).padStart(len);
}

function centerText(text, width) {
  const padding = Math.max(0, width - text.length);
  const leftPad = Math.floor(padding / 2);
  return repeat(' ', leftPad) + text + repeat(' ', padding - leftPad);
}

function progressBar(value, max, width = 20) {
  const filled = Math.round((value / max) * width);
  const empty = width - filled;
  return INDICATORS.full.repeat(filled) + INDICATORS.quarter.repeat(empty);
}

function box(title, content, width = 60) {
  const lines = content.split('\n');
  const innerWidth = width - 4;

  let output = [];
  output.push(BOX.topLeft + BOX.horizontal + ' ' + title + ' ' + repeat(BOX.horizontal, width - title.length - 5) + BOX.topRight);

  for (const line of lines) {
    output.push(BOX.vertical + ' ' + padRight(line, innerWidth) + ' ' + BOX.vertical);
  }

  output.push(BOX.bottomLeft + repeat(BOX.horizontal, width - 2) + BOX.bottomRight);
  return output.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════
// Saturation Visualization
// ═══════════════════════════════════════════════════════════════════════════

function vizSaturation(config) {
  const tracking = config.saturation_tracking;

  if (!tracking) {
    return box('SATURATION TRACKING', 'Not initialized. Record your first document to begin tracking.');
  }

  const lines = [];

  // Header
  const level = tracking.saturation_signals?.overall_level || 'unknown';
  const levelEmoji = {
    low: '○○○○○',
    emerging: '●○○○○',
    approaching: '●●○○○',
    high: '●●●○○',
    saturated: '●●●●●'
  }[level] || '?????';

  lines.push(`Saturation Level: ${level.toUpperCase()} ${levelEmoji}`);
  lines.push('');

  // Code Generation Rate Chart
  lines.push('CODE GENERATION (new codes per document)');
  const codesByDoc = tracking.code_generation?.codes_by_document || [];
  if (codesByDoc.length > 0) {
    // ASCII sparkline of last 10 documents
    const recent = codesByDoc.slice(-10);
    const maxCodes = Math.max(...recent.map(d => d.new_codes_created), 1);

    // Draw mini bar chart
    const chartHeight = 4;
    for (let row = chartHeight; row > 0; row--) {
      const threshold = (row / chartHeight) * maxCodes;
      let chartLine = '  ';
      for (const doc of recent) {
        chartLine += doc.new_codes_created >= threshold ? '█ ' : '  ';
      }
      lines.push(chartLine + (row === chartHeight ? ` ${maxCodes}` : ''));
    }
    lines.push('  ' + repeat('──', recent.length) + ' 0');
    lines.push('  ' + recent.map((_, i) => (i + 1).toString().padStart(2)).join(''));
    lines.push(`  Rate: ${tracking.code_generation.generation_rate}/doc | Total: ${tracking.code_generation.total_codes}`);

    if (tracking.code_generation.stabilized_at_document) {
      lines.push(`  ${INDICATORS.check} Stabilized at: ${tracking.code_generation.stabilized_at_document}`);
    }
  } else {
    lines.push('  No documents tracked yet');
  }

  lines.push('');

  // Refinement Activity
  lines.push('REFINEMENT ACTIVITY');
  const refinement = tracking.refinement || {};
  lines.push(`  Recent changes: ${refinement.changes_last_5_documents || 0}`);
  lines.push(`  Splits/merges: ${refinement.split_merge_count || 0}`);

  lines.push('');

  // Redundancy Score
  lines.push('REDUNDANCY');
  const redundancy = tracking.redundancy || {};
  const redScore = redundancy.redundancy_score || 0;
  lines.push(`  Score: ${progressBar(redScore, 1, 15)} ${Math.round(redScore * 100)}%`);
  if (redundancy.assessment_notes) {
    lines.push(`  Notes: ${redundancy.assessment_notes.substring(0, 40)}...`);
  }

  lines.push('');

  // Recommendation
  if (tracking.saturation_signals?.recommendation) {
    lines.push('RECOMMENDATION');
    const rec = tracking.saturation_signals.recommendation;
    // Word wrap recommendation
    const words = rec.split(' ');
    let line = '  ';
    for (const word of words) {
      if (line.length + word.length > 55) {
        lines.push(line);
        line = '  ' + word + ' ';
      } else {
        line += word + ' ';
      }
    }
    if (line.trim()) lines.push(line);
  }

  return box('SATURATION TRACKING', lines.join('\n'), 60);
}

// ═══════════════════════════════════════════════════════════════════════════
// Rules Visualization
// ═══════════════════════════════════════════════════════════════════════════

function vizRules(config) {
  const research = config.research_design || {};
  const isolation = research.isolation_config || {};
  const strain = research.strain_tracking || {};

  const lines = [];

  // Phase info
  const phase = getCurrentPhase(config);
  lines.push(`Current Phase: ${phase}`);
  lines.push('');

  // Isolation Rules Table
  lines.push('ISOLATION RULES');
  lines.push('─────────────────────────────────────────────────');
  lines.push('Rule              Status    Friction   Relaxes At');
  lines.push('─────────────────────────────────────────────────');

  const rules = [
    { id: 'case-isolation', name: 'Case Isolation', config: isolation.case_isolation },
    { id: 'wave-isolation', name: 'Wave Isolation', config: isolation.wave_isolation },
    { id: 'stream-separation', name: 'Stream Sep.', config: isolation.stream_separation }
  ];

  for (const rule of rules) {
    const cfg = rule.config || {};
    const enabled = cfg.enabled !== false;
    const friction = cfg.friction_level || 'nudge';
    const relaxesAt = cfg.relaxes_at || 'manual';

    // Check if strained
    const overrideCount = strain.override_counts?.[rule.id]?.count || 0;
    const isStrained = overrideCount >= (strain.strain_threshold || 3);

    const statusIcon = enabled ? (isStrained ? '⚠' : '●') : '○';
    const statusText = enabled ? (isStrained ? 'STRAIN' : 'Active') : 'Off';

    lines.push(
      padRight(rule.name, 16) + '  ' +
      statusIcon + ' ' + padRight(statusText, 6) + ' ' +
      padRight(friction, 9) + ' ' +
      relaxesAt.substring(0, 15)
    );

    if (overrideCount > 0) {
      lines.push(`                  └─ ${overrideCount} overrides`);
    }
  }

  lines.push('');

  // Strain Summary
  if (strain.strained_rules?.length > 0) {
    lines.push('⚠ STRAIN DETECTED');
    lines.push(`Rules: ${strain.strained_rules.join(', ')}`);
    lines.push('Run strain-check.js for review prompts');
  }

  // Methodology Preset
  if (research.methodology_preset) {
    lines.push('');
    lines.push(`Methodology: ${research.methodology_preset}`);
  }

  return box('METHODOLOGICAL RULES', lines.join('\n'), 60);
}

function getCurrentPhase(config) {
  const sandwich = config.sandwich_status;
  if (!sandwich) return 'unknown';

  if (sandwich.current_stage === 'stage1_foundation') return 'Stage 1: Foundation';
  if (sandwich.current_stage === 'stage3_synthesis') return 'Stage 3: Synthesis';

  const progress = sandwich.stage2_progress || {};
  if (progress.phase3_pattern_characterization === 'in_progress' || progress.phase3_pattern_characterization === 'complete') {
    return 'Phase 3: Pattern Characterization';
  }
  if (progress.phase2_synthesis === 'in_progress' || progress.phase2_synthesis === 'complete') {
    return 'Phase 2: Synthesis';
  }
  return 'Phase 1: Parallel Streams';
}

// ═══════════════════════════════════════════════════════════════════════════
// Branches Visualization
// ═══════════════════════════════════════════════════════════════════════════

function vizBranches(config) {
  const branches = config.workspace_branches;

  if (!branches || branches.branches.length <= 1) {
    return box('WORKSPACE BRANCHES', 'Single branch (main). Use --fork to explore alternatives.');
  }

  const lines = [];
  lines.push(`Current: ${branches.current_branch}`);
  lines.push('');

  // Build tree structure
  lines.push('BRANCH TREE');

  // Group by parent
  const byParent = {};
  for (const branch of branches.branches) {
    const parent = branch.parent_branch || 'root';
    if (!byParent[parent]) byParent[parent] = [];
    byParent[parent].push(branch);
  }

  // Render tree from main
  function renderTree(branchId, indent = '') {
    const children = byParent[branchId] || [];
    for (let i = 0; i < children.length; i++) {
      const branch = children[i];
      const isLast = i === children.length - 1;
      const prefix = isLast ? '└──' : '├──';
      const childIndent = indent + (isLast ? '   ' : '│  ');

      const statusIcon = {
        active: branch.id === branches.current_branch ? '●' : '○',
        merged: '✓',
        abandoned: '✗'
      }[branch.status] || '?';

      const framingTag = branch.methodological_framing ? ` [${branch.methodological_framing}]` : '';

      lines.push(`${indent}${prefix} ${statusIcon} ${branch.name}${framingTag}`);

      renderTree(branch.id, childIndent);
    }
  }

  // Start from main
  const main = branches.branches.find(b => b.id === 'main');
  if (main) {
    lines.push(`● ${main.name} (main)`);
    renderTree('main', '');
  }

  lines.push('');

  // Stats
  const active = branches.branches.filter(b => b.status === 'active').length;
  const merged = branches.branches.filter(b => b.status === 'merged').length;
  const abandoned = branches.branches.filter(b => b.status === 'abandoned').length;

  lines.push(`Active: ${active} | Merged: ${merged} | Abandoned: ${abandoned}`);

  return box('WORKSPACE BRANCHES', lines.join('\n'), 60);
}

// ═══════════════════════════════════════════════════════════════════════════
// Combined Dashboard
// ═══════════════════════════════════════════════════════════════════════════

function vizAll(config) {
  const output = [];

  // Header
  const projectName = config.project_info?.name || 'Unnamed Project';
  output.push('');
  output.push('╔════════════════════════════════════════════════════════════╗');
  output.push(`║ ${centerText(projectName, 58)} ║`);
  output.push('║ ' + centerText('Interpretive Orchestration Dashboard', 58) + ' ║');
  output.push('╚════════════════════════════════════════════════════════════╝');
  output.push('');

  // Sandwich Status Bar
  const stage = config.sandwich_status?.current_stage || 'unknown';
  const stageNum = stage.includes('1') ? 1 : stage.includes('3') ? 3 : 2;
  output.push('Stage Progress: ' +
    (stageNum >= 1 ? '●' : '○') + '─' +
    (stageNum >= 2 ? '●' : '○') + '─' +
    (stageNum >= 3 ? '●' : '○') +
    '  [' + (stageNum === 1 ? 'Foundation' : stageNum === 2 ? 'Collaboration' : 'Synthesis') + ']');
  output.push('');

  // Three boxes side by side is hard in CLI, so stack them
  output.push(vizSaturation(config));
  output.push('');
  output.push(vizRules(config));
  output.push('');
  output.push(vizBranches(config));

  return output.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════
// Mermaid Export
// ═══════════════════════════════════════════════════════════════════════════

function mermaidCodeLineage(config) {
  const tracking = config.saturation_tracking;
  const dataStructure = config.data_structure;

  const lines = ['```mermaid', 'flowchart TD'];
  lines.push('  subgraph "Data Structure"');

  // Build from data_structure if available
  if (dataStructure?.aggregate_dimensions) {
    for (const dim of dataStructure.aggregate_dimensions) {
      lines.push(`    AD_${dim.id}["${dim.name}"]`);
    }
  }

  if (dataStructure?.second_order_themes) {
    for (const theme of dataStructure.second_order_themes) {
      lines.push(`    SOT_${theme.id}["${theme.name}"]`);
      if (theme.parent_dimension) {
        lines.push(`    SOT_${theme.id} --> AD_${theme.parent_dimension}`);
      }
    }
  }

  if (dataStructure?.first_order_concepts) {
    for (const concept of dataStructure.first_order_concepts) {
      lines.push(`    FOC_${concept.id}["${concept.name}"]`);
      if (concept.parent_theme) {
        lines.push(`    FOC_${concept.id} --> SOT_${concept.parent_theme}`);
      }
    }
  }

  lines.push('  end');

  // Add refinement history if available
  if (tracking?.refinement?.definition_changes?.length > 0) {
    lines.push('  subgraph "Recent Refinements"');
    const recent = tracking.refinement.definition_changes.slice(-5);
    for (let i = 0; i < recent.length; i++) {
      const change = recent[i];
      const icon = change.change_type === 'split' ? '↗' : change.change_type === 'merge' ? '↘' : '→';
      lines.push(`    REF_${i}["${change.code_id}: ${change.change_type}"]`);
    }
    lines.push('  end');
  }

  lines.push('```');

  return lines.join('\n');
}

function mermaidBranchTree(config) {
  const branches = config.workspace_branches;

  if (!branches) {
    return '```mermaid\ngraph TD\n  main["Main Analysis"]\n```';
  }

  const lines = ['```mermaid', 'graph TD'];

  for (const branch of branches.branches) {
    const status = branch.status === 'merged' ? '✓' : branch.status === 'abandoned' ? '✗' : '';
    lines.push(`  ${branch.id}["${branch.name} ${status}"]`);

    if (branch.parent_branch) {
      lines.push(`  ${branch.parent_branch} --> ${branch.id}`);
    }
  }

  lines.push('```');
  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Execution
// ═══════════════════════════════════════════════════════════════════════════

const args = parseArgs();

if (!args['project-path']) {
  console.error('Missing required argument: --project-path');
  process.exit(1);
}

const projectPath = path.resolve(args['project-path']);
const config = loadConfig(projectPath);

if (!config) {
  console.error('Config not found. Run /qual-init first.');
  process.exit(1);
}

// Handle different views
const view = args.view || 'all';
const mermaid = args.mermaid;

if (mermaid) {
  if (mermaid === 'lineage') {
    console.log(mermaidCodeLineage(config));
  } else if (mermaid === 'branches') {
    console.log(mermaidBranchTree(config));
  } else {
    console.error('Unknown mermaid view. Use: lineage, branches');
    process.exit(1);
  }
} else {
  switch (view) {
    case 'saturation':
      console.log(vizSaturation(config));
      break;
    case 'rules':
      console.log(vizRules(config));
      break;
    case 'branches':
      console.log(vizBranches(config));
      break;
    case 'all':
    default:
      console.log(vizAll(config));
      break;
  }
}

process.exit(0);
