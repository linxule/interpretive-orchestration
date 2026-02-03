# qual-methodological-rules

Methodological integrity through isolation rules, preset application, and phase-aware guidance. Helps researchers maintain rigor throughout the analytical journey.

## When to Use

Use this skill when:
- User mentions "generate rules", "apply preset", or "methodology preset"
- User asks "which methodology should I use" or "configure my approach"
- After `/flow:qual-init` completes (auto-apply preset)
- User mentions "Gioia", "Charmaz", "Grounded Theory", "Phenomenology", "Ethnography"
- When phase changes (update rules to reflect new stage)
- User asks about methodological boundaries or isolation

## Phase 1 Capabilities (MVP)

### 1. Methodology Presets

**Available Presets:**
- **gioia_corley** - Gioia & Corley systematic approach
- **charmaz_constructivist** - Charmaz constructivist GT
- **straussian** - Straussian grounded theory
- **glaserian** - Glaserian classic GT
- **phenomenology** - Phenomenological analysis
- **ethnography** - Ethnographic analysis
- **custom** - Manual configuration

**What Presets Configure:**
- Isolation rule defaults (case, wave, stream)
- Proactive prompts for the methodology
- Philosophical defaults (ontology, epistemology)
- Coding vocabulary (preferred/avoided verbs)
- Key methodological practices

### 2. Isolation Rules

Three types of methodological boundaries:

**Case Isolation** (multi-case studies):
- Keeps cases separate during open coding
- Prevents cross-case contamination
- Relaxes at: Phase 3 (Pattern Characterization)

**Wave Isolation** (longitudinal studies):
- Keeps waves separate during initial analysis
- Preserves temporal integrity
- Relaxes at: Cross-Wave Analysis phase

**Stream Separation** (parallel streams):
- Keeps theoretical and empirical streams separate
- Allows independent maturation
- Relaxes at: Phase 2 (Synthesis)

### 3. Phase-Aware Guidance

Rules adapt as analysis progresses:
- Stage 1: All rules active (strict boundaries)
- Stage 2 Phase 1: Stream separation active
- Stage 2 Phase 2: Stream separation relaxes (synthesis begins)
- Stage 2 Phase 3: Case isolation relaxes (cross-case patterns emerge)

### 4. Friction Levels

Rules use graduated friction, not binary blocking:

| Level | Behavior | When Used |
|-------|----------|-----------|
| **SILENT** | Log only, no interruption | Relaxed rules |
| **NUDGE** | Gentle reminder | Moderate boundaries |
| **CHALLENGE** | Pause, request justification | Important boundaries |
| **HARD_STOP** | Block action | Critical integrity (rarely used) |

## Usage

### List Available Presets

```bash
python3 scripts/apply_preset.py --list-presets
```

**Returns:**
```json
{
  "presets": [
    {
      "id": "gioia_corley",
      "name": "Gioia & Corley Systematic Approach",
      "description": "..."
    }
  ]
}
```

### Apply a Preset

```bash
python3 scripts/apply_preset.py \
  --project-path /path/to/project \
  --preset gioia_corley
```

**What happens:**
1. Loads preset configuration
2. Applies isolation rule defaults
3. Configures proactive prompts
4. Sets philosophical defaults (if not already set)
5. Sets coding vocabulary
6. Logs to reflexivity journal
7. Returns applied configuration

### Generate Rules from Research Design

```bash
python3 scripts/generate_rules.py \
  --project-path /path/to/project
```

**What it creates:**
- `.interpretive-orchestration/methodological-rules.json` with rule definitions
- Logs generation to reflexivity journal

### Check Current Phase and Rule Status

```bash
python3 scripts/check_phase.py \
  --project-path /path/to/project
```

**Returns:**
```json
{
  "current_phase": "phase1_parallel_streams",
  "rules_should_relax": [],
  "rules_still_active": [
    {"name": "case-isolation", "relaxes_at": "phase3_pattern_characterization"}
  ]
}
```

### Update Rules After Phase Change

```bash
python3 scripts/update_rules.py \
  --project-path /path/to/project
```

**When to use:**
- After advancing to a new stage/phase
- After completing Stage 1 and entering Stage 2
- After completing Phase 1 and entering Phase 2 (Synthesis)
- Anytime you suspect rules are outdated

## Integration with Kimi CLI

### Via @research-configurator Agent

The research-configurator agent uses this skill during Stage 2 setup:

```
@research-configurator I'm ready to start Stage 2 coding

> What methodology do you follow?
  [User selects: Gioia & Corley]

> [Invokes qual-methodological-rules skill]
> [Applies gioia_corley preset]
> [Generates isolation rules]
>
> Your approach is configured:
> - Case isolation active (relaxes at Phase 3)
> - Stream separation active (relaxes at Phase 2)
> - 7 proactive prompts enabled
```

### Manual Invocation

```bash
/skill:qual-methodological-rules --preset gioia_corley
```

## Methodology Preset Guide

### When to Use Each Preset

**Gioia & Corley** - Choose if you:
- Build data structures (1st order → 2nd order → aggregate)
- Use parallel theoretical and empirical streams
- Value systematic, visible reasoning
- Need rigorous case-based research

**Charmaz Constructivist** - Choose if you:
- Emphasize co-construction with participants
- Position yourself reflexively in research
- Use gerund-based codes (action focus)
- Value maximal reflexivity

**Straussian** - Choose if you:
- Follow coding paradigm (open → axial → selective)
- Build conditional matrices
- Use structured analytical procedures
- Want systematic coding approach

**Glaserian** - Choose if you:
- Let theory emerge without forcing
- Delay literature review until after coding
- Focus on discovery of core category
- Value minimal researcher imposition

**Phenomenology** - Choose if you:
- Study lived experience and meaning
- Practice bracketing of assumptions
- Seek essence of phenomena
- Value interpretive depth

**Ethnography** - Choose if you:
- Study culture and meaning systems
- Write thick descriptions
- Navigate emic/etic perspectives
- Engage with field context

**Custom** - Choose if you:
- Have a hybrid or unique methodology
- Want to configure everything manually
- None of the above fit your approach

## Data Structures

### Research Design Configuration

```json
{
  "research_design": {
    "methodology_preset": "gioia_corley",
    "isolation_config": {
      "case_isolation": {
        "enabled": true,
        "relaxes_at": "phase3_pattern_characterization",
        "friction_level": "challenge"
      },
      "wave_isolation": {
        "enabled": true,
        "relaxes_at": "cross_wave_analysis",
        "friction_level": "challenge"
      },
      "stream_separation": {
        "enabled": true,
        "relaxes_at": "phase2_synthesis",
        "friction_level": "nudge"
      }
    },
    "proactive_prompts": {
      "enabled": true,
      "active_prompts": ["in_vivo_check", "memo_prompt", ...],
      "cooldown_turns": 5
    }
  }
}
```

### Generated Rules Output

```json
{
  "rules": [
    {
      "rule_id": "case-isolation",
      "rule_type": "case_isolation",
      "status": "active",
      "friction_level": "challenge",
      "relaxes_at_phase": "phase3_pattern_characterization",
      "current_phase": "phase1_parallel_streams",
      "config": {
        "case_count": 3,
        "case_names": ["TechCorp", "HealthCo", "FinServ"],
        "study_type": "comparative"
      },
      "rendered_content": "...",  // Full rule guidance text
      "last_updated": "2026-02-02T10:30:00Z"
    }
  ],
  "generated_at": "2026-02-02T10:30:00Z",
  "current_phase": "phase1_parallel_streams"
}
```

## Key Difference from Claude Code Version

**Claude Code:**
- Writes rules to `.claude/rules/*.md` for auto-discovery
- Rules enforced by Claude Code plugin system
- PostPhaseTransition hook auto-updates rules

**Kimi CLI:**
- Writes rules to `.interpretive-orchestration/methodological-rules.json`
- Rules surfaced via conversational prompts (DefensiveRouter + FrictionSystem)
- Manual rule updates (no hooks system)
- **Same philosophical foundation**, different enforcement mechanism

## Future Phases (Not Yet Implemented)

### Phase 2: Strain & Saturation
- Track rule override patterns
- Detect when methodology is evolving
- Multi-dimensional saturation tracking

### Phase 3: Advanced Features
- Workspace branching (exploratory analysis)
- Visualization dashboard
- Multi-researcher support

See `/Users/xulelin/.claude/plans/humming-splashing-fairy.md` for full roadmap.

## Philosophy

**Graduated friction** over binary blocking:
- Rules don't police - they prompt awareness
- Overrides are documented, not blocked
- Methodological strain becomes data
- Researcher maintains interpretive authority

**Phase-aware guidance** over static rules:
- Rules appropriate for current stage
- Auto-relax when methodologically sound
- No unnecessary friction in later phases

## Related

- **Skills:** `qual-init` sets up research design
- **Skills:** `qual-status` shows active rules
- **Agents:** @research-configurator uses this for Stage 2 setup
- **Files:** `templates/methodology-presets.json` contains all presets

---

*Phase 1 Complete - Core rule system functional.*
*Phase 2 & 3 coming soon: strain detection, saturation tracking, branching.*
