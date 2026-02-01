#!/usr/bin/env node
/**
 * check-hierarchy.js
 * Analyzes hierarchy quality and methodological consistency
 *
 * Usage:
 *   node check-hierarchy.js --structure-path /path/to/data-structure.json
 */

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    parsed[key] = value;
  }

  return parsed;
}

// Words that suggest 1st-order concepts may be too abstract
const ABSTRACT_INDICATORS = [
  'mechanism', 'strategy', 'construct', 'dimension', 'paradigm',
  'framework', 'model', 'theory', 'dynamic', 'process of',
  'enabling', 'facilitating', 'undermining', 'leveraging'
];

// Words that suggest good 1st-order grounding
const GROUNDED_INDICATORS = [
  'I ', 'we ', 'they ', 'my ', 'our ', 'their ',
  'said', 'told', 'felt', 'wanted', 'tried', 'had to'
];

function analyzeHierarchy(structure) {
  const analysis = {
    overall_health: 'good',
    distribution: {
      dimensions: [],
      balance_score: 0
    },
    abstraction_concerns: [],
    quote_coverage: {
      concepts_with_quotes: 0,
      concepts_without_quotes: 0,
      total_quotes: 0
    },
    recommendations: []
  };

  if (!structure.aggregate_dimensions) {
    analysis.overall_health = 'error';
    analysis.recommendations.push('No aggregate_dimensions found in structure');
    return analysis;
  }

  let totalConcepts = 0;
  let conceptsPerTheme = [];

  for (const dimension of structure.aggregate_dimensions) {
    const dimAnalysis = {
      id: dimension.id,
      name: dimension.name,
      theme_count: 0,
      concept_count: 0
    };

    if (!dimension.second_order_themes) {
      dimAnalysis.theme_count = 0;
      analysis.distribution.dimensions.push(dimAnalysis);
      continue;
    }

    dimAnalysis.theme_count = dimension.second_order_themes.length;

    // Check theme count per dimension
    if (dimAnalysis.theme_count < 2) {
      analysis.recommendations.push(
        `Dimension "${dimension.name}" has only ${dimAnalysis.theme_count} theme(s) - consider if this is truly a dimension or should be a theme`
      );
    } else if (dimAnalysis.theme_count > 5) {
      analysis.recommendations.push(
        `Dimension "${dimension.name}" has ${dimAnalysis.theme_count} themes - consider splitting into multiple dimensions`
      );
    }

    for (const theme of dimension.second_order_themes) {
      if (!theme.first_order_concepts) continue;

      const conceptCount = theme.first_order_concepts.length;
      dimAnalysis.concept_count += conceptCount;
      totalConcepts += conceptCount;
      conceptsPerTheme.push(conceptCount);

      // Check concept count per theme
      if (conceptCount < 2) {
        analysis.recommendations.push(
          `Theme "${theme.name}" has only ${conceptCount} concept(s) - may need more empirical grounding or merge with another theme`
        );
      } else if (conceptCount > 10) {
        analysis.recommendations.push(
          `Theme "${theme.name}" has ${conceptCount} concepts - consider creating sub-themes or splitting`
        );
      }

      // Analyze each concept
      for (const concept of theme.first_order_concepts) {
        // Check quote coverage
        if (concept.example_quotes && concept.example_quotes.length > 0) {
          analysis.quote_coverage.concepts_with_quotes++;
          analysis.quote_coverage.total_quotes += concept.example_quotes.length;
        } else {
          analysis.quote_coverage.concepts_without_quotes++;
        }

        // Check abstraction level of 1st-order concepts
        const conceptName = (concept.name || '').toLowerCase();
        const conceptDef = (concept.definition || '').toLowerCase();
        const combinedText = conceptName + ' ' + conceptDef;

        let abstractionScore = 0;
        for (const indicator of ABSTRACT_INDICATORS) {
          if (combinedText.includes(indicator)) {
            abstractionScore++;
          }
        }

        let groundedScore = 0;
        if (concept.informant_terms) {
          for (const term of concept.informant_terms) {
            const termLower = term.toLowerCase();
            for (const indicator of GROUNDED_INDICATORS) {
              if (termLower.includes(indicator)) {
                groundedScore++;
              }
            }
          }
        }

        if (abstractionScore > 1 && groundedScore === 0) {
          analysis.abstraction_concerns.push({
            concept_id: concept.id,
            concept_name: concept.name,
            concern: '1st-order concept may be too abstract - should use participant language',
            suggestion: 'Consider if this should be a 2nd-order theme, or rephrase using informant terms'
          });
        }
      }
    }

    analysis.distribution.dimensions.push(dimAnalysis);
  }

  // Calculate balance score (lower is better, 0 = perfectly balanced)
  if (conceptsPerTheme.length > 0) {
    const avg = conceptsPerTheme.reduce((a, b) => a + b, 0) / conceptsPerTheme.length;
    const variance = conceptsPerTheme.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / conceptsPerTheme.length;
    analysis.distribution.balance_score = Math.sqrt(variance).toFixed(2);

    if (analysis.distribution.balance_score > 3) {
      analysis.recommendations.push(
        `Uneven distribution of concepts across themes (variance: ${analysis.distribution.balance_score}) - some themes may need consolidation or expansion`
      );
    }
  }

  // Overall health assessment
  const quoteCoverage = analysis.quote_coverage.concepts_with_quotes /
    (analysis.quote_coverage.concepts_with_quotes + analysis.quote_coverage.concepts_without_quotes || 1);

  if (analysis.abstraction_concerns.length > totalConcepts * 0.2) {
    analysis.overall_health = 'needs_attention';
    analysis.recommendations.push(
      'Many 1st-order concepts appear too abstract - review for participant grounding'
    );
  }

  if (quoteCoverage < 0.5) {
    analysis.overall_health = 'needs_attention';
    analysis.recommendations.push(
      `Only ${(quoteCoverage * 100).toFixed(0)}% of concepts have example quotes - add more empirical grounding`
    );
  }

  if (analysis.recommendations.length === 0) {
    analysis.recommendations.push('Structure looks methodologically sound!');
  }

  return analysis;
}

// Main execution
const args = parseArgs();

if (!args['structure-path']) {
  console.error(JSON.stringify({
    success: false,
    error: 'Missing required argument: --structure-path'
  }));
  process.exit(1);
}

const structurePath = args['structure-path'];

// Path traversal protection - resolve to absolute path
const resolvedPath = path.resolve(structurePath);
if (resolvedPath.includes('\0')) {  // Null byte injection protection
  console.error(JSON.stringify({
    success: false,
    error: 'Invalid path - null bytes detected'
  }));
  process.exit(1);
}

if (!fs.existsSync(resolvedPath)) {
  console.error(JSON.stringify({
    success: false,
    error: `File not found: ${structurePath}`
  }));
  process.exit(1);
}

let structure;
try {
  const content = fs.readFileSync(resolvedPath, 'utf8');
  structure = JSON.parse(content);
} catch (error) {
  console.error(JSON.stringify({
    success: false,
    error: `Failed to parse JSON: ${error.message}`
  }));
  process.exit(1);
}

const analysis = analyzeHierarchy(structure);
console.log(JSON.stringify({
  success: true,
  ...analysis
}, null, 2));

process.exit(analysis.overall_health === 'error' ? 1 : 0);
