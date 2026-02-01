#!/usr/bin/env node
/**
 * saturation-tracker.js
 * Multi-dimensional tracking of theoretical saturation
 *
 * Saturation is NOT just repetition - it's understanding the full range of variation.
 * This script tracks:
 * - Code generation rate (are we creating fewer new codes?)
 * - Code coverage (how well do codes cover the corpus?)
 * - Refinement activity (are we still refining definitions?)
 * - Conceptual redundancy (are we hearing the same things?)
 *
 * Usage:
 *   node saturation-tracker.js --project-path /path/to/project --status
 *   node saturation-tracker.js --project-path /path/to/project --record-document --doc-id "INT_001" --doc-name "Interview 1" --new-codes 5
 *   node saturation-tracker.js --project-path /path/to/project --record-refinement --code-id "coping" --change-type "split" --rationale "Distinct coping mechanisms"
 *   node saturation-tracker.js --project-path /path/to/project --update-redundancy --score 0.72 --notes "Still seeing new variations in resilience theme"
 *   node saturation-tracker.js --project-path /path/to/project --assess
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

function initSaturationTracking(config) {
  if (!config.saturation_tracking) {
    config.saturation_tracking = {
      code_generation: {
        total_codes: 0,
        codes_by_document: [],
        generation_rate: 0,
        stabilized_at_document: null
      },
      code_coverage: {
        coverage_by_code: {},
        rare_codes: [],
        universal_codes: []
      },
      refinement: {
        definition_changes: [],
        changes_last_5_documents: 0,
        split_merge_count: 0
      },
      redundancy: {
        redundancy_score: 0,
        last_assessment: null,
        assessment_notes: '',
        threshold: 0.85
      },
      saturation_signals: {
        overall_level: 'low',
        last_assessment: null,
        recommendation: '',
        evidence: {}
      },
      thresholds: {
        code_generation_stable: 0.5,
        refinement_stable: 2,
        redundancy_high: 0.85,
        coverage_adequate: 0.7
      }
    };
  }
  return config.saturation_tracking;
}

function logToJournal(projectPath, message) {
  const journalPath = path.join(projectPath, '.interpretive-orchestration', 'reflexivity-journal.md');
  if (!fs.existsSync(journalPath)) return;

  const entry = `
---

### Saturation Tracking Update
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
 * Record a document coding event
 */
function recordDocument(config, docId, docName, newCodes) {
  const tracking = initSaturationTracking(config);
  const now = new Date().toISOString();

  // Add to codes_by_document
  tracking.code_generation.codes_by_document.push({
    document_id: docId,
    document_name: docName,
    new_codes_created: newCodes,
    timestamp: now
  });

  // Update total codes
  tracking.code_generation.total_codes += newCodes;

  // Calculate rolling average (last 5 documents)
  const recentDocs = tracking.code_generation.codes_by_document.slice(-5);
  const avgRate = recentDocs.reduce((sum, d) => sum + d.new_codes_created, 0) / recentDocs.length;
  tracking.code_generation.generation_rate = Math.round(avgRate * 100) / 100;

  // Check if stabilized (rate dropped below threshold)
  const threshold = tracking.thresholds?.code_generation_stable || 0.5;
  if (!tracking.code_generation.stabilized_at_document && avgRate < threshold && recentDocs.length >= 3) {
    tracking.code_generation.stabilized_at_document = docId;
  }

  return {
    success: true,
    document: docId,
    new_codes: newCodes,
    total_codes: tracking.code_generation.total_codes,
    generation_rate: tracking.code_generation.generation_rate,
    stabilized: tracking.code_generation.stabilized_at_document !== null,
    stabilized_at: tracking.code_generation.stabilized_at_document
  };
}

/**
 * Record a code refinement (split, merge, redefinition, etc.)
 */
