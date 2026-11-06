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
    assert(mcp.mcpServers['lotus-wisdom'], 'Should have lotus wisdom');
    // Removed: markdownify (MCP SDK incompatibility, 0.2.1), sequential thinking (0.3.0, now a prompt)
    const kimi = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, '..', 'kimi.plugin.json'), 'utf8'));
    assert(JSON.stringify(Object.keys(kimi.mcpServers || {})) === JSON.stringify(Object.keys(mcp.mcpServers)),
      'kimi.plugin.json should bundle the same MCP servers as .mcp.json');
  });
}

// Test: Version consistency
function testVersionConsistency() {
  test('Version matches across every platform manifest', () => {
    const repoRoot = path.join(PROJECT_ROOT, '..');
    const readJson = rel => JSON.parse(fs.readFileSync(path.join(repoRoot, rel), 'utf8'));
    const marketplace = readJson('.claude-plugin/marketplace.json');
    const citation = fs.readFileSync(path.join(repoRoot, 'CITATION.cff'), 'utf8').match(/^version:\s*(\S+)/m);
    const versions = {
      'package.json': readJson('package.json').version,
      'plugin/.claude-plugin/plugin.json': readJson('plugin/.claude-plugin/plugin.json').version,
      'plugin/.claude-plugin/plugin-extended.json': readJson('plugin/.claude-plugin/plugin-extended.json').version,
      'plugin/.codex-plugin/plugin.json': readJson('plugin/.codex-plugin/plugin.json').version,
      'kimi.plugin.json': readJson('kimi.plugin.json').version,
      '.claude-plugin/marketplace.json': marketplace.plugins.find(p => p.name === 'interpretive-orchestration').version,
      'CITATION.cff': citation && citation[1]
    };
    const distinct = new Set(Object.values(versions));
    assert(distinct.size === 1, `Version mismatch: ${JSON.stringify(versions)}`);
  });
}

function frontmatter(file) {
  const content = fs.readFileSync(file, 'utf8');
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  return match ? match[1] : null;
}

// Test: every skill follows the Agent Skills format that Claude Code, Codex,
// Copilot CLI and Kimi Code all read
function testSkillsFormat() {
  const skillsDir = path.join(PROJECT_ROOT, 'skills');
  const skillDirs = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name !== '_shared')
    .map(d => d.name);

  test('skills: every skill folder has a SKILL.md', () => {
    const missing = skillDirs.filter(d => !fs.existsSync(path.join(skillsDir, d, 'SKILL.md')));
    assert(missing.length === 0, `Missing SKILL.md: ${missing.join(', ')}`);
  });

  test('skills: frontmatter name matches folder and description is present', () => {
    const problems = [];
    for (const dir of skillDirs) {
      const fm = frontmatter(path.join(skillsDir, dir, 'SKILL.md'));
      const name = fm && fm.match(/^name:\s*(.+)$/m);
      const description = fm && fm.match(/^description:\s*(.+)$/m);
      if (!name || name[1].trim() !== dir) problems.push(`${dir}: name`);
      if (!description || description[1].trim().length > 1024) problems.push(`${dir}: description`);
    }
    assert(problems.length === 0, problems.join('; '));
  });

  test('skills: every command listed in plugin-extended.json exists as a skill', () => {
    const plugin = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, '.claude-plugin', 'plugin-extended.json'), 'utf8'));
    const commands = Object.entries(plugin.components.commands)
      .filter(([group]) => !group.startsWith('_'))
      .flatMap(([, names]) => names);
    const missing = commands.filter(c => !skillDirs.includes(c));
    assert(missing.length === 0, `Listed commands without a skill: ${missing.join(', ')}`);
  });

  test('skills: script paths are anchored to the plugin root', () => {
    // A bare "node skills/..." only works when the plugin folder is the working directory.
    const offenders = [];
    for (const dir of [...skillDirs, '_shared']) {
      const files = fs.readdirSync(path.join(skillsDir, dir)).filter(f => f.endsWith('.md'));
      for (const f of files) {
        const content = fs.readFileSync(path.join(skillsDir, dir, f), 'utf8');
        if (/\b(node|python3?) +skills\//.test(content)) offenders.push(`${dir}/${f}`);
      }
    }
    assert(offenders.length === 0, `Relative script paths in: ${offenders.join(', ')}`);
  });
}

// Test: agents can start. Claude Code refuses to start an agent whose tools
// allowlist resolves to nothing, and plugin MCP tools are named
// mcp__plugin_<plugin>_<server>__<tool>.
function testAgentToolLists() {
  const agentsDir = path.join(PROJECT_ROOT, 'agents');
  for (const file of fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'))) {
    test(`agents: ${file} does not restrict itself to MCP-only tools`, () => {
      const fm = frontmatter(path.join(agentsDir, file)) || '';
      const tools = fm.match(/^tools:\s*(.+)$/m);
      if (!tools) return;
      const names = tools[1].split(',').map(t => t.trim()).filter(Boolean);
      assert(names.some(t => !t.startsWith('mcp__')),
        `tools: lists only MCP tools (${names.join(', ')}), which removes Read and Grep`);
    });
  }
}

// Test: hooks.json only points at hook scripts the adapter knows
function testHooksConfig() {
  const hooksDir = path.join(PROJECT_ROOT, 'hooks');
  const adapter = fs.readFileSync(path.join(hooksDir, 'run-hook.js'), 'utf8');
  for (const file of ['hooks.json', 'codex-hooks.json']) {
    test(`${file}: every command runs a known script through run-hook.js`, () => {
      const config = JSON.parse(fs.readFileSync(path.join(hooksDir, file), 'utf8'));
      const commands = Object.values(config.hooks).flat().flatMap(group => group.hooks.map(h => h.command));
      for (const command of commands) {
        const match = command.match(/run-hook\.js"? ([\w-]+\.js)$/);
        assert(match, `Hook does not use run-hook.js: ${command}`);
        assert(fs.existsSync(path.join(hooksDir, match[1])), `Missing hook script: ${match[1]}`);
        assert(adapter.includes(`'${match[1]}'`), `run-hook.js has no triggers for ${match[1]}`);
      }
    });
  }

  test('Codex manifest points at the Codex hooks file', () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, '.codex-plugin', 'plugin.json'), 'utf8'));
    assert(manifest.hooks === './hooks/codex-hooks.json', 'Codex should load codex-hooks.json, not hooks.json');
  });

  test('session-stance.js finds the principles in CLAUDE.md', () => {
    const guide = fs.readFileSync(path.join(PROJECT_ROOT, 'CLAUDE.md'), 'utf8');
    const match = guide.match(/## Core Philosophy[^\n]*\n([\s\S]*?)\n---/);
    assert(match && match[1].includes('NEVER skip Stage 1 enforcement'), 'Core Philosophy section moved or changed');
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
  testSkillsFormat();
  testAgentToolLists();
  testHooksConfig();

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
