#!/usr/bin/env node

/**
 * SessionEnd Hook: Reflexivity Prompt
 *
 * Triggers at end of each Claude Code session to prompt reflexive thinking.
 * Captures insights, assumptions examined, and learning.
 *
 * Philosophy: Constructivist reflexivity - researcher position shapes interpretation
 * Purpose: Build epistemic awareness through regular reflection
 */

const fs = require('fs');
const path = require('path');

// Logged with the session end, so /qual-reflect can open with them later.
const REFLEXIVE_QUESTIONS = [
  'What did you learn about YOUR data today?',
  'What did you learn about YOUR interpretive process?',
  'What assumptions did you examine (or should examine)?',
  'How did working with AI shape your thinking?',
  'What tensions or questions are you sitting with?'
];

function findProjectRoot(startPath) {
  let currentPath = startPath;
  while (currentPath !== path.parse(currentPath).root) {
    if (fs.existsSync(path.join(currentPath, '.interpretive-orchestration'))) {
      return currentPath;
    }
    currentPath = path.dirname(currentPath);
  }
  return null;
}

// Output structured remediation JSON (machine-readable)
function outputRemediation(code, severity, reason, nextCommands, nextSkills, canBypass, details) {
  const remediation = {
    code,
    severity,
    reason,
    next_commands: nextCommands,
    next_skills: nextSkills,
    can_bypass: canBypass,
    details
  };

  console.error(JSON.stringify(remediation));
}

function getSessionStats(projectRoot) {
  const logPath = path.join(projectRoot, '.interpretive-orchestration', 'conversation-log.jsonl');

  if (!fs.existsSync(logPath)) {
    return { activities: 0, tools_used: [], codes_created: 0 };
  }

  // Skip lines that are not JSON: one bad line must not stop the logging.
  const logs = fs.readFileSync(logPath, 'utf8')
    .split('\n')
    .filter(line => line.trim())
    .flatMap(line => {
      try {
        const entry = JSON.parse(line);
        return entry && typeof entry === 'object' ? [entry] : [];
      } catch (error) {
        return [];
      }
    });

  // Use the last 20 entries as a simplified session window
  const recentLogs = logs.slice(-20);

  const toolsUsed = [...new Set(recentLogs
    .filter(log => log.activity_type === 'deep_reasoning' || log.activity_type === 'paradox_navigation')
    .map(log => log.from))];

  return {
    activities: recentLogs.length,
    tools_used: toolsUsed,
    codes_created: recentLogs.filter(log => log.activity_type === 'coding').length
  };
}

function main() {
  const projectRoot = findProjectRoot(process.cwd());

  if (!projectRoot) {
    // Not in Interpretive Orchestration project - skip
    process.exit(0);
  }

  const stats = getSessionStats(projectRoot);

  outputRemediation(
    'SESSION_REFLECTION',
    'info',  // This is a reflection prompt, not a warning or blocker
    'Session ending - reflexivity prompt for epistemic awareness',
    ['/qual-reflect', '/qual-memo', '/qual-think-through'],
    ['deep-reasoning', 'coherence-check'],
    true,  // Always bypassable - it's a prompt, not a block
    {
      session_activities: stats.activities,
      tools_used: stats.tools_used,
      codes_created: stats.codes_created,
      reflexive_questions: REFLEXIVE_QUESTIONS
    }
  );

  console.log('');
  console.log('🌅 SESSION REFLECTION');
  console.log('   (methodology prompt - reflexivity builds epistemic awareness)');
  console.log('');
  console.log('   Before you go, consider pausing for reflexive thinking...');
  console.log('');

  if (stats.activities > 0) {
    console.log('   📊 This session:');
    console.log(`   • Analytical activities: ${stats.activities}`);
    if (stats.tools_used.length > 0) {
      console.log(`   • Epistemic tools used: ${stats.tools_used.join(', ')}`);
    }
    if (stats.codes_created > 0) {
      console.log(`   • Documents worked on: ${stats.codes_created}`);
    }
    console.log('');
  }

  console.log('   🤔 Reflexive questions for your journal:');
  console.log('');
  for (const question of REFLEXIVE_QUESTIONS) console.log(`   • ${question}`);
  console.log('');
  console.log('   💡 Quick reflection:');
  console.log('   Run /qual-reflect for structured synthesis dialogue');
  console.log('   Or: Jot notes in .interpretive-orchestration/reflexivity-journal.md');
  console.log('');
  console.log('   📝 Why this matters:');
  console.log("   Reflexivity isn't overhead - it's how you develop");
  console.log('   theoretical sensitivity and epistemic awareness.');
  console.log('');
  console.log('   Constructivist principle: Your position shapes interpretation.');
  console.log('   Regular reflection makes that visible and productive.');
  console.log('');

  const logPath = path.join(projectRoot, '.interpretive-orchestration', 'conversation-log.jsonl');
  const logEntry = {
    timestamp: new Date().toISOString(),
    from: 'session_end_hook',
    to: 'human_researcher',
    message: 'Session ending. Reflexivity prompt recorded here; agent tools do not show session-end output, so the researcher may not have seen it. /qual-reflect counts these entries (reflection-sessions.js) and opens with the questions.',
    stage: 'session_end',
    activity_type: 'reflexive_prompt',
    metadata: {
      session_activities: stats.activities,
      tools_used: stats.tools_used,
      reflexive_questions: REFLEXIVE_QUESTIONS
    },
    philosophy_check: 'Constructivist reflexivity: researcher awareness of interpretive role'
  };

  if (fs.existsSync(path.dirname(logPath))) {
    // Start a new line first if the log does not end with one.
    const text = fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf8') : '';
    const separator = text && !text.endsWith('\n') ? '\n' : '';
    fs.appendFileSync(logPath, separator + JSON.stringify(logEntry) + '\n');
  }

  console.log('   See you next session! 🌟');
  console.log('');

  process.exit(0);
}

try {
  main();
} catch (error) {
  // Fail gracefully
  process.exit(0);
}
