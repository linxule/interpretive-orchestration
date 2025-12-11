#!/usr/bin/env node
/**
 * search-and-fetch.js
 * Orchestrates literature gathering with graceful degradation
 *
 * Usage:
 *   node search-and-fetch.js \
 *     --project-path /path/to/project \
 *     --query "sensemaking organizational change" \
 *     --max-results 15
 *
 * Or for Tier 2/3 (manual URL input):
 *   node search-and-fetch.js \
 *     --project-path /path/to/project \
 *     --urls "https://example.com/paper1.pdf,https://example.com/paper2.pdf"
 *
 * This script:
 * 1. Detects available tier based on API keys
 * 2. Creates output directory structure
 * 3. Returns workflow instructions for Claude to execute
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

function detectTier() {
  const hasExa = !!process.env.EXA_API_KEY;
  const hasJina = !!process.env.JINA_API_KEY;

  if (hasExa && hasJina) {
    return { tier: 1, name: 'Full', exa: true, jina: true };
  } else if (hasJina) {
    return { tier: 2, name: 'Manual Search + Jina Fetch', exa: false, jina: true };
  } else {
    return { tier: 3, name: 'Basic (WebFetch/Markdownify)', exa: false, jina: false };
  }
}

function ensureDirectoryStructure(projectPath) {
  const dirs = [
    path.join(projectPath, 'stage2-collaboration', 'stream-a-theoretical', 'papers'),
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  return dirs;
}

function loadOrCreateInventory(projectPath) {
  const inventoryPath = path.join(
    projectPath,
    'stage2-collaboration',
    'stream-a-theoretical',
    'literature-inventory.json'
  );

  if (fs.existsSync(inventoryPath)) {
    try {
      return JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
    } catch (error) {
      // Corrupted file, create new
    }
  }

  return {
    sources: [],
    search_queries: [],
    last_updated: new Date().toISOString()
  };
}

function saveInventory(projectPath, inventory) {
  const inventoryPath = path.join(
    projectPath,
    'stage2-collaboration',
    'stream-a-theoretical',
    'literature-inventory.json'
  );

  inventory.last_updated = new Date().toISOString();
  fs.writeFileSync(inventoryPath, JSON.stringify(inventory, null, 2));

  return inventoryPath;
}

function generateTier1Workflow(query, maxResults, projectPath) {
  return {
    tier: 1,
    tier_name: 'Full Literature Sweep',
    steps: [
      {
        step: 1,
        action: 'search',
        description: 'Search for academic papers using Exa',
        mcp_tool: 'exa',
        parameters: {
          query: query,
          type: 'research_paper',
          numResults: maxResults
        },
        instruction: `Use Exa MCP to search: "${query}" (limit: ${maxResults} results)`
      },
      {
        step: 2,
        action: 'select',
        description: 'Review search results and select relevant papers',
        instruction: 'Present top results to user. Let them select which papers to fetch.'
      },
      {
        step: 3,
        action: 'fetch',
        description: 'Fetch full content using Jina',
        mcp_tool: 'jina',
        instruction: 'For each selected URL, use Jina to fetch the full content as markdown.'
      },
      {
        step: 4,
        action: 'save',
        description: 'Save papers to project directory',
        output_dir: path.join(projectPath, 'stage2-collaboration', 'stream-a-theoretical', 'papers'),
        instruction: 'Save each paper as markdown in the papers/ directory with format: author-year-keyword.md'
      },
      {
        step: 5,
        action: 'inventory',
        description: 'Update literature inventory',
        instruction: 'Add entries to literature-inventory.json for each fetched paper.'
      }
    ],
    output_structure: {
      papers_dir: path.join(projectPath, 'stage2-collaboration', 'stream-a-theoretical', 'papers'),
      inventory_file: path.join(projectPath, 'stage2-collaboration', 'stream-a-theoretical', 'literature-inventory.json')
    }
  };
}

function generateTier2Workflow(urls, projectPath) {
  const urlList = urls ? urls.split(',').map(u => u.trim()) : [];

  return {
    tier: 2,
    tier_name: 'Manual Search + Jina Fetch',
    note: 'Exa API key not available. User must provide URLs manually.',
    steps: [
      {
        step: 1,
        action: 'manual_search',
        description: 'Search for papers manually',
        instruction: `Search these sources for relevant papers:
          - Google Scholar: scholar.google.com
          - Semantic Scholar: semanticscholar.org
          - JSTOR: jstor.org
          - Your institutional library

          Collect URLs for papers you want to analyze.`
      },
      {
        step: 2,
        action: 'provide_urls',
        description: 'Provide paper URLs',
        urls_provided: urlList,
        instruction: urlList.length > 0
          ? `URLs to process: ${urlList.join(', ')}`
          : 'Ask user to provide URLs for papers they found.'
      },
      {
        step: 3,
        action: 'fetch',
        description: 'Fetch content using Jina',
        mcp_tool: 'jina',
        instruction: 'For each URL, use Jina to fetch the full content as markdown.'
      },
      {
        step: 4,
        action: 'save',
        description: 'Save papers to project directory',
        output_dir: path.join(projectPath, 'stage2-collaboration', 'stream-a-theoretical', 'papers'),
        instruction: 'Save each paper as markdown in the papers/ directory.'
      },
      {
        step: 5,
        action: 'inventory',
        description: 'Update literature inventory',
        instruction: 'Add entries to literature-inventory.json for each fetched paper.'
      }
    ],
    output_structure: {
      papers_dir: path.join(projectPath, 'stage2-collaboration', 'stream-a-theoretical', 'papers'),
      inventory_file: path.join(projectPath, 'stage2-collaboration', 'stream-a-theoretical', 'literature-inventory.json')
    }
  };
}

function generateTier3Workflow(urls, projectPath) {
  const urlList = urls ? urls.split(',').map(u => u.trim()) : [];

  return {
    tier: 3,
    tier_name: 'Basic (No API Keys)',
    note: 'Neither Exa nor Jina API keys available. Using built-in tools only.',
    steps: [
      {
        step: 1,
        action: 'manual_search',
        description: 'Search for papers manually',
        instruction: `Search these sources for relevant papers:
          - Google Scholar: scholar.google.com
          - Semantic Scholar: semanticscholar.org
          - Unpaywall browser extension for free versions
          - Check author websites for preprints

          Download PDFs when possible.`
      },
      {
        step: 2,
        action: 'provide_content',
        description: 'Provide paper content',
        urls_provided: urlList,
        instruction: `Options for getting paper content:
          1. If URL accessible: Use WebFetch tool
          2. If PDF downloaded: Use Markdownify (pdf-to-markdown)
          3. If paywalled: Check for open access version or preprint`
      },
      {
        step: 3,
        action: 'convert',
        description: 'Convert PDFs to markdown',
        mcp_tool: 'markdownify',
        instruction: 'For PDF files, use Markdownify pdf-to-markdown to convert to analyzable text.'
      },
      {
        step: 4,
        action: 'save',
        description: 'Save papers to project directory',
        output_dir: path.join(projectPath, 'stage2-collaboration', 'stream-a-theoretical', 'papers'),
        instruction: 'Save each paper as markdown in the papers/ directory.'
      },
      {
        step: 5,
        action: 'inventory',
        description: 'Update literature inventory',
        instruction: 'Add entries to literature-inventory.json for each paper.'
      }
    ],
    api_upgrade_suggestion: {
      for_better_experience: [
        'Set EXA_API_KEY for automatic academic search',
        'Set JINA_API_KEY for reliable content extraction'
      ]
    },
    output_structure: {
      papers_dir: path.join(projectPath, 'stage2-collaboration', 'stream-a-theoretical', 'papers'),
      inventory_file: path.join(projectPath, 'stage2-collaboration', 'stream-a-theoretical', 'literature-inventory.json')
    }
  };
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

  // Ensure directory structure exists
  ensureDirectoryStructure(resolvedPath);

  // Load existing inventory
  const inventory = loadOrCreateInventory(resolvedPath);

  // Detect available tier
  const tier = detectTier();

  // Generate appropriate workflow
  let workflow;
  const query = args.query;
  const urls = args.urls;
  const maxResults = parseInt(args['max-results'], 10) || 15;

  if (tier.tier === 1 && query) {
    workflow = generateTier1Workflow(query, maxResults, resolvedPath);
    inventory.search_queries.push(query);
  } else if (tier.tier === 2 || (tier.tier === 1 && !query)) {
    workflow = generateTier2Workflow(urls, resolvedPath);
  } else {
    workflow = generateTier3Workflow(urls, resolvedPath);
  }

  // Save updated inventory (with new search query if applicable)
  const inventoryPath = saveInventory(resolvedPath, inventory);

  console.log(JSON.stringify({
    success: true,
    detected_tier: tier,
    workflow: workflow,
    inventory_path: inventoryPath,
    existing_sources: inventory.sources.length,
    next_action: workflow.steps[0].instruction
  }, null, 2));
}

main();
