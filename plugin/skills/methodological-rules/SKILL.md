---
name: methodological-rules
description: "This skill should be used when users mention 'generate rules', 'isolation rules', 'methodology preset', 'apply preset', 'saturation', 'am I saturated', 'branch', 'fork', 'explore alternative', 'team', 'add researcher', 'intercoder reliability', 'dashboard', 'show status', or after /qual-design completes."
---

# Methodological Rules Skill

Comprehensive methodological support: isolation rules, strain detection, saturation tracking, workspace branching, multi-researcher collaboration, and visualization.

---

## When to Use This Skill

**Triggers:**
- "generate rules" / "create rules" / "isolation rules"
- "methodology preset" / "apply preset"
- "saturation" / "am I saturated" / "theoretical saturation"
- "branch" / "fork" / "explore alternative"
- "team" / "add researcher" / "intercoder reliability"
- "dashboard" / "show status" / "visualize"
- After `/qual-design` completes
- When research_design changes in config

**Auto-invoked:**
- By `PostPhaseTransition` hook when sandwich_status changes
- By `project-setup` skill after design configuration

---

## What This Skill Does

1. **Reads research design** from `config.json`
2. **Generates Claude Code rules** in `.claude/rules/`
3. **Adapts rules** based on current phase
4. **Logs changes** to reflexivity journal

---

## Rule Types Generated

| Rule | When Generated | Purpose |
|------|---------------|---------|
| `case-isolation.md` | study_type includes "comparative" | Prevent cross-case contamination |
| `wave-isolation.md` | study_type includes "longitudinal" | Preserve temporal integrity |
| `stream-separation.md` | streams.enabled = true | Keep theory/data separate until synthesis |

---

## Rule Lifecycle

```
research_design configured
        ↓
generate-rules.js creates .claude/rules/
        ↓
Rules active with configured friction level
        ↓
Phase transition detected (hook)
        ↓
update-rules.js checks relaxes_at conditions
        ↓
Rules regenerated with updated status
        ↓
Change logged to reflexivity journal
```

---

## Friction Levels

Rules use graduated friction, not binary allow/block:

| Level | Behavior | When to Use |
|-------|----------|-------------|
| `silent` | Log only, no interruption | Low-risk boundaries |
| `nudge` | Gentle reminder in response | Moderate guidance |
| `challenge` | Pause, request justification | Important methodological boundaries |
| `hard_stop` | Block action | Critical integrity requirements |

---

## Scripts

### generate-rules.js

```bash
node skills/methodological-rules/scripts/generate-rules.js \
  --project-path /path/to/project
```

**What it does:**
- Reads `config.json` research_design section
- Generates rule files from templates
- Places rules in `.claude/rules/` (auto-discovered by Claude Code)
- Returns JSON summary of generated rules

### check-phase.js

```bash
node skills/methodological-rules/scripts/check-phase.js \
  --project-path /path/to/project
```

**What it does:**
- Reads current sandwich_status
- Returns current phase and which rules should be relaxed

### update-rules.js

```bash
node skills/methodological-rules/scripts/update-rules.js \
  --project-path /path/to/project
```

**What it does:**
- Called by PostPhaseTransition hook
- Checks which rules need status updates
- Regenerates rules with new status
- Logs changes to reflexivity journal

### strain-check.js

```bash
# Check strain status
node skills/methodological-rules/scripts/strain-check.js \
  --project-path /path/to/project

# Record an override
node skills/methodological-rules/scripts/strain-check.js \
  --project-path /path/to/project \
  --record-override --rule-id case-isolation \
  --justification "Building cross-cutting theme"

# Record resolution
node skills/methodological-rules/scripts/strain-check.js \
  --project-path /path/to/project \
  --record-resolution --rule-id case-isolation \
  --resolution phase_transition
```

**What it does:**
- Tracks rule override patterns
- Detects strain (3+ overrides triggers review)
- Generates conversational review prompts
- Records resolutions for audit trail

### apply-preset.js

```bash
# List available presets
node skills/methodological-rules/scripts/apply-preset.js --list-presets

# Apply a preset
node skills/methodological-rules/scripts/apply-preset.js \
  --project-path /path/to/project --preset gioia_corley
```

**What it does:**
- Lists methodology presets (Gioia, Charmaz, Straussian, etc.)
- Applies preset defaults (isolation config, proactive prompts, vocabulary)
- Logs to reflexivity journal

### saturation-tracker.js

```bash
# Check saturation status
node skills/methodological-rules/scripts/saturation-tracker.js \
  --project-path /path/to/project --status

# Record document coding
node skills/methodological-rules/scripts/saturation-tracker.js \
  --project-path /path/to/project \
  --record-document --doc-id INT_001 --new-codes 5

# Record code refinement
node skills/methodological-rules/scripts/saturation-tracker.js \
  --project-path /path/to/project \
  --record-refinement --code-id coping --change-type split

# Full assessment
node skills/methodological-rules/scripts/saturation-tracker.js \
  --project-path /path/to/project --assess
```

