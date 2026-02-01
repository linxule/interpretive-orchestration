#!/usr/bin/env node
/**
 * track-documents.js
 * Tracks which documents have been coded and their status
 *
 * Usage:
 *   node track-documents.js --project-path /path/to/project [options]
 *
 * Options:
 *   --list              List all documents and their status
 *   --mark-coded DOC    Mark a document as coded
 *   --mark-reviewed DOC Mark a document as reviewed
 *   --mark-pending DOC  Reset a document to pending status
 *   --add-document DOC  Add a new document to tracking
 *   --summary           Show summary statistics only
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

function scanDocuments(projectPath) {
  // Scan for documents in stage1-foundation and stage2-collaboration
  const locations = [
    path.join(projectPath, 'stage1-foundation', 'manual-codes'),
    path.join(projectPath, 'stage2-collaboration', 'stream-b-empirical')
  ];

  const documents = new Set();

  for (const location of locations) {
    if (fs.existsSync(location)) {
      const files = fs.readdirSync(location).filter(f => !f.startsWith('.'));
      for (const file of files) {
        // Use filename without extension as document ID
        const docId = path.parse(file).name;
        documents.add(docId);
      }
    }
  }

  return Array.from(documents).sort();
}

function trackDocuments(projectPath, args) {
  const config = readConfig(projectPath);

  if (!config) {
    return {
      success: false,
      error: 'Project not initialized',
      suggestion: 'Run project-setup first'
    };
  }

  // Initialize tracking if not present
  config.batch_tracking = config.batch_tracking || {
    sessions: [],
    document_status: {}
  };

  const docStatus = config.batch_tracking.document_status;

  // Handle --add-document
  if (args['add-document']) {
    const docId = args['add-document'];
    if (!docStatus[docId]) {
      docStatus[docId] = {
        status: 'pending',
        added_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      if (!updateConfig(projectPath, config)) {
        return { success: false, error: 'Failed to save tracking data' };
      }
      return {
        success: true,
        action: 'added',
        document_id: docId,
        status: 'pending'
      };
    } else {
      return {
        success: false,
        error: `Document ${docId} already exists`,
        current_status: docStatus[docId].status
      };
    }
  }

  // Handle --mark-coded
  if (args['mark-coded']) {
    const docId = args['mark-coded'];
    const previous = docStatus[docId]?.status || 'unknown';
    docStatus[docId] = {
      ...docStatus[docId],
      status: 'coded',
      coded_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Update coding progress count
    const codedCount = Object.values(docStatus).filter(d =>
      d.status === 'coded' || d.status === 'reviewed' || d.status === 'finalized'
    ).length;
    config.coding_progress = config.coding_progress || {};
    config.coding_progress.documents_coded = codedCount;
    config.coding_progress.last_coding_session = new Date().toISOString();

    if (!updateConfig(projectPath, config)) {
      return { success: false, error: 'Failed to save tracking data' };
    }
    return {
      success: true,
      action: 'marked_coded',
      document_id: docId,
      previous_status: previous,
      new_status: 'coded',
      total_coded: codedCount
    };
  }

  // Handle --mark-reviewed
  if (args['mark-reviewed']) {
    const docId = args['mark-reviewed'];
    const previous = docStatus[docId]?.status || 'unknown';
    docStatus[docId] = {
      ...docStatus[docId],
      status: 'reviewed',
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    if (!updateConfig(projectPath, config)) {
      return { success: false, error: 'Failed to save tracking data' };
    }
    return {
      success: true,
      action: 'marked_reviewed',
      document_id: docId,
      previous_status: previous,
      new_status: 'reviewed'
    };
  }

  // Handle --mark-pending
  if (args['mark-pending']) {
    const docId = args['mark-pending'];
    const previous = docStatus[docId]?.status || 'unknown';
    docStatus[docId] = {
      ...docStatus[docId],
      status: 'pending',
      updated_at: new Date().toISOString()
    };
    if (!updateConfig(projectPath, config)) {
      return { success: false, error: 'Failed to save tracking data' };
    }
    return {
      success: true,
      action: 'reset_to_pending',
      document_id: docId,
      previous_status: previous,
      new_status: 'pending'
    };
  }

  // Handle --summary (quick stats only)
  if (args.summary) {
    const statusCounts = {
      pending: 0,
      in_progress: 0,
      coded: 0,
      reviewed: 0,
      finalized: 0
    };

    for (const doc of Object.values(docStatus)) {
      const status = doc.status || 'pending';
      if (statusCounts[status] !== undefined) {
        statusCounts[status]++;
      }
    }

    return {
      success: true,
      summary: statusCounts,
      total_tracked: Object.keys(docStatus).length,
      stage1_coded: config.sandwich_status?.stage1_details?.documents_manually_coded || 0
    };
  }

  // Default --list behavior: show all documents
  if (args.list || (!args['add-document'] && !args['mark-coded'] && !args['mark-reviewed'] && !args['mark-pending'])) {
    // Auto-discover documents from filesystem
    const discoveredDocs = scanDocuments(projectPath);

    // Merge discovered with tracked
    for (const docId of discoveredDocs) {
      if (!docStatus[docId]) {
        docStatus[docId] = {
          status: 'pending',
          discovered_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          source: 'auto_discovered'
        };
      }
    }

    // Save any newly discovered documents
    if (discoveredDocs.length > 0) {
      updateConfig(projectPath, config);
    }

    // Organize by status
    const byStatus = {
      pending: [],
      in_progress: [],
      coded: [],
      reviewed: [],
      finalized: []
    };

    for (const [docId, info] of Object.entries(docStatus)) {
      const status = info.status || 'pending';
      if (byStatus[status]) {
        byStatus[status].push({
          id: docId,
          ...info
        });
      }
    }

    // Calculate summary
    const summary = {
      total: Object.keys(docStatus).length,
      pending: byStatus.pending.length,
      in_progress: byStatus.in_progress.length,
      coded: byStatus.coded.length,
      reviewed: byStatus.reviewed.length,
      finalized: byStatus.finalized.length,
      completion_percent: 0
    };

    const completed = summary.coded + summary.reviewed + summary.finalized;
    if (summary.total > 0) {
      summary.completion_percent = Math.round((completed / summary.total) * 100);
    }

    return {
      success: true,
      documents: byStatus,
      summary: summary,
      stage1_manually_coded: config.sandwich_status?.stage1_details?.documents_manually_coded || 0
    };
  }

  return {
    success: false,
    error: 'No valid action specified',
    suggestion: 'Use --list, --add-document, --mark-coded, --mark-reviewed, --mark-pending, or --summary'
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

const result = trackDocuments(resolvedPath, args);
console.log(JSON.stringify(result, null, 2));

process.exit(result.success ? 0 : 1);
