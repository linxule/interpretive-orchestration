# Upgrade guide

## Upgrade from v0.2.x to v0.3.0

Version 0.3.0 brings the plugin up to date with current Claude Code. Your projects and your `.interpretive-orchestration/` folder work as before. No migration is needed.

### How to upgrade

In a terminal, run:

```bash
claude plugin marketplace update interpretive-orchestration
claude plugin update interpretive-orchestration@interpretive-orchestration
```

Then restart Claude Code and run `/qual-check-setup`. It should report version 0.3.0 or later.

If the plugin is not installed yet, follow [INSTALL.md](INSTALL.md).

### What changed

- Commands are now skills. Each `/qual-*` command lives at `skills/qual-<name>/SKILL.md`. You type the same names as before, such as `/qual-init` and `/qual-status`.
- The hooks now fire. In earlier versions they did not run in current Claude Code. When Stage 1 is not complete, Claude Code now asks you to confirm before the AI runs @dialogical-coder or a Stage 2 command. If you type the command yourself, the AI is told to ask you first. You can stop, or go ahead knowingly.
- The interpretive pause, coherence prompts and rule updates now reach you after @dialogical-coder finishes, including when it runs in the background.
- Sequential Thinking is no longer bundled. Providers increasingly block tools of this kind. `/qual-think-through` and the deep-reasoning skill now ask the model to think deeply and step by step before responding, which gives the same result.
- Lotus Wisdom is the only bundled MCP server. It runs as `npx -y lotus-wisdom-mcp@latest`, so it updates itself. [DEPENDENCIES.md](DEPENDENCIES.md#lotus-wisdom) describes a hosted alternative.
- The Cowork plugin (`interpretive-orchestration-cowork`) is removed. If you installed it, remove it with `claude plugin uninstall interpretive-orchestration-cowork@interpretive-orchestration`.
- Script paths inside skills now start from the plugin folder (`${CLAUDE_PLUGIN_ROOT}/skills/...`), so the scripts work from your project folder.

---

## Upgrade from v0.1.0 to v0.2.0

If you were using v0.1.0 (MVEP Release), here's what changed in v0.2.0 (Skills Infrastructure Release).

---

### What's New

#### Skills System

v0.2.0 introduces **11 auto-discoverable skills** that Claude loads when relevant to your request:

| Skill | Replaces/Enhances |
|-------|-------------------|
| `project-setup` | Enhanced `/qual-init` |
| `gioia-methodology` | Templates now bundled in skill |
| `literature-sweep` | New: search + fetch + organize papers |
| `interview-ingest` | New: audio/PDF conversion |
| `document-conversion` | New: intelligent format conversion |
| `deep-reasoning` | Wraps Sequential Thinking MCP |
| `paradox-navigation` | Wraps Lotus Wisdom MCP |
| `analysis-orchestration` | Enhanced model selection |
| `coding-workflow` | Enhanced batch processing |
| `project-dashboard` | Enhanced `/qual-status` |
| `coherence-check` | Enhanced `/qual-examine-assumptions` |

**You don't need to learn new commands.** Skills are invoked automatically based on what you ask. Say "help me transcribe my interviews" and Claude loads `interview-ingest`.

---

### What Changed

#### Commands

All your commands still work exactly the same:
- `/qual-init`, `/qual-status`, `/qual-check-setup` - unchanged
- `/qual-think-through`, `/qual-wisdom-check` - unchanged
- `/qual-configure-analysis`, `/qual-reflect` - unchanged

**New commands in v0.2.0:**
- `/qual-memo` - Write analytical memos (Stage 1)
- `/qual-parallel-streams` - Run theoretical + empirical streams (Stage 2)
- `/qual-code-deductive` - Apply framework to documents (Stage 2)
- `/qual-characterize-patterns` - Systematic variation analysis (Stage 2)
- `/qual-synthesize` - Integrate streams (Stage 2)

#### Templates Location

**Before (v0.1.0):**
```
templates/
├── gioia-data-structure.md
├── analytical-memo.md
└── ...
```

**After (v0.2.0):**
```
skills/
├── gioia-methodology/
│   └── templates/
│       └── gioia-data-structure.md
├── coding-workflow/
│   └── templates/
│       └── conversation-log-spec.md
└── ...
```

**Impact:** If you referenced template paths directly, update them. If you just used commands, no change needed.

#### Config Files

Your existing `.interpretive-orchestration/` folder remains compatible. No migration needed.

---

### What's Better

#### Graceful Degradation

Skills now work at multiple capability tiers based on available MCPs:

**literature-sweep:**
- Tier 1: Exa search + Jina fetch (full automation)
- Tier 2: Your URLs + Jina fetch
- Tier 3: Your URLs + WebFetch (no API keys needed)

**document-conversion:**
- Tier 1: MinerU (90%+ accuracy for complex PDFs)
- Tier 2: Manual conversion (Adobe Acrobat, Google Docs OCR)

#### New MCP: MinerU

v0.2.0 adds MinerU for high-accuracy PDF parsing:
- Complex tables with merged cells
- Multi-column layouts
- Figures and charts
- Academic papers with formulas

Requires `MINERU_API_KEY` - falls back to manual conversion if not configured.

#### State Management

New JavaScript scripts for deterministic state operations:
- `read-config.js` - Returns project state as JSON
- `update-progress.js` - Updates stage/document/memo counts
- `validate-config.js` - Schema validation

These run automatically - you don't need to use them directly.

---

### Migration Checklist

1. **Update plugin:** `claude plugin update interpretive-orchestration@interpretive-orchestration`
2. **Verify setup:** `/qual-check-setup` (should show v0.2.0)
3. **Existing projects:** Continue working normally - fully compatible
4. **Optional:** Add MinerU API key for better PDF handling

---

## Questions?

- See [CHANGELOG.md](CHANGELOG.md) for full release notes
- See [DEPENDENCIES.md](DEPENDENCIES.md) for MCP setup
- See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues
