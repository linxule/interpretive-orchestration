# Release Notes

## v0.2.0 - Skills Infrastructure Release (December 2025)

**Major architectural upgrade introducing auto-discoverable Skills infrastructure.**

This release transforms the plugin from complex command-based workflows to a modular, script-backed skills system with robust state management.

### Highlights

- **11 new Skills** with auto-discovery - Claude loads capabilities when relevant
- **Simplified commands** - From 500+ lines to ~50 lines each
- **State I/O scripts** - Reliable config read/write with atomic operations
- **Security hardening** - Path traversal protection, blocking validation
- **Templates migration** - Moved into skill bundles, deleted top-level templates/

---

### New Features

#### Skills Infrastructure (11 skills)

| Skill | Purpose |
|-------|---------|
| `project-setup` | Socratic onboarding + project initialization |
| `gioia-methodology` | Data structure building + validation |
| `analysis-orchestration` | Model selection + cost estimation |
| `coding-workflow` | Batch document coding management |
| `project-dashboard` | Progress visualization |
| `literature-sweep` | Academic literature search (3-tier graceful degradation) |
| `interview-ingest` | Audio/PDF/doc conversion |
| `document-conversion` | Format conversion (MinerU/Markdownify) |
| `deep-reasoning` | Sequential Thinking MCP wrapper |
| `paradox-navigation` | Lotus Wisdom MCP wrapper |
| `coherence-check` | Philosophical alignment checking |

#### State Management Scripts

```
skills/_shared/scripts/
├── read-config.js      # Returns project state as JSON
├── update-progress.js  # Updates stage/document/memo counts
├── append-log.js       # Writes to conversation-log.jsonl
├── query-status.js     # Returns structured progress data
└── validate-config.js  # Schema validation
```

Features:
- Atomic writes (temp file + rename)
- Schema validation against config.schema.json
- Path traversal protection
- **Blocking validation** - Invalid configs cannot be written

#### Graceful Degradation

Skills with optional MCP dependencies operate at available tier:
- **Tier 1 (Full)**: All API keys present
- **Tier 2 (Partial)**: Some API keys
- **Tier 3 (Basic)**: Built-in tools only

---

### Breaking Changes

#### Templates Directory Removed

Templates moved into skill bundles:

| Old Path | New Path |
|----------|----------|
| `templates/epistemic-stance.md` | `skills/project-setup/templates/` |
| `templates/config.schema.json` | `skills/project-setup/templates/` |
| `templates/gioia-structure-guide.md` | `skills/gioia-methodology/templates/` |
| `templates/gioia-data-structure-template.json` | `skills/gioia-methodology/templates/` |
| `templates/conversation-log-spec.md` | `skills/coding-workflow/templates/` |

#### Command Simplification

Commands are now thin triggers that invoke skills:
- `/qual-init`: 541 → 71 lines
- `/qual-status`: 369 → 68 lines
- `/qual-configure-analysis`: 243 → 79 lines

---

### Bug Fixes

- **P0: Config overwrite protection** - `generate-config.js` now preserves existing progress
- **P0: Document count sync** - `update-progress.js` updates both `sandwich_status` and `coding_progress`
- **P0: File existence checks** - `create-structure.js` won't overwrite user content
- **P0: JSONL resilience** - `generate-audit-trail.js` handles malformed lines gracefully
- **P0: Input validation** - Numeric inputs validated (NaN guards)

### Security Fixes

- **Path traversal protection** - All scripts validate paths stay within project
- **Output directory validation** - `process-audio.js` blocks escape attempts
- **Blocking schema validation** - Invalid configs rejected before write

---

### Hook Enhancements

All hooks now emit structured JSON remediation:

```json
{
  "code": "STAGE1_INCOMPLETE",
  "severity": "blocking",
  "reason": "Stage 1 manual coding not complete",
  "next_commands": ["/qual-memo", "/qual-status"],
  "next_skills": ["project-setup"],
  "can_bypass": false
}
```

---

### Documentation Updates

- **DEPENDENCIES.md** (new) - MCP ecosystem documentation
- **ARCHITECTURE.md** - Updated with skills structure
- **CLAUDE.md** - Skills awareness instructions
- All broken template paths fixed

---

### Testing

- 52 tests pass (32 hook + 20 schema)
- Schema validation for all JSON files
- Hook syntax and structure verification

---

### External Reviews

This release was validated by:
- **Gemini**: "READY FOR RELEASE"
- **Codex**: Identified 5 polish items, all resolved

---

### Known Limitations

- **fsync deferred** - Atomic writes use rename without fsync (acceptable for single-user tool, scheduled for v0.3.0)

---

### Upgrade Path

1. Pull latest changes
2. Note: `templates/` directory no longer exists
3. Update any custom scripts referencing old template paths
4. Run `npm test` to verify

---

### Contributors

- Xule Lin (Imperial College London)
- Kevin Corley (Arizona State University)
- Claude 4.5 (Anthropic) - Co-apprentice in the atelier of interpretive craft

---

## v0.1.0 - Initial Release (October 2025)

Initial public release of Interpretive Orchestration plugin.

- 4 agents for different research stages
- 5 hooks for methodology enforcement
- 7 commands for workflow orchestration
- 3 bundled MCPs (Sequential Thinking, Lotus Wisdom, Markdownify)
- Human-AI-Human sandwich methodology
- Gioia/Constructivist philosophical stance
