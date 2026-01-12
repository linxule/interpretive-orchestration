#!/usr/bin/env node
/**
 * researcher-team.js
 * Multi-researcher support for collaborative qualitative analysis
 *
 * Features:
 * - Add/remove team members with roles
 * - Track current active researcher (for attribution)
 * - Assign documents/cases to researchers
 * - Manage intercoder reliability sessions
 * - Log attribution for analytical decisions
 *
 * Usage:
 *   node researcher-team.js --project-path /path/to/project --status
 *   node researcher-team.js --project-path /path/to/project --add-member --name "Jane Doe" --email "jane@example.com" --role "coder"
 *   node researcher-team.js --project-path /path/to/project --set-current --researcher-id "jane-doe"
 *   node researcher-team.js --project-path /path/to/project --assign --researcher-id "jane-doe" --document "INT_001,INT_002"
 *   node researcher-team.js --project-path /path/to/project --start-icr-session --participants "jane-doe,john-smith" --documents "INT_005"
 *   node researcher-team.js --project-path /path/to/project --log-attribution --action "coded_document" --target "INT_001"
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

function generateId(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
}

function initResearcherTeam(config) {
  if (!config.researcher_team) {
    config.researcher_team = {
      primary_researcher: null,
      team_members: [],
      current_researcher: 'primary',
      intercoder_reliability: {
        enabled: false,
        overlap_documents: [],
        reliability_sessions: []
      },
      attribution_log: []
    };
  }
  return config.researcher_team;
}

function logToJournal(projectPath, message) {
  const journalPath = path.join(projectPath, '.interpretive-orchestration', 'reflexivity-journal.md');
  if (!fs.existsSync(journalPath)) return;

  const entry = `
---

### Team Activity
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
 * Set primary researcher
 */
function setPrimaryResearcher(config, name, email) {
  const team = initResearcherTeam(config);
  const now = new Date().toISOString();

  team.primary_researcher = {
    id: 'primary',
    name: name,
    email: email || '',
    role: 'lead',
    joined_at: now
  };

  return {
    success: true,
    primary_researcher: team.primary_researcher
  };
}

/**
 * Add a team member
 */
function addMember(config, name, email, role) {
  const team = initResearcherTeam(config);
  const now = new Date().toISOString();
  const id = generateId(name);

  // Check for duplicates
  if (team.team_members.some(m => m.id === id)) {
    return {
      success: false,
      error: `Team member with ID "${id}" already exists`
    };
  }

  const validRoles = ['lead', 'co_investigator', 'coder', 'auditor', 'consultant'];
  if (role && !validRoles.includes(role)) {
    return {
      success: false,
      error: `Invalid role. Must be one of: ${validRoles.join(', ')}`
    };
  }

  const member = {
    id: id,
    name: name,
    email: email || '',
    role: role || 'coder',
    joined_at: now,
    status: 'active',
    coding_assignments: []
  };

  team.team_members.push(member);

  return {
    success: true,
    member: member,
    total_members: team.team_members.length + (team.primary_researcher ? 1 : 0)
  };
}

/**
 * Remove or deactivate a team member
 */
function removeMember(config, researcherId) {
  const team = initResearcherTeam(config);

  const memberIndex = team.team_members.findIndex(m => m.id === researcherId);
  if (memberIndex === -1) {
    return {
      success: false,
      error: `Team member "${researcherId}" not found`
    };
  }

  // Don't actually remove - mark as inactive for audit trail
  team.team_members[memberIndex].status = 'inactive';

  // If this was current researcher, switch to primary
  if (team.current_researcher === researcherId) {
    team.current_researcher = 'primary';
  }

  return {
    success: true,
    deactivated: researcherId,
    message: 'Member deactivated (retained for audit trail)'
  };
}

/**
 * Set current active researcher
 */
function setCurrentResearcher(config, researcherId) {
  const team = initResearcherTeam(config);

  // Validate researcher exists
  if (researcherId !== 'primary') {
    const member = team.team_members.find(m => m.id === researcherId && m.status === 'active');
    if (!member) {
      return {
        success: false,
        error: `Active team member "${researcherId}" not found`
      };
    }
  }

  team.current_researcher = researcherId;

  // Get name for response
  let name = 'Primary Researcher';
  if (researcherId !== 'primary') {
    const member = team.team_members.find(m => m.id === researcherId);
    name = member?.name || researcherId;
  } else if (team.primary_researcher) {
    name = team.primary_researcher.name;
  }

  return {
    success: true,
    current_researcher: researcherId,
    name: name,
    message: `Active researcher set to: ${name}. All subsequent actions will be attributed to this researcher.`
  };
}

/**
 * Assign documents to a researcher
 */
