# Hook Philosophy Documentation

This document preserves the philosophical rationale for each hook in the Interpretive Orchestration plugin. These hooks enforce methodological rigor that optional guidelines cannot achieve.

**Design Philosophy:** Design prevents problems; guidelines only request compliance. Hooks make philosophical commitments operational, not just aspirational.

---

## Hook Overview

| Hook | Event | Blocking | Purpose |
|------|-------|----------|---------|
| PreStage2 | PreToolUse | Yes | Enforces Stage 1 completion |
| PostFiveDocuments | PostToolUse | No | Interpretive pause every 5 documents |
| EpistemicCoherence | PostToolUse | No | Validates philosophical consistency |
| PostSynthesis | PostToolUse | No | Generates audit trail |
| PostPhaseTransition | PostToolUse | No | Updates methodological rules |
| SessionEnd | SessionEnd | No | Reflexivity prompt |

---

## Individual Hook Rationales

### PreStage2 (Blocking)

**Script:** `hooks/check-stage1-complete.js`

**Rationale:** AI cannot develop YOUR theoretical sensitivity. Manual Stage 1 engagement creates interpretive foundation that makes Stage 2 collaboration meaningful. The sandwich starts with human bread!

**Prevents:** Calculator mindset where researchers skip foundational engagement and treat AI as mere automation.

**Triggered by:** `@dialogical-coder`, `/qual-parallel-streams`, `/qual-synthesize`, `/qual-code-deductive`, `/qual-characterize-patterns`

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

---

## Meta-Philosophy

**Without hooks:** User might skip Stage 1, lose interpretive depth, treat AI as calculator.

**With hooks:** PreStage2 blocks Stage 2 access, forcing foundational engagement, ensuring partnership.

Hooks transform philosophical commitments from aspirational statements into operational constraints. They encode the epistemology of Partnership Agency into the infrastructure itself.

---

*See `hooks/hooks.json.old` for the original configuration with inline philosophy fields.*
