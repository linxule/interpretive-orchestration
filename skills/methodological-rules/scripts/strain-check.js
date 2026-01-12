#!/usr/bin/env node
/**
 * strain-check.js
 * Detects and handles methodological strain from repeated rule overrides
 *
 * Usage:
 *   node strain-check.js --project-path /path/to/project --rule-id case-isolation
 *   node strain-check.js --project-path /path/to/project --record-override --rule-id case-isolation --justification "Building cross-cutting theme"
 *
 * What is "strain"?
 * When a rule is overridden 3+ times in the same phase, it suggests the rule
 * may not fit the researcher's evolving methodology. Instead of just logging
 * violations, we trigger a methodological review conversation.
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

function saveConfig(projectPath, config) {
  const configPath = path.join(projectPath, '.interpretive-orchestration', 'config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

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

function logToJournal(projectPath, message) {
  const journalPath = path.join(projectPath, '.interpretive-orchestration', 'reflexivity-journal.md');
  if (!fs.existsSync(journalPath)) return;

  const entry = `
---

### Methodological Strain Detected
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

/**
 * Record an override and check for strain
 */
function recordOverride(config, ruleId, justification, currentPhase) {
  // Initialize strain tracking if needed
  if (!config.research_design) {
    config.research_design = {};
  }
  if (!config.research_design.strain_tracking) {
    config.research_design.strain_tracking = {
      override_counts: {},
      strain_threshold: 3,
      strained_rules: [],
      strain_reviews: []
    };
  }

  const tracking = config.research_design.strain_tracking;
  const now = new Date().toISOString();

  // Initialize count for this rule if needed
  if (!tracking.override_counts[ruleId]) {
    tracking.override_counts[ruleId] = {
      count: 0,
      last_override: null,
      phase_when_overridden: currentPhase
    };
  }

  const ruleCount = tracking.override_counts[ruleId];

  // Check if phase changed - reset count if so
  if (ruleCount.phase_when_overridden !== currentPhase) {
    ruleCount.count = 0;
    ruleCount.phase_when_overridden = currentPhase;
  }

  // Increment count
  ruleCount.count++;
  ruleCount.last_override = now;

  // Also log to rule_overrides array
  if (!config.research_design.rule_overrides) {
    config.research_design.rule_overrides = [];
  }
  config.research_design.rule_overrides.push({
    rule_id: ruleId,
    timestamp: now,
    justification: justification || '',
    compensatory_moves: [],
    outcome: 'pending'
  });

  // Check if strain threshold reached
  const threshold = tracking.strain_threshold || 3;
  const isStrained = ruleCount.count >= threshold;

  if (isStrained && !tracking.strained_rules.includes(ruleId)) {
    tracking.strained_rules.push(ruleId);
  }

  return {
    rule_id: ruleId,
    override_count: ruleCount.count,
    threshold: threshold,
    is_strained: isStrained,
    phase: currentPhase,
    first_time_strained: isStrained && ruleCount.count === threshold
  };
}

/**
 * Check strain status for all rules or specific rule
 */
function checkStrain(config, ruleId = null) {
  if (!config.research_design?.strain_tracking) {
    return {
      has_strain: false,
      strained_rules: [],
      override_counts: {}
    };
  }

  const tracking = config.research_design.strain_tracking;
  const threshold = tracking.strain_threshold || 3;

  if (ruleId) {
    const ruleCount = tracking.override_counts[ruleId];
    if (!ruleCount) {
      return {
        has_strain: false,
        rule_id: ruleId,
        override_count: 0,
        threshold: threshold
      };
    }
    return {
      has_strain: ruleCount.count >= threshold,
      rule_id: ruleId,
      override_count: ruleCount.count,
      threshold: threshold,
      last_override: ruleCount.last_override
    };
  }

  // Check all rules
  const strainedRules = [];
  for (const [id, counts] of Object.entries(tracking.override_counts)) {
    if (counts.count >= threshold) {
      strainedRules.push({
        rule_id: id,
        override_count: counts.count,
        last_override: counts.last_override
      });
    }
  }

  return {
    has_strain: strainedRules.length > 0,
    strained_rules: strainedRules,
    threshold: threshold,
    override_counts: tracking.override_counts
  };
}

/**
 * Record resolution of a strain review
 */
