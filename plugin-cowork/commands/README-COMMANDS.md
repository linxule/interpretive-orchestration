# Commands: Cowork (Claude Desktop) Version

## Structure

Claude Desktop requires a **flat command structure** - all commands are directly in `commands/` with a `qual-` prefix. This differs from the Claude Code CLI version which uses nested subdirectories.

## All Commands

### Project Commands
| Command | Purpose |
|---------|---------|
| `qual-init` | Initialize project with Socratic onboarding |
| `qual-status` | Navigate atelier journey, see progress |
| `qual-check-setup` | Verify plugin installation and configuration |
| `qual-configure-analysis` | Model selection, cost estimation, batch processing |
| `qual-design` | Configure research design (cases, waves, isolation rules) |
| `qual-advance-stage` | Transition between stages with validation |

### Stage 1 Commands
| Command | Purpose |
|---------|---------|
| `qual-memo` | Capture analytical memos during manual coding |
| `qual-stage1-guide` | Comprehensive guidance for Stage 1 manual coding |
| `qual-complete-stage1` | Validate foundation and transition to Stage 2 |

### Stage 2 Commands
| Command | Purpose |
|---------|---------|
| `qual-parallel-streams` | Run theoretical + empirical streams |
| `qual-synthesize` | Synthesize findings across streams |
| `qual-code-deductive` | Deductive coding with existing framework |
| `qual-characterize-patterns` | Systematic pattern characterization |

### Analysis Commands (Stage-Agnostic)
| Command | Purpose |
|---------|---------|
| `qual-reflect` | Synthesis dialogue |
| `qual-think-through` | Sequential Thinking for deep reasoning |
| `qual-wisdom-check` | Lotus Wisdom for paradox navigation |
| `qual-examine-assumptions` | Reflexive assumption examination |

---

## Why Flat Structure?

Claude Desktop plugins require all command files directly in the `commands/` folder. The `qual-` prefix groups them logically while maintaining discoverability.

The Claude Code CLI version uses nested directories (`commands/project/`, `commands/analysis/`, etc.) which isn't supported in Desktop mode.

---

## For AI Agents Reading This

All 17 commands are in this flat directory. Use the `qual-` prefix table above to find the right command for the researcher's current need.
