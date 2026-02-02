# Future Parity Guide: Maintaining Kimi CLI ↔ Claude Code Alignment

**Purpose:** Systematic approach for updating Kimi CLI when Claude Code plugin changes.

**Version:** 1.0 | **Date:** 2026-02-02

---

## Quick Start: Parity Update Checklist

### Phase 1: Discovery
- [ ] Check Claude plugin for changes
- [ ] Identify modified/added/deleted files
- [ ] Categorize by type (skill, agent, hook, script)

### Phase 2: Analysis
- [ ] Map Claude changes to Kimi equivalents
- [ ] Note platform-specific considerations
- [ ] Identify intentional divergences

### Phase 3: Implementation
- [ ] Port skills to Kimi
- [ ] Update agents if needed
- [ ] Add/modify shared scripts
- [ ] Add tests

### Phase 4: Validation
- [ ] Run full test suite
- [ ] Verify example project works
- [ ] Update documentation

---

## Architecture Mapping

| Claude | Kimi | Notes |
|--------|------|-------|
| `commands/X.md` | `.agents/skills/qual-X/SKILL.md` | Convert to skill |
| `.agents/skills/X/SKILL.md` | `.agents/skills/X/SKILL.md` | Direct compatibility |
| `agents/X.md` | `.agents/agents/X.yaml` | Convert format |
| `hooks/X.js` | `.agents/skills/qual-shared/scripts/*.py` | Integrate into systems |
| `templates/` | `.agents/skills/X/templates/` | Same structure |
| `@agent-name` | `@agent-name` | Same invocation (via router agent) |
| `/command` | `/flow:X` or `/skill:X` | Add prefix |

**Kimi agent format note:**
- Agent YAMLs use `version: 1` with a nested `agent:` block.
- `system_prompt_path` points to `.agents/agents/prompts/*.md`.
- Kimi entrypoint uses `interpretive-orchestrator.yaml` to route `@agent` mentions.

**Prompt parity rule:**
- Agent prompt files in `.agents/agents/prompts/` are copied **verbatim** from Claude agent docs in `plugin/agents/*.md` (body only, excluding frontmatter).
- When Claude agent text changes, re-copy the body to keep strict word-for-word parity.

**One-command sync (recommended):**
```bash
python3 plugin-kimi/scripts/sync_prompts_from_claude.py
```

---

## Component Port Matrix

### Skills

| Claude Skill | Kimi Skill | Status |
|--------------|------------|--------|
| project-setup | qual-init | Direct |
| project-dashboard | qual-status | Direct |
| coding-workflow | qual-coding | Direct |
| gioia-methodology | qual-gioia | Complete |
| literature-sweep | qual-literature | Direct |
| interview-ingest | qual-ingest | Direct |
| deep-reasoning | qual-reflection | Merged |
| paradox-navigation | qual-reflection | Merged |

### Scripts (JS → Python)

| Pattern | Claude | Kimi |
|---------|--------|------|
| File ops | `fs` module | `pathlib.Path` |
| JSON | `JSON.parse` | `json.load` |
| Args | `process.argv` | `argparse` |
| Logging | `console.log` | `logging` |
| Async | callbacks | `async/await` |

---

## Update Procedures

### Updating a Skill

1. Compare SKILL.md files
2. Identify changes to triggers, examples, scripts
3. Update Kimi SKILL.md
4. Port any script changes
5. Add tests
6. Update docs

### Updating an Agent

1. Read updated agent markdown
2. Extract: system prompt, forbidden behaviors, examples
3. Update YAML file
4. Maintain identical personality

### Updating a Hook

1. Read JavaScript hook
2. Map to Kimi system:
   - Enforcement → `defensive_router.py`
   - Friction → `friction_system.py`
   - Reflection → `reflexivity_system.py`
3. Add trigger enum
4. Implement logic

---

## Testing for Parity

```python
# Key parity tests

def test_stage1_enforcement():
    """Both block Stage 2 without Stage 1."""
    assert claude.can_access_stage2() == kimi.can_access_stage2()

def test_4stage_structure():
    """Both produce 4-stage reasoning."""
    assert has_4_stages(claude_output)
    assert has_4_stages(kimi_output)

def test_philosophy_preserved():
    """AI never decides final interpretation."""
    for agent in all_agents:
        assert "never decide final" in agent.system_prompt
```

---

## Common Scenarios

### Scenario 1: New Skill Added

**Action:**
1. Create `.agents/skills/qual-newskill/SKILL.md`
2. Port any scripts
3. Update related skills
4. Add tests

### Scenario 2: Agent Modified

**Action:**
1. Update `.agents/agents/agent-name.yaml`
2. Modify system prompt
3. Test with sample input

### Scenario 3: New Hook

**Action:**
1. Determine type (enforcement/friction/reflection)
2. Add to appropriate system file
3. Add trigger to enum

### Scenario 4: Template Updated

**Action:**
1. Copy to skill's `templates/` directory
2. Update validation if needed
3. Add tests

---

## Current Divergences

| Feature | Claude | Kimi | Rationale |
|---------|--------|------|-----------|
| Deep/Paradox | Separate | Combined | Simpler UX |
| Hooks | JS files | Integrated | Platform constraint |
| Parallel streams | N/A | Conceptual | Future enhancement |
| Chinese | N/A | English | Scope |

**Acceptable:** Platform constraints, UX improvements
**Not acceptable:** Philosophical changes, weaker enforcement

---

## File Mapping Reference

```
CLAUDE                          KIMI
----                            ----
plugin/commands/                plugin-kimi/.agents/skills/
plugin/.agents/skills/                  plugin-kimi/.agents/skills/
plugin/.agents/agents/*.md              plugin-kimi/.agents/agents/*.yaml
plugin/hooks/*.js               plugin-kimi/.agents/skills/qual-shared/scripts/*.py
plugin/templates/               plugin-kimi/.agents/skills/*/templates/
```

---

## Key Principles

1. **Preserve philosophy, adapt implementation**
2. **Test for behavioral parity, not code identity**
3. **Document all intentional divergences**
4. **Maintain Stage 1 enforcement rigorously**
5. **Keep 4-stage reasoning visible**

---

## Remember

- **Functional parity > Implementation identity**
- **Philosophical alignment is non-negotiable**
- **Adapt to Kimi's platform, preserve methodology**

*Last updated: 2026-02-02*
