#!/usr/bin/env node
/**
 * generate-config.js
 * Generates config.json from dialogue responses with atomic write
 *
 * Usage:
 *   node generate-config.js \
 *     --project-path /path/to/project \
 *     --name "My Research" \
 *     --research-question "How do..." \
 *     --domain "organizational behavior" \
 *     --ontology interpretivist \
 *     --epistemology systematic_interpretation \
 *     --tradition gioia_corley \
 *     --ai-relationship epistemic_partner \
 *     --research-design '{"study_type":"comparative","cases":[...]}'
 *
 * Research Design Options:
 *   --study-type          single_case|comparative|longitudinal|comparative_longitudinal
 *   --research-design     Full JSON object for complex designs
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

function getVocabulary(ontology, epistemology) {
  // Determine vocabulary mode based on stance
  if (ontology === 'objectivist' || epistemology === 'objectivist_discovery') {
    return {
      mode: 'discovery',
      verbs: ['discover', 'find', 'identify', 'uncover', 'reveal'],
      avoid: ['construct', 'interpret', 'build']
    };
  } else if (ontology === 'relativist' || epistemology === 'co_constructive') {
    return {
      mode: 'constructivist',
      verbs: ['co-construct', 'negotiate', 'build together', 'create meaning'],
      avoid: ['discover', 'find', 'extract']
    };
  } else {
    // Default: systematic interpretivist (Gioia)
    return {
      mode: 'systematic',
      verbs: ['construct', 'interpret', 'characterize', 'organize', 'build'],
      avoid: ['discover', 'find', 'extract', 'uncover', 'reveal']
    };
  }
}

/**
 * Generate research_design section from arguments
 * Handles both simple --study-type and complex --research-design JSON
 */
function generateResearchDesign(args) {
  // If full research-design JSON provided, parse and use it
  if (args['research-design']) {
    try {
      return JSON.parse(args['research-design']);
    } catch (e) {
      console.error(`Warning: Invalid JSON in --research-design, using defaults`);
    }
  }

  // Build from individual arguments
  const studyType = args['study-type'] || 'single_case';

  const design = {
    study_type: studyType,
    cases: [],
    waves: [],
    streams: {
      theoretical: {
        folder_path: 'literature',
        sources: []
      },
      empirical: {
        folder_path: 'data',
        sources: []
      }
    },
    data_sources: [],
    isolation_config: {
      case_isolation: {
        enabled: studyType.includes('comparative'),
        relaxes_at: 'phase3_pattern_characterization',
        friction_level: 'challenge'
      },
      wave_isolation: {
        enabled: studyType.includes('longitudinal'),
        relaxes_at: 'cross_wave_analysis',
        friction_level: 'challenge'
      },
      stream_separation: {
        enabled: true,
        relaxes_at: 'phase2_synthesis',
        friction_level: 'nudge'
      },
      custom_isolations: []
    },
    rule_overrides: []
  };

  return design;
}

function generateConfig(args) {
  const vocab = getVocabulary(args.ontology, args.epistemology);
  const today = new Date().toISOString().split('T')[0];
  const researchDesign = generateResearchDesign(args);

  const config = {
    research_design: researchDesign,

    project_info: {
      name: args.name || 'Qualitative Research Project',
      research_question: args['research-question'] || '',
      domain: args.domain || '',
      created_date: today,
      researcher_name: args.researcher || ''
    },

    philosophical_stance: {
      ontology: args.ontology || 'interpretivist',
      epistemology: args.epistemology || 'systematic_interpretation',
      tradition: args.tradition || 'gioia_corley',
      ai_relationship: args['ai-relationship'] || 'epistemic_partner',
      vocabulary_mode: vocab.mode,
      coding_verbs: vocab.verbs,
      avoid_verbs: vocab.avoid,
      reflexivity_level: 'high',
      interpretive_authority: 'human'
    },

    sandwich_status: {
      current_stage: 'stage1_foundation',
      stage1_complete: false,
      stage1_details: {
        documents_manually_coded: 0,
        initial_structure_created: false,
        memos_written: 0,
        theoretical_frameworks_consulted: []
      },
      stage2_progress: {
        phase1_parallel_streams: 'not_started',
        phase2_synthesis: 'not_started',
        phase3_pattern_characterization: 'not_started'
      },
      stage3_progress: {
        evidence_organized: false,
        theory_developed: false,
        manuscript_drafted: false
      }
    },

    data_structure: {
      aggregate_dimensions: [],
      second_order_themes: [],
      first_order_concepts: [],
      version_history: [
        {
          version: '0.1',
          date: today,
          changes: 'Initial structure created',
          rationale: 'Project initialization'
        }
      ]
    },

    mcp_integrations: {
      active_mcps: [
        'mcp-sequentialthinking-tools',
        'lotus-wisdom',
        'markdownify'
      ],
      mcp_usage_log: []
    },

    epistemic_growth: {
      reflexive_moments: [],
      assumption_challenges: [],
      philosophical_tensions: []
    },

    interaction_preferences: {
      teaching_moment_frequency: 'key_decisions',
      philosophical_depth: 'beginner',
      preferred_dialogue_style: 'socratic_questions',
      uncertainty_comfort: 'comfortable_with_ambiguity'
    },

    coding_progress: {
      documents_coded: 0,
      quotes_extracted: 0,
      concepts_in_framework: 0,
      last_coding_session: null
    }
  };

  return config;
}

