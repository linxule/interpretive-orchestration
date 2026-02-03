# Interpretive Orchestration for Kimi CLI

**Infrastructure for human-AI epistemic partnership in qualitative research.**

Not a tool for faster coding. A partner for deeper thinking.

---

## What Is This?

This plugin implements **Partnership Agency** from [Cognitio Emergens](https://arxiv.org/abs/2505.03105) — a configuration where human and AI become co-apprentices to craft traditions (rigor, reflexivity, theoretical sensitivity).

### The Three Stages (Sandwich Methodology)

```
🎨 Stage 1: Solo Practice (Human)
   • Manual coding 10-15 documents
   • Build theoretical sensitivity
   • @stage1-listener: thinking partner

   🔒 (Enforced: Can't skip to Stage 2)

🤝 Stage 2: Collaboration (Partnership)  
   • AI-assisted with 4-stage visible reasoning
   • @research-configurator: technical orchestration
   • @dialogical-coder: reflexive coding

💭 Stage 3: Synthesis (Human)
   • Theoretical integration
   • @scholarly-companion: asks tradition's questions
```

---

## Installation

### Prerequisites
- Kimi CLI installed
- Python 3.10+ (required for advanced features)
- uv (recommended) or pip for dependency installation

### Install Plugin

```bash
# Project-local (recommended): copy the single .agents folder
cp -r plugin-kimi/.agents ./.agents

# Install Python dependencies
cd .agents
uv pip install -r requirements.txt
# Or with pip: pip3 install -r requirements.txt

# Optional: install skills globally (agents still referenced by file path)
cp -r plugin-kimi/.agents/skills ~/.config/agents/skills/
```

This repo is self-contained: `.agents/` includes all skills, agents, and contexts.

### Start Kimi CLI

```bash
# Recommended: use the router agent (enables @stage1-listener style routing)
kimi --agent-file .agents/agents/interpretive-orchestrator.yaml

# Or start a dedicated stage agent
# kimi --agent-file .agents/agents/stage1-listener.yaml
```

### Optional: MCP Servers

For enhanced reasoning, configure MCP:

```bash
kimi mcp add --transport stdio sequential-thinking \
  -- npx -y @modelcontextprotocol/server-sequential-thinking@latest

kimi mcp add --transport stdio lotus-wisdom \
  -- npx -y @lotus-wisdom/mcp-server@latest
```

---

## Quick Start

### 1. Initialize a Project

```bash
/flow:qual-init
```

This guides you through Socratic dialogue to establish:
- Your ontological stance
- Your epistemological approach
- Your methodological tradition
- Your relationship to AI

### 2. Check Progress

```bash
/flow:qual-status
```

Shows:
- Current stage
- Documents coded
- Progress indicators
- Next steps

### 3. Begin Coding

**Stage 1** (Manual foundation):
```bash
# Work through documents manually
# With the router agent, use @stage1-listener for thinking partnership
@stage1-listener I'm noticing tension in this passage...
```

**Stage 2** (AI collaboration):
```bash
# After completing Stage 1
@dialogical-coder Code this segment about workplace identity
```

---

## Skills Reference

### Core Skills

| Skill | Type | Purpose |
|-------|------|---------|
| `qual-init` | flow | Socratic onboarding |
| `qual-status` | flow | Progress dashboard |
| `qual-coding` | standard | Dialogical coding |
| `qual-reflection` | standard | MCP reasoning tools |
| `qual-analysis-orchestration` | standard | Cost estimation & planning |
| `qual-methodological-rules` | standard | Isolation rules & methodology presets |
| `qual-shared` | — | Shared infrastructure |

### Agents

| Agent | Stage | Role |
|-------|-------|------|
| `@stage1-listener` | Stage 1 | Curious thinking partner |
| `@research-configurator` | Stage 2 | Technical orchestration ("The Whisperer") |
| `@dialogical-coder` | Stage 2 | 4-stage reflexive coding |
| `@scholarly-companion` | Stage 3 | Theoretical dialogue |

**Router entrypoint:** `interpretive-orchestrator.yaml` (enables `@stage1-listener` style routing)

---

## Project Structure

When you initialize a project:

```
my-research/
├── .interpretive-orchestration/
│   ├── config.json              # Project state
│   ├── epistemic-stance.md      # Your philosophy
│   ├── conversation-log.jsonl   # AI-to-AI transparency
│   └── reflexivity-journal.md   # Your reflections
│
├── .kimi/reasoning/             # Extended 4-stage analysis
│
├── stage1-foundation/
│   ├── manual-codes/
│   └── memos/
│
├── stage2-collaboration/
│   ├── stream-a-theoretical/
│   ├── stream-b-empirical/
│   └── synthesis/
│
├── stage3-synthesis/
│   ├── evidence-tables/
│   └── theoretical-integration/
│
└── outputs/
```

---

## Key Features

### 1. Stage Enforcement (No Bypassing)

Can't accidentally skip Stage 1. Every skill checks your stage and routes appropriately.

### 2. 4-Stage Visible Reasoning

When AI codes in Stage 2, you see:
1. **Tentative mapping** — Initial observations
2. **Self-challenge** — AI questions itself
3. **Structured output** — Codes with rationale
4. **Reflective audit** — Limitations acknowledged

### 3. Hybrid Logging

Both formats:
- **JSONL** — Machine-readable for processing
- **Markdown** — Human-readable for reflection

### 4. Methodological Friction

Intentional "heavy" moments:
- Pause every 5 documents
- Reflexivity prompts
- Epistemic coherence checks

### 5. MCP Integration

Deep reasoning when needed:
- **Sequential Thinking** — Systematic analysis
- **Lotus Wisdom** — Navigate paradoxes
- Graceful fallback if MCP unavailable

---

## Performance

| Operation | Time |
|-----------|------|
| Cold start | ~150ms |
| Warm start | ~10ms |
| File I/O per doc | ~50-100ms |
| 264 documents | ~15-20 seconds total |

---

## Architecture

### Foundation (qual-shared)

- `StateManager` — Atomic state with optimistic locking
- `ReasoningBuffer` — Batched file I/O
- `DefensiveRouter` — Stage enforcement
- `ConversationLogger` — Dual-format logging
- `MCPWrapper` — Graceful fallback
- `FrictionSystem` — Methodological integrity
- `ReflexivitySystem` — Context-aware prompts

### Design Decisions

1. **File-based state** — Simple, portable, no dependencies
2. **Optimistic locking** — Performance over pessimism
3. **Batched I/O** — Amortize disk writes
4. **Defensive routing** — Every skill checks stage
5. **Hybrid visibility** — Inline + extended reasoning
6. **4 agents × 3 contexts** — Stable identity, dynamic framing

---

## Testing

```bash
cd tests
python3 test_integration.py
```

Tests cover:
- Project initialization
- State management
- Defensive routing
- File I/O
- MCP integration
- Friction system
- Reflexivity prompts

---

## Documentation

- `IMPLEMENTATION-ROADMAP.md` — Development plan
- `BUILD-SUMMARY.md` — What's been built
- `PROGRESS.md` — Current status
- `.agents/skills/*/SKILL.md` — Individual skill docs

---

## Philosophy

### Non-Negotiables

1. **Human interpretive authority** — AI never decides final meaning
2. **Stage 1 required** — Manual foundation before AI collaboration
3. **Visible reasoning** — 4-stage process mandatory
4. **Reflexivity embedded** — Not optional feature
5. **Partnership not automation** — Transform thinking, not just speed up

### The Atelier Metaphor

> "Welcome to the Interpretive Orchestration atelier."

Both human and AI are apprentices to craft traditions:
- Rigor
- Reflexivity
- Theoretical sensitivity
- Interpretive depth

Neither masters the other.

---

## Citation

If you use this plugin:

```
Lin, X. (2025). Cognitio Emergens: The Generative Dance of Human-AI Partnership 
  in Qualitative Discovery. arXiv:2505.03105.

Lin, X., & Corley, K. Interpretive Orchestration: Epistemic Partnership System 
  for AI-Assisted Qualitative Research.
```

---

## License

MIT — Because epistemic infrastructure should be freely available.

---

## Acknowledgments

- **Frameworks:** Cognitio Emergens (Lin), Gioia & Corley methodology
- **Built by:** Xule Lin and Kevin Corley (Imperial College London)
- **AI Collaborators:** Kimi K2.5 (Moonshot AI)
- **Validation:** Kimi Team (agents1onKimi.ai)

---

*Built for partnership. Now seeking partnership to research.* 🤝
