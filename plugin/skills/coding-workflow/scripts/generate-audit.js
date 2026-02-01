#!/usr/bin/env node
/**
 * generate-audit.js
 * Generates audit trail documentation for coding sessions
 *
 * Usage:
 *   node generate-audit.js --project-path /path/to/project [options]
 *
 * Options:
 *   --output FILE        Output filename (default: audit-trail.md)
 *   --format FORMAT      Output format: markdown, json (default: markdown)
 *   --session SESSION_ID Generate for specific session only
 *   --since DATE         Only include entries since date (ISO-8601)
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

function parseJsonlSafely(content) {
  const lines = content.split('\n').filter(line => line.trim());
  const parsed = [];
  let skipped = 0;

  for (const line of lines) {
    try {
      parsed.push(JSON.parse(line));
    } catch (error) {
      skipped++;
    }
  }

  return { logs: parsed, skipped };
}

function readConversationLog(projectPath, sinceDate) {
  const logPath = path.join(projectPath, '.interpretive-orchestration', 'conversation-log.jsonl');

  if (!fs.existsSync(logPath)) {
    return { logs: [], skipped: 0 };
  }

  const content = fs.readFileSync(logPath, 'utf8');
  const result = parseJsonlSafely(content);

  // Filter by date if specified
  if (sinceDate) {
    const sinceTimestamp = new Date(sinceDate).getTime();
    result.logs = result.logs.filter(log => {
      const logTime = new Date(log.timestamp).getTime();
      return logTime >= sinceTimestamp;
    });
  }

  return result;
}

function generateMarkdownAudit(config, logs, sessions, args) {
  const projectName = config.project_info?.name || 'Qualitative Research Project';
  const generatedAt = new Date().toISOString();

  let markdown = `# Coding Audit Trail

**Project:** ${projectName}
**Generated:** ${generatedAt}
**Tradition:** ${config.philosophical_stance?.tradition || 'Not specified'}

---

## Purpose

This audit trail documents all coding activities for confirmability and transparency.
Every analytical decision is traced to enable verification of the interpretive process.

---

## Project State Summary

| Metric | Value |
|--------|-------|
| Stage 1 Complete | ${config.sandwich_status?.stage1_complete ? 'Yes' : 'No'} |
| Documents Manually Coded | ${config.sandwich_status?.stage1_details?.documents_manually_coded || 0} |
| Documents AI-Assisted | ${config.coding_progress?.documents_coded || 0} |
| Quotes Extracted | ${config.coding_progress?.quotes_extracted || 0} |
| Concepts in Framework | ${config.coding_progress?.concepts_in_framework || 0} |

---

## Batch Sessions

`;

  // Document batch sessions
  if (sessions.length === 0) {
    markdown += '*No batch sessions recorded yet.*\n\n';
  } else {
    for (const session of sessions) {
      markdown += `### Session: ${session.id}

- **Started:** ${session.started_at}
- **Agent:** @${session.agent}
- **Phase:** ${session.phase}
- **Documents:** ${session.documents?.join(', ') || 'None specified'}
- **Status:** ${session.status}

`;
    }
  }

  markdown += '---\n\n## Conversation Log Analysis\n\n';

  // Categorize log entries
  const categories = {
    coding: logs.filter(l => l.action === 'coding' || l.activity_type === 'coding'),
    synthesis: logs.filter(l => l.action === 'synthesis' || l.activity_type === 'synthesis'),
    reflection: logs.filter(l => l.action === 'reflection' || l.activity_type === 'reflexive_insight'),
    decisions: logs.filter(l => l.from === 'human_researcher'),
    tool_usage: logs.filter(l => l.activity_type === 'deep_reasoning' || l.activity_type === 'paradox_navigation')
  };

  // Coding activities
  markdown += `### Coding Activities (${categories.coding.length} entries)\n\n`;
  if (categories.coding.length === 0) {
    markdown += '*No coding activities recorded.*\n\n';
  } else {
    for (let i = 0; i < Math.min(categories.coding.length, 20); i++) {
      const log = categories.coding[i];
      markdown += `**${i + 1}. ${log.timestamp}** - ${log.agent || log.from || 'Unknown'}
> ${log.content || log.message || 'No content'}
${log.document_id ? `Document: ${log.document_id}` : ''}
${log.concept_id ? `Concept: ${log.concept_id}` : ''}

`;
    }
    if (categories.coding.length > 20) {
      markdown += `*...and ${categories.coding.length - 20} more coding activities*\n\n`;
    }
  }

  // Human decisions
  markdown += `### Human Decisions (${categories.decisions.length} entries)\n\n`;
  if (categories.decisions.length === 0) {
    markdown += '*No human decisions explicitly recorded.*\n\n';
  } else {
    for (let i = 0; i < Math.min(categories.decisions.length, 10); i++) {
      const log = categories.decisions[i];
      markdown += `**${i + 1}. ${log.timestamp}**
> ${log.content || log.message || 'No content'}
${log.metadata?.rationale ? `Rationale: ${log.metadata.rationale}` : ''}

`;
    }
    if (categories.decisions.length > 10) {
      markdown += `*...and ${categories.decisions.length - 10} more decisions*\n\n`;
    }
  }

  // Reflexive insights
  markdown += `### Reflexive Insights (${categories.reflection.length} entries)\n\n`;
  if (categories.reflection.length === 0) {
    markdown += '*No reflexive insights recorded.*\n\n';
  } else {
    for (const log of categories.reflection) {
      markdown += `**${log.timestamp}**
> ${log.content || log.message || 'No content'}

`;
    }
  }

  // Tool usage
  markdown += `### Epistemic Tool Usage (${categories.tool_usage.length} entries)\n\n`;
  if (categories.tool_usage.length === 0) {
    markdown += '*No epistemic tool usage recorded.*\n\n';
  } else {
    for (const log of categories.tool_usage) {
      markdown += `**${log.timestamp}** - ${log.activity_type}
> ${log.content || log.message || 'No content'}

`;
    }
  }

  // Confirmability statement
  markdown += `---

## Confirmability Statement

This audit trail provides:
- Complete chronology of coding activities
- Transparent record of human decisions
- Documentation of AI assistance (what, when, how)
- Reflexive awareness throughout the process

**All interpretive claims are traceable from raw data through this documented process.**

---

## Statistics

| Category | Count |
|----------|-------|
| Total Log Entries | ${logs.length} |
| Coding Activities | ${categories.coding.length} |
| Human Decisions | ${categories.decisions.length} |
| Reflexive Insights | ${categories.reflection.length} |
| Tool Usage | ${categories.tool_usage.length} |
| Batch Sessions | ${sessions.length} |

---

*Generated by Interpretive Orchestration - Epistemic Partnership System*
`;

  return markdown;
}

function generateJsonAudit(config, logs, sessions) {
  return {
    generated_at: new Date().toISOString(),
    project: {
      name: config.project_info?.name,
      research_question: config.project_info?.research_question,
      tradition: config.philosophical_stance?.tradition
    },
    state: {
      stage1_complete: config.sandwich_status?.stage1_complete,
      documents_manually_coded: config.sandwich_status?.stage1_details?.documents_manually_coded,
      documents_ai_coded: config.coding_progress?.documents_coded,
      quotes_extracted: config.coding_progress?.quotes_extracted
    },
    sessions: sessions,
    logs: logs,
    statistics: {
      total_logs: logs.length,
      coding_activities: logs.filter(l => l.action === 'coding').length,
      human_decisions: logs.filter(l => l.from === 'human_researcher').length,
      reflexive_insights: logs.filter(l => l.activity_type === 'reflexive_insight').length
    }
  };
}

function generateAudit(projectPath, args) {
  const config = readConfig(projectPath);

  if (!config) {
    return {
      success: false,
      error: 'Project not initialized',
      suggestion: 'Run project-setup first'
    };
  }

  // Read conversation log
  const { logs, skipped } = readConversationLog(projectPath, args.since);

  // Get sessions from config
  const sessions = config.batch_tracking?.sessions || [];

  // Filter to specific session if requested
  let filteredSessions = sessions;
  let filteredLogs = logs;

  if (args.session) {
    filteredSessions = sessions.filter(s => s.id === args.session);
    // Filter logs to those from this session if possible
    filteredLogs = logs.filter(l =>
      l.metadata?.session_id === args.session ||
      !l.metadata?.session_id  // Include logs without session ID
    );
  }

  // Generate output
  const format = args.format || 'markdown';
  let output;
  let outputPath;

  if (format === 'json') {
    output = JSON.stringify(generateJsonAudit(config, filteredLogs, filteredSessions), null, 2);
    outputPath = path.join(projectPath, 'outputs', args.output || 'audit-trail.json');
  } else {
    output = generateMarkdownAudit(config, filteredLogs, filteredSessions, args);
    outputPath = path.join(projectPath, 'outputs', args.output || 'audit-trail.md');
  }

  // Ensure outputs directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write output
  fs.writeFileSync(outputPath, output);

  return {
    success: true,
    output_path: outputPath,
    format: format,
    statistics: {
      logs_included: filteredLogs.length,
      logs_skipped_parse_errors: skipped,
      sessions_included: filteredSessions.length
    },
    message: `Audit trail generated: ${outputPath}`
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

const result = generateAudit(resolvedPath, args);
console.log(JSON.stringify(result, null, 2));

process.exit(result.success ? 0 : 1);
