#!/usr/bin/env node
/**
 * export-structure.js
 * Exports data structure to publication-ready formats
 *
 * Usage:
 *   node export-structure.js --structure-path /path/to/data-structure.json --format markdown|table|latex
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

function exportToMarkdown(structure) {
  let output = '# Data Structure\n\n';

  if (!structure.aggregate_dimensions) {
    return '# Data Structure\n\nNo aggregate dimensions found.';
  }

  for (const dimension of structure.aggregate_dimensions) {
    output += `## ${dimension.name}\n\n`;
    if (dimension.definition) {
      output += `*${dimension.definition}*\n\n`;
    }

    if (!dimension.second_order_themes) continue;

    for (const theme of dimension.second_order_themes) {
      output += `### ${theme.name}\n\n`;
      if (theme.researcher_interpretation) {
        output += `> ${theme.researcher_interpretation}\n\n`;
      }

      if (!theme.first_order_concepts) continue;

      for (const concept of theme.first_order_concepts) {
        output += `- **${concept.name}**`;
        if (concept.informant_terms && concept.informant_terms.length > 0) {
          output += ` (${concept.informant_terms.slice(0, 2).map(t => `"${t}"`).join(', ')})`;
        }
        output += '\n';
      }
      output += '\n';
    }
  }

  return output;
}

function exportToTable(structure) {
  // Tab-separated values for Gioia display table
  let output = 'First-Order Concepts\tSecond-Order Themes\tAggregate Dimensions\n';

  if (!structure.aggregate_dimensions) {
    return output;
  }

  for (const dimension of structure.aggregate_dimensions) {
    if (!dimension.second_order_themes) continue;

    let isFirstTheme = true;

    for (const theme of dimension.second_order_themes) {
      if (!theme.first_order_concepts) continue;

      let isFirstConcept = true;

      for (const concept of theme.first_order_concepts) {
        const conceptName = concept.name || '';
        const themeName = isFirstConcept ? (theme.name || '') : '';
        const dimName = (isFirstTheme && isFirstConcept) ? (dimension.name || '') : '';

        output += `${conceptName}\t${themeName}\t${dimName}\n`;

        isFirstConcept = false;
      }

      isFirstTheme = false;
    }
  }

  return output;
}

function exportToLatex(structure) {
  let output = `\\begin{table}[htbp]
\\centering
\\caption{Data Structure}
\\label{tab:data-structure}
\\begin{tabular}{p{4cm}|p{4cm}|p{4cm}}
\\hline
\\textbf{First-Order Concepts} & \\textbf{Second-Order Themes} & \\textbf{Aggregate Dimensions} \\\\
\\hline
`;

  if (!structure.aggregate_dimensions) {
    output += '\\multicolumn{3}{c}{No data} \\\\\n';
  } else {
    for (const dimension of structure.aggregate_dimensions) {
      if (!dimension.second_order_themes) continue;

      let isFirstTheme = true;

      for (const theme of dimension.second_order_themes) {
        if (!theme.first_order_concepts) continue;

        const conceptCount = theme.first_order_concepts.length;
        let isFirstConcept = true;

        for (let i = 0; i < theme.first_order_concepts.length; i++) {
          const concept = theme.first_order_concepts[i];
          const conceptName = escapeLatex(concept.name || '');

          // Theme column: show on first concept, with multirow
          let themeCell = '';
          if (isFirstConcept && conceptCount > 1) {
            themeCell = `\\multirow{${conceptCount}}{*}{${escapeLatex(theme.name || '')}}`;
          } else if (isFirstConcept) {
            themeCell = escapeLatex(theme.name || '');
          }

          // Dimension column: show on first concept of first theme
          let dimCell = '';
          if (isFirstTheme && isFirstConcept) {
            const totalConcepts = dimension.second_order_themes.reduce(
              (sum, t) => sum + (t.first_order_concepts?.length || 0), 0
            );
            if (totalConcepts > 1) {
              dimCell = `\\multirow{${totalConcepts}}{*}{${escapeLatex(dimension.name || '')}}`;
            } else {
              dimCell = escapeLatex(dimension.name || '');
            }
          }

          output += `${conceptName} & ${themeCell} & ${dimCell} \\\\\n`;
          isFirstConcept = false;
        }

        isFirstTheme = false;
      }
      output += '\\hline\n';
    }
  }

  output += `\\end{tabular}
\\end{table}`;

  return output;
}

function escapeLatex(text) {
  return text
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
    .replace(/#/g, '\\#')
    .replace(/\$/g, '\\$')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}');
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
const format = args.format || 'markdown';

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

let output;
switch (format.toLowerCase()) {
  case 'markdown':
  case 'md':
    output = exportToMarkdown(structure);
    break;
  case 'table':
  case 'tsv':
    output = exportToTable(structure);
    break;
  case 'latex':
  case 'tex':
    output = exportToLatex(structure);
    break;
  default:
    console.error(JSON.stringify({
      success: false,
      error: `Unknown format: ${format}. Use markdown, table, or latex.`
    }));
    process.exit(1);
}

// Output the result
console.log(output);
