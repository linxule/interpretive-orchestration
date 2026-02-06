# Interpretive Orchestration (Cowork / Claude Desktop)

> Epistemic Partnership System for AI-Assisted Qualitative Research

This is the **Claude Desktop (Cowork)** version of the Interpretive Orchestration plugin. It provides the same methodology and features as the CLI version, adapted for Claude Desktop's plugin structure.

For the full project overview, philosophy, and methodology, see the [main README](../README.md).

## Quick Start

```
/qual-init           # Socratic onboarding
/qual-status         # See your progress
/qual-stage1-guide   # Stage 1 manual coding guidance
```

## What's Included

- **17 commands** (flat `qual-*` structure for Desktop compatibility)
- **4 agents** (@stage1-listener, @dialogical-coder, @research-configurator, @scholarly-companion)
- **12 skills** (auto-discoverable capability packages)
- **6 hooks** (methodology enforcement)
- **2 MCP servers** (Sequential Thinking + Lotus Wisdom)

## Key Difference from CLI Version

Claude Desktop requires a flat command structure. All commands use a `qual-` prefix instead of nested directories:

| CLI Version | Desktop Version |
|-------------|-----------------|
| `/project/init` | `/qual-init` |
| `/analysis/think-through` | `/qual-think-through` |
| `/stage1/memo` | `/qual-memo` |

MCP servers require manual installation in Desktop. See [docs/CONNECTOR-SETUP.md](docs/CONNECTOR-SETUP.md) for instructions.

## Documentation

- [docs/README.md](docs/README.md) - Detailed documentation index
- [docs/CONNECTOR-SETUP.md](docs/CONNECTOR-SETUP.md) - MCP server setup for Desktop
- [docs/HOOKS-PHILOSOPHY.md](docs/HOOKS-PHILOSOPHY.md) - Hook rationale
- [commands/README-COMMANDS.md](commands/README-COMMANDS.md) - All commands reference

## License

MIT - See [LICENSE](../LICENSE)
