#!/usr/bin/env node
/**
 * workspace-branch.js
 * Versioning for interpretation - support non-linear, exploratory analysis
 *
 * The "messy middle" of qualitative analysis is non-linear. This script enables:
 * - Forking interpretive branches to explore alternatives
 * - Tracking the methodological framing of each branch
 * - Merging branches with required synthesis memos
 * - Audit trail of interpretive decisions
 *
 * Usage:
 *   node workspace-branch.js --project-path /path/to/project --status
 *   node workspace-branch.js --project-path /path/to/project --list
 *   node workspace-branch.js --project-path /path/to/project --fork --name "alternative-structure" --framing "exploratory" --rationale "Testing whether..."
 *   node workspace-branch.js --project-path /path/to/project --switch --branch-id "alt-001"
 *   node workspace-branch.js --project-path /path/to/project --merge --branch-id "alt-001" --memo "Synthesis notes..."
 *   node workspace-branch.js --project-path /path/to/project --abandon --branch-id "alt-001" --rationale "Why abandoning..."
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

function initWorkspaceBranches(config) {
  if (!config.workspace_branches) {
    const now = new Date().toISOString();
    config.workspace_branches = {
      current_branch: 'main',
      branches: [{
        id: 'main',
        name: 'Main Analysis',
        parent_branch: null,
        forked_at_version: 'initial',
        created_at: now,
        methodological_framing: null,
        status: 'active',
        merge_memo: null
      }],
      branch_decisions: []
    };
  }
  return config.workspace_branches;
}

function generateBranchId(name) {
  const timestamp = Date.now().toString(36);
  const sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 20);
  return `${sanitized}-${timestamp}`;
}

function getCurrentVersion(config) {
  // Get version from data_structure or use timestamp
  if (config.data_structure?.version_history?.length > 0) {
    const latest = config.data_structure.version_history[config.data_structure.version_history.length - 1];
    return latest.version;
  }
  return new Date().toISOString().split('T')[0];
}

function logToJournal(projectPath, message) {
  const journalPath = path.join(projectPath, '.interpretive-orchestration', 'reflexivity-journal.md');
  if (!fs.existsSync(journalPath)) return;

  const entry = `
---

### Workspace Branch Activity
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
 * Fork a new interpretive branch
 */
function forkBranch(config, name, framing, rationale) {
  const branches = initWorkspaceBranches(config);
  const now = new Date().toISOString();
  const branchId = generateBranchId(name);
  const currentVersion = getCurrentVersion(config);

  // Validate framing
  const validFramings = ['exploratory', 'confirmatory', 'negative_case', 'alternative_interpretation'];
  if (framing && !validFramings.includes(framing)) {
    return {
      success: false,
      error: `Invalid framing. Must be one of: ${validFramings.join(', ')}`
    };
  }

  // Create new branch
  const newBranch = {
    id: branchId,
    name: name,
    parent_branch: branches.current_branch,
    forked_at_version: currentVersion,
    created_at: now,
    methodological_framing: framing || 'exploratory',
    status: 'active',
    merge_memo: null
  };

  branches.branches.push(newBranch);

  // Log decision
  branches.branch_decisions.push({
    action: 'fork',
    branch_id: branchId,
    target_branch: branches.current_branch,
    timestamp: now,
    rationale: rationale || ''
  });

  // Switch to new branch
  const previousBranch = branches.current_branch;
  branches.current_branch = branchId;

  branches.branch_decisions.push({
    action: 'switch',
    branch_id: branchId,
    target_branch: previousBranch,
    timestamp: now,
    rationale: 'Auto-switch after fork'
  });

  return {
    success: true,
    branch_id: branchId,
    name: name,
    forked_from: previousBranch,
    forked_at_version: currentVersion,
    framing: framing || 'exploratory',
    message: `Created and switched to branch "${name}". You can now explore this interpretive direction safely.`
  };
}

