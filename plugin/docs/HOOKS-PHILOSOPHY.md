# Hook Philosophy Documentation

This document preserves the philosophical rationale for each hook in the Interpretive Orchestration plugin. These hooks enforce methodological rigor that optional guidelines cannot achieve.

**Design Philosophy:** Design prevents problems; guidelines only request compliance. Hooks make philosophical commitments operational, not just aspirational.

---

## Hook Overview

| Hook | Claude Code event | Stops work? | Purpose |
|------|-------------------|-------------|---------|
| PreStage2 | PreToolUse, UserPromptExpansion | Asks the researcher to confirm | Enforces Stage 1 completion |
| PostFiveDocuments | PostToolUse (SubagentStop for background agents) | No | Interpretive pause every 5 documents |
| EpistemicCoherence | PostToolUse (SubagentStop for background agents) | No | Validates philosophical consistency |
| PostSynthesis | Stop, declared by `/qual-synthesize` | No | Generates audit trail |
| PostPhaseTransition | PostToolUse, SubagentStop, and Stop declared by the stage commands | No | Updates methodological rules |
| SessionEnd | SessionEnd | No | Reflexivity prompt (not shown; the session end is logged) |

---

## Individual Hook Rationales

### PreStage2 (asks to confirm)

**Script:** `hooks/check-stage1-complete.js`

**Rationale:** AI cannot develop YOUR theoretical sensitivity. Manual Stage 1 engagement creates interpretive foundation that makes Stage 2 collaboration meaningful. The sandwich starts with human bread!

**Prevents:** Calculator mindset where researchers skip foundational engagement and treat AI as mere automation.

**Triggered by:** `@dialogical-coder`, `/qual-parallel-streams`, `/qual-synthesize`, `/qual-code-deductive`, `/qual-characterize-patterns`

**What the researcher sees:** if Stage 1 is not complete, Claude Code shows what the check found and asks whether to go ahead. The researcher can stop, or proceed knowingly.

---

### PostFiveDocuments (Non-blocking)

**Script:** `hooks/interpretive-pause.js`

**Rationale:** From Appendix A: "Structured interpretive pauses: after every five documents within an archetype, at transitions between archetypes, and whenever edge cases appeared." Prevents mechanical coding without reflection.

**Prevents:** Pattern-matching without theoretical engagement.

**Triggered by:** `@dialogical-coder` (with internal document count check)

---

### EpistemicCoherence (Non-blocking)

**Script:** `hooks/check-coherence.js`

**Rationale:** Philosophical coherence matters - can't mix objectivist discovery language with constructivist stance. Maintains internal consistency.

**Prevents:** Mixing incompatible ontologies that undermine analytical rigor.

**Triggered by:** `@dialogical-coder`

---

### PostSynthesis (Non-blocking)

**Script:** `hooks/generate-audit-trail.js`

**Rationale:** Confirmability through transparent documentation. Every analytical decision traced and justified.

**Prevents:** Black-box synthesis where decisions are opaque.

**Triggered by:** `/qual-synthesize`

---

### PostPhaseTransition (Non-blocking)

**Script:** `hooks/post-phase-transition.js`

**Rationale:** Methodological rules should adapt to analytical phase. What's forbidden during open coding becomes appropriate at synthesis. Rules are a conscience, not a cage.

**Prevents:** Rules remaining inappropriately restrictive after legitimate phase progression.

**Triggered by:** `/qual-advance-stage`, `/qual-complete-stage1`, `/qual-parallel-streams`, `/qual-synthesize`, `/qual-characterize-patterns`, `@dialogical-coder`

---

### SessionEnd (Non-blocking)

**Script:** `hooks/session-reflect.js`

**Rationale:** Constructivist reflexivity - researcher position shapes interpretation. Regular reflection builds epistemic awareness.

**Prevents:** Unreflective coding that ignores researcher's interpretive role.

**Triggered by:** Session end events

**Limit:** Claude Code does not show hook output at session end, so the researcher does not see this prompt. The hook still records the session end in `.interpretive-orchestration/conversation-log.jsonl`.

---

## Meta-Philosophy

**Without hooks:** User might skip Stage 1, lose interpretive depth, treat AI as calculator.

**With hooks:** PreStage2 stops at the door of Stage 2 and asks, so skipping the foundation becomes a conscious choice rather than a drift. This keeps foundational engagement at the center of the partnership.

Hooks transform philosophical commitments from aspirational statements into operational constraints. They encode the epistemology of Partnership Agency into the infrastructure itself.

---

## How the hooks are wired

The methodology scripts in `hooks/` (`check-stage1-complete.js` and the rest) print plain text for the researcher. Claude Code sends hooks a JSON payload and reads JSON back. An adapter, `hooks/run-hook.js`, connects the two.

`hooks/hooks.json` registers every hook as `node "${CLAUDE_PLUGIN_ROOT}/hooks/run-hook.js" <script>.js`:

| Claude Code event | Matcher | Scripts |
|-------------------|---------|---------|
| PreToolUse | `Agent\|Task\|Skill` | `check-stage1-complete.js` |
| UserPromptExpansion (a typed `/qual-*` command) | any | `check-stage1-complete.js` |
| PostToolUse | `Agent\|Task` | `interpretive-pause.js`, `check-coherence.js`, `post-phase-transition.js` |
| SubagentStop | any | the same three scripts, for background agents |
| SessionEnd | any | `session-reflect.js` |

For each call, the adapter:

1. Reads the payload and works out which agent or skill the call targets.
2. Exits quietly unless that target is one the script was written for. The `TRIGGERS` table in `run-hook.js` lists them, and matches the "Triggered by" lines above.
3. Runs the script from the researcher's project folder, so it finds `.interpretive-orchestration/`.
4. Turns the script's output into Claude Code's hook JSON.

What the researcher and Claude see:

- a failed Stage 1 check before an agent or skill call becomes a permission prompt (`ask`), with the script's explanation as the reason
- a failed Stage 1 check on a typed command shows the explanation to the researcher and tells Claude to ask whether to proceed, and why, before doing anything else
- after-agent notices (the interpretive pause, coherence prompts, rule updates) go to the researcher and are added to Claude's context
- a background agent returns as soon as it launches, so its after-agent hooks wait for `SubagentStop` and run once

Two hooks follow a command rather than an agent. They are Stop hooks declared in the frontmatter of the skill they follow:

- `/qual-synthesize` runs `generate-audit-trail.js`, then `post-phase-transition.js`
- `/qual-advance-stage`, `/qual-complete-stage1`, `/qual-parallel-streams` and `/qual-characterize-patterns` run `post-phase-transition.js`

A command's work can span several replies, for example while it waits for the researcher's answers. So these hooks run at the end of every reply once the command has started, and report only news. The phase transition speaks only when rules change. The audit trail tells the researcher the first time, then rewrites `outputs/audit-trail.md` quietly, so it covers the whole synthesis.

The adapter never blocks the researcher because of its own error: if something goes wrong, it exits and lets work continue. Run without a payload (for example, from a terminal), a script behaves exactly as it did before 0.3.0.

Other platforms load hooks differently. Codex, Copilot CLI and Kimi Code are covered in [INSTALL.md](../INSTALL.md).

---

*See `hooks/hooks.json.old` for the original configuration with inline philosophy fields.*
