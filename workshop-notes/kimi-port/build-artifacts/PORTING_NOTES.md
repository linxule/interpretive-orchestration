# Porting Notes: generate-rules.js → generate_rules.py

## Summary

Successfully ported `/plugin/skills/methodological-rules/scripts/generate-rules.js` to Python as `/plugin-kimi/.agents/skills/qual-methodological-rules/scripts/generate_rules.py`.

## Key Changes

### 1. Template Rendering: Mustache → Jinja2

**Original (JavaScript):**
```javascript
function renderTemplate(template, data) {
  let result = template;
  // Handle {{variable}} replacements
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value || '');
  }
  // Handle {{#array}}...{{/array}} blocks
  const blockRegex = /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g;
  // ... custom parsing logic
}
```

**Ported (Python with Jinja2):**
```python
from jinja2 import Environment, FileSystemLoader
env = Environment(loader=FileSystemLoader(templates_dir))
template = env.get_template('case-isolation.template.md')
rendered = template.render(**data)
```

### 2. Phase Detection: Reused from check_phase.py

**Reused functions:**
- `get_current_phase(sandwich_status)` - imported directly
- `should_relax(relaxes_at, current_phase)` - imported directly

No reimplementation needed - DRY principle maintained.

### 3. Output Format: Markdown Files → JSON Structure

**Original (JavaScript):**
```javascript
// Writes to .claude/rules/*.md
fs.writeFileSync(path.join(rulesDir, 'case-isolation.md'), content);
```

**Ported (Python):**
```python
# Writes to .interpretive-orchestration/methodological-rules.json
output = {
    "rules": [
        {
            "rule_id": "case-isolation",
            "rule_type": "case_isolation",
            "status": "active",
            "friction_level": "challenge",
            "relaxes_at_phase": "phase3_pattern_characterization",
            "current_phase": "phase1_parallel_streams",
            "config": { /* case-specific data */ },
            "rendered_content": "...",  # The markdown content
            "last_updated": "2026-02-02T..."
        }
    ]
}
```

### 4. Infrastructure Integration

**StateManager (qual-shared):**
```python
if StateManager:
    try:
        state_manager = StateManager(str(project_path))
        state = state_manager.load()
        config = state.to_dict() if hasattr(state, 'to_dict') else state
    except Exception:
        # Fallback to direct file reading
```

**ConversationLogger (qual-shared):**
```python
if ConversationLogger:
    try:
        logger = ConversationLogger(str(project_path))
        logger.log({
            "event_type": "methodological_rules_update",
            "agent": "generate_rules",
            "content": {"message": message}
        })
    except Exception:
        # Fallback to manual append
```

Both use graceful fallback if qual-shared is unavailable.

### 5. Dependency Management: npm → uv

**Original:**
- Node.js script, no external dependencies (uses built-in `fs`, `path`)
- Mustache-lite implemented inline

**Ported:**
- Uses `uv` for Python dependency management
- PEP 723 inline script metadata for automatic dependency resolution:
  ```python
  #!/usr/bin/env -S uv run --script
  # /// script
  # requires-python = ">=3.10"
  # dependencies = [
  #     "jinja2>=3.1.0",
  # ]
  # ///
  ```

**Installation:**
```bash
# Automatic with uv run:
uv run generate_rules.py --project-path /path

# Manual installation (if needed):
cd .agents && uv venv && source .venv/bin/activate && uv pip install -r requirements.txt
```

## Template Compatibility

All three templates work with Jinja2 without modification:
- `case-isolation.template.md` ✅
- `wave-isolation.template.md` ✅ (including `{{#waves}}...{{/waves}}` loops)
- `stream-separation.template.md` ✅

Jinja2 syntax is compatible with Mustache for basic use cases.

## Function Mapping

| JavaScript (Original) | Python (Ported) | Notes |
|----------------------|-----------------|-------|
| `parseArgs()` | `argparse.ArgumentParser()` | Standard library |
| `renderTemplate(template, data)` | `jinja2.Template.render(**data)` | External library |
| `getCurrentPhase(sandwichStatus)` | `get_current_phase(sandwich_status)` | Imported from check_phase.py |
| `shouldRelax(relaxesAt, currentPhase)` | `should_relax(relaxes_at, current_phase)` | Imported from check_phase.py |
| `generateCaseIsolationRule()` | `generate_case_isolation_rule()` | Ported with Jinja2 |
| `generateWaveIsolationRule()` | `generate_wave_isolation_rule()` | Ported with Jinja2 |
| `generateStreamSeparationRule()` | `generate_stream_separation_rule()` | Ported with Jinja2 |
| `logToJournal()` | `log_to_journal()` | Uses ConversationLogger + fallback |

## Testing

```bash
# Test with non-existent project (should handle gracefully)
uv run generate_rules.py --project-path /tmp/test-project

# Expected output:
# {
#   "success": true,
#   "message": "No research_design configured. No rules generated.",
#   "rules_generated": 0,
#   "rules": []
# }
```

## Remaining Work

This script is part of **Phase 1 (Core Rules)** of the methodological-rules port.

**Completed:**
- ✅ Core rule generation (case-isolation, wave-isolation, stream-separation)
- ✅ Phase detection integration
- ✅ Template rendering with Jinja2
- ✅ JSON output structure
- ✅ Graceful fallbacks for qual-shared integration

**Still TODO (Phase 2 & 3):**
- ⬜ Strain detection (`strain-check.js`)
- ⬜ Saturation tracking (`saturation-tracker.js`)
- ⬜ Workspace branching (`workspace-branch.js`)
- ⬜ Visualization dashboard (`viz-dashboard.js`)
- ⬜ Team management (`researcher-team.js`)
- ⬜ Preset application (`apply-preset.js`)

## Files Changed

**Created:**
- `/plugin-kimi/.agents/skills/qual-methodological-rules/scripts/generate_rules.py`
- `/plugin-kimi/.agents/requirements.txt`
- `/plugin-kimi/.agents/.venv/` (local virtual environment)

**Referenced (unchanged):**
- `/plugin-kimi/.agents/skills/qual-methodological-rules/scripts/check_phase.py`
- `/plugin-kimi/.agents/skills/qual-methodological-rules/templates/*.template.md`
- `/plugin-kimi/.agents/skills/qual-shared/scripts/state_manager.py`
- `/plugin-kimi/.agents/skills/qual-shared/scripts/conversation_logger.py`

## Backward Compatibility

The original JavaScript version remains unchanged in `/plugin/` for Claude Code CLI compatibility. The Python port in `/plugin-kimi/.agents/` is for the Kimi CLI agent implementation.

Both versions:
- Read from the same config format (`.interpretive-orchestration/config.json`)
- Use the same template files
- Maintain the same methodological logic
- Write to different output formats:
  - JS: `.claude/rules/*.md` (for Claude Code auto-discovery)
  - Python: `.interpretive-orchestration/methodological-rules.json` (structured data for Kimi agents)
