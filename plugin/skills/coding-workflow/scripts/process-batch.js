#!/usr/bin/env node
/**
 * process-batch.js
 * Orchestrates batch coding workflow for Stage 2
 *
 * Usage:
 *   node process-batch.js \
 *     --project-path /path/to/project \
 *     --documents "D001,D002,D003" \
 *     --agent dialogical-coder \
 *     --phase phase1_parallel_streams
 *
 * Options:
 *   --project-path    Path to the project root (required)
 *   --documents       Comma-separated list of document IDs to process
 *   --agent           Agent to use (dialogical-coder, scholarly-companion)
 *   --phase           Current phase (phase1_parallel_streams, phase2_synthesis, phase3_pattern_characterization)
 *   --dry-run         Show what would be processed without doing it
 */

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].replace('--', '');
      const nextArg = args[i + 1];
      if (nextArg && !nextArg.startsWith('--')) {
        parsed[key] = nextArg;
        i++;
      } else {
        parsed[key] = true;
      }
    }
  }

  return parsed;
}

function readConfig(projectPath) {
  const configPath = path.join(projectPath, '.interpretive-orchestration', 'config.json');
  if (!fs.existsSync(configPath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (error) {
    return null;
  }
}

function updateConfig(projectPath, config) {
  const configPath = path.join(projectPath, '.interpretive-orchestration', 'config.json');
  const tempPath = configPath + '.tmp.' + process.pid;

  // Validate config before writing
  const { validateConfig } = require('../../_shared/scripts/validate-config.js');
  const validation = validateConfig(config);
  if (!validation.valid && !validation.warning) {
    console.error(JSON.stringify({
      success: false,
      error: 'Configuration validation failed - refusing to write invalid config',
      validation_errors: validation.errors.slice(0, 5)
    }));
    return false;
  }

  try {
    fs.writeFileSync(tempPath, JSON.stringify(config, null, 2));
    fs.renameSync(tempPath, configPath);
    return true;
  } catch (error) {
    try { fs.unlinkSync(tempPath); } catch (e) {}
    return false;
  }
}

function appendLog(projectPath, entry) {
  const logPath = path.join(projectPath, '.interpretive-orchestration', 'conversation-log.jsonl');
  const logDir = path.dirname(logPath);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  fs.appendFileSync(logPath, JSON.stringify(entry) + '\n');
}

function processBatch(projectPath, args) {
  const config = readConfig(projectPath);

  if (!config) {
    return {
      success: false,
      error: 'Project not initialized',
      suggestion: 'Run project-setup first'
    };
  }

  // Check Stage 1 completion
  if (!config.sandwich_status?.stage1_complete) {
    return {
      success: false,
      error: 'Stage 1 not complete',
      suggestion: 'Complete manual coding of 10-15 documents before batch processing',
      current_count: config.sandwich_status?.stage1_details?.documents_manually_coded || 0
    };
  }

  // Parse document list
  const documents = args.documents
    ? args.documents.split(',').map(d => d.trim()).filter(d => d)
    : [];

  if (documents.length === 0) {
    return {
      success: false,
      error: 'No documents specified',
      suggestion: 'Use --documents "D001,D002,D003" to specify documents'
    };
  }

  const agent = args.agent || 'dialogical-coder';
  const phase = args.phase || 'phase1_parallel_streams';
  const isDryRun = args['dry-run'] === true;

  // Validate phase
  const validPhases = ['phase1_parallel_streams', 'phase2_synthesis', 'phase3_pattern_characterization'];
  if (!validPhases.includes(phase)) {
    return {
      success: false,
      error: `Invalid phase: ${phase}`,
      valid_phases: validPhases
    };
  }

  // Validate agent
  const validAgents = ['dialogical-coder', 'scholarly-companion'];
  if (!validAgents.includes(agent)) {
    return {
      success: false,
      error: `Invalid agent: ${agent}`,
      valid_agents: validAgents
    };
  }

  // Initialize or load document tracking
  config.batch_tracking = config.batch_tracking || {
    sessions: [],
    document_status: {}
  };

  // Create batch session
  const sessionId = `session_${Date.now()}`;
  const session = {
    id: sessionId,
    started_at: new Date().toISOString(),
    agent: agent,
    phase: phase,
    documents: documents,
    status: isDryRun ? 'dry_run' : 'started',
    completed_documents: [],
    pending_documents: [...documents]
  };

  if (!isDryRun) {
    config.batch_tracking.sessions.push(session);

    // Mark documents as in_progress
    for (const doc of documents) {
      config.batch_tracking.document_status[doc] = {
        status: 'in_progress',
        session_id: sessionId,
        updated_at: new Date().toISOString()
      };
    }

    // Update phase status
    if (!config.sandwich_status.stage2_progress) {
      config.sandwich_status.stage2_progress = {};
    }
    if (config.sandwich_status.stage2_progress[phase] === 'not_started') {
      config.sandwich_status.stage2_progress[phase] = 'in_progress';
    }

    // Save config
    if (!updateConfig(projectPath, config)) {
      return {
        success: false,
        error: 'Failed to save batch tracking data'
      };
    }

    // Log the session start
    appendLog(projectPath, {
      timestamp: new Date().toISOString(),
      agent: 'batch-processor',
      action: 'batch_started',
      content: `Started batch coding session with ${documents.length} documents`,
      metadata: {
        session_id: sessionId,
        agent: agent,
        phase: phase,
        document_count: documents.length
      }
    });
  }

  // Generate workflow guidance
  const workflow = generateWorkflowGuidance(agent, phase, documents);

  return {
    success: true,
    session: {
      id: sessionId,
      agent: agent,
      phase: phase,
      document_count: documents.length,
      documents: documents,
      is_dry_run: isDryRun
    },
    workflow: workflow,
    next_steps: [
      `1. For each document, invoke @${agent} with the document content`,
      '2. Follow the 4-stage dialogical process for visible reasoning',
      '3. After every 5 documents, you will receive an interpretive pause prompt',
      '4. Update document status as you complete each one',
      '5. Write reflective memo after the session'
    ],
    commands: {
      mark_complete: `node skills/coding-workflow/scripts/track-documents.js --project-path "${projectPath}" --mark-coded <DOC_ID>`,
      check_progress: `node skills/coding-workflow/scripts/track-documents.js --project-path "${projectPath}" --list`,
      end_session: `node skills/_shared/scripts/update-progress.js --project-path "${projectPath}" --increment-documents`
    }
  };
}

function generateWorkflowGuidance(agent, phase, documents) {
  const guidance = {
    agent_instructions: '',
    phase_context: '',
    document_approach: ''
  };

  // Agent-specific guidance
  if (agent === 'dialogical-coder') {
    guidance.agent_instructions = `
Use @dialogical-coder's 4-stage visible reasoning process:
1. NOTICE: What patterns or themes do you observe in this document?
2. RELATE: How does this connect to existing concepts in the data structure?
3. QUESTION: What tensions, surprises, or gaps emerge?
4. PROPOSE: What coding actions do you suggest, with rationale?

Always show your reasoning transparently. Express uncertainty when present.
`;
  } else if (agent === 'scholarly-companion') {
    guidance.agent_instructions = `
Use @scholarly-companion for theoretical dialogue:
1. Present the document's key claims
2. Ask: "What theoretical traditions does this invoke?"
3. Explore: "What are the assumptions underlying this perspective?"
4. Connect: "How does this relate to your emerging framework?"
`;
  }

  // Phase-specific context
  switch (phase) {
    case 'phase1_parallel_streams':
      guidance.phase_context = `
Phase 1: Parallel Streams
- Stream A (Theoretical): Build theoretical grounding
- Stream B (Empirical): Code documents with data structure
- Keep streams separate for now - synthesis comes in Phase 2
`;
      break;
    case 'phase2_synthesis':
      guidance.phase_context = `
Phase 2: Synthesis
- Compare theoretical and empirical patterns
- Look for alignments and productive tensions
- Refine data structure based on synthesis insights
`;
      break;
    case 'phase3_pattern_characterization':
      guidance.phase_context = `
Phase 3: Pattern Characterization
- Identify systematic variations in patterns
- Document boundary conditions
- Prepare evidence tables for theorizing
`;
      break;
  }

  // Document approach
  guidance.document_approach = `
For each of the ${documents.length} documents:
1. Read the full document for context
2. Apply ${agent} with visible reasoning
3. Log the interaction
4. Update document status when complete
5. Note any questions for later reflection
`;

  return guidance;
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

// Path traversal protection
const resolvedPath = path.resolve(args['project-path']);
const configTarget = path.join(resolvedPath, '.interpretive-orchestration', 'config.json');
if (!configTarget.startsWith(resolvedPath + path.sep) && configTarget !== resolvedPath) {
  console.error(JSON.stringify({
    success: false,
    error: 'Path traversal detected - invalid project path'
  }));
  process.exit(1);
}

const result = processBatch(resolvedPath, args);
console.log(JSON.stringify(result, null, 2));

process.exit(result.success ? 0 : 1);
