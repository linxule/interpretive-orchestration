#!/usr/bin/env node

/**
 * Schema Tests
 *
 * Tests for JSON schema validation and template file integrity.
 * Ensures all JSON files parse correctly and schemas are valid.
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`   ✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`   ✗ ${name}`);
    console.log(`     Error: ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Test: All JSON files parse correctly
function testJsonFilesParse() {
  const jsonFiles = [
    '.mcp.json',
    '.claude-plugin/plugin.json',
    '.claude-plugin/plugin-extended.json',
    'hooks/hooks.json',
    'skills/project-setup/templates/config.schema.json',
    'skills/project-setup/templates/example-config.json',
    'examples/tutorial-quickstart/sample-config.json'
  ];

  // Marketplace-level files (at root, not plugin level)
  const marketplaceFiles = [
    '../package.json',
    '../.claude-plugin/marketplace.json'
  ];

  for (const file of jsonFiles) {
    test(`JSON parses: ${file}`, () => {
      const filePath = path.join(PROJECT_ROOT, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        JSON.parse(content); // Will throw if invalid
      } else {
        throw new Error(`File not found: ${file}`);
      }
    });
  }

  // Test marketplace-level files
  for (const file of marketplaceFiles) {
    test(`JSON parses: ${file}`, () => {
      const filePath = path.join(PROJECT_ROOT, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        JSON.parse(content); // Will throw if invalid
      } else {
        throw new Error(`File not found: ${file}`);
      }
    });
  }
}

// Test: config.schema.json has required fields
function testConfigSchemaStructure() {
  test('config.schema.json: Has required properties', () => {
    const schemaPath = path.join(PROJECT_ROOT, 'skills', 'project-setup', 'templates', 'config.schema.json');
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

    assert(schema.required, 'Schema should have required array');
    assert(schema.required.includes('project_info'), 'Should require project_info');
    assert(schema.required.includes('philosophical_stance'), 'Should require philosophical_stance');
    assert(schema.required.includes('sandwich_status'), 'Should require sandwich_status');
  });

  test('config.schema.json: Has philosophical_stance properties', () => {
    const schemaPath = path.join(PROJECT_ROOT, 'skills', 'project-setup', 'templates', 'config.schema.json');
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

    const stance = schema.properties.philosophical_stance;
    assert(stance, 'Should have philosophical_stance');
    assert(stance.properties.ontology, 'Should have ontology');
    assert(stance.properties.epistemology, 'Should have epistemology');
    assert(stance.properties.tradition, 'Should have tradition');
  });

  test('config.schema.json: Has coding_progress', () => {
    const schemaPath = path.join(PROJECT_ROOT, 'skills', 'project-setup', 'templates', 'config.schema.json');
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

    assert(schema.properties.coding_progress, 'Should have coding_progress');
    assert(schema.properties.coding_progress.properties.documents_coded, 'Should have documents_coded');
  });

  test('config.schema.json: Has interpretive_authority = human', () => {
    const schemaPath = path.join(PROJECT_ROOT, 'skills', 'project-setup', 'templates', 'config.schema.json');
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

    const authority = schema.properties.philosophical_stance.properties.interpretive_authority;
    assert(authority, 'Should have interpretive_authority');
    assert(authority.const === 'human', 'interpretive_authority should be const "human"');
  });
}

// Test: plugin.json has required fields
function testPluginJsonStructure() {
  test('plugin.json: Has required metadata', () => {
    const pluginPath = path.join(PROJECT_ROOT, '.claude-plugin', 'plugin.json');
    const plugin = JSON.parse(fs.readFileSync(pluginPath, 'utf8'));

    assert(plugin.name, 'Should have name');
    assert(plugin.version, 'Should have version');
    assert(plugin.description, 'Should have description');
    assert(plugin.author, 'Should have author');
  });

  // Extended metadata tests use plugin-extended.json (preserves custom fields)
  test('plugin-extended.json: Has philosophy section', () => {
    const pluginPath = path.join(PROJECT_ROOT, '.claude-plugin', 'plugin-extended.json');
    const plugin = JSON.parse(fs.readFileSync(pluginPath, 'utf8'));

    assert(plugin.philosophy, 'Should have philosophy');
    assert(plugin.philosophy.stance, 'Should have philosophical stance');
    assert(plugin.philosophy.core_principles, 'Should have core_principles');
  });

  test('plugin-extended.json: Has components', () => {
    const pluginPath = path.join(PROJECT_ROOT, '.claude-plugin', 'plugin-extended.json');
    const plugin = JSON.parse(fs.readFileSync(pluginPath, 'utf8'));

    assert(plugin.components, 'Should have components');
    assert(plugin.components.commands, 'Should have commands');
    assert(plugin.components.agents, 'Should have agents');
    assert(plugin.components.hooks, 'Should have hooks');
  });
}

// Test: example-config matches schema structure
function testExampleConfigMatchesSchema() {
  test('example-config.json: Has all required fields', () => {
    const configPath = path.join(PROJECT_ROOT, 'skills', 'project-setup', 'templates', 'example-config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    assert(config.project_info, 'Should have project_info');
    assert(config.philosophical_stance, 'Should have philosophical_stance');
    assert(config.sandwich_status, 'Should have sandwich_status');
  });

  test('example-config.json: philosophical_stance complete', () => {
    const configPath = path.join(PROJECT_ROOT, 'skills', 'project-setup', 'templates', 'example-config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    const stance = config.philosophical_stance;
    assert(stance.ontology, 'Should have ontology');
    assert(stance.epistemology, 'Should have epistemology');
    assert(stance.tradition, 'Should have tradition');
    assert(stance.ai_relationship, 'Should have ai_relationship');
  });
}

// Test: .mcp.json has bundled MCPs
function testMcpJsonStructure() {
  test('.mcp.json: Has required bundled MCPs', () => {
    const mcpPath = path.join(PROJECT_ROOT, '.mcp.json');
    const mcp = JSON.parse(fs.readFileSync(mcpPath, 'utf8'));

    assert(mcp.mcpServers, 'Should have mcpServers');
    assert(mcp.mcpServers['mcp-sequentialthinking-tools'], 'Should have sequential thinking');
    assert(mcp.mcpServers['lotus-wisdom'], 'Should have lotus wisdom');
    assert(mcp.mcpServers['markdownify'], 'Should have markdownify');
  });
}

// Test: Version consistency
function testVersionConsistency() {
  test('Version matches across files', () => {
    // package.json is at marketplace root level
    const packageJson = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, '..', 'package.json'), 'utf8'));
    const pluginJson = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, '.claude-plugin', 'plugin.json'), 'utf8'));

    assert(packageJson.version === pluginJson.version,
      `Version mismatch: package.json=${packageJson.version}, plugin.json=${pluginJson.version}`);
  });
}

// Test: Agents listed in plugin-extended.json exist as files
function testAgentsExist() {
  test('plugin-extended.json: All listed agents exist as files', () => {
    const pluginPath = path.join(PROJECT_ROOT, '.claude-plugin', 'plugin-extended.json');
    const plugin = JSON.parse(fs.readFileSync(pluginPath, 'utf8'));
    const agentsDir = path.join(PROJECT_ROOT, 'agents');

    for (const agent of plugin.components.agents) {
      const agentFile = path.join(agentsDir, `${agent}.md`);
      assert(fs.existsSync(agentFile), `Agent file not found: ${agent}.md`);
    }
  });

  test('plugin-extended.json: Agent count matches directory', () => {
    const pluginPath = path.join(PROJECT_ROOT, '.claude-plugin', 'plugin-extended.json');
    const plugin = JSON.parse(fs.readFileSync(pluginPath, 'utf8'));
    const agentsDir = path.join(PROJECT_ROOT, 'agents');

    const agentFiles = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));
    const listedAgents = plugin.components.agents.length;

    assert(agentFiles.length === listedAgents,
      `Agent count mismatch: ${agentFiles.length} files vs ${listedAgents} listed`);
  });
}

// Run all tests
async function run() {
  testJsonFilesParse();
  testConfigSchemaStructure();
  testPluginJsonStructure();
  testExampleConfigMatchesSchema();
  testMcpJsonStructure();
  testVersionConsistency();
  testAgentsExist();

  return { passed, failed };
}

module.exports = { run };

// Allow direct execution
if (require.main === module) {
  run().then(results => {
    console.log(`\nResults: ${results.passed} passed, ${results.failed} failed`);
    process.exit(results.failed > 0 ? 1 : 0);
  });
}