function recordRefinement(config, codeId, changeType, oldState, newState, rationale) {
  const tracking = initSaturationTracking(config);
  const now = new Date().toISOString();

  // Add to definition_changes
  tracking.refinement.definition_changes.push({
    code_id: codeId,
    change_type: changeType,
    old_state: oldState || '',
    new_state: newState || '',
    rationale: rationale || '',
    timestamp: now
  });

  // Update split_merge_count
  if (changeType === 'split' || changeType === 'merge') {
    tracking.refinement.split_merge_count++;
  }

  // Calculate changes in last 5 documents
  // (approximation: last 5 changes within recent timeframe)
  const recentChanges = tracking.refinement.definition_changes.slice(-10);
  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
  const recentCount = recentChanges.filter(c => c.timestamp > fiveDaysAgo).length;
  tracking.refinement.changes_last_5_documents = Math.min(recentCount, 10);

  return {
    success: true,
    code_id: codeId,
    change_type: changeType,
    total_refinements: tracking.refinement.definition_changes.length,
    split_merge_count: tracking.refinement.split_merge_count,
    recent_activity: tracking.refinement.changes_last_5_documents
  };
}

/**
 * Update code coverage statistics
 */
function updateCoverage(config, coverageData) {
  const tracking = initSaturationTracking(config);
  const totalDocuments = config.coding_progress?.documents_coded || 1;

  // Update coverage by code
  for (const [codeId, data] of Object.entries(coverageData)) {
    const coveragePercent = (data.document_count / totalDocuments) * 100;
    tracking.code_coverage.coverage_by_code[codeId] = {
      document_count: data.document_count,
      case_count: data.case_count || 0,
      coverage_percent: Math.round(coveragePercent * 10) / 10
    };
  }

  // Identify rare and universal codes
  const rareCodes = [];
  const universalCodes = [];

  for (const [codeId, data] of Object.entries(tracking.code_coverage.coverage_by_code)) {
    if (data.coverage_percent < 10) {
      rareCodes.push(codeId);
    } else if (data.coverage_percent > 80) {
      universalCodes.push(codeId);
    }
  }

  tracking.code_coverage.rare_codes = rareCodes;
  tracking.code_coverage.universal_codes = universalCodes;

  return {
    success: true,
    total_codes_tracked: Object.keys(tracking.code_coverage.coverage_by_code).length,
    rare_codes: rareCodes.length,
    universal_codes: universalCodes.length
  };
}

/**
 * Update redundancy assessment (typically done by researcher/AI)
 */
function updateRedundancy(config, score, notes) {
  const tracking = initSaturationTracking(config);
  const now = new Date().toISOString();

  tracking.redundancy.redundancy_score = Math.max(0, Math.min(1, parseFloat(score)));
  tracking.redundancy.last_assessment = now;
  tracking.redundancy.assessment_notes = notes || '';

  return {
    success: true,
    redundancy_score: tracking.redundancy.redundancy_score,
    threshold: tracking.redundancy.threshold,
    above_threshold: tracking.redundancy.redundancy_score >= tracking.redundancy.threshold
  };
}

/**
 * Assess overall saturation level
 */
