# Changelog: Interpretive Orchestration for Kimi CLI

## v1.0.2 (2026-02-06)

- Port `qual-coherence-check` skill from Claude Code (philosophical coherence examination)
- Skill count: 12 (exact parity with Claude Code)
- Convention cleanup: StateManager import, pathlib, type hints, path traversal protection

## v1.0.1 (2026-02-02)

- Port `qual-analysis-orchestration` (Kimi K2.5 cost estimation, 180 lines)
- Port `qual-methodological-rules` (9 scripts, ~4,500 lines):
  - Phase 1: Rule generation, preset application, phase detection
  - Phase 2: Strain detection, saturation tracking
  - Phase 3: Workspace branching, visualization, team management
- 6 methodology presets: Gioia, Charmaz, Straussian GT, Glaserian GT, Phenomenology, Ethnography
- 21 new tests added
- Dependencies: Jinja2 (templates), PyYAML (config), rich (dashboards)

## v1.0.0 (2026-01)

- Initial Kimi CLI port: 9 skills, 11 Python infrastructure modules (~3,500 lines)
- Built by ~10 Kimi agents, reviewed and fixed by Codex (OpenAI)
- Core: qual-init, qual-status, qual-coding, qual-reflection, qual-gioia, qual-literature, qual-ingest, qual-convert, qual-shared
- 4 stage agents + router, 3 stage contexts, complete example project
- Cross-platform support (Unix/Windows), atomic file operations, file locking

---

## Key Metrics (v1.0.2)

- 12 skills (8 core + 4 advanced), 12/12 parity with Claude Code
- 4 stage agents + 1 router
- ~20 Python infrastructure modules
- 33+ tests (integration, E2E, performance)
- Cold start: <200ms, warm start: ~10ms

## Known Limitations

- Parallel streams: conceptual only (no Task tool parallelism)
- Chinese localization: framework ready, content English-only
- Drift detection: friction-based, no automated algorithm yet
- Dynamic agents: static YAMLs only

## Credits

- **Kimi team** (~10 agents, 2026-01): Core infrastructure and first 9 skills
- **Codex** (OpenAI, 2026-01): Cross-platform locking fixes, code review
- **Claude Sonnet 4.5** (2026-02-02): Methodological-rules and analysis-orchestration ports
- **Claude Opus 4.6** (2026-02-06): Coherence-check port, convention cleanup, docs consolidation
- **Methodology:** Xule Lin & Kevin Corley (Imperial College London)

## Citation

```
Lin, X. (2025). Cognitio Emergens: The Generative Dance of Human-AI Partnership
  in Qualitative Discovery. arXiv:2505.03105.
```
