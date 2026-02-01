#!/usr/bin/env node
/**
 * check-coherence.js
 * Deep examination of philosophical coherence between declared stance and practice
 *
 * Usage:
 *   node check-coherence.js --project-path /path/to/project
 *   node check-coherence.js --project-path /path/to/project --text "analysis revealed that..."
 *   node check-coherence.js --project-path /path/to/project --recent-activity
 *
 * Options:
 *   --project-path      Path to the qualitative project root
 *   --text              Text to analyze for language coherence
 *   --recent-activity   Analyze recent conversation log entries
 *   --full-report       Generate comprehensive coherence report
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

function readRecentActivity(projectPath, count = 20) {
  const logPath = path.join(projectPath, '.interpretive-orchestration', 'conversation-log.jsonl');

  if (!fs.existsSync(logPath)) {
    return [];
  }

  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n').filter(line => line.trim());

  // Get last N entries
  const recentLines = lines.slice(-count);
  const logs = [];

  for (const line of recentLines) {
    try {
      logs.push(JSON.parse(line));
    } catch (error) {
      // Skip malformed lines
    }
  }

  return logs;
}

// Language patterns for different stances
const LANGUAGE_PATTERNS = {
  constructivist: {
    preferred: [
      'construct', 'interpret', 'characterize', 'build', 'develop',
      'co-create', 'meaning-making', 'understanding', 'sense-making',
      'perspective', 'view', 'conceptualize', 'frame'
    ],
    avoid: [
      'discover', 'find', 'uncover', 'reveal', 'extract',
      'identify objectively', 'determine', 'prove', 'demonstrate objectively',
      'the truth', 'the reality', 'actually means'
    ]
  },
  interpretivist: {
    preferred: [
      'interpret', 'understand', 'make sense', 'meaning',
      'perspective', 'experience', 'perception', 'context'
    ],
    avoid: [
      'discover', 'prove', 'objective truth', 'demonstrate causally',
      'verify', 'the facts'
    ]
  },
  objectivist: {
    preferred: [
      'discover', 'find', 'identify', 'reveal', 'uncover',
      'determine', 'verify', 'demonstrate', 'prove'
    ],
    avoid: [
      'construct', 'co-create', 'subjective', 'multiple truths'
    ]
  },
  critical_realist: {
    preferred: [
      'uncover', 'reveal', 'understand mechanisms', 'underlying',
      'real structures', 'causal powers', 'tendencies'
    ],
    avoid: [
      'purely construct', 'no reality', 'all relative'
    ]
  }
};

// AI relationship patterns
const AI_RELATIONSHIP_PATTERNS = {
  epistemic_partner: {
    coherent: [
      'question', 'dialogue', 'challenge', 'explore together',
      'what do you think', 'help me think through', 'discuss'
    ],
    tension: [
      'just do', 'give me the answer', 'code this for me',
      'accept all', 'don\'t question'
    ]
  },
  interpretive_aid: {
    coherent: [
      'organize', 'structure', 'help me see', 'identify patterns',
      'my interpretation', 'what I think'
    ],
    tension: [
      'what does this mean', 'interpret for me', 'you decide'
    ]
  },
  coding_tool: {
    coherent: [
      'apply my codes', 'use my framework', 'follow my structure',
      'according to my categories'
    ],
    tension: [
      'create codes', 'suggest categories', 'develop themes'
    ]
  }
};

// Technical exceptions - these don't indicate stance
const TECHNICAL_EXCEPTIONS = [
  'find file', 'find the file', 'find document',
  'identify error', 'identify bug', 'identify issue',
  'discover cause', 'discover bug', 'reveal error',
  'extract file', 'extract from archive'
];

function isTechnicalContext(text) {
  const lowerText = text.toLowerCase();
  return TECHNICAL_EXCEPTIONS.some(exc => lowerText.includes(exc));
}

function analyzeLanguageCoherence(text, stance) {
  const results = {
    coherent: [],
    tensions: [],
    suggestions: []
  };

  if (!text || !stance) return results;

  // Skip technical contexts
  if (isTechnicalContext(text)) {
    results.note = 'Technical context detected - language check skipped';
    return results;
  }

  const lowerText = text.toLowerCase();
  const ontology = stance.ontology || 'interpretivist';
  const vocabularyMode = stance.vocabulary_mode || 'constructivist';

  // Determine which pattern set to use
  let patterns = LANGUAGE_PATTERNS[vocabularyMode] || LANGUAGE_PATTERNS[ontology];
  if (!patterns) {
    patterns = LANGUAGE_PATTERNS.constructivist; // Default
  }

  // Check for preferred language
  for (const word of patterns.preferred) {
    if (lowerText.includes(word.toLowerCase())) {
      results.coherent.push({
        word: word,
        context: 'Aligns with ' + vocabularyMode + ' stance'
      });
    }
  }

  // Check for language to avoid
  for (const word of patterns.avoid) {
    if (lowerText.includes(word.toLowerCase())) {
      // Find alternative
      const alternative = patterns.preferred[0] || 'consider rephrasing';
      results.tensions.push({
        word: word,
        stance: vocabularyMode,
        suggestion: `Consider using "${alternative}" instead of "${word}"`
      });
    }
  }

  // Generate overall suggestions
  if (results.tensions.length > 0) {
    results.suggestions.push(
      `Your ${vocabularyMode} stance suggests avoiding objectivist language`,
      'This may be intentional (hybrid stance) or a slip to examine'
    );
  }

  return results;
}

function analyzeAIRelationship(activity, declaredRelationship) {
  const results = {
    coherent: [],
    tensions: [],
    suggestions: []
  };

  if (!activity || !declaredRelationship) return results;

  const patterns = AI_RELATIONSHIP_PATTERNS[declaredRelationship];
  if (!patterns) return results;

  const activityText = JSON.stringify(activity).toLowerCase();

  // Check for coherent patterns
  for (const pattern of patterns.coherent) {
    if (activityText.includes(pattern.toLowerCase())) {
      results.coherent.push({
        pattern: pattern,
        context: `Aligns with "${declaredRelationship}" relationship`
      });
    }
  }

  // Check for tension patterns
  for (const pattern of patterns.tension) {
    if (activityText.includes(pattern.toLowerCase())) {
      results.tensions.push({
        pattern: pattern,
        relationship: declaredRelationship,
        suggestion: `This may not align with your "${declaredRelationship}" stance`
      });
    }
  }

  return results;
}

function generateFullReport(config, recentActivity, textToAnalyze) {
  const report = {
    stance_declared: {
      ontology: config.philosophical_stance?.ontology || 'not specified',
      epistemology: config.philosophical_stance?.epistemology || 'not specified',
      tradition: config.philosophical_stance?.tradition || 'not specified',
      ai_relationship: config.philosophical_stance?.ai_relationship || 'not specified',
      vocabulary_mode: config.philosophical_stance?.vocabulary_mode || 'constructivist'
    },
    coherent_aspects: [],
    tensions_detected: [],
    recommendations: [],
    reflexive_prompts: []
  };

  // Analyze provided text
  if (textToAnalyze) {
    const languageResults = analyzeLanguageCoherence(textToAnalyze, config.philosophical_stance);

    report.coherent_aspects.push(...languageResults.coherent.map(c => ({
      type: 'language',
      detail: `Used "${c.word}" - ${c.context}`
    })));

    report.tensions_detected.push(...languageResults.tensions.map(t => ({
      type: 'language',
      detail: `Used "${t.word}" which conflicts with ${t.stance} stance`,
      suggestion: t.suggestion
    })));

    if (languageResults.note) {
      report.notes = [languageResults.note];
    }
  }

  // Analyze recent activity
  if (recentActivity && recentActivity.length > 0) {
    const combinedText = recentActivity.map(a => a.message || a.content || '').join(' ');
    const activityLanguage = analyzeLanguageCoherence(combinedText, config.philosophical_stance);

    if (activityLanguage.tensions.length > 0) {
      report.tensions_detected.push({
        type: 'recent_activity_language',
        detail: `${activityLanguage.tensions.length} language inconsistencies in recent activity`,
        examples: activityLanguage.tensions.slice(0, 3)
      });
    }

    // Analyze AI relationship
    const aiResults = analyzeAIRelationship(
      recentActivity,
      config.philosophical_stance?.ai_relationship
    );

    report.coherent_aspects.push(...aiResults.coherent.map(c => ({
      type: 'ai_relationship',
      detail: c.context
    })));

    report.tensions_detected.push(...aiResults.tensions.map(t => ({
      type: 'ai_relationship',
      detail: t.suggestion
    })));
  }

  // Check method-stance alignment
  const tradition = config.philosophical_stance?.tradition;
  const stage1Complete = config.sandwich_status?.stage1_complete;

  if (tradition === 'gioia_corley' || tradition === 'gioia_hybrid') {
    if (stage1Complete) {
      report.coherent_aspects.push({
        type: 'method',
        detail: 'Stage 1 foundation complete - aligns with Gioia emphasis on human groundwork'
      });
    }
  }

  // Generate recommendations
  if (report.tensions_detected.length > 0) {
    report.recommendations.push(
      'Review your philosophical stance declaration in config.json',
      'Consider whether language shifts reflect evolving understanding',
      'Document any intentional stance changes in your reflexivity journal'
    );
  } else {
    report.recommendations.push(
      'Continue maintaining philosophical coherence',
      'Periodically revisit this check as analysis deepens'
    );
  }

  // Add reflexive prompts
  report.reflexive_prompts = [
    'How has your understanding of your stance evolved since starting?',
    'Are there aspects of your approach that feel inconsistent?',
    'What would you lose if you shifted to a different stance?',
    'How is your position as researcher shaping your interpretations?'
  ];

  // Summary
  report.summary = {
    coherent_count: report.coherent_aspects.length,
    tension_count: report.tensions_detected.length,
    overall: report.tensions_detected.length === 0
      ? 'Philosophical coherence maintained'
      : report.tensions_detected.length <= 2
        ? 'Minor tensions detected - worth examining'
        : 'Multiple tensions detected - consider reflection'
  };

  return report;
}

function main() {
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

  const config = readConfig(resolvedPath);

  if (!config) {
    console.error(JSON.stringify({
      success: false,
      error: 'Project not initialized',
      suggestion: 'Run /qual-init to initialize your project'
    }));
    process.exit(1);
  }

  // Get text to analyze
  const textToAnalyze = args.text || null;

  // Get recent activity if requested
  let recentActivity = null;
  if (args['recent-activity'] || args['full-report']) {
    recentActivity = readRecentActivity(resolvedPath);
  }

  // Generate report
  const report = generateFullReport(config, recentActivity, textToAnalyze);

  console.log(JSON.stringify({
    success: true,
    ...report
  }, null, 2));

  // Exit with non-zero if significant tensions
  process.exit(report.tensions_detected.length > 3 ? 1 : 0);
}

main();