function atomicWrite(filePath, content) {
  const tempPath = filePath + '.tmp.' + process.pid;

  try {
    // Write to temp file first
    fs.writeFileSync(tempPath, content);

    // Atomic rename
    fs.renameSync(tempPath, filePath);

    return { success: true };
  } catch (error) {
    // Clean up temp file if it exists
    try {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    } catch (cleanupError) {
      // Ignore cleanup errors
    }

    return { success: false, error: error.message };
  }
}

function deepMerge(target, source) {
  // Deep merge source into target, preserving target values when source is default/empty
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else if (target[key] === undefined) {
      result[key] = source[key];
    }
  }
  return result;
}

function loadExistingConfig(configPath) {
  if (!fs.existsSync(configPath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (error) {
    return null;
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

const projectPath = args['project-path'];

// Path traversal protection
const resolvedPath = path.resolve(projectPath);
const configDir = path.join(resolvedPath, '.interpretive-orchestration');
const configPath = path.join(configDir, 'config.json');
if (!configPath.startsWith(resolvedPath + path.sep) && configPath !== resolvedPath) {
  console.error(JSON.stringify({
    success: false,
    error: 'Path traversal detected - invalid project path'
  }));
  process.exit(1);
}

// Ensure directory exists
try {
  fs.mkdirSync(configDir, { recursive: true });
} catch (error) {
  // Directory might already exist
}

// CRITICAL: Load existing config if present to preserve progress
const existingConfig = loadExistingConfig(configPath);
const newConfig = generateConfig(args);

let finalConfig;
let configAction;

if (existingConfig) {
  // PRESERVE progress fields - these should NEVER be overwritten
  const preservedFields = {
    sandwich_status: existingConfig.sandwich_status,
    coding_progress: existingConfig.coding_progress,
    epistemic_growth: existingConfig.epistemic_growth,
    data_structure: existingConfig.data_structure,
    mcp_integrations: existingConfig.mcp_integrations
  };

  // Start with new config structure
  finalConfig = { ...newConfig };

  // Restore preserved fields
  Object.assign(finalConfig, preservedFields);

  // Handle research_design - preserve if exists unless explicitly updating
  if (existingConfig.research_design) {
    if (args['research-design'] || args['study-type']) {
      // User is explicitly updating research design - merge carefully
      finalConfig.research_design = {
        ...existingConfig.research_design,
        ...newConfig.research_design,
        // Preserve rule_overrides (audit trail)
        rule_overrides: existingConfig.research_design.rule_overrides || [],
        // Merge isolation_config carefully
        isolation_config: {
          ...existingConfig.research_design.isolation_config,
          ...newConfig.research_design.isolation_config
        }
      };
    } else {
      // No explicit update - preserve existing research_design entirely
      finalConfig.research_design = existingConfig.research_design;
    }
  }

  // Merge project_info (allow updates but keep created_date)
  finalConfig.project_info = {
    ...existingConfig.project_info,
    ...newConfig.project_info,
    created_date: existingConfig.project_info.created_date  // Never change creation date
  };

  // Merge philosophical_stance (allow updates)
  if (args.ontology || args.epistemology || args.tradition || args['ai-relationship']) {
    finalConfig.philosophical_stance = {
      ...existingConfig.philosophical_stance,
      ...newConfig.philosophical_stance
    };
  } else {
    finalConfig.philosophical_stance = existingConfig.philosophical_stance;
  }

  // Merge interaction_preferences (allow updates)
  finalConfig.interaction_preferences = {
    ...existingConfig.interaction_preferences,
    ...newConfig.interaction_preferences
  };

  configAction = 'merged';
} else {
  finalConfig = newConfig;
  configAction = 'created';
}

// Validate config against schema before writing
const { validateConfig } = require('../../_shared/scripts/validate-config.js');
const validation = validateConfig(finalConfig);

if (!validation.valid && !validation.warning) {
  // BLOCKING: Invalid config should not be written
  console.error(JSON.stringify({
    success: false,
    error: 'Configuration validation failed - refusing to write invalid config',
    validation_errors: validation.errors.slice(0, 5),
    message: 'Fix these errors before proceeding.'
  }));
  process.exit(1);
}

const content = JSON.stringify(finalConfig, null, 2);

const result = atomicWrite(configPath, content);

if (result.success) {
  console.log(JSON.stringify({
    success: true,
    action: configAction,
    path: configPath,
    preserved_progress: existingConfig ? {
      documents_coded: finalConfig.coding_progress.documents_coded,
      stage1_complete: finalConfig.sandwich_status.stage1_complete,
      memos_written: finalConfig.sandwich_status.stage1_details?.memos_written || 0
    } : null,
    config: finalConfig
  }, null, 2));
  process.exit(0);
} else {
  console.error(JSON.stringify({
    success: false,
    error: result.error
  }));
  process.exit(1);
}
