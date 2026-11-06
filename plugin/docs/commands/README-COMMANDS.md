# Commands: organizational logic

## How commands are packaged

Since 0.3.0, every `/qual-*` command is a skill. Each one lives in its own folder at `skills/qual-<name>/SKILL.md`, and the folder name is the command name. In Claude Code you type `/qual-init`, `/qual-status` and so on, as before. The old `commands/` folder is gone.

There are 17 commands. The skills folder is flat, so the grouping below is by function, not by folder.

## Why group by function

Commands are grouped by FUNCTION (not just stage), because tools are used across multiple stages.

### Project: setup, navigation and stage transitions

These commands work across all stages:

- `/qual-init` - initialize a project with Socratic onboarding
- `/qual-status` - see your progress through the atelier journey
- `/qual-check-setup` - verify the plugin installation and MCP servers
- `/qual-configure-analysis` - model selection, cost estimation and batch processing
- `/qual-design` - configure research design (cases, waves, isolation rules)
- `/qual-advance-stage` - move between stages with validation

When used: at the start, then throughout for orientation and stage management.

### Analysis: epistemic tools for every stage

These commands are thinking and synthesis tools:

- `/qual-reflect` - synthesis dialogue
- `/qual-think-through` - deep reasoning, thinking step by step before responding
- `/qual-wisdom-check` - paradox navigation with Lotus Wisdom
- `/qual-examine-assumptions` - reflexive examination of assumptions (philosophical coherence)

When used: Stage 1 (planning), Stage 2 (challenges), Stage 3 (theorization).

### Stage 1: solo practice

These commands support manual coding without automating it:

- `/qual-memo` - capture analytical memos during manual coding
- `/qual-stage1-guide` - guidance for Stage 1 manual coding
- `/qual-complete-stage1` - validate your foundation and move to Stage 2

The philosophy of solo practice is in [README-STAGE1.md](README-STAGE1.md).

### Stage 2: collaboration

These commands follow the three Stage 2 phases:

- `/qual-parallel-streams` - Phase 1, theoretical and empirical streams
- `/qual-synthesize` - Phase 2, merge the streams into unified patterns
- `/qual-code-deductive` - Phase 2, apply established patterns to the remaining data
- `/qual-characterize-patterns` - Phase 3, dimensional analysis of patterns

When Stage 1 is not complete, Claude Code asks you to confirm before these 4 commands run. [README-STAGE2.md](README-STAGE2.md) maps where the other Stage 2 tools live.

---

## The logic (for first-time visitors)

**Principle:** Organize by what tools DO, not just when they're used.

**Why?**
- `/qual-think-through` is used in Stage 1, 2, AND 3
- Listing it under Stage 1 would hide it from Stage 2/3 users
- Functional organization makes tools discoverable

**Outcome:**
- **Project** = "Setup and navigation" (meta)
- **Analysis** = "Thinking and synthesis" (tools)
- **Stage 1**, **Stage 2** = "Guidance and stage-specific work"

---

## For AI agents reading this

When you need:

- project setup or status: `skills/qual-init/`, `skills/qual-status/` and the other project commands
- deep thinking or synthesis: `skills/qual-think-through/`, `skills/qual-reflect/`, `skills/qual-wisdom-check/`, `skills/qual-examine-assumptions/`
- stage-specific philosophy: [README-STAGE1.md](README-STAGE1.md) or [README-STAGE2.md](README-STAGE2.md)

**All commands have:**
- Purpose explanation
- Philosophical foundation
- Implementation guidance for Claude
- Context-agnostic examples

---

## The craft detail

**This organization embodies:**
- Functional clarity over rigid categorization
- Discoverability over perfect taxonomy
- Pragmatic access over theoretical purity

**A small example of craft thinking in infrastructure design.**