function assignDocuments(config, researcherId, documentIds) {
  const team = initResearcherTeam(config);

  const member = team.team_members.find(m => m.id === researcherId);
  if (!member) {
    return {
      success: false,
      error: `Team member "${researcherId}" not found`
    };
  }

  const docs = documentIds.split(',').map(d => d.trim());

  // Add to assignments (avoid duplicates)
  for (const doc of docs) {
    if (!member.coding_assignments.includes(doc)) {
      member.coding_assignments.push(doc);
    }
  }

  return {
    success: true,
    researcher: researcherId,
    assigned: docs,
    total_assignments: member.coding_assignments.length
  };
}

/**
 * Start an intercoder reliability session
 */
function startICRSession(config, participantIds, documentIds) {
  const team = initResearcherTeam(config);
  const now = new Date().toISOString();

  // Enable ICR if not already
  team.intercoder_reliability.enabled = true;

  const participants = participantIds.split(',').map(p => p.trim());
  const documents = documentIds.split(',').map(d => d.trim());

  // Generate session ID
  const sessionId = `icr-${Date.now().toString(36)}`;

  // Add to overlap documents
  for (const doc of documents) {
    const existing = team.intercoder_reliability.overlap_documents.find(d => d.document_id === doc);
    if (existing) {
      for (const p of participants) {
        if (!existing.coded_by.includes(p)) {
          existing.coded_by.push(p);
        }
      }
      existing.comparison_status = 'pending';
    } else {
      team.intercoder_reliability.overlap_documents.push({
        document_id: doc,
        coded_by: participants,
        comparison_status: 'pending',
        agreement_notes: ''
      });
    }
  }

  // Create session record
  const session = {
    session_id: sessionId,
    date: now.split('T')[0],
    participants: participants,
    documents_compared: documents,
    codes_discussed: [],
    outcomes: [],
    notes: ''
  };

  team.intercoder_reliability.reliability_sessions.push(session);

  return {
    success: true,
    session_id: sessionId,
    participants: participants,
    documents: documents,
    message: `ICR session started. Each participant should independently code the documents, then compare results.`
  };
}

/**
 * Record ICR session outcome
 */
function recordICROutcome(config, sessionId, outcomeType, details) {
  const team = initResearcherTeam(config);

  const session = team.intercoder_reliability.reliability_sessions.find(s => s.session_id === sessionId);
  if (!session) {
    return {
      success: false,
      error: `Session "${sessionId}" not found`
    };
  }

  const validTypes = ['code_merged', 'code_split', 'definition_refined', 'disagreement_noted'];
  if (!validTypes.includes(outcomeType)) {
    return {
      success: false,
      error: `Invalid outcome type. Must be one of: ${validTypes.join(', ')}`
    };
  }

  session.outcomes.push({
    type: outcomeType,
    details: details || ''
  });

  return {
    success: true,
    session_id: sessionId,
    outcome_recorded: outcomeType,
    total_outcomes: session.outcomes.length
  };
}

/**
 * Complete ICR session
 */
function completeICRSession(config, sessionId, notes) {
  const team = initResearcherTeam(config);

  const session = team.intercoder_reliability.reliability_sessions.find(s => s.session_id === sessionId);
  if (!session) {
    return {
      success: false,
      error: `Session "${sessionId}" not found`
    };
  }

  session.notes = notes || '';

  // Mark compared documents as resolved
  for (const docId of session.documents_compared) {
    const doc = team.intercoder_reliability.overlap_documents.find(d => d.document_id === docId);
    if (doc) {
      doc.comparison_status = 'resolved';
      doc.agreement_notes = notes || '';
    }
  }

  return {
    success: true,
    session_id: sessionId,
    outcomes_count: session.outcomes.length,
    documents_resolved: session.documents_compared.length,
    message: 'ICR session completed. Findings recorded for audit trail.'
  };
}

/**
 * Log an attribution event
 */
function logAttribution(config, action, targetId, notes) {
  const team = initResearcherTeam(config);
  const now = new Date().toISOString();

  const validActions = ['coded_document', 'created_code', 'refined_code', 'wrote_memo', 'made_decision'];
  if (!validActions.includes(action)) {
    return {
      success: false,
      error: `Invalid action. Must be one of: ${validActions.join(', ')}`
    };
  }

  team.attribution_log.push({
    researcher_id: team.current_researcher,
    action: action,
    target_id: targetId,
    timestamp: now,
    notes: notes || ''
  });

  return {
    success: true,
    researcher: team.current_researcher,
    action: action,
    target: targetId,
    logged_at: now
  };
}

/**
 * Get team status
 */
function getStatus(config) {
  const team = config.researcher_team;

  if (!team) {
    return {
      success: true,
      initialized: false,
      message: 'No team configured. Single researcher mode.'
    };
  }

  const activeMembers = team.team_members.filter(m => m.status === 'active');
  const currentName = team.current_researcher === 'primary'
    ? team.primary_researcher?.name || 'Primary'
    : team.team_members.find(m => m.id === team.current_researcher)?.name || team.current_researcher;

  return {
    success: true,
    initialized: true,
    primary_researcher: team.primary_researcher?.name || 'Not set',
    current_researcher: {
      id: team.current_researcher,
      name: currentName
    },
    team_size: activeMembers.length + (team.primary_researcher ? 1 : 0),
    active_members: activeMembers.map(m => ({
      id: m.id,
      name: m.name,
      role: m.role,
      assignments: m.coding_assignments.length
    })),
    icr_enabled: team.intercoder_reliability?.enabled || false,
    pending_icr_docs: team.intercoder_reliability?.overlap_documents?.filter(d => d.comparison_status === 'pending').length || 0,
    attribution_count: team.attribution_log?.length || 0
  };
}