function assessSaturation(config) {
  const tracking = initSaturationTracking(config);
  const thresholds = tracking.thresholds;
  const now = new Date().toISOString();

  const evidence = {
    code_generation_signal: '',
    coverage_signal: '',
    refinement_signal: '',
    redundancy_signal: ''
  };

  let saturationScore = 0;

  // 1. Code Generation Assessment
  const genRate = tracking.code_generation.generation_rate;
  if (genRate < thresholds.code_generation_stable) {
    evidence.code_generation_signal = `STABLE: ${genRate} new codes/doc (threshold: ${thresholds.code_generation_stable})`;
    saturationScore += 25;
  } else if (genRate < thresholds.code_generation_stable * 2) {
    evidence.code_generation_signal = `SLOWING: ${genRate} new codes/doc`;
    saturationScore += 10;
  } else {
    evidence.code_generation_signal = `ACTIVE: ${genRate} new codes/doc - still generating`;
  }

  // 2. Coverage Assessment
  const coverageData = tracking.code_coverage.coverage_by_code;
  const codeCount = Object.keys(coverageData).length;
  if (codeCount > 0) {
    const codesWithAdequateCoverage = Object.values(coverageData)
      .filter(c => c.coverage_percent >= 20).length;
    const coverageRatio = codesWithAdequateCoverage / codeCount;

    if (coverageRatio >= thresholds.coverage_adequate) {
      evidence.coverage_signal = `ADEQUATE: ${Math.round(coverageRatio * 100)}% of codes have >20% coverage`;
      saturationScore += 25;
    } else {
      evidence.coverage_signal = `DEVELOPING: ${Math.round(coverageRatio * 100)}% coverage ratio`;
      saturationScore += Math.round(coverageRatio * 15);
    }
  } else {
    evidence.coverage_signal = 'NO DATA: Coverage not yet tracked';
  }

  // 3. Refinement Assessment
  const recentRefinements = tracking.refinement.changes_last_5_documents;
  if (recentRefinements <= thresholds.refinement_stable) {
    evidence.refinement_signal = `STABLE: ${recentRefinements} changes recently (threshold: ${thresholds.refinement_stable})`;
    saturationScore += 25;
  } else {
    evidence.refinement_signal = `ACTIVE: ${recentRefinements} recent refinements - concepts still evolving`;
    saturationScore += 5;
  }

  // 4. Redundancy Assessment
  const redundancyScore = tracking.redundancy.redundancy_score;
  if (redundancyScore >= thresholds.redundancy_high) {
    evidence.redundancy_signal = `HIGH: ${Math.round(redundancyScore * 100)}% redundancy`;
    saturationScore += 25;
  } else if (redundancyScore >= thresholds.redundancy_high * 0.7) {
    evidence.redundancy_signal = `EMERGING: ${Math.round(redundancyScore * 100)}% redundancy`;
    saturationScore += 15;
  } else {
    evidence.redundancy_signal = `LOW: ${Math.round(redundancyScore * 100)}% redundancy - still finding novelty`;
  }

  // Determine overall level
  let level, recommendation;
  if (saturationScore >= 90) {
    level = 'saturated';
    recommendation = 'Strong saturation signals. Consider: Are there negative cases you haven\'t explored? If variation is understood, ready for theoretical integration.';
  } else if (saturationScore >= 70) {
    level = 'high';
    recommendation = 'Approaching saturation. Theoretical sampling: seek cases most different from your current sample to test your codes.';
  } else if (saturationScore >= 50) {
    level = 'approaching';
    recommendation = 'Emerging saturation patterns. Continue coding but watch for diminishing returns. Write memos on variation.';
  } else if (saturationScore >= 25) {
    level = 'emerging';
    recommendation = 'Early saturation signals. Still actively generating codes and refining concepts. Stay open to new patterns.';
  } else {
    level = 'low';
    recommendation = 'Low saturation. Actively developing codes. Focus on open coding and memo writing.';
  }

  // Update tracking
  tracking.saturation_signals = {
    overall_level: level,
    last_assessment: now,
    recommendation: recommendation,
    evidence: evidence
  };

  return {
    success: true,
    saturation_level: level,
    saturation_score: saturationScore,
    recommendation: recommendation,
    evidence: evidence,
    metrics: {
      code_generation_rate: genRate,
      total_codes: tracking.code_generation.total_codes,
      documents_coded: tracking.code_generation.codes_by_document.length,
      stabilized_at: tracking.code_generation.stabilized_at_document,
      recent_refinements: recentRefinements,
      redundancy_score: redundancyScore,
      rare_codes: tracking.code_coverage.rare_codes.length,
      universal_codes: tracking.code_coverage.universal_codes.length
    }
  };
}

/**
 * Get current status
 */
