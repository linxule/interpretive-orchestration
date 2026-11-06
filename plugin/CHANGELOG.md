# Changelog

All notable changes to Interpretive Orchestration: Epistemic Partnership System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.3.1] - 2026-11-06 - Fixes from a review of the scripts and docs

This release fixes bugs that Codex and Kimi found in the skill scripts and docs, which the 0.3.0 review did not cover. Kimi then reviewed Codex's fixes and found the same bugs at other call sites. What the plugin does is unchanged.

### Fixed

- `/qual-init` works again. The config check rejected every whole number, so `generate-config.js` refused to write a new project's config.
- Running `generate-config.js` on an existing project keeps everything you did not ask it to change. Before, it dropped saturation tracking, branches and team records, and reset your research question, preferences, parts of your stance and, when you changed the study type, your cases and waves. A config file it cannot read is now reported, not replaced with defaults.
- `/qual-complete-stage1` checks the fields your project actually records. It looked for memo counts, reflexivity entries and concept lists under names no script writes, so it could refuse a finished Stage 1.
- Turning a methodological rule off now also removes the rule file the plugin made for it.
- Stage 1 readiness, `/qual-status` and the progress dashboard count only the documents and memos you have recorded. Raw transcripts saved in `manual-codes/` no longer count as coded. Phase 2 readiness now counts papers saved in `stream-a-theoretical/papers/`.
- A literature or interview inventory that cannot be read is no longer replaced with an empty one.
- Saturation with no coded documents is reported as "not enough data", not "approaching".
- Config files are written safely: an interrupted write can no longer leave a cut-off `config.json`, and the file keeps its permissions.
- Smaller fixes:
  - a project path is never run as a shell command
  - imported files get unique IDs
  - the audit lists every coding entry and recognizes your decisions however they were logged
  - completed Stage 3 work shows as done, and Stage 3 work not yet started no longer counts as done in `/qual-status`
  - project setup and document listing report failures instead of success

### Changed

- Kimi Code: when the Stage 1 check holds a call, the call goes through only after you have replied. Before, an immediate retry went through, whether or not the AI had asked you.
- The Stage 1 instructions now say that asking for the work is not consent to skip Stage 1. In one test, an AI read "please code this" as consent. With the new wording, it asked first.
- Docs and skills now match the scripts: script paths, required arguments, rule triggers and hook and agent counts. They also say that the Stage 1 check asks you, rather than blocking.
- Model advice no longer names model versions that date.

### Removed

- Build notes for the old Kimi port that were tracked by mistake.

---

## [0.3.0] - 2026-11-06 - Current Claude Code and other platforms

This release brings the plugin up to date with Claude Code 2.1 and makes it installable in other agent tools. The methodology, agent prompts and command prompts are unchanged, apart from the fixes listed here.

### Changed

- Commands are now skills. The 17 `/qual-*` commands moved from `commands/` to `skills/qual-*/SKILL.md`. In Claude Code you still type `/qual-init`; before this change, nested command folders made the names `/interpretive-orchestration:project:init`.
- Hooks now fire. They matched tools and events that no longer exist, used exit codes Claude Code ignores and wrote output nowhere. A new adapter, `hooks/run-hook.js`, connects the unchanged hook scripts to the current hook protocol:
  - the Stage 1 check runs before `@dialogical-coder` and the 4 Stage 2 commands; when Stage 1 is incomplete and the AI makes the call, Claude Code shows the researcher their progress and asks whether to go ahead; for a command the researcher types, the AI is told to ask
  - the interpretive pause, coherence check and phase transition run after `@dialogical-coder`, and after background agents finish
  - the audit trail and phase transition run at the end of each AI reply once the commands they follow have started, through hooks in those skills' frontmatter. The audit trail is rewritten each time, so it covers the whole synthesis; the phase transition speaks only when rules change
