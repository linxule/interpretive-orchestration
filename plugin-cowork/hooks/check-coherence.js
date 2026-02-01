#!/usr/bin/env node

/**
 * EpistemicCoherence Hook: Philosophical Consistency Check
 *
 * Validates that analytical moves align with declared philosophical stance.
 * Checks language consistency (construct vs discover), ontological coherence,
 * and methodological alignment.
 *
 * Philosophy: Can't mix objectivist discovery language with constructivist stance
 * Purpose: Maintain internal philosophical consistency
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

// Whitelist: Technical/file operations that don't imply ontological stance
// These are common phrases where "find", "identify", "extract" etc. are
// used in technical (not research-interpretive) contexts
const technicalExceptions = [
  'find file', 'find the file', 'find document', 'find the document',
  'find folder', 'find the folder', 'find directory',
  'locate file', 'locate the file', 'locate document',
  'extract file', 'extract the', 'extract from', 'extract zip',
  'search for file', 'search the folder',
  'identify the error', 'identify the bug', 'identify the issue',
  'identify the problem', 'identify which file',
  'discover the cause', 'discover the bug', 'discover the error',
  'uncover the bug', 'reveal the error'
];

function isTechnicalContext(text) {
  const lowerText = text.toLowerCase();
  return technicalExceptions.some(exception =>
    lowerText.includes(exception)
  );
}

function checkLanguageCoherence(stance, recentActivity) {
  const issues = [];

  // Define problematic verbs for each stance
  const stanceVocabulary = {
    constructivist: {
      good: ['construct', 'interpret', 'characterize', 'build', 'develop', 'co-create'],
      avoid: ['discover', 'find', 'uncover', 'reveal', 'extract', 'identify objectively']
    },
    interpretivist: {
      good: ['interpret', 'understand', 'make sense', 'construct', 'analyze'],
      avoid: ['discover', 'prove', 'demonstrate objectively', 'find truth']
    },
    objectivist: {
      good: ['discover', 'find', 'identify', 'reveal', 'uncover'],
      avoid: ['construct', 'co-create', 'interpret subjectively']
    }
  };

  const vocabularyMode = stance.vocabulary_mode || 'constructivist';
  const avoidVerbs = stance.avoid_verbs || stanceVocabulary[vocabularyMode]?.avoid || [];

  // Simple check: look for avoided verbs in activity description
  // In real implementation, would analyze actual tool outputs
  const activityText = JSON.stringify(recentActivity).toLowerCase();

  // Skip checking if the context is clearly technical (file operations, debugging)
  // These uses don't imply ontological stance
  if (isTechnicalContext(activityText)) {
    return issues; // Return empty - technical language is fine
  }

  for (const verb of avoidVerbs) {
    if (activityText.includes(verb.toLowerCase())) {
      issues.push({
        type: 'language_inconsistency',
        verb: verb,
        stance: vocabularyMode,
        suggestion: `Use "${stanceVocabulary[vocabularyMode]?.good[0]}" instead of "${verb}"`
      });
    }
  }

  return issues;
}

function main() {
  const projectRoot = findProjectRoot(process.cwd());

  if (!projectRoot) {
    process.exit(0);
  }

  const configPath = path.join(projectRoot, '.interpretive-orchestration', 'config.json');

  if (!fs.existsSync(configPath)) {
    process.exit(0);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const stance = config.philosophical_stance || {};

  // Get recent activity from conversation log
  const logPath = path.join(projectRoot, '.interpretive-orchestration', 'conversation-log.jsonl');
  let recentActivity = {};

  if (fs.existsSync(logPath)) {
    const logs = fs.readFileSync(logPath, 'utf8')
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line));

    recentActivity = logs[logs.length - 1] || {};
  }

  // Check for language inconsistencies
  const issues = checkLanguageCoherence(stance, recentActivity);

  if (issues.length > 0) {
    // Output structured remediation for machine parsing
    outputRemediation(
      'COHERENCE_CHECK_NOTE',
      'warning',  // This is a reflection prompt, not a blocker
      'Language inconsistency detected with declared philosophical stance',
      ['/qual-examine-assumptions', '/qual-reflect'],
      ['coherence-check'],
      true,  // Always bypassable - this is a reflection prompt
      {
        issues_found: issues.length,
        stance: stance.vocabulary_mode || 'constructivist',
        issues: issues.slice(0, 3)  // First 3 issues for brevity
      }
    );

    console.log('');
    console.log('💭 REFLECTION PROMPT: Philosophical Coherence');
    console.log('   (heuristic check - simple pattern matching, not definitive judgment)');
    console.log('');
    console.log('   I noticed some potential language patterns worth reflecting on:');
    console.log('');

    issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. Language: "${issue.verb}"`);
      console.log(`      Your stance (${issue.stance}) suggests: "${issue.suggestion}"`);
      console.log('');
    });

    console.log('   💭 Why this might matter:');
    console.log('   Language embeds ontological assumptions. "Discover" implies');
    console.log('   patterns exist objectively. "Construct" acknowledges interpretive work.');
    console.log('');
    console.log('   🔍 Want to examine your assumptions?');
    console.log('   Run: /qual-examine-assumptions');
    console.log('');
    console.log('   Note: This is a heuristic prompt for reflection, not an error.');
    console.log('   Intentional hybrid stances are valid if coherent!');
    console.log('   (Technical language like "find file" or "identify error" is always fine.)');
    console.log('');

    // Log the coherence check
    const logEntry = {
      timestamp: new Date().toISOString(),
      from: 'epistemic_coherence_hook',
      to: 'human_researcher',
      message: `Philosophical coherence check identified ${issues.length} potential language inconsistencies with declared ${stance.vocabulary_mode || 'constructivist'} stance.`,
      stage: recentActivity.stage || 'unknown',
      activity_type: 'coherence_check',
      metadata: {
        issues_found: issues.length,
        issues: issues
      },
      philosophy_check: 'Checking alignment between stance and practice'
    };

    if (fs.existsSync(path.dirname(logPath))) {
      fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
    }
  } else {
    // Coherence maintained
    console.log('');
    console.log('✓ Philosophical coherence maintained');
    console.log(`  Your ${stance.vocabulary_mode || 'constructivist'} language is consistent. Good reflexive practice!`);
    console.log('');
  }

  process.exit(0);
}

try {
  main();
} catch (error) {
  // Fail gracefully
  process.exit(0);
}