function recordStrainResolution(config, ruleId, resolution, notes) {
  if (!config.research_design?.strain_tracking) return;

  const tracking = config.research_design.strain_tracking;

  // Add to strain reviews log
  tracking.strain_reviews.push({
    rule_id: ruleId,
    triggered_at: new Date().toISOString(),
    override_count: tracking.override_counts[ruleId]?.count || 0,
    resolution: resolution,
    notes: notes || ''
  });

  // If resolution involves adjusting the rule, handle that
  if (resolution === 'phase_transition') {
    // Reset counts since we're moving to new phase
    if (tracking.override_counts[ruleId]) {
      tracking.override_counts[ruleId].count = 0;
    }
  }

  // Remove from strained list if resolved
  const strainedIndex = tracking.strained_rules.indexOf(ruleId);
  if (strainedIndex > -1) {
    tracking.strained_rules.splice(strainedIndex, 1);
  }

  return {
    success: true,
    resolution: resolution,
    rule_id: ruleId
  };
}

/**
 * Generate the strain review prompt
 */
function generateStrainPrompt(ruleId, overrideCount) {
  const prompts = {
    'case-isolation': `You've overridden case isolation ${overrideCount} times this phase. That's not wrong—it might mean your study is evolving.

Quick check: Are you...
[A] Moving toward cross-case synthesis (ready for phase transition?)
[B] Finding the rule too strict for your methodology
[C] Just exploring—keep the rule but note the pattern

What feels right?`,

    'wave-isolation': `You've crossed wave boundaries ${overrideCount} times this phase. Let's check in on this pattern.

Are you...
[A] Ready for cross-wave analysis (natural progression?)
[B] Finding temporal isolation doesn't fit your approach
[C] Exploring specific connections (legitimate but note it)

What's happening in your analysis?`,

    'stream-separation': `You've integrated theory and data ${overrideCount} times before the synthesis phase.

Are you...
[A] Ready to move to synthesis (streams mature enough?)
[B] Finding parallel streams too artificial for your work
[C] Using theoretical sampling (methodologically appropriate)

How would you characterize what's happening?`
  };

  return prompts[ruleId] || `You've overridden the ${ruleId} rule ${overrideCount} times. Let's review whether this rule fits your evolving methodology.`;
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
const config = loadConfig(projectPath);

if (!config) {
  console.error(JSON.stringify({
    success: false,
    error: 'Config not found'
  }));
  process.exit(1);
}

const currentPhase = getCurrentPhase(config.sandwich_status);

// Handle different modes
if (args['record-override']) {
  // Recording an override
  if (!args['rule-id']) {
    console.error(JSON.stringify({
      success: false,
      error: 'Missing --rule-id for override recording'
    }));
    process.exit(1);
  }

  const result = recordOverride(config, args['rule-id'], args.justification, currentPhase);
  saveConfig(projectPath, config);

  // If first time strained, log to journal and generate prompt
  if (result.first_time_strained) {
    const prompt = generateStrainPrompt(args['rule-id'], result.override_count);
    logToJournal(projectPath, `**Rule "${args['rule-id']}" has reached strain threshold (${result.override_count} overrides)**

This triggers a methodological review. Consider:
- Is this rule appropriate for your current phase?
- Has your study design evolved?
- Should you transition to the next phase?

${prompt}`);

    result.strain_prompt = prompt;
    result.action_required = 'methodological_review';
  }

  console.log(JSON.stringify(result, null, 2));

} else if (args['record-resolution']) {
  // Recording resolution of strain review
  if (!args['rule-id'] || !args.resolution) {
    console.error(JSON.stringify({
      success: false,
      error: 'Missing --rule-id or --resolution'
    }));
    process.exit(1);
  }

  const result = recordStrainResolution(config, args['rule-id'], args.resolution, args.notes);
  saveConfig(projectPath, config);

  logToJournal(projectPath, `**Strain review resolved for "${args['rule-id']}"**
Resolution: ${args.resolution}
Notes: ${args.notes || 'None provided'}`);

  console.log(JSON.stringify(result, null, 2));

} else {
  // Just checking strain status
  const result = checkStrain(config, args['rule-id']);
  result.current_phase = currentPhase;

  // Add prompts for any strained rules
  if (result.has_strain) {
    if (args['rule-id']) {
      result.strain_prompt = generateStrainPrompt(args['rule-id'], result.override_count);
    } else {
      result.strain_prompts = {};
      for (const rule of result.strained_rules) {
        result.strain_prompts[rule.rule_id] = generateStrainPrompt(rule.rule_id, rule.override_count);
      }
    }
  }

  console.log(JSON.stringify(result, null, 2));
}

process.exit(0);
