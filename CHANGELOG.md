# Changelog

All notable changes to Interpretive Orchestration: Epistemic Partnership System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
