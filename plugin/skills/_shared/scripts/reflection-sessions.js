#!/usr/bin/env node
/**
 * reflection-sessions.js
 * Counts the sessions that ended since the researcher's last /qual-reflect.
 *
 * The session-end hook logs a reflection prompt to conversation-log.jsonl,
 * because agent tools never show session-end output. /qual-reflect reads the
 * count, and records each completed reflection in the same log, so both sides
 * use full timestamps from one file.
 *
 * Usage:
 *   node reflection-sessions.js --project-path /path/to/project            # count
 *   node reflection-sessions.js --project-path /path/to/project --record   # mark a reflection done
 */

const fs = require('fs');
const path = require('path');
const { readEntries, appendLine } = require('./conversation-log.js');

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (!args[i].startsWith('--')) continue;
    const key = args[i].slice(2);
    const next = args[i + 1];
    if (next && !next.startsWith('--')) {
      parsed[key] = next;
      i++;
    } else {
      parsed[key] = true;
    }
  }
  return parsed;
}

// Log order is time order: both sides only ever append.
function count(logPath) {
  const entries = readEntries(logPath);
  let lastReflection = null;
  let sessions = 0;
  let questions = [];
  for (const entry of entries) {
    if (entry.activity_type === 'reflection_completed') {
      lastReflection = entry.timestamp || lastReflection;
      sessions = 0;
      questions = [];
    } else if (entry.activity_type === 'reflexive_prompt') {
      sessions++;
      const logged = entry.metadata && entry.metadata.reflexive_questions;
      if (Array.isArray(logged) && logged.length) questions = logged;
    }
  }
  return { success: true, sessions_since_reflection: sessions, last_reflection: lastReflection, questions };
}

function record(logPath) {
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  const entry = {
    timestamp: new Date().toISOString(),
    from: 'qual-reflect',
    to: 'human_researcher',
    message: 'Reflection completed with /qual-reflect.',
    activity_type: 'reflection_completed'
  };
  appendLine(logPath, JSON.stringify(entry));
  return { success: true, recorded: entry.timestamp };
}

const args = parseArgs();
if (!args['project-path'] || args['project-path'] === true) {
  console.error(JSON.stringify({ success: false, error: 'Missing required argument: --project-path' }));
  process.exit(1);
}

const projectPath = path.resolve(args['project-path']);
const logPath = path.join(projectPath, '.interpretive-orchestration', 'conversation-log.jsonl');
if (!fs.existsSync(path.join(projectPath, '.interpretive-orchestration'))) {
  console.error(JSON.stringify({ success: false, error: 'Project not initialized' }));
  process.exit(1);
}

try {
  console.log(JSON.stringify(args.record ? record(logPath) : count(logPath), null, 2));
} catch (error) {
  console.error(JSON.stringify({ success: false, error: error.message }));
  process.exit(1);
}
