# Upgrade Guide: v0.1.0 → v0.2.0

If you were using v0.1.0 (MVEP Release), here's what changed in v0.2.0 (Skills Infrastructure Release).

---

## What's New

### Skills System

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

## What Changed

### Commands

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

### Templates Location

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

### Config Files

Your existing `.interpretive-orchestration/` folder remains compatible. No migration needed.

---

## What's Better

### Graceful Degradation

Skills now work at multiple capability tiers based on available MCPs:

**literature-sweep:**
- Tier 1: Exa search + Jina fetch (full automation)
- Tier 2: Your URLs + Jina fetch
- Tier 3: Your URLs + WebFetch (no API keys needed)

**document-conversion:**
- Tier 1: MinerU (90%+ accuracy for complex PDFs)
- Tier 2: Markdownify (good for simple docs, audio)
- Tier 3: Manual guidance

### New MCP: MinerU

v0.2.0 adds MinerU for high-accuracy PDF parsing:
- Complex tables with merged cells
- Multi-column layouts
- Figures and charts
- Academic papers with formulas

Requires `MINERU_API_KEY` - falls back to Markdownify if not configured.

### State Management

New JavaScript scripts for deterministic state operations:
- `read-config.js` - Returns project state as JSON
- `update-progress.js` - Updates stage/document/memo counts
- `validate-config.js` - Schema validation

These run automatically - you don't need to use them directly.

---

## Migration Checklist

1. **Update plugin:** `/plugin update linxule/interpretive-orchestration`
2. **Verify setup:** `/qual-check-setup` (should show v0.2.0)
3. **Existing projects:** Continue working normally - fully compatible
4. **Optional:** Add MinerU API key for better PDF handling

---

## Questions?

- See [CHANGELOG.md](CHANGELOG.md) for full release notes
- See [DEPENDENCIES.md](DEPENDENCIES.md) for MCP setup
- See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues
