# Commands Directory: Organizational Logic

## Why This Structure?

Commands are organized by **FUNCTION** (not just stage), because tools are used across multiple stages.

```
commands/
├── project/        Cross-stage meta-commands
├── analysis/       Epistemic tools (used in all stages)
├── stage1/         Stage-specific guidance
└── stage2/         Stage-specific guidance
```

### project/ - Meta-Commands
**Function:** Project setup, navigation, and stage transitions (transcend stages)
- `init.md` - Initialize project with Socratic onboarding
- `status.md` - Navigate atelier journey, see progress
- `check-setup.md` - Verify plugin installation and configuration
- `configure-analysis.md` - Model selection, cost estimation, batch processing
- `design.md` - Configure research design (cases, waves, isolation rules)
- `advance-stage.md` - Transition between stages with validation

**When used:** Beginning + throughout for orientation and stage management

### analysis/ - Epistemic Tools
**Function:** Thinking and synthesis tools (stage-agnostic)
- `reflect.md` - Synthesis dialogue
- `think-through.md` - Sequential Thinking (deep reasoning)
- `wisdom-check.md` - Lotus Wisdom (paradox navigation)
- `examine-assumptions.md` - Reflexive assumption examination (philosophical coherence)

**When used:** Stage 1 (planning), Stage 2 (challenges), Stage 3 (theorization)

### stage1/ - Solo Practice Guidance
**Function:** Stage 1 philosophy and transition commands
- `README-STAGE1.md` - Philosophy of solo practice
- `memo.md` - Capture analytical memos during manual coding
- `stage1-guide.md` - Comprehensive guidance for Stage 1 manual coding
- `complete-stage1.md` - Validate foundation and transition to Stage 2

**When used:** Understanding Stage 1, capturing insights, completing Stage 1

### stage2/ - Collaboration Organization
**Function:** Explain where Stage 2 tools live (they're distributed!)
- `README-STAGE2.md` - Tool location map

**When used:** Understanding why commands aren't all in stage2/

---

## The Logic (For First-Time Visitors)

**Principle:** Organize by what tools DO, not just when they're used.

**Why?**
- `/qual-think-through` is used in Stage 1, 2, AND 3
- Putting it in "stage1/" would hide it from Stage 2/3 users
- Functional organization makes tools discoverable

**Outcome:**
- **project/** = "Setup and navigation" (meta)
- **analysis/** = "Thinking and synthesis" (tools)
- **stage1/**, **stage2/** = "Guidance and philosophy" (explanatory)

---

## For AI Agents Reading This

**When you need:**
- Project setup/status → `commands/project/`
- Deep thinking/synthesis → `commands/analysis/`
- Stage-specific philosophy → `commands/stage1/` or `stage2/`

**All commands have:**
- Purpose explanation
- Philosophical foundation
- Implementation guidance for Claude
- Context-agnostic examples

---

## The Craft Detail

**This organization embodies:**
- Functional clarity over rigid categorization
- Discoverability over perfect taxonomy
- Pragmatic access over theoretical purity

**A small example of craft thinking in infrastructure design.**
