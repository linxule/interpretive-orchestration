/**
 * The project's analytical phase, and which isolation rules it has relaxed.
 * check-phase.js, generate-rules.js, update-rules.js and strain-check.js read
 * it from here.
 */

const PHASE_ORDER = [
  'stage1_foundation',
  'phase1_parallel_streams',
  'phase2_synthesis',
  'phase3_pattern_characterization',
  'cross_wave_analysis',
  'stage3_synthesis'
];

function getCurrentPhase(sandwichStatus) {
  if (!sandwichStatus) return 'stage1_foundation';

  const stage = sandwichStatus.current_stage;
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
  return stage;
}

// A rule relaxes once the current phase is at or past its relaxes_at phase.
// An unknown phase relaxes nothing.
function shouldRelax(relaxesAt, currentPhase) {
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);
  const relaxIndex = PHASE_ORDER.indexOf(relaxesAt);
  if (currentIndex === -1 || relaxIndex === -1) return false;
  return currentIndex >= relaxIndex;
}

// The current phase, and which of the design's rules should be relaxed or
// still active. This is what check-phase.js prints.
function checkPhase(config) {
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

  const rules = [
    { name: 'case-isolation', key: 'case_isolation', applies: design.cases?.length > 0,
      defaultRelaxesAt: 'phase3_pattern_characterization' },
    { name: 'wave-isolation', key: 'wave_isolation', applies: design.waves?.length > 0,
      defaultRelaxesAt: 'cross_wave_analysis' },
    { name: 'stream-separation', key: 'stream_separation', applies: true,
      defaultRelaxesAt: 'phase2_synthesis' }
  ];
  for (const rule of rules) {
    if (isolation[rule.key]?.enabled === false || !rule.applies) continue;
    const relaxesAt = isolation[rule.key]?.relaxes_at || rule.defaultRelaxesAt;
    const list = shouldRelax(relaxesAt, currentPhase) ? result.rules_should_relax : result.rules_still_active;
    list.push({ name: rule.name, relaxes_at: relaxesAt });
  }

  return result;
}

module.exports = { getCurrentPhase, shouldRelax, checkPhase };
