#!/usr/bin/env node

/**
 * PostFiveDocuments Hook: Interpretive Pause
 *
 * Triggers after every 5 documents coded - directly from Appendix A methodology!
 * "Structured interpretive pauses: after every five documents within an archetype,
 * at transitions between archetypes, and whenever edge cases appeared."
 *
 * Purpose: Prevents mechanical coding without reflection
 * Philosophy: Constant comparison and pattern consolidation require pauses
 */

const fs = require('fs');
const path = require('path');

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

  // Output JSON to stderr for machine parsing
  console.error(JSON.stringify(remediation));
}

function getDocumentCount(projectRoot) {
  const configPath = path.join(projectRoot, '.interpretive-orchestration', 'config.json');
  if (!fs.existsSync(configPath)) return 0;

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  return config.coding_progress?.documents_coded || 0;
}

function shouldPause(count) {
  // Pause every 5 documents
  return count > 0 && count % 5 === 0;
}

function main() {
  const projectRoot = findProjectRoot(process.cwd());

  if (!projectRoot) {
    // Not in an Interpretive Orchestration project - skip silently
    process.exit(0);
  }

  const documentCount = getDocumentCount(projectRoot);

  if (shouldPause(documentCount)) {
    // Output structured remediation for machine parsing
    outputRemediation(
      'INTERPRETIVE_PAUSE',
      'info',  // This is a methodological reminder, not a warning or blocker
      `Interpretive pause triggered at ${documentCount} documents`,
      ['/qual-reflect', '/qual-think-through', '/qual-memo'],
      ['deep-reasoning', 'gioia-methodology'],
      true,  // Always bypassable - it's a prompt, not a block
      {
        documents_coded: documentCount,
        next_pause_at: documentCount + 5,
        suggested_actions: [
          'Write analytical memo',
          'Review emerging patterns',
          'Check theoretical coherence'
        ]
      }
    );

    console.log('');
    console.log('🔍 INTERPRETIVE PAUSE: Time to Reflect');
    console.log('   (methodology prompt - this pause is part of the process, not an interruption)');
    console.log('');
    console.log(`   You've coded ${documentCount} documents. Before continuing, consider pausing`);
    console.log('   for reflection and pattern consolidation.');
    console.log('');
    console.log('   📚 From Gioia methodology:');
    console.log('   "Structured interpretive pauses: after every five documents,');
    console.log('   at transitions, and whenever edge cases appeared."');
    console.log('');
    console.log('   💭 This pause prevents mechanical coding without theoretical engagement.');
    console.log('');
    console.log('   Suggested actions:');
    console.log('   • Run /qual-reflect for synthesis dialogue');
    console.log('   • Review coded quotes for emerging patterns');
    console.log('   • Write analytical memo about insights');
    console.log('   • Check theoretical coherence with /qual-examine-assumptions');
    console.log('   • Use /qual-think-through for pattern consolidation');
    console.log('');
    console.log('   🌊 Take your time. Constant comparison needs space.');
    console.log('');
    console.log('   When ready to continue, the pause completes automatically.');
    console.log('');

    // Log to conversation journal
    const logPath = path.join(projectRoot, '.interpretive-orchestration', 'conversation-log.jsonl');
    const logEntry = {
      timestamp: new Date().toISOString(),
      from: 'interpretive_pause_hook',
      to: 'human_researcher',
      message: `Interpretive pause triggered at ${documentCount} documents. Researcher prompted for reflection and pattern consolidation.`,
      stage: 'stage2_phase2_deductive_coding',
      activity_type: 'methodological_pause',
      philosophy_check: 'Constant comparison requires interpretive pauses'
    };

    if (fs.existsSync(path.dirname(logPath))) {
      fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
    }
  }

  process.exit(0);
}

try {
  main();
} catch (error) {
  // Fail silently - hooks shouldn't break workflow
  process.exit(0);
}
