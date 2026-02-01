# Tutorial Quickstart

A step-by-step guide to getting started with the Interpretive Orchestration plugin.

---

## Overview

This tutorial walks you through:
1. Installing and verifying the plugin
2. Running your first Socratic onboarding
3. Understanding the project structure
4. Beginning Stage 1 manual coding

**Time required:** 15-30 minutes

---

## Prerequisites

Before starting:
- [ ] Claude Code is installed
- [ ] Node.js 18+ is installed
- [ ] You have qualitative data to analyze (or use the placeholder structure below)

---

## Step 1: Install the Plugin

```
/plugin marketplace add linxule/interpretive-orchestration
/plugin install linxule/interpretive-orchestration
```

Verify installation:
```
/qual-check-setup
```

You should see all green checkmarks for bundled MCPs and commands.

---

## Step 2: Initialize Your Project

Run the initialization command:
```
/qual-init
```

**Choose your path:**
- **[A] Full Setup (15 min):** Complete Socratic dialogue about your philosophical stance
- **[B] Quick Start (3 min):** Use sensible defaults (Gioia/Interpretivist)

For this tutorial, try **Full Setup** to experience the philosophical foundation.

---

## Step 3: Understand Your Project Structure

After initialization, you'll have:

```
your-project/
├── .interpretive-orchestration/  # Configuration and logs
│   ├── config.json            # Your settings (AI-readable)
│   ├── epistemic-stance.md    # Your philosophy (human-readable)
│   └── conversation-log.jsonl # Transparency log
│
├── stage1-foundation/         # Your manual coding work
│   ├── manual-codes/
│   └── memos/
│
├── stage2-collaboration/      # AI-assisted coding
│   ├── stream-a-theoretical/
│   ├── stream-b-empirical/
│   └── synthesis/
│
└── stage3-synthesis/          # Final integration
```

---

## Step 4: Begin Stage 1 Manual Coding

**This step is essential.** The "sandwich methodology" requires human foundation before AI collaboration.

### 4.1 Add Your Documents
Place your research documents (interviews, field notes, etc.) in `stage1-foundation/` or a `data/` folder.

### 4.2 Code Manually
Code 10-15 documents by hand:
- Read closely
- Identify patterns
- Note initial codes
- Write memos

Use `/qual-memo` to capture insights.

### 4.3 Track Progress
Use `/qual-status` to see your journey through the stages.

---

## Step 5: Tools Available in Stage 1

Even before AI-assisted coding, you have powerful tools:

| Command | Purpose |
|---------|---------|
| `/qual-think-through` | Deep reasoning with Sequential Thinking |
| `/qual-wisdom-check` | Navigate paradoxes with Lotus Wisdom |
| `/qual-memo` | Write analytical memos |
| `/qual-status` | Check your progress |

Convert your documents for analysis:
- **PDFs:** Use MinerU (if API key) or Adobe Acrobat/Google Docs
- **Audio:** Use Otter.ai, Rev.com, or YouTube auto-captions
- **Word documents:** Copy/paste or use Pandoc

---

## Next Steps

After completing Stage 1:
1. Use `@dialogical-coder` for AI-assisted coding
2. Run `/qual-parallel-streams` to begin dual-stream analysis
3. Continue to Stage 2 and beyond

---

## Your Documents

This tutorial uses a placeholder structure. Add your own data:

```
your-documents/
├── document-01.txt
├── document-02.txt
└── ...
```

**Format:** Plain text or markdown. One document per file.

---

## Getting Help

- **Plugin overview:** Read `../../README.md`
- **Installation issues:** See `../../TROUBLESHOOTING.md`
- **Philosophical foundation:** See `../../DESIGN-PHILOSOPHY.md`
- **Architecture:** See `../../ARCHITECTURE.md`

---

*Welcome to Interpretive Orchestration: Epistemic Partnership System!*