**What it does:**
- Tracks multi-dimensional saturation (generation, coverage, refinement, redundancy)
- Calculates saturation level (low → saturated)
- Provides recommendations based on saturation signals

### workspace-branch.js

```bash
# Fork a branch
node skills/methodological-rules/scripts/workspace-branch.js \
  --project-path /path/to/project \
  --fork --name "alternative-structure" --framing exploratory

# Switch branches
node skills/methodological-rules/scripts/workspace-branch.js \
  --project-path /path/to/project --switch --branch-id alt-123

# Merge (requires memo)
node skills/methodological-rules/scripts/workspace-branch.js \
  --project-path /path/to/project \
  --merge --branch-id alt-123 --memo "Synthesis explanation..."
```

**What it does:**
- Creates interpretive branches for exploratory analysis
- Tracks methodological framing (exploratory, confirmatory, negative case)
- Requires synthesis memo for merges
- Preserves abandoned branches for audit trail

### viz-dashboard.js

```bash
# Full dashboard
node skills/methodological-rules/scripts/viz-dashboard.js \
  --project-path /path/to/project --view all

# Specific views
node skills/methodological-rules/scripts/viz-dashboard.js \
  --project-path /path/to/project --view saturation

# Mermaid export
node skills/methodological-rules/scripts/viz-dashboard.js \
  --project-path /path/to/project --mermaid lineage
```

**What it does:**
- Renders CLI dashboards (ASCII art, box drawing)
- Views: saturation, rules, branches, all
- Exports Mermaid diagrams for documentation

### researcher-team.js

```bash
# Add team member
node skills/methodological-rules/scripts/researcher-team.js \
  --project-path /path/to/project \
  --add-member --name "Jane Doe" --role coder

# Start ICR session
node skills/methodological-rules/scripts/researcher-team.js \
  --project-path /path/to/project \
  --start-icr-session --participants "jane,john" --documents "INT_001"

# Log attribution
node skills/methodological-rules/scripts/researcher-team.js \
  --project-path /path/to/project \
  --log-attribution --action created_code --target adaptive_coping
```

**What it does:**
- Manages research team members and roles
- Tracks current researcher for attribution
- Supports intercoder reliability sessions
- Logs all analytical decisions to researcher

---

## Templates

Templates use Mustache-style placeholders:

- `{{study_type}}` - From config
- `{{case_count}}` - Number of cases
- `{{case_names}}` - Comma-separated case names
- `{{current_phase}}` - Current sandwich_status phase
- `{{relaxes_at_phase}}` - When this rule relaxes
- `{{friction_level}}` - Current friction setting
- `{{rule_status}}` - active | relaxed
- `{{timestamp}}` - Generation timestamp

---

## Integration Points

**With existing architecture:**
- Hooks: `PostPhaseTransition` triggers rule updates
- Config: Reads from `research_design` section
- Agents: `@dialogical-coder` references rules during coding
- Commands: `/qual-status` shows active rules

**With Claude Code:**
- Rules placed in `.claude/rules/` for auto-discovery
- Uses official glob pattern frontmatter
- Follows Claude Code rule best practices

---

## Example Generated Rule

```markdown
# .claude/rules/case-isolation.md
---
paths: data/cases/**
---
## Methodological Rule: Case Isolation

**Study:** 3-case comparative study
**Cases:** TechCorp Alpha, HealthCo Beta, FinServ Gamma
**Status:** ACTIVE
**Friction:** CHALLENGE

### Guidance

When analyzing data from a specific case folder:

1. Focus ONLY on the current case's data
2. Let themes emerge from THIS case independently
3. Do NOT reference findings from other cases yet
4. Note cross-case hunches in memos, but don't act on them

### Why This Matters

Cross-case contamination during open coding prevents genuine pattern
emergence. Each case deserves analytical fresh eyes before comparison.

### When This Relaxes

This rule relaxes when you enter **Phase 3: Pattern Characterization**.
At that point, cross-case comparison becomes methodologically appropriate.

Check: config.json → sandwich_status.stage2_progress.phase3_pattern_characterization

---
*Generated: 2025-12-13 | Friction: CHALLENGE | Relaxes: phase3_pattern_characterization*
```

---

## Allowed Tools

This skill may use:
- Read (config, templates)
- Write (rules, journal)
- Bash (script execution)
- Glob (find existing rules)

---

## Related

- **Config schema:** `skills/project-setup/templates/config.schema.json`
- **Hook:** `hooks/post-phase-transition.js`
- **Command:** `/qual-design` (triggers rule generation)
- **Philosophy:** See DESIGN-PHILOSOPHY.md on cognitive hygiene
