#!/usr/bin/env node
/**
 * append-log.js
 * Writes entries to conversation-log.jsonl for AI-to-AI transparency
 *
 * Usage:
 *   node append-log.js --project-path /path/to/project [options]
 *
 * Options:
 *   --agent NAME           Agent name (e.g., "dialogical-coder", "scholarly-companion")
 *   --action TYPE          Action type (e.g., "coding", "question", "suggestion", "reflection")
 *   --content TEXT         The content/message to log
 *   --document-id ID       Related document ID (optional)
 *   --concept-id ID        Related concept ID (optional)
 *   --metadata JSON        Additional metadata as JSON string (optional)
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

function appendLog(projectPath, args) {
  const logPath = path.join(projectPath, '.interpretive-orchestration', 'conversation-log.jsonl');

  // Ensure directory exists - create if missing
  const logDir = path.dirname(logPath);
  if (!fs.existsSync(logDir)) {
    try {
      fs.mkdirSync(logDir, { recursive: true });
    } catch (error) {
      return {
        success: false,
        error: `Failed to create log directory: ${error.message}`
      };
    }
  }

  // Build log entry
  const entry = {
    timestamp: new Date().toISOString(),
    agent: args.agent || 'unknown',
    action: args.action || 'log',
    content: args.content || ''
  };

  // Add optional fields
  if (args['document-id']) {
    entry.document_id = args['document-id'];
  }

  if (args['concept-id']) {
    entry.concept_id = args['concept-id'];
  }

  if (args.metadata) {
    try {
      entry.metadata = JSON.parse(args.metadata);
    } catch (error) {
      entry.metadata_raw = args.metadata;
    }
  }

  // Append to log file (create if doesn't exist)
  try {
    fs.appendFileSync(logPath, JSON.stringify(entry) + '\n');

    return {
      success: true,
      path: logPath,
      entry: entry
    };

  } catch (error) {
    return {
      success: false,
      error: `Failed to write log: ${error.message}`
    };
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

if (!args.content && !args.action) {
  console.error(JSON.stringify({
    success: false,
    error: 'Missing required argument: --content or --action'
  }));
  process.exit(1);
}

// Path traversal protection
const resolvedPath = path.resolve(args['project-path']);
const logTarget = path.join(resolvedPath, '.interpretive-orchestration', 'conversation-log.jsonl');
if (!logTarget.startsWith(resolvedPath + path.sep) && logTarget !== resolvedPath) {
  console.error(JSON.stringify({
    success: false,
    error: 'Path traversal detected - invalid project path'
  }));
  process.exit(1);
}

const result = appendLog(resolvedPath, args);
console.log(JSON.stringify(result, null, 2));

process.exit(result.success ? 0 : 1);