/**
 * Switch to a different branch
 */
function switchBranch(config, branchId) {
  const branches = initWorkspaceBranches(config);
  const now = new Date().toISOString();

  // Find branch
  const branch = branches.branches.find(b => b.id === branchId);
  if (!branch) {
    return {
      success: false,
      error: `Branch "${branchId}" not found`
    };
  }

  if (branch.status !== 'active') {
    return {
      success: false,
      error: `Branch "${branchId}" is ${branch.status}, cannot switch to it`
    };
  }

  const previousBranch = branches.current_branch;
  branches.current_branch = branchId;

  branches.branch_decisions.push({
    action: 'switch',
    branch_id: branchId,
    target_branch: previousBranch,
    timestamp: now,
    rationale: ''
  });

  return {
    success: true,
    switched_to: branchId,
    switched_from: previousBranch,
    branch_name: branch.name,
    framing: branch.methodological_framing
  };
}

/**
 * Merge a branch back (requires synthesis memo)
 */
function mergeBranch(config, branchId, memo) {
  const branches = initWorkspaceBranches(config);
  const now = new Date().toISOString();

  if (!memo || memo.trim().length < 50) {
    return {
      success: false,
      error: 'Merge requires a synthesis memo (at least 50 characters) explaining what you learned and how you\'re integrating this exploration.'
    };
  }

  // Find branch
  const branch = branches.branches.find(b => b.id === branchId);
  if (!branch) {
    return {
      success: false,
      error: `Branch "${branchId}" not found`
    };
  }

  if (branch.status !== 'active') {
    return {
      success: false,
      error: `Branch "${branchId}" is already ${branch.status}`
    };
  }

  if (branchId === 'main') {
    return {
      success: false,
      error: 'Cannot merge the main branch'
    };
  }

  // Mark as merged
  branch.status = 'merged';
  branch.merge_memo = memo;

  // Log decision
  branches.branch_decisions.push({
    action: 'merge',
    branch_id: branchId,
    target_branch: branch.parent_branch || 'main',
    timestamp: now,
    rationale: memo
  });

  // Switch back to parent if we're on this branch
  if (branches.current_branch === branchId) {
    branches.current_branch = branch.parent_branch || 'main';
  }

  return {
    success: true,
    merged_branch: branchId,
    merged_into: branch.parent_branch || 'main',
    current_branch: branches.current_branch,
    message: `Branch "${branch.name}" merged. Your synthesis memo has been recorded for the audit trail.`
  };
}

/**
 * Abandon a branch (with rationale)
 */
function abandonBranch(config, branchId, rationale) {
  const branches = initWorkspaceBranches(config);
  const now = new Date().toISOString();

  // Find branch
  const branch = branches.branches.find(b => b.id === branchId);
  if (!branch) {
    return {
      success: false,
      error: `Branch "${branchId}" not found`
    };
  }

  if (branch.status !== 'active') {
    return {
      success: false,
      error: `Branch "${branchId}" is already ${branch.status}`
    };
  }

  if (branchId === 'main') {
    return {
      success: false,
      error: 'Cannot abandon the main branch'
    };
  }

  // Mark as abandoned
  branch.status = 'abandoned';

  // Log decision
  branches.branch_decisions.push({
    action: 'abandon',
    branch_id: branchId,
    target_branch: null,
    timestamp: now,
    rationale: rationale || 'No rationale provided'
  });

  // Switch back to parent if we're on this branch
  if (branches.current_branch === branchId) {
    branches.current_branch = branch.parent_branch || 'main';
  }

  return {
    success: true,
    abandoned_branch: branchId,
    current_branch: branches.current_branch,
    message: `Branch "${branch.name}" abandoned. Note: Abandoned branches are preserved in the audit trail - interpretive dead ends are data too.`
  };
}

/**
 * List all branches
 */
