#!/usr/bin/env node

/**
 * SessionStart Hook: Partnership Stance
 *
 * In an Interpretive Orchestration project, gives the AI the plugin's
 * non-negotiable principles and the researcher's Stage 1 status at the start
 * of every session.
 *
 * Why: agent tools do not load a plugin's CLAUDE.md into the researcher's
 * session, so without this a request like "code this transcript for me",
 * made without a /qual-* command, reaches the AI with no Stage 1 check.
 * The principles are read from CLAUDE.md so there is one source.
 */

const fs = require('fs');
const path = require('path');

function findProjectRoot(startPath) {
  let currentPath = startPath;
  while (currentPath !== path.parse(currentPath).root) {
    if (fs.existsSync(path.join(currentPath, '.interpretive-orchestration', 'config.json'))) {
      return currentPath;
    }
    currentPath = path.dirname(currentPath);
  }
  return null;
}

function readPrinciples() {
  const guide = fs.readFileSync(path.join(__dirname, '..', 'CLAUDE.md'), 'utf8');
  const match = guide.match(/## Core Philosophy[^\n]*\n([\s\S]*?)\n---/);
  return match ? match[1].trim() : '';
}

function stage1Status(config) {
  const status = config.sandwich_status || {};
  const details = status.stage1_details || {};
  if (status.stage1_complete) {
    return 'Stage 1 is complete. AI-assisted coding is open to this researcher.';
  }
  return `Stage 1 is NOT complete: ${details.documents_manually_coded || 0} documents coded by hand ` +
    `and ${details.memos_written || 0} memos written so far. Before any AI-assisted coding, ` +
    'whether or not the researcher used a /qual-* command, explain why the manual foundation ' +
    'matters (principle 1 below) and ask whether they want to proceed anyway, and why. ' +
    'Asking for the work is not that confirmation: ask, then wait for their answer. ' +
    'If they confirm, respect their decision.';
}

try {
  const projectRoot = findProjectRoot(process.cwd());
  if (!projectRoot) process.exit(0);

  const config = JSON.parse(
    fs.readFileSync(path.join(projectRoot, '.interpretive-orchestration', 'config.json'), 'utf8')
  );
  const principles = readPrinciples();
  if (!principles) process.exit(0);

  console.log(
    'This is an Interpretive Orchestration research project.\n\n' +
    `${stage1Status(config)}\n\n${principles}`
  );
  process.exit(0);
} catch (error) {
  // A broken stance hook must never block the session.
  process.exit(0);
}