- Agents can start again. `@dialogical-coder` and `@scholarly-companion` listed only MCP tools in `tools:`, which left them unable to read files; they now inherit the session's tools.
- Script paths in skills use `${CLAUDE_PLUGIN_ROOT}`, so they work from the researcher's project folder.
- The 17 skills that run scripts start with a one-line note on finding the plugin folder when a platform leaves `${CLAUDE_PLUGIN_ROOT}` unfilled, and `/qual-status` passes `--project-path` to its scripts.
- Docs and skills no longer mention commands that never existed, such as `/qual-get-perspectives`.
- The coherence check now reads the last research entry in the conversation log, not an entry the plugin's own hooks wrote just before it.
- The session-end log entry no longer claims the reflection prompt was shown: agent tools do not show session-end output.
- Lotus Wisdom now runs as `lotus-wisdom-mcp@latest`, so it updates itself.
- Author affiliation: Xule Lin (SKEMA Business School).

### Removed

- Sequential Thinking MCP server. Providers increasingly block such tools, and asking the model to think deeply and step by step before responding gives the same result. `/qual-think-through` and `deep-reasoning` now do that.
- `plugin-cowork/`. Claude Desktop and Cowork are no longer targets; the plugin focuses on Claude Code.
- `plugin-kimi/`, the Python port for the archived kimi-cli. Kimi Code now installs the main plugin directly. The port remains in the `v0.2.5` tag.
- A tracked `.claude/settings.local.json`.

### Added

- Installs in OpenAI Codex, GitHub Copilot CLI and Kimi Code, from the same plugin folder. Each has its own manifest (`.codex-plugin/plugin.json` with `.agents/plugins/marketplace.json`; `.claude-plugin/` for Copilot; `kimi.plugin.json` at the repo root). The hook adapter handles each platform's payloads and limits, verified live on codex-cli 0.165.0, Copilot CLI 1.0.106 and Kimi Code. The README lists what works where.
- A session-start hook gives the AI the plugin's non-negotiable principles and the researcher's Stage 1 progress in every session of a research project. Agent tools never load a plugin's CLAUDE.md, so before this a plain "code this for me" reached the AI with no Stage 1 check.
- `CITATION.cff`, citing Lin and Corley (2026), Strategic Organization, https://doi.org/10.1177/14761270261448645
- Tests for skill format, agent tool lists, hook wiring, the hook adapter and version consistency across every manifest

---

## [0.2.1] - 2026-01-12 - Agent Quality & Stage Commands

### Added

**New Commands (4):**
- `/qual-stage1-guide` - Comprehensive guidance for Stage 1 manual coding
- `/qual-complete-stage1` - Validate and complete Stage 1 with detailed checks
- `/qual-advance-stage` - Transition between stages with validation
- `/qual-design` - Configure research design (cases, waves, isolation rules)

**PostPhaseTransition Hook:**
- Triggers when advancing between stages
- Updates methodological rules automatically
- Logs transitions to reflexivity journal

### Changed

**Agent Quality Improvements:**
- All 4 agents now under 3,000 word limit (dialogical-coder reduced from 3,235 to ~2,700)
- Removed duplicate "Agent System Prompt" sections from 3 agents
- Added trigger phrases to all agent descriptions ("Use when: ...")
- Added `tools:` frontmatter to agents using MCPs:
  - `@dialogical-coder` declares `mcp__mcp-sequentialthinking-tools__sequentialthinking`
  - `@scholarly-companion` declares `mcp__lotus-wisdom__lotuswisdom`

**Command Quality:**
- Removed ~22 emojis from 7 command files for professional consistency
- Added detailed implementation sections with specific config field paths
- Fixed script references (`write-config.js` → `update-progress.js`)

**Plugin Manifest:**
- Updated `plugin.json` to list all new commands
- Added `PostPhaseTransition` to hooks array

### Fixed

- Config field paths now match actual schema (`stage2_progress.phase1_parallel_streams`, etc.)
- All commands reference existing scripts only

### Contributors