function listBranches(config) {
  const branches = initWorkspaceBranches(config);

  const branchList = branches.branches.map(b => ({
    id: b.id,
    name: b.name,
    status: b.status,
    framing: b.methodological_framing,
    parent: b.parent_branch,
    forked_at: b.forked_at_version,
    created: b.created_at?.split('T')[0],
    is_current: b.id === branches.current_branch
  }));

  return {
    success: true,
    current_branch: branches.current_branch,
    branches: branchList,
    active_count: branchList.filter(b => b.status === 'active').length,
    merged_count: branchList.filter(b => b.status === 'merged').length,
    abandoned_count: branchList.filter(b => b.status === 'abandoned').length
  };
}

/**
 * Get current status
 */
function getStatus(config) {
  const branches = config.workspace_branches;
  if (!branches) {
    return {
      success: true,
      initialized: false,
      current_branch: 'main',
      message: 'Workspace branching not yet initialized. Use --fork to create your first exploratory branch.'
    };
  }

  const currentBranch = branches.branches.find(b => b.id === branches.current_branch);
  const recentDecisions = branches.branch_decisions.slice(-5);

  return {
    success: true,
    initialized: true,
    current_branch: branches.current_branch,
    current_branch_name: currentBranch?.name,
    current_framing: currentBranch?.methodological_framing,
    total_branches: branches.branches.length,
    active_branches: branches.branches.filter(b => b.status === 'active').length,
    recent_activity: recentDecisions.map(d => ({
      action: d.action,
      branch: d.branch_id,
      date: d.timestamp?.split('T')[0]
    }))
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

if (args.list) {
  console.log(JSON.stringify(listBranches(config), null, 2));
  process.exit(0);
}

if (args.fork) {
  if (!args.name) {
    console.error(JSON.stringify({ success: false, error: 'Missing --name for fork' }));
    process.exit(1);
  }
  const result = forkBranch(config, args.name, args.framing, args.rationale);
  if (result.success) {
    saveConfig(projectPath, config);
    logToJournal(projectPath, `**New Interpretive Branch Created**

Branch: ${result.name} (${result.branch_id})
Forked from: ${result.forked_from}
At version: ${result.forked_at_version}
Framing: ${result.framing}

${args.rationale ? `**Rationale:** ${args.rationale}` : ''}

This branch provides a safe space to explore an alternative interpretive direction.
When ready, merge with a synthesis memo or abandon with notes on what you learned.`);
  }
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
}

if (args.switch) {
  if (!args['branch-id']) {
    console.error(JSON.stringify({ success: false, error: 'Missing --branch-id for switch' }));
    process.exit(1);
  }
  const result = switchBranch(config, args['branch-id']);
  if (result.success) {
    saveConfig(projectPath, config);
  }
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
}

if (args.merge) {
  if (!args['branch-id']) {
    console.error(JSON.stringify({ success: false, error: 'Missing --branch-id for merge' }));
    process.exit(1);
  }
  const result = mergeBranch(config, args['branch-id'], args.memo);
  if (result.success) {
    saveConfig(projectPath, config);
    logToJournal(projectPath, `**Branch Merged**

Merged: ${args['branch-id']} → ${result.merged_into}

**Synthesis Memo:**
${args.memo}

This interpretive exploration has been integrated into the main analysis.`);
  }
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
}

if (args.abandon) {
  if (!args['branch-id']) {
    console.error(JSON.stringify({ success: false, error: 'Missing --branch-id for abandon' }));
    process.exit(1);
  }
  const result = abandonBranch(config, args['branch-id'], args.rationale);
  if (result.success) {
    saveConfig(projectPath, config);
    logToJournal(projectPath, `**Branch Abandoned**

Abandoned: ${args['branch-id']}
Rationale: ${args.rationale || 'Not provided'}

Note: This is preserved in the audit trail. Dead ends are valuable methodological data.`);
  }
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
}

// Default: show status
console.log(JSON.stringify(getStatus(config), null, 2));
process.exit(0);
