#!/usr/bin/env node
/**
 * check-phase.js
 * Returns current phase and which rules should be relaxed
 *
 * Usage:
 *   node check-phase.js --project-path /path/to/project
 *
 * Returns JSON with:
 *   - current_phase
 *   - rules_should_relax (array of rule names)
 *   - phase_details
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

function getCurrentPhase(sandwichStatus) {
  if (!sandwichStatus) return 'stage1_foundation';

  const stage = sandwichStatus.current_stage;

  if (stage === 'stage1_foundation') {
    return 'stage1_foundation';
  }

  if (stage === 'stage2_collaboration') {
    const progress = sandwichStatus.stage2_progress || {};
    if (progress.phase3_pattern_characterization === 'in_progress' ||
        progress.phase3_pattern_characterization === 'complete') {
      return 'phase3_pattern_characterization';
    }
    if (progress.phase2_synthesis === 'in_progress' ||
        progress.phase2_synthesis === 'complete') {
      return 'phase2_synthesis';
    }
    return 'phase1_parallel_streams';
  }

  if (stage === 'stage3_synthesis') {
    return 'stage3_synthesis';
  }

  return stage;
}

function shouldRelax(relaxesAt, currentPhase) {
  const phaseOrder = [
    'stage1_foundation',
    'phase1_parallel_streams',
    'phase2_synthesis',
    'phase3_pattern_characterization',
    'cross_wave_analysis',
    'stage3_synthesis'
  ];

  const currentIndex = phaseOrder.indexOf(currentPhase);
  const relaxIndex = phaseOrder.indexOf(relaxesAt);

  if (currentIndex === -1 || relaxIndex === -1) return false;
  return currentIndex >= relaxIndex;
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
const configPath = path.join(projectPath, '.interpretive-orchestration', 'config.json');

if (!fs.existsSync(configPath)) {
  console.error(JSON.stringify({
    success: false,
    error: 'Config not found'
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

const currentPhase = getCurrentPhase(config.sandwich_status);
const design = config.research_design || {};
const isolation = design.isolation_config || {};

const result = {
  success: true,
  current_phase: currentPhase,
  sandwich_status: config.sandwich_status,
  rules_should_relax: [],
  rules_still_active: [],
  phase_details: {
    stage: config.sandwich_status?.current_stage,
    stage1_complete: config.sandwich_status?.stage1_complete,
    stage2_progress: config.sandwich_status?.stage2_progress
  }
};

// Check each rule
if (isolation.case_isolation?.enabled !== false && design.cases?.length > 0) {
  const relaxesAt = isolation.case_isolation?.relaxes_at || 'phase3_pattern_characterization';
  if (shouldRelax(relaxesAt, currentPhase)) {
    result.rules_should_relax.push({ name: 'case-isolation', relaxes_at: relaxesAt });
  } else {
    result.rules_still_active.push({ name: 'case-isolation', relaxes_at: relaxesAt });
  }
}

if (isolation.wave_isolation?.enabled !== false && design.waves?.length > 0) {
  const relaxesAt = isolation.wave_isolation?.relaxes_at || 'cross_wave_analysis';
  if (shouldRelax(relaxesAt, currentPhase)) {
    result.rules_should_relax.push({ name: 'wave-isolation', relaxes_at: relaxesAt });
  } else {
    result.rules_still_active.push({ name: 'wave-isolation', relaxes_at: relaxesAt });
  }
}

if (isolation.stream_separation?.enabled !== false) {
  const relaxesAt = isolation.stream_separation?.relaxes_at || 'phase2_synthesis';
  if (shouldRelax(relaxesAt, currentPhase)) {
    result.rules_should_relax.push({ name: 'stream-separation', relaxes_at: relaxesAt });
  } else {
    result.rules_still_active.push({ name: 'stream-separation', relaxes_at: relaxesAt });
  }
}

console.log(JSON.stringify(result, null, 2));
process.exit(0);
