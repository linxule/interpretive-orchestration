#!/usr/bin/env node
/**
 * validate-structure.js
 * Validates a Gioia data structure JSON file against the schema
 *
 * Usage:
 *   node validate-structure.js --structure-path /path/to/data-structure.json
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

function validateStructure(structure) {
  const results = {
    valid: true,
    errors: [],
    warnings: [],
    stats: {
      dimensions: 0,
      themes: 0,
      concepts: 0,
      quotes: 0
    }
  };

  // Check for aggregate_dimensions array
  if (!structure.aggregate_dimensions || !Array.isArray(structure.aggregate_dimensions)) {
    results.errors.push('Missing or invalid aggregate_dimensions array');
    results.valid = false;
    return results;
  }

  const seenIds = new Set();

  // Validate each dimension
  for (const dimension of structure.aggregate_dimensions) {
    results.stats.dimensions++;

    // Check dimension fields
    if (!dimension.id) {
      results.errors.push(`Dimension missing id: ${JSON.stringify(dimension).slice(0, 50)}...`);
      results.valid = false;
    } else {
      if (seenIds.has(dimension.id)) {
        results.errors.push(`Duplicate id: ${dimension.id}`);
        results.valid = false;
      }
      seenIds.add(dimension.id);

      // Check ID format (should start with AD)
      if (!dimension.id.startsWith('AD')) {
        results.warnings.push(`Dimension id "${dimension.id}" should start with "AD" (e.g., AD1)`);
      }
    }

    if (!dimension.name || dimension.name.includes('{')) {
      results.errors.push(`Dimension ${dimension.id || 'unknown'}: missing or placeholder name`);
      results.valid = false;
    }

    if (!dimension.definition) {
      results.warnings.push(`Dimension ${dimension.id}: missing definition`);
    }

    // Validate themes
    if (!dimension.second_order_themes || !Array.isArray(dimension.second_order_themes)) {
      results.errors.push(`Dimension ${dimension.id}: missing second_order_themes array`);
      results.valid = false;
      continue;
    }

    if (dimension.second_order_themes.length === 0) {
      results.warnings.push(`Dimension ${dimension.id}: has no themes`);
    }

    for (const theme of dimension.second_order_themes) {
      results.stats.themes++;

      // Check theme fields
      if (!theme.id) {
        results.errors.push(`Theme missing id in dimension ${dimension.id}`);
        results.valid = false;
      } else {
        if (seenIds.has(theme.id)) {
          results.errors.push(`Duplicate id: ${theme.id}`);
          results.valid = false;
        }
        seenIds.add(theme.id);

        // Check ID format (should include parent dimension)
        if (!theme.id.includes('_T')) {
          results.warnings.push(`Theme id "${theme.id}" should follow format "AD1_T1"`);
        }
      }

      if (!theme.name || theme.name.includes('{')) {
        results.errors.push(`Theme ${theme.id || 'unknown'}: missing or placeholder name`);
        results.valid = false;
      }

      if (!theme.researcher_interpretation) {
        results.warnings.push(`Theme ${theme.id}: missing researcher_interpretation (important for audit trail)`);
      }

      // Validate concepts
      if (!theme.first_order_concepts || !Array.isArray(theme.first_order_concepts)) {
        results.errors.push(`Theme ${theme.id}: missing first_order_concepts array`);
        results.valid = false;
        continue;
      }

      if (theme.first_order_concepts.length === 0) {
        results.warnings.push(`Theme ${theme.id}: has no concepts`);
      }

      for (const concept of theme.first_order_concepts) {
        results.stats.concepts++;

        // Check concept fields
        if (!concept.id) {
          results.errors.push(`Concept missing id in theme ${theme.id}`);
          results.valid = false;
        } else {
          if (seenIds.has(concept.id)) {
            results.errors.push(`Duplicate id: ${concept.id}`);
            results.valid = false;
          }
          seenIds.add(concept.id);

          // Check ID format
          if (!concept.id.includes('_C')) {
            results.warnings.push(`Concept id "${concept.id}" should follow format "AD1_T1_C1"`);
          }
        }

        if (!concept.name || concept.name.includes('{')) {
          results.errors.push(`Concept ${concept.id || 'unknown'}: missing or placeholder name`);
          results.valid = false;
        }

        if (!concept.informant_terms || concept.informant_terms.length === 0) {
          results.warnings.push(`Concept ${concept.id}: missing informant_terms (important for 1st-order grounding)`);
        }

        // Count quotes
        if (concept.example_quotes && Array.isArray(concept.example_quotes)) {
          for (const quote of concept.example_quotes) {
            results.stats.quotes++;

            if (!quote.document_id) {
              results.warnings.push(`Quote in ${concept.id}: missing document_id`);
            }
            if (!quote.lines) {
              results.warnings.push(`Quote in ${concept.id}: missing line numbers`);
            }
            if (!quote.quote) {
              results.errors.push(`Quote in ${concept.id}: missing quote text`);
              results.valid = false;
            }
          }
        } else {
          results.warnings.push(`Concept ${concept.id}: no example_quotes (should have at least 2-3)`);
        }
      }
    }
  }

  return results;
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

const results = validateStructure(structure);
console.log(JSON.stringify({
  success: results.valid,
  ...results
}, null, 2));

process.exit(results.valid ? 0 : 1);
