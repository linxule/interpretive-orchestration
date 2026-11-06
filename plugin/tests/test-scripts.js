#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const skills = path.join(__dirname, '..', 'skills');
let passed = 0;
let failed = 0;
let scratch;

function test(name, fn) {
  if (process.env.TEST_FINDING && !name.startsWith(process.env.TEST_FINDING + ':')) return;
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
  if (!condition) throw new Error(message || 'Assertion failed');
}
function runFile(file, project, args = [], env = {}) {
  return spawnSync(process.execPath, [path.join(skills, file), '--project-path', project, ...args], {
    encoding: 'utf8', env: { ...process.env, ...env }
  });
}
function json(result) {
  try { return JSON.parse(result.stdout); } catch (e) { throw new Error(`Invalid output (exit ${result.status}): ${result.stderr} ${result.stdout}`); }
}
function project(name = 'project') {
  const dir = fs.mkdtempSync(path.join(scratch, name));
  const result = runFile('project-setup/scripts/generate-config.js', dir);
  assert(result.status === 0, `fixture config failed: ${result.stderr}`);
  return dir;
}
function configPath(dir) { return path.join(dir, '.interpretive-orchestration', 'config.json'); }
function getConfig(dir) { return JSON.parse(fs.readFileSync(configPath(dir), 'utf8')); }
function setConfig(dir, config) { fs.writeFileSync(configPath(dir), JSON.stringify(config, null, 2)); }
function write(dir, relative, content = '') {
  const file = path.join(dir, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  return file;
}

async function run() {
  scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'interpretive-scripts-'));
  try {
    test('1: integer and finite number validation and fresh initialization', () => {
      const { validateAgainstSchema } = require('../skills/_shared/scripts/validate-config.js');
      assert(validateAgainstSchema(3, { type: 'integer' }).length === 0);
      assert(validateAgainstSchema(3.5, { type: 'integer' }).length === 1);
      assert(validateAgainstSchema(3.5, { type: 'number' }).length === 0);
      assert(validateAgainstSchema(Infinity, { type: 'number' }).length === 1);
      assert(validateAgainstSchema(NaN, { type: 'number' }).length === 1);
      project();
    });
    test('2: rule updates handle shell metacharacters as path data', () => {
      const p = project('with "$(printf injected)" ');
      const result = runFile('methodological-rules/scripts/update-rules.js', p);
      assert(result.status === 0 && json(result).success, result.stderr);
      const c = getConfig(p);
      c.sandwich_status.current_stage = 'stage2_collaboration';
      c.sandwich_status.stage2_progress.phase2_synthesis = 'in_progress';
      setConfig(p, c);
      write(p, '.claude/rules/stream-separation.md', '**Rule Status:** ACTIVE');
      const regen = runFile('methodological-rules/scripts/update-rules.js', p);
      assert(regen.status === 0 && json(regen).rules_updated.includes('stream-separation'), regen.stderr);
    });
    test('3: rerun preserves unspecified fields while applying explicit changes', () => {
      const p = project(); const c = getConfig(p);
      c.project_info = { ...c.project_info, name: 'Existing', research_question: 'Question', domain: 'Domain', researcher_name: 'Researcher', created_date: '2000-01-01', extra: 'keep' };
      c.philosophical_stance = { ...c.philosophical_stance, ontology: 'relativist', reflexivity_level: 'moderate', extra: 'keep' };
      c.interaction_preferences.philosophical_depth = 'expert';
      c.saturation_tracking = { marker: 1 }; c.workspace_branches = { marker: 2 }; c.researcher_team = { marker: 3 }; c.batch_tracking = { marker: 4 };
      setConfig(p, c);
      const r = runFile('project-setup/scripts/generate-config.js', p, ['--name', 'Changed', '--tradition', 'gioia_corley']);
      assert(r.status === 0, r.stderr); const n = getConfig(p);
      assert(n.project_info.name === 'Changed' && n.project_info.research_question === 'Question' && n.project_info.domain === 'Domain' && n.project_info.researcher_name === 'Researcher' && n.project_info.created_date === '2000-01-01' && n.project_info.extra === 'keep');
      assert(n.philosophical_stance.ontology === 'relativist' && n.philosophical_stance.reflexivity_level === 'moderate' && n.philosophical_stance.extra === 'keep');
      assert(n.interaction_preferences.philosophical_depth === 'expert');
      assert(n.saturation_tracking.marker === 1 && n.workspace_branches.marker === 2 && n.researcher_team.marker === 3 && n.batch_tracking.marker === 4);
    });
    test('4: malformed literature inventory is reported and preserved', () => {
      const p = project(); const file = write(p, 'stage2-collaboration/stream-a-theoretical/literature-inventory.json', '{ broken');
      const r = runFile('literature-sweep/scripts/search-and-fetch.js', p);
      assert(r.status !== 0 && JSON.parse(r.stderr).error.includes('parse'), r.stderr);
      assert(fs.readFileSync(file, 'utf8') === '{ broken');
    });
    test('7: stage 2 readiness uses recorded counts, not files', () => {
      const p = project();
      for (let i = 0; i < 10; i++) write(p, `stage1-foundation/manual-codes/doc${i}.md`, 'transcript');
      write(p, 'stage1-foundation/manual-codes/source.pdf');
      write(p, 'stage1-foundation/memos/memo.md');
      write(p, 'stage1-foundation/memos/memo.txt');
      const result = json(runFile('project-dashboard/scripts/check-readiness.js', p, ['--target-stage', 'stage2']));
      assert(!result.ready && result.current_status.documents_coded === 0 && result.current_status.memos_written === 0);
      assert(result.recommendations.some(x => x.includes('11 file') && x.includes('--documents-coded')));
      assert(result.recommendations.some(x => x.includes('2 file') && x.includes('--memos-written')));
    });
    test('9: phase 2 counts nested theoretical markdown', () => {
      const p = project(); write(p, 'stage2-collaboration/stream-a-theoretical/root.md');
      write(p, 'stage2-collaboration/stream-a-theoretical/papers/a.md');
      write(p, 'stage2-collaboration/stream-a-theoretical/papers/nested/b.md');
      const result = json(runFile('project-dashboard/scripts/check-readiness.js', p, ['--target-stage', 'phase2']));
      assert(result.current_status.theoretical_documents === 3, JSON.stringify(result));
    });
    const writers = [
      ['saturation-tracker', ['--record-document', '--doc-id', 'D1']],
      ['strain-check', ['--record-override', '--rule-id', 'example']],
      ['workspace-branch', ['--fork', '--name', 'Alternative']],
      ['researcher-team', ['--set-primary', '--name', 'Alice']],
      ['apply-preset', ['--preset', 'gioia_corley']]
    ];
    for (const [script, args] of writers) test(`10: ${script} preserves config if atomic rename fails`, () => {
      const p = project(); const original = fs.readFileSync(configPath(p), 'utf8');
      const inject = write(p, 'inject.js', "const fs = require('fs'); const rename = fs.renameSync; fs.renameSync = function(a, b) { if (String(b).endsWith('/config.json')) throw new Error('injected rename failure'); return rename.apply(this, arguments); };\n");
      const result = runFile(`methodological-rules/scripts/${script}.js`, p, args, { NODE_OPTIONS: `--require=${inject}` });
      assert(result.status !== 0, 'expected rename failure');
      assert(fs.readFileSync(configPath(p), 'utf8') === original, 'config was changed');
      assert(!fs.readdirSync(path.dirname(configPath(p))).some(x => x.startsWith('config.json.tmp.')), 'temporary file left behind');
    });
    test('11: disabling generated rules removes them but preserves user rules', () => {
      const p = project(); const c = getConfig(p);
      c.research_design.cases = [{ id: 'a', name: 'A', folder_path: 'a' }];
      c.research_design.waves = [{ id: 'w', name: 'W', folder_path: 'w' }];
      for (const name of ['case_isolation', 'wave_isolation', 'stream_separation']) c.research_design.isolation_config[name].enabled = true;
      setConfig(p, c);
      assert(runFile('methodological-rules/scripts/generate-rules.js', p).status === 0);
      const rule = path.join(p, '.claude/rules');
      assert(fs.existsSync(path.join(rule, 'case-isolation.md')) && fs.existsSync(path.join(rule, 'stream-separation.md')));
      // Simulate pre-marker generator output for compatibility with existing projects.
      const caseFile = path.join(rule, 'case-isolation.md');
      fs.writeFileSync(caseFile, fs.readFileSync(caseFile, 'utf8').replace('<!-- Generated by Interpretive Orchestration -->\n', ''));
      write(p, '.claude/rules/wave-isolation.md', '# My own rule\n');
      for (const name of ['case_isolation', 'wave_isolation', 'stream_separation']) c.research_design.isolation_config[name].enabled = false;
      setConfig(p, c);
      const r = runFile('methodological-rules/scripts/generate-rules.js', p);
      assert(r.status === 0, r.stderr);
      assert(!fs.existsSync(caseFile) && !fs.existsSync(path.join(rule, 'stream-separation.md')));
      assert(fs.readFileSync(path.join(rule, 'wave-isolation.md'), 'utf8') === '# My own rule\n');
    });
    test('3: changing the ontology recomputes the coding vocabulary', () => {
      const p = project();
      assert(runFile('project-setup/scripts/generate-config.js', p, ['--ontology', 'relativist']).status === 0);
      const stance = getConfig(p).philosophical_stance;
      assert(stance.ontology === 'relativist' && stance.vocabulary_mode === 'constructivist', JSON.stringify(stance));
    });
    test('12: saturation assessment without documents is low and insufficient', () => {
      const p = project(); const r = json(runFile('methodological-rules/scripts/saturation-tracker.js', p, ['--assess']));
      assert(r.saturation_level === 'low' && r.saturation_score === 0 && /not enough data/i.test(r.recommendation), JSON.stringify(r));
    });
    test('13: each suggested ID is reserved across formats', () => {
      const p = project(); const input = path.join(p, 'input'); fs.mkdirSync(input);
      for (const file of ['a.pdf', 'b.pdf', 'c.docx', 'd.mp3', 'e.wav']) fs.writeFileSync(path.join(input, file), 'x');
      const r = json(runFile('interview-ingest/scripts/process-audio.js', p, ['--input-dir', input]));
      const files = r.workflow.steps.flatMap(s => s.files || []); const ids = files.map(f => f.suggested_id);
      assert(ids.length === 5 && new Set(ids).size === 5, JSON.stringify(ids));
      assert(files.every(f => f.output_name.startsWith(f.suggested_id + '-')));
    });
    test('14: audit labels coding progress without claiming AI assistance', () => {
      const p = project(); const c = getConfig(p); c.coding_progress.documents_coded = 7; setConfig(p, c);
      let r = runFile('coding-workflow/scripts/generate-audit.js', p);
      const md = fs.readFileSync(json(r).output_path, 'utf8');
      assert(md.includes('| Documents Coded (Progress Counter) | 7 |') && !md.includes('Documents AI-Assisted'));
      r = runFile('coding-workflow/scripts/generate-audit.js', p, ['--format', 'json']);
      const data = JSON.parse(fs.readFileSync(json(r).output_path, 'utf8'));
      assert(data.state.documents_coded_progress === 7 && !('documents_ai_coded' in data.state));
    });
    test('15: audit recognizes both log author fields', () => {
      const p = project();
      const log = [{ agent: 'human_researcher', action: 'decision', content: 'agent-field' }, { from: 'human_researcher', action: 'decision', content: 'from-field' }];
      write(p, '.interpretive-orchestration/conversation-log.jsonl', log.map(JSON.stringify).join('\n'));
      let r = runFile('coding-workflow/scripts/generate-audit.js', p);
      const md = fs.readFileSync(json(r).output_path, 'utf8');
      assert(md.includes('Human Decisions (2 entries)') && md.includes('agent-field') && md.includes('from-field'));
      r = runFile('coding-workflow/scripts/generate-audit.js', p, ['--format', 'json']);
      assert(JSON.parse(fs.readFileSync(json(r).output_path, 'utf8')).statistics.human_decisions === 2);
    });
    test('16: document listing propagates failed config validation', () => {
      const p = project(); const c = getConfig(p); c.project_info.name = 42; setConfig(p, c);
      write(p, 'stage1-foundation/manual-codes/transcript.md');
      const r = runFile('coding-workflow/scripts/track-documents.js', p, ['--list']);
      assert(r.status !== 0 && json(r).success === false, r.stdout + r.stderr);
    });
    test('17: both progress scripts support Stage 3 booleans and strings', () => {
      const p = project(); const c = getConfig(p);
      c.sandwich_status.stage2_complete = true;
      c.sandwich_status.stage3_progress = { evidence_organized: true, theory_developed: 'in_progress', manuscript_drafted: 'complete' };
      setConfig(p, c);
      const calc = json(runFile('project-dashboard/scripts/calculate-progress.js', p));
      const dash = json(runFile('project-dashboard/scripts/generate-dashboard.js', p, ['--format', 'json']));
      assert(calc.stage3_progress === 84 && dash.progress.stage3.progress === 84, JSON.stringify({ calc, dash }));
    });
    test('18: structure creation reports file-write errors', () => {
      const p = project(); fs.mkdirSync(path.join(p, '.interpretive-orchestration', 'reflexivity-journal.md'));
      const r = runFile('project-setup/scripts/create-structure.js', p, ['--force']);
      const data = json(r); assert(r.status !== 0 && data.success === false && data.errors.length > 0, r.stdout);
    });
    test('19: absolute output directory inside project is used as resolved', () => {
      const p = project(); const input = path.join(p, 'input'); fs.mkdirSync(input); fs.writeFileSync(path.join(input, 'a.pdf'), 'x');
      const output = path.join(p, 'chosen', 'output');
      const r = json(runFile('interview-ingest/scripts/process-audio.js', p, ['--input-dir', input, '--output-dir', output]));
      assert(r.workflow.output_directory === output && fs.existsSync(output), JSON.stringify(r));
    });
    test('20: markdown audit includes all coding entries', () => {
      const p = project();
      const logs = Array.from({ length: 23 }, (_, i) => JSON.stringify({ action: 'coding', timestamp: '2026-01-01', content: `entry-${i}` })).join('\n');
      write(p, '.interpretive-orchestration/conversation-log.jsonl', logs);
      const r = json(runFile('coding-workflow/scripts/generate-audit.js', p));
      const md = fs.readFileSync(r.output_path, 'utf8');
      assert(md.includes('entry-22') && !md.includes('more coding activities'));
    });
    test('K1: an unreadable existing config is reported, never overwritten', () => {
      const p = project(); fs.writeFileSync(configPath(p), '{"project_info": {"name": "Kept"');
      const r = runFile('project-setup/scripts/generate-config.js', p, ['--name', 'New']);
      assert(r.status !== 0, 'expected failure');
      assert(fs.readFileSync(configPath(p), 'utf8') === '{"project_info": {"name": "Kept"', 'config was changed');
    });
    test('K2: --study-type changes the study type and keeps the cases', () => {
      const p = project(); const c = getConfig(p);
      c.research_design.cases = [{ id: 'a', name: 'A', folder_path: 'data/a' }];
      c.research_design.streams.theoretical.folder_path = 'lit';
      setConfig(p, c);
      assert(runFile('project-setup/scripts/generate-config.js', p, ['--study-type', 'comparative']).status === 0);
      const d = getConfig(p).research_design;
      assert(d.study_type === 'comparative' && d.cases.length === 1 && d.streams.theoretical.folder_path === 'lit', JSON.stringify(d));
      assert(d.isolation_config.case_isolation.enabled === true && d.isolation_config.case_isolation.relaxes_at, JSON.stringify(d.isolation_config));
    });
    test('K2: invalid --research-design JSON stops and keeps the config', () => {
      const p = project(); const before = fs.readFileSync(configPath(p), 'utf8');
      const r = runFile('project-setup/scripts/generate-config.js', p, ['--research-design', '{"cases": [']);
      assert(r.status !== 0 && fs.readFileSync(configPath(p), 'utf8') === before);
    });
    test('K3: the phase-transition hook treats the project path as data', () => {
      const p = project('hook "$(printf injected > hook-injected)" ');
      write(p, '.claude/rules/stream-separation.md', '# A rule, so the hook reaches update-rules\n');
      const r = spawnSync(process.execPath, [path.join(__dirname, '..', 'hooks', 'post-phase-transition.js')], { cwd: p, encoding: 'utf8' });
      assert(r.status === 0, r.stderr);
      assert(!fs.existsSync(path.join(scratch, 'hook-injected')) && !fs.existsSync(path.join(p, 'hook-injected')), 'shell command ran');
    });
    test('K4: status and progress use recorded Stage 1 counts, not raw files', () => {
      const p = project();
      for (let i = 0; i < 10; i++) write(p, `stage1-foundation/manual-codes/raw-${i}.md`, 'Raw transcript, not coded');
      for (let i = 0; i < 3; i++) write(p, `stage1-foundation/memos/memo-${i}.md`, 'memo');
      const q = json(runFile('_shared/scripts/query-status.js', p));
      assert(q.sandwich.stage1.ready_for_stage2 === false, JSON.stringify(q.sandwich.stage1));
      assert(JSON.stringify(q.recommendations).includes('update-progress.js'), 'expected a record-your-counts hint');
      assert(json(runFile('project-dashboard/scripts/calculate-progress.js', p)).stage1_progress === 0);
    });
    test('D1: the dashboard says how to record Stage 1 counts until they are recorded', () => {
      const p = project();
      for (let i = 0; i < 4; i++) write(p, `stage1-foundation/manual-codes/raw-${i}.md`, 'Raw transcript');
      write(p, 'stage1-foundation/memos/memo.md', 'memo');
      const dashboard = format => runFile('project-dashboard/scripts/generate-dashboard.js', p, ['--format', format]).stdout;
      for (const format of ['ascii', 'markdown']) assert(dashboard(format).includes('update-progress.js'), `no hint in ${format}`);
      assert(json({ stdout: dashboard('json') }).progress.stage1.record_counts_hint, 'no hint in json');
      assert(runFile('_shared/scripts/update-progress.js', p, ['--documents-coded', '2', '--memos-written', '1']).status === 0);
      assert(!dashboard('ascii').includes('update-progress.js'), 'hint should go once counts are recorded');
      assert(!JSON.stringify(json(runFile('_shared/scripts/query-status.js', p)).recommendations).includes('update-progress.js'),
        '/qual-status hint should go once counts are recorded');
    });
    test('K6: a malformed data inventory is reported, never replaced', () => {
      const p = project(); const inv = write(p, 'stage1-foundation/data-inventory.json', '{"documents": [');
      const input = path.join(p, 'input'); fs.mkdirSync(input); fs.writeFileSync(path.join(input, 'a.mp3'), 'x');
      const r = runFile('interview-ingest/scripts/process-audio.js', p, ['--input-dir', input]);
      assert(r.status !== 0 && fs.readFileSync(inv, 'utf8') === '{"documents": [');
    });
    test('K7: Stage 3 status strings count only when complete', () => {
      const p = project(); const c = getConfig(p);
      c.sandwich_status.stage3_progress = { evidence_organized: 'not_started', theory_developed: 'in_progress', manuscript_drafted: 'complete' };
      fs.writeFileSync(configPath(p), JSON.stringify(c));
      assert(json(runFile('_shared/scripts/query-status.js', p)).sandwich.stage3.progress_percent === 34);
    });
    test('K8: atomic writes keep the file permissions', () => {
      const { atomicWrite } = require('../skills/_shared/scripts/atomic-write.js');
      const file = write(scratch, 'private.json', '{}'); fs.chmodSync(file, 0o600);
      atomicWrite(file, '{"a":1}');
      assert((fs.statSync(file).mode & 0o777) === 0o600, (fs.statSync(file).mode & 0o777).toString(8));
    });
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true });
  }
  return { passed, failed };
}
module.exports = { run };
if (require.main === module) run().then(results => { console.log(`\nResults: ${results.passed} passed, ${results.failed} failed`); process.exit(results.failed ? 1 : 0); });
