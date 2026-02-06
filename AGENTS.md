# AGENTS.md: AI Assistant Entry Point

This is your entry point for understanding and working with the Interpretive Orchestration project.

---

## What's in This Repository

```
repo-root/
│
├── AGENTS.md                          # ← You are here
├── README.md                          # Human-facing project overview
│
├── plugin/                            # Claude Code plugin (ORIGINAL)
│   ├── CLAUDE.md                      # Plugin instructions & maintenance guide
│   ├── ARCHITECTURE.md                # Full architecture reference
│   ├── skills/                        # 12 skills (JavaScript)
│   ├── agents/                        # 4 agents (markdown)
│   ├── commands/                      # Commands system
│   └── hooks/                         # JavaScript hooks
│
├── plugin-cowork/                     # Claude Desktop/Cowork plugin
│   ├── README.md                      # Cowork plugin guide
│   └── commands/                      # 17 qual-* commands (flat structure)
│
└── plugin-kimi/                       # Kimi CLI plugin (COMPLETE)
    ├── README.md                      # Kimi plugin user guide
    ├── AGENTS.md                      # Agent reference
    ├── CHANGELOG.md                   # Version history & credits
    ├── .agents/
    │   ├── skills/                    # 12 skills for Kimi (Python)
    │   ├── agents/                    # 5 YAML files (4 agents + router)
    │   └── contexts/                  # 3 stage contexts
    ├── examples/                      # Sample project
    └── tests/                         # Test suites
```

---

## Project Overview

**Interpretive Orchestration** is a methodology for human-AI partnership in qualitative research.

### The 3-Stage Sandwich

```
Stage 1 (Foundation):    Human codes manually (10+ docs)
         ↓
Stage 2 (Collaboration): Human + AI partnership
         ↓
Stage 3 (Synthesis):     Human synthesizes with AI dialogue
```

### The 5 Non-Negotiables

1. **Human interpretive authority** — AI never decides final meanings
2. **Stage 1 requirement** — Manual foundation before AI collaboration
3. **Visible reasoning** — 4-stage process mandatory
4. **Reflexivity embedded** — Regular prompted reflection
5. **Partnership not automation** — Transform thinking, don't replace

### The 4 Agents

| Agent | Stage | Role |
|-------|-------|------|
| @stage1-listener | Stage 1 | Thinking partner, never codes |
| @dialogical-coder | Stage 2 | 4-stage visible reasoning |
| @research-configurator | Stage 2 | Technical orchestration |
| @scholarly-companion | Stage 3 | Theoretical dialogue |

---

## For Different Tasks

### I want to understand the project

1. This file (overview, architecture, non-negotiables)
2. `plugin/ARCHITECTURE.md` (full technical architecture)
3. `plugin-kimi/examples/sample-research-project/README.md` (workflow example)

### I need to update the Claude Code plugin

1. `plugin/CLAUDE.md` (instructions, skill list, maintenance guide)
2. `plugin/ARCHITECTURE.md` (architecture reference)

### I need to update the Kimi plugin

1. `plugin-kimi/FUTURE-PARITY-GUIDE.md` (porting process)
2. `plugin/CLAUDE.md` → "Kimi CLI Plugin Maintenance" section (conventions, doc checklist)
3. `plugin-kimi/CHANGELOG.md` (version history)

### I want to port to another platform

1. `plugin-kimi/FUTURE-PARITY-GUIDE.md` (porting patterns: JS→Python mapping)
2. `plugin-kimi/.agents/skills/qual-shared/scripts/` (reference implementation)
3. Use `plugin-kimi/` as your template

### I need to fix a bug

1. Check if the bug exists in Claude version too (`plugin/`)
2. Fix in the affected plugin(s)
3. Run tests: `bun test` (Claude) or `python3 plugin-kimi/tests/test_integration.py` (Kimi)

---

## Current Status

| Component | Status |
|-----------|--------|
| **Claude Code Plugin** | 12 skills, maintained |
| **Kimi CLI Plugin** | 12 skills, production-ready |
| **Cowork Plugin** | 17 commands, maintained |
| **Feature Parity** | 12/12 skills across Claude & Kimi |
| **Tests** | All passing |

---

## Key Documents

| Document | Purpose |
|----------|---------|
| `plugin/CLAUDE.md` | Claude plugin instructions & Kimi maintenance guide |
| `plugin/ARCHITECTURE.md` | Full architecture reference |
| `plugin-kimi/README.md` | Kimi plugin user guide |
| `plugin-kimi/AGENTS.md` | Agent documentation for Kimi |
| `plugin-kimi/CHANGELOG.md` | Version history and build credits |
| `plugin-kimi/FUTURE-PARITY-GUIDE.md` | Maintenance and porting process |
| `plugin-kimi/MVP-SCOPE.md` | Scope, requirements, known limitations |
| `plugin-cowork/README.md` | Cowork plugin guide |

---

## Testing

```bash
# Claude Code plugin
bun test

# Kimi CLI plugin (tests run standalone, no pytest required)
python3 plugin-kimi/tests/test_integration.py
python3 plugin-kimi/tests/test_end_to_end.py
python3 plugin-kimi/tests/test_performance.py
```

---

## Critical Rules

When working on this project:

1. **Never break the 5 non-negotiables** (see above)
2. **Always maintain Stage 1 enforcement**
3. **Keep 4-stage reasoning visible**
4. **Preserve agent personalities**
5. **Run tests before committing changes**
6. **Update documentation with code changes** (see checklist in `plugin/CLAUDE.md`)

---

## Local Development Notes

If a `workshop-notes/` directory exists locally, it contains additional development context (AI handoff guides, Kimi port artifacts, methodology notes). These are gitignored and not required for working on the project.

---

*Interpretive Orchestration: Epistemic Partnership System*
*Built by Xule Lin and Kevin Corley (Imperial College London)*