function getStatus(config) {
  const tracking = config.saturation_tracking;
  if (!tracking) {
    return {
      success: true,
      initialized: false,
      message: 'Saturation tracking not yet initialized. Record your first document to begin.'
    };
  }

  return {
    success: true,
    initialized: true,
    code_generation: {
      total_codes: tracking.code_generation.total_codes,
      documents_tracked: tracking.code_generation.codes_by_document.length,
      generation_rate: tracking.code_generation.generation_rate,
      stabilized: tracking.code_generation.stabilized_at_document !== null
    },
    refinement: {
      total_changes: tracking.refinement.definition_changes.length,
      recent_activity: tracking.refinement.changes_last_5_documents,
      splits_merges: tracking.refinement.split_merge_count
    },
    redundancy: {
      score: tracking.redundancy.redundancy_score,
      last_assessed: tracking.redundancy.last_assessment
    },
    saturation: tracking.saturation_signals
  };
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
    error: 'Config not found. Run /qual-init first.'
  }));
  process.exit(1);
}

// Handle different modes
if (args.status) {
  console.log(JSON.stringify(getStatus(config), null, 2));
  process.exit(0);
}

if (args['record-document']) {
  if (!args['doc-id']) {
    console.error(JSON.stringify({ success: false, error: 'Missing --doc-id' }));
    process.exit(1);
  }
  const newCodes = parseInt(args['new-codes']) || 0;
  const result = recordDocument(config, args['doc-id'], args['doc-name'] || args['doc-id'], newCodes);
  saveConfig(projectPath, config);

  if (result.stabilized && args['doc-id'] === result.stabilized_at) {
    logToJournal(projectPath, `**Code Generation Stabilized**

Code generation rate has dropped below threshold at document: ${args['doc-id']}
Current rate: ${result.generation_rate} new codes per document
Total codes: ${result.total_codes}

This is a positive saturation signal, but remember: saturation isn't just about stopping code creation.
Consider: Are you understanding the full range of variation in your codes?`);
  }

  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

if (args['record-refinement']) {
  if (!args['code-id'] || !args['change-type']) {
    console.error(JSON.stringify({ success: false, error: 'Missing --code-id or --change-type' }));
    process.exit(1);
  }
  const result = recordRefinement(
    config,
    args['code-id'],
    args['change-type'],
    args['old-state'],
    args['new-state'],
    args.rationale
  );
  saveConfig(projectPath, config);

  if (args['change-type'] === 'split') {
    logToJournal(projectPath, `**Code Split Recorded**

Code "${args['code-id']}" was split.
Rationale: ${args.rationale || 'Not provided'}

This indicates theoretical elaboration - your understanding is becoming more nuanced.`);
  }

  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

if (args['update-coverage']) {
  // Expects JSON coverage data via stdin or --coverage-json
  let coverageData = {};
  if (args['coverage-json']) {
    try {
      coverageData = JSON.parse(args['coverage-json']);
    } catch (e) {
      console.error(JSON.stringify({ success: false, error: 'Invalid coverage JSON' }));
      process.exit(1);
    }
  }
  const result = updateCoverage(config, coverageData);
  saveConfig(projectPath, config);
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

if (args['update-redundancy']) {
  if (!args.score) {
    console.error(JSON.stringify({ success: false, error: 'Missing --score' }));
    process.exit(1);
  }
  const result = updateRedundancy(config, args.score, args.notes);
  saveConfig(projectPath, config);

  if (result.above_threshold) {
    logToJournal(projectPath, `**High Redundancy Detected**

Redundancy score: ${Math.round(result.redundancy_score * 100)}%
Notes: ${args.notes || 'None'}

High redundancy is a saturation signal, but verify:
- Have you explored negative cases?
- Do you understand what accounts for variation?
- Are there theoretical dimensions you haven't fully developed?`);
  }

  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

if (args.assess) {
  const result = assessSaturation(config);
  saveConfig(projectPath, config);

  logToJournal(projectPath, `**Saturation Assessment**

Overall Level: ${result.saturation_level.toUpperCase()}
Score: ${result.saturation_score}/100

**Evidence:**
- Code Generation: ${result.evidence.code_generation_signal}
- Coverage: ${result.evidence.coverage_signal}
- Refinement: ${result.evidence.refinement_signal}
- Redundancy: ${result.evidence.redundancy_signal}

**Recommendation:** ${result.recommendation}`);

  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

// Default: show status
console.log(JSON.stringify(getStatus(config), null, 2));
process.exit(0);
