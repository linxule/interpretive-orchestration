#!/usr/bin/env node
/**
 * estimate-costs.js
 * Estimates API costs based on document characteristics
 *
 * Usage:
 *   node estimate-costs.js --documents 25 --avg-pages 5 --model sonnet --passes 2
 */

const fs = require('fs');

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

// Pricing per 1M tokens (approximate, 2025)
const PRICING = {
  opus: { input: 15.00, output: 75.00 },
  sonnet: { input: 3.00, output: 15.00 },
  haiku: { input: 0.25, output: 1.25 }
};

// Tokens per page (rough estimate)
const TOKENS_PER_PAGE = 500;

// Output tokens per document (dialogical coding generates substantial output)
const OUTPUT_RATIO = {
  brief: 0.3,      // Brief codes only
  standard: 0.5,   // Codes with rationale
  detailed: 1.0    // Full 4-stage dialogical process
};

function estimateCosts(args) {
  const documents = parseInt(args.documents) || 10;
  const avgPages = parseFloat(args['avg-pages']) || 5;
  const model = (args.model || 'sonnet').toLowerCase();
  const passes = parseInt(args.passes) || 1;
  const verbosity = args.verbosity || 'standard';

  if (!PRICING[model]) {
    return {
      success: false,
      error: `Unknown model: ${model}. Valid options: opus, sonnet, haiku`
    };
  }

  const pricing = PRICING[model];
  const outputRatio = OUTPUT_RATIO[verbosity] || OUTPUT_RATIO.standard;

  // Calculate tokens
  const tokensPerDoc = avgPages * TOKENS_PER_PAGE;
  const totalInputTokens = documents * tokensPerDoc * passes;
  const totalOutputTokens = totalInputTokens * outputRatio;

  // Calculate costs
  const inputCost = (totalInputTokens / 1_000_000) * pricing.input;
  const outputCost = (totalOutputTokens / 1_000_000) * pricing.output;
  const totalCost = inputCost + outputCost;

  // Add variance for estimates (±30%)
  const lowEstimate = totalCost * 0.7;
  const highEstimate = totalCost * 1.3;

  return {
    success: true,
    parameters: {
      documents,
      avg_pages: avgPages,
      model,
      passes,
      verbosity
    },
    tokens: {
      per_document: tokensPerDoc,
      total_input: Math.round(totalInputTokens),
      total_output: Math.round(totalOutputTokens),
      total: Math.round(totalInputTokens + totalOutputTokens)
    },
    costs: {
      input: `$${inputCost.toFixed(2)}`,
      output: `$${outputCost.toFixed(2)}`,
      total: `$${totalCost.toFixed(2)}`,
      range: `$${lowEstimate.toFixed(2)} - $${highEstimate.toFixed(2)}`
    },
    recommendations: generateRecommendations(documents, model, totalCost)
  };
}

function generateRecommendations(documents, model, cost) {
  const recs = [];

  if (documents > 50 && model === 'opus') {
    recs.push({
      type: 'cost_optimization',
      suggestion: 'Consider using Sonnet for initial pass, then Opus for complex cases',
      potential_savings: '40-60%'
    });
  }

  if (documents > 100) {
    recs.push({
      type: 'batch_strategy',
      suggestion: 'Process in batches of 20-30 with review breaks',
      reason: 'Allows quality checking and framework refinement'
    });
  }

  if (model === 'haiku' && documents < 20) {
    recs.push({
      type: 'quality',
      suggestion: 'Consider Sonnet for better interpretive quality on small corpus',
      tradeoff: 'Higher cost but richer coding'
    });
  }

  if (cost > 100) {
    recs.push({
      type: 'budget',
      suggestion: 'Run pilot on 5-10 documents first to validate approach',
      reason: 'Avoid costly iterations on full corpus'
    });
  }

  return recs;
}

// Main execution
const args = parseArgs();

const result = estimateCosts(args);
console.log(JSON.stringify(result, null, 2));

process.exit(result.success ? 0 : 1);
