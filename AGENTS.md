# AGENTS.md: AI Assistant Entry Point

**Welcome, AI Assistant!** 👋

This is your entry point for understanding and working with the Interpretive Orchestration project.

---

## 🚀 Quick Start

### If you're continuing this work:

➡️ **GO TO:** `workshop-notes/guides/ai-continuation/AI-HANDOFF-GUIDE.md`

This handoff guide tells you everything that was accomplished and how to continue.

---

## 📂 What's in This Repository

```
repo-root/
│
├── AGENTS.md                          # ← You are here
├── README.md                          # Human-facing project overview
│
├── plugin/                            # Claude Code plugin (ORIGINAL)
│   ├── skills/                        # 12 skills for Claude
│   ├── agents/                        # 4 agents (markdown)
│   ├── commands/                      # Commands system
│   └── hooks/                         # JavaScript hooks
│
├── plugin-kimi/                       # Kimi CLI plugin (COMPLETE)
│   ├── README.md                      # Kimi plugin user guide
│   ├── AGENTS.md                      # Agent reference
│   ├── .agents/
│   │   ├── skills/                    # 11 skills for Kimi
│   │   ├── agents/                    # 5 YAML files (4 agents + router)
│   │   └── contexts/                  # 3 stage contexts
│   ├── examples/                      # Sample project
│   └── tests/                         # Test suites
│
└── workshop-notes/                    # PROJECT DOCUMENTATION
    ├── README.md                      # Documentation index
    ├── guides/                        # ORGANIZED GUIDES
    │   ├── ai-continuation/           # For future AI assistants
    │   ├── for-kimi-team/             # For Kimi.ai team
    │   └── for-developers/            # For technical development
    ├── kimi-port/                     # Kimi port project
    └── archive/                       # Archived older files
```

---

## 🎯 Project Overview

**Interpretive Orchestration** is a methodology for human-AI partnership in qualitative research.

### Core Concept: The 3-Stage Sandwich

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

## 📋 For Different Tasks

### I want to understand what was done

Read these in order:
1. `workshop-notes/guides/ai-continuation/AI-HANDOFF-GUIDE.md`
2. `plugin-kimi/✅-PRODUCTION-READY.md`
3. `plugin-kimi/FINAL-BUILD-SUMMARY.md`

### I need to update the Kimi plugin

Read:
1. `plugin-kimi/FUTURE-PARITY-GUIDE.md`
2. `workshop-notes/guides/for-developers/KIMI-CLI-PORT-MAPPING.md`

### I want to port to another platform (Codex, etc.)

Study:
1. `workshop-notes/guides/for-developers/KIMI-CLI-PORT-MAPPING.md`
2. `plugin-kimi/skills/qual-shared/scripts/` (reference implementation)
3. Use `plugin-kimi/` as your template

### I need to fix a bug

Check:
1. Does the bug exist in Claude version too? (`plugin/`)
2. Fix in Kimi version (`plugin-kimi/`)
3. Run tests: `cd plugin-kimi && python -m pytest tests/`

### I want to understand the methodology

Read:
1. `workshop-notes/guides/for-kimi-team/KIMI-TEAM-CONTEXT-PACKAGE.md`
2. `plugin-kimi/examples/sample-research-project/README.md`

---

## ✅ Current Status

| Component | Status |
|-----------|--------|
| **Claude Code Plugin** | ✅ Complete, maintained |
| **Kimi CLI Plugin** | ✅ Complete, production-ready |
| **Feature Parity** | ✅ **100% TRUE PARITY** (all skills ported) |
| **Documentation** | ✅ Organized |
| **Tests** | ✅ All passing |
| **Example Project** | ✅ Working |

---

## 📚 Key Documents

### Start Here
- `workshop-notes/guides/ai-continuation/AI-HANDOFF-GUIDE.md` — For continuing
- `plugin-kimi/README.md` — For using the plugin
- `workshop-notes/README.md` — Documentation index

### Reference
- `plugin-kimi/AGENTS.md` — Agent documentation
- `plugin-kimi/MVP-SCOPE.md` — What's in/out
- `plugin-kimi/FUTURE-PARITY-GUIDE.md` — Maintenance process
- `workshop-notes/guides/for-kimi-team/KIMI-TEAM-CONTEXT-PACKAGE.md` — Methodology

---

## 🧪 Testing

```bash
# Run all tests (no pytest required - tests run standalone)
cd plugin-kimi/tests
python3 test_integration.py
python3 test_end_to_end.py
python3 test_performance.py

# Run skill-specific tests
python3 .agents/skills/qual-analysis-orchestration/scripts/test_estimate_costs.py
python3 .agents/skills/qual-methodological-rules/scripts/test_saturation_tracker.py
```

---

## 🎓 Learning Path

**New to this project?** Follow this path:

1. **Read:** `workshop-notes/guides/ai-continuation/AI-HANDOFF-GUIDE.md`
2. **Explore:** `plugin-kimi/examples/sample-research-project/`
3. **Study:** `workshop-notes/guides/for-kimi-team/KIMI-TEAM-CONTEXT-PACKAGE.md`
4. **Review:** `plugin-kimi/skills/qual-shared/scripts/`
5. **Understand:** `plugin-kimi/FUTURE-PARITY-GUIDE.md`

---

## ⚠️ Critical Rules

When working on this project:

1. **Never break the 5 non-negotiables** (see above)
2. **Always maintain Stage 1 enforcement**
3. **Keep 4-stage reasoning visible**
4. **Preserve agent personalities**
5. **Run tests before committing changes**
6. **Update documentation with code changes**

---

## 📞 Quick Reference

| What | Where |
|------|-------|
| Claude plugin | `plugin/` |
| Kimi plugin | `plugin-kimi/` |
| Documentation | `workshop-notes/` |
| Guides | `workshop-notes/guides/` |
| Kimi port files | `workshop-notes/kimi-port/` |
| Example project | `plugin-kimi/examples/` |
| Tests | `plugin-kimi/tests/` |
| Archive | `workshop-notes/archive/` |

---

## 🎯 Mission

This project demonstrates **Partnership Agency** — the highest form of human-AI collaboration in qualitative research.

The goal is not automation. The goal is **transformation**: helping researchers think more deeply, rigorously, and reflexively.

---

**Welcome to the project! Start with the handoff guide and you'll be up to speed quickly.**

➡️ `workshop-notes/guides/ai-continuation/AI-HANDOFF-GUIDE.md`

---

*Last updated: 2026-02-02*

**Status: COMPLETE AND READY FOR CONTINUATION** ✅