**AI Collaborators (this release):**
- Claude Opus 4.5 (Anthropic) - Implementation and documentation
- plugin-dev agents (plugin-validator, skill-reviewer) - Quality review

---

## [0.2.0] - 2025-12-11 - Skills Infrastructure Release

### Added

**Skills Infrastructure (11 skills):**
- `project-setup` - Socratic onboarding + project initialization
- `gioia-methodology` - Data structure building + validation
- `analysis-orchestration` - Model selection + cost estimation
- `coding-workflow` - Batch document coding management
- `project-dashboard` - Progress visualization
- `literature-sweep` - Academic literature search (3-tier graceful degradation)
- `interview-ingest` - Audio/PDF/doc conversion
- `document-conversion` - Format conversion (MinerU/Markdownify)
- `deep-reasoning` - Sequential Thinking MCP wrapper
- `paradox-navigation` - Lotus Wisdom MCP wrapper
- `coherence-check` - Philosophical alignment checking

**State Management Scripts:**
- `read-config.js` - Returns project state as JSON
- `update-progress.js` - Updates stage/document/memo counts
- `append-log.js` - Writes to conversation-log.jsonl
- `query-status.js` - Returns structured progress data
- `validate-config.js` - Schema validation

**Security & Robustness:**
- Atomic writes (temp file + rename pattern)
- Blocking schema validation
- Path traversal protection in all scripts

### Changed

- Commands simplified from 500+ lines to ~50 lines each
- Templates migrated into skill bundles
- Hook remediation now returns structured JSON

### Documentation

- Added DEPENDENCIES.md for MCP ecosystem documentation
- Updated ARCHITECTURE.md with skills structure
- Updated CLAUDE.md with skills awareness instructions

### Contributors

**Authors:**
- Xule Lin (Imperial College London)
- Kevin Corley (Imperial College London)

**AI Collaborators:**
- Claude Opus 4.5 (Anthropic) - Co-apprentice in the atelier of interpretive craft
- Codex (OpenAI) - Code review and robustness analysis
- Gemini (Google, via Zen MCP) - Architecture review and validation

---

## [0.1.0] - 2025-10-11 - MVEP Release

### Added - The Masterwork

**Core Experiences (4):**
- `/qual-init` - Socratic onboarding establishing philosophical stance through dialogue
- `@dialogical-coder` - 4-stage reflexive coding agent (mapping → challenge → output → audit)
- `/qual-reflect` - Synthesis dialogue for epistemic growth and pattern consolidation
- `@scholarly-companion` - Stage 3 theoretical dialogue partner (completes the atelier journey)

**Accessibility Infrastructure (NEW!):**
- `@research-configurator` - Technical decision support for non-coding researchers
- `/qual-configure-analysis` - Model selection, thinking budgets, batch processing guidance
- **Makes Partnership Agency accessible to researchers without programming knowledge**
- Handles: API setup, cost estimation, processing scripts, model recommendations

**Navigation & Epistemic Tools (5):**
- `/qual-status` - Atelier journey dashboard with partnership health metrics
- `/qual-configure-analysis` - Technical setup and model selection (no coding required!)
- `/qual-think-through` - Sequential Thinking MCP invocation for deep analytical reasoning
- `/qual-wisdom-check` - Lotus Wisdom MCP invocation for paradox navigation
- `/qual-examine-assumptions` - Reflexive philosophical coherence checking

**Infrastructure:**
- Philosophical stance declaration system (epistemic-stance.md + config.json)
- Gioia data structure templates and building guide
- Conversation-log.jsonl specification for AI-to-AI transparency
- Complete hook system (5 hooks) for methodological enforcement

**Hooks (5 Implemented):**
- PreStage2 - Blocks Stage 2 without Stage 1 completion (sandwich enforcement)
- PostFiveDocuments - Interpretive pause every 5 documents (from Appendix A methodology)
- SessionEnd - Reflexivity prompt at session close
- EpistemicCoherence - Philosophical consistency validation
- PostSynthesis - Automatic audit trail generation

