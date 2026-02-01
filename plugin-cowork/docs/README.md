# Interpretive Orchestration - Documentation

**Interpretive Orchestration** is a plugin for Claude that supports qualitative researchers in coding, analyzing, and theorizing from interview data, field notes, and other qualitative materials. It enforces methodological rigor through a staged approach that preserves the researcher's interpretive role while leveraging AI as a thinking partner.

This folder contains documentation for the Cowork-compatible version of the plugin.

## The Three Stages

The plugin follows a "sandwich" methodology where human work brackets AI assistance:

1. **Stage 1 (Human)** - Manual coding where you develop initial codes and build theoretical sensitivity through close reading
2. **Stage 2 (Partnership)** - AI-assisted parallel coding, pattern characterization, and synthesis - with you maintaining interpretive authority
3. **Stage 3 (Human)** - Human-led theoretical integration and dialogue with scholarly literature

## Contents

| Document | Description |
|----------|-------------|
| [CONNECTOR-SETUP.md](CONNECTOR-SETUP.md) | Guide for installing optional MCP connectors (Sequential Thinking, Lotus Wisdom) |
| [HOOKS-PHILOSOPHY.md](HOOKS-PHILOSOPHY.md) | Philosophy and rationale behind each methodological hook |

## Quick Links

- **Getting Started:** Use `/qual-init` to set up a new project
- **Check Status:** Use `/qual-status` to see your progress
- **Stage 1 Help:** Use `/qual-stage1-guide` for manual coding guidance
- **Need an Agent:**
  - `@stage1-listener` - Thinking partner for Stage 1
  - `@dialogical-coder` - Four-stage coding for Stage 2
  - `@scholarly-companion` - Theoretical dialogue for Stage 3

## Claude Desktop vs Claude Code CLI

This plugin version (`interpretive-orchestration-cowork`) is optimized for Claude Desktop (Cowork):

| Feature | Status |
|---------|--------|
| Commands | ✅ Full support |
| Skills | ✅ Full support |
| Agents | ✅ Full support |
| Hooks | ✅ Full support |
| MCP Connectors | ⚙️ Manual setup required |

The MCP connectors (Sequential Thinking, Lotus Wisdom, etc.) require manual installation in Claude Desktop due to sandbox limitations. See [CONNECTOR-SETUP.md](CONNECTOR-SETUP.md) for instructions.

## For the Full CLI Experience

If you're using Claude Code CLI, the full `interpretive-orchestration` plugin includes:
- Auto-loading MCP servers
- All features of this Cowork version

Install via:
```
claude plugin install linxule/interpretive-orchestration
```

---

*Part of the Interpretive Orchestration: Epistemic Partnership System*
