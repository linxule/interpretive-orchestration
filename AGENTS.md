# AGENTS.md: AI Assistant Entry Point

This is your entry point for understanding and working with the Interpretive Orchestration project.

---

## What's in This Repository

One plugin, with a manifest for each agent tool that can install it:

```
repo-root/
│
├── AGENTS.md                          # ← You are here
├── README.md                          # Human-facing project overview
├── CITATION.cff                       # How to cite the work
├── .claude-plugin/marketplace.json    # Claude Code and Copilot CLI marketplace
├── .agents/plugins/marketplace.json   # Codex marketplace
├── kimi.plugin.json                   # Kimi Code manifest
│
└── plugin/                            # The plugin
    ├── CLAUDE.md                      # Maintenance guide and agent instructions
    ├── ARCHITECTURE.md                # Full architecture reference
    ├── skills/                        # 17 qual-* commands + 12 skills (JavaScript scripts)
    ├── agents/                        # 4 agents (markdown)
    ├── hooks/                         # hooks.json + run-hook.js adapter + hook scripts
    └── tests/                         # node tests/run-tests.js
```

The Python port for the archived kimi-cli (`plugin-kimi/`) was removed in 0.3.0. It is still in the `v0.2.5` tag.

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
3. `plugin/examples/tutorial-quickstart/README.md` (workflow example)

### I need to update the Claude Code plugin

1. `plugin/CLAUDE.md` (instructions, skill list, maintenance guide)
2. `plugin/ARCHITECTURE.md` (architecture reference)

### I need to support another platform

1. `plugin/CLAUDE.md` → "Plugin Marketplace Structure" and "Other platforms"
2. Keep one plugin folder; add a manifest, not a port

### I need to fix a bug

1. Fix it in `plugin/`
2. Run tests: `bun run test` (or `node plugin/tests/run-tests.js`)
3. Validate: `claude plugin validate .` and `claude plugin validate plugin`

---

## Current Status

| Component | Status |
|-----------|--------|
| **Plugin** | 0.3.1: 17 commands (as skills), 12 skills, 4 agents, 7 hooks |
| **Claude Code** | Full support, including hooks |
| **Codex, Copilot CLI, Kimi Code** | Installable; see `plugin/CLAUDE.md` → "Other platforms" for what works |
| **Tests** | `node plugin/tests/run-tests.js` |

---

## Key Documents

| Document | Purpose |
|----------|---------|
| `plugin/CLAUDE.md` | Maintenance guide and agent instructions |
| `plugin/ARCHITECTURE.md` | Full architecture reference |
| `plugin/docs/HOOKS-PHILOSOPHY.md` | Why each hook exists and how it is wired |
| `plugin/CHANGELOG.md` | Version history |

---

## Testing

```bash
bun run test                     # all suites
node plugin/tests/test-hooks.js  # hooks and the hook adapter
claude plugin validate .         # marketplace
claude plugin validate plugin    # plugin
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

If a `workshop-notes/` directory exists locally, it contains additional development context (AI handoff guides, methodology notes). These are gitignored and not required for working on the project.

---

*Interpretive Orchestration: Epistemic Partnership System*
*Built by Xule Lin (SKEMA Business School) and Kevin Corley (Imperial College London)*