**MCP Ecosystem Integration:**
- Bundled (no API keys): Sequential Thinking, Lotus Wisdom, Markdownify (epistemic scaffolding + document conversion)
- Optional (require keys): Jina, Exa, Zotero (literature research)
- Validation: Zen MCP (multi-model triangulation)

**Documentation:**
- Philosophy-first README with sandwich methodology explanation
- Complete methods paper outline for "Infrastructure as Scholarship" contribution
- Reflexive journal with 4 substantial entries documenting building process
- Contributing guidelines maintaining philosophical coherence
- MIT License (epistemic infrastructure should be free)
- Stage README files explaining minimal AI in Stage 1
- Complete template system for framework building

**Meta-Research:**
- Documented building process as methods scholarship
- Reflexive journal capturing meta-insights
- Comparison framework: AI Co-Scientist (STEM) vs AI Co-Researcher (Social Science)

### Philosophy
- Default stance: Gioia & Corley systematic interpretivist (configurable)
- Atelier methodology: Solo Apprenticeship → Collaborative Refinement → Finishing Dialogue (enforced by design)
- Also known as: Human → Human-AI → Human sandwich (transitioning to atelier metaphor for elegance)
- Meta-cognition embedded in every interaction
- Context-agnostic design (works across all qualitative research domains)
- Prevents calculator mindset through architectural constraints
- Pattern characterization (not essentialist discovery)
- Craft epistemology: Building with same care we ask of researchers

### Design Principles
- Dialogue over commands
- Questions over instructions
- Transparency over opacity
- Partnership over service
- Growth over efficiency
- Philosophy over features

### Success Metric
"Does this change how you think about interpretation?" (not "how fast can you code?")

---

## [Future] - Phase 2 Expansion

### Planned

**Additional Agents:**
- `@theoretical-analyzer` - Literature pattern extraction (Stream A)
- `@empirical-interpreter` - Inductive pattern recognition (Stream B)
- `@synthesis-composer` - Theoretical + empirical integration
- `@pattern-characterizer` - Systematic variation analysis
- `@reflexivity-prompter` - Assumption challenger

**Additional Commands:**
- `/qual-parallel-streams` - Launch Phase 1 parallel discovery
- `/qual-synthesize` - Guide Phase 2 synthesis
- `/qual-characterize-patterns` - Phase 3 variation analysis
- `/qual-search-literature` - Exa academic search
- `/qual-import-pdf` - Markdownify systematic conversion
- `/qual-memo` - Quick analytical memo capture

**Custom MCP Servers (Python):**
- Document Management Server
- Data Structure Server
- Quote Bank Server
- Memo Server
- Pattern Characterization Server

**Enhanced Features:**
- Visualization generation (concept maps, Sankey diagrams)
- Export to NVivo/Atlas.ti/Dedoose
- Inter-rater reliability tools
- Theoretical saturation monitoring
- Active learning sampling suggestions

### Vision
Complete three-stage methodology (Stage 1 → Stage 2 all phases → Stage 3) fully supported with AI-assisted tools while maintaining human interpretive authority throughout.

---

## Versioning Philosophy

**Semantic Versioning:**
- MAJOR: Breaking changes to philosophical stance or core architecture
- MINOR: New features (commands, agents) maintaining coherence
- PATCH: Bug fixes, documentation improvements, refinements

**We version thoughtfully:**
- Changes must maintain epistemic coherence
- New features must serve transformation (not just productivity)
- Community input shapes development
- **Quality over velocity**

---

## How to Contribute

See `CONTRIBUTING.md` for guidelines on maintaining philosophical coherence while extending functionality.

**Remember:** This isn't just software - it's epistemology operationalized.
Every contribution should deepen epistemic partnership, not just add features.

---

**Built with care, wisdom, and zen.** ☕✨