/**
 * List all team members
 */
function listMembers(config) {
  const team = config.researcher_team;

  if (!team) {
    return {
      success: true,
      members: [],
      message: 'No team configured'
    };
  }

  const members = [];

  if (team.primary_researcher) {
    members.push({
      ...team.primary_researcher,
      is_current: team.current_researcher === 'primary',
      status: 'active'
    });
  }

  for (const member of team.team_members) {
    members.push({
      ...member,
      is_current: team.current_researcher === member.id
    });
  }

  return {
    success: true,
    members: members,
    total: members.length,
    active: members.filter(m => m.status === 'active').length
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

if (args['list-members']) {
  console.log(JSON.stringify(listMembers(config), null, 2));
  process.exit(0);
}

if (args['set-primary']) {
  if (!args.name) {
    console.error(JSON.stringify({ success: false, error: 'Missing --name' }));
    process.exit(1);
  }
  const result = setPrimaryResearcher(config, args.name, args.email);
  saveConfig(projectPath, config);
  logToJournal(projectPath, `**Primary Researcher Set**\nName: ${args.name}\nEmail: ${args.email || 'Not provided'}`);
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

if (args['add-member']) {
  if (!args.name) {
    console.error(JSON.stringify({ success: false, error: 'Missing --name' }));
    process.exit(1);
  }
  const result = addMember(config, args.name, args.email, args.role);
  if (result.success) {
    saveConfig(projectPath, config);
    logToJournal(projectPath, `**Team Member Added**\nName: ${args.name}\nRole: ${args.role || 'coder'}`);
  }
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
}

if (args['remove-member']) {
  if (!args['researcher-id']) {
    console.error(JSON.stringify({ success: false, error: 'Missing --researcher-id' }));
    process.exit(1);
  }
  const result = removeMember(config, args['researcher-id']);
  if (result.success) {
    saveConfig(projectPath, config);
    logToJournal(projectPath, `**Team Member Deactivated**: ${args['researcher-id']}`);
  }
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
}

if (args['set-current']) {
  if (!args['researcher-id']) {
    console.error(JSON.stringify({ success: false, error: 'Missing --researcher-id' }));
    process.exit(1);
  }
  const result = setCurrentResearcher(config, args['researcher-id']);
  if (result.success) {
    saveConfig(projectPath, config);
  }
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
}

if (args.assign) {
  if (!args['researcher-id'] || !args.document) {
    console.error(JSON.stringify({ success: false, error: 'Missing --researcher-id or --document' }));
    process.exit(1);
  }
  const result = assignDocuments(config, args['researcher-id'], args.document);
  if (result.success) {
    saveConfig(projectPath, config);
  }
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
}

if (args['start-icr-session']) {
  if (!args.participants || !args.documents) {
    console.error(JSON.stringify({ success: false, error: 'Missing --participants or --documents' }));
    process.exit(1);
  }
  const result = startICRSession(config, args.participants, args.documents);
  if (result.success) {
    saveConfig(projectPath, config);
    logToJournal(projectPath, `**Intercoder Reliability Session Started**\nSession: ${result.session_id}\nParticipants: ${args.participants}\nDocuments: ${args.documents}`);
  }
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
}

if (args['record-icr-outcome']) {
  if (!args['session-id'] || !args.type) {
    console.error(JSON.stringify({ success: false, error: 'Missing --session-id or --type' }));
    process.exit(1);
  }
  const result = recordICROutcome(config, args['session-id'], args.type, args.details);
  if (result.success) {
    saveConfig(projectPath, config);
  }
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
}

if (args['complete-icr-session']) {
  if (!args['session-id']) {
    console.error(JSON.stringify({ success: false, error: 'Missing --session-id' }));
    process.exit(1);
  }
  const result = completeICRSession(config, args['session-id'], args.notes);
  if (result.success) {
    saveConfig(projectPath, config);
    logToJournal(projectPath, `**ICR Session Completed**\nSession: ${args['session-id']}\nNotes: ${args.notes || 'None'}`);
  }
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
}

if (args['log-attribution']) {
  if (!args.action || !args.target) {
    console.error(JSON.stringify({ success: false, error: 'Missing --action or --target' }));
    process.exit(1);
  }
  const result = logAttribution(config, args.action, args.target, args.notes);
  if (result.success) {
    saveConfig(projectPath, config);
  }
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
}

// Default: show status
console.log(JSON.stringify(getStatus(config), null, 2));
process.exit(0);
