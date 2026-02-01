# Hooks Philosophy

This document explains *why* the plugin enforces certain practices through automated hooks. It's written for researchers who want to understand the methodological rationale and for developers who may extend the system.

## The Sandwich Methodology

The plugin follows a "sandwich" approach: **Human → AI → Human**

- **Stage 1 (top bread):** You code manually to build theoretical sensitivity
- **Stage 2 (filling):** AI assists with scaling while you maintain interpretive authority
- **Stage 3 (bottom bread):** You lead theoretical integration and meaning-making

The hooks exist to protect this structure and ensure AI assistance enhances rather than replaces your interpretive work.

## Core Principle

> **Design prevents problems; guidelines only request compliance.**

Without hooks, users might skip Stage 1, lose interpretive depth, and treat AI as a calculator. With hooks, the system enforces foundational engagement and ensures genuine epistemic partnership.

---

## Hook Documentation

### PreStage2 (check-stage1-complete.js)

**Event:** PreToolUse
**Triggers on:** `@dialogical-coder`, `/qual-parallel-streams`, `/qual-synthesize`, `/qual-code-deductive`, `/qual-characterize-patterns`

**Purpose:** Enforces sandwich methodology by preventing Stage 2 AI collaboration without Stage 1 human foundation. This is non-negotiable for epistemic partnership.

**Philosophy:**
> AI cannot develop YOUR theoretical sensitivity. Manual Stage 1 engagement creates interpretive foundation that makes Stage 2 collaboration meaningful. The sandwich starts with human bread!

**Prevents:** Calculator mindset where researchers skip foundational engagement and treat AI as mere automation.

---

### PostFiveDocuments (interpretive-pause.js)

**Event:** PostToolUse
**Triggers on:** `@dialogical-coder`

**Purpose:** Interpretive pause after every 5 documents coded - directly from the methodology. Prompts researcher to consolidate patterns and check theoretical coherence.

**Philosophy:**
> From Appendix A: "Structured interpretive pauses: after every five documents within an archetype, at transitions between archetypes, and whenever edge cases appeared." Prevents mechanical coding without reflection.

**Prevents:** Pattern-matching without theoretical engagement.

---

### SessionEnd (session-reflect.js)

**Event:** SessionEnd

**Purpose:** Reflexivity prompt at end of each coding session. Captures insights, assumptions examined, and learning.

**Philosophy:**
> Constructivist reflexivity - researcher position shapes interpretation. Regular reflection builds epistemic awareness.

**Prevents:** Unreflective coding that ignores researcher's interpretive role.

---

### EpistemicCoherence (check-coherence.js)

**Event:** PostToolUse
**Triggers on:** `@dialogical-coder`

**Purpose:** Checks that analytical moves align with declared philosophical stance. Validates consistency between ontology, epistemology, and practice.

**Philosophy:**
> Philosophical coherence matters - can't mix objectivist discovery language with constructivist stance. Maintains internal consistency.

**Prevents:** Mixing incompatible ontologies that undermine analytical rigor.

---

### PostSynthesis (generate-audit-trail.js)

**Event:** PostToolUse
**Triggers on:** `/qual-synthesize`

**Purpose:** After synthesis, automatically generate audit trail documentation for confirmability and transparency.

**Philosophy:**
> Confirmability through transparent documentation. Every analytical decision traced and justified.

**Prevents:** Black-box synthesis where decisions are opaque.

---

### PostPhaseTransition (post-phase-transition.js)

**Event:** PostToolUse
**Triggers on:** `/qual-advance-stage`, `/qual-complete-stage1`, `/qual-parallel-streams`, `/qual-synthesize`, `/qual-characterize-patterns`, `@dialogical-coder`

**Purpose:** Updates methodological rules when analytical phase changes. Rules automatically relax at their designated phase.

**Philosophy:**
> Methodological rules should adapt to analytical phase. What's forbidden during open coding becomes appropriate at synthesis. Rules are a conscience, not a cage.

**Prevents:** Rules remaining inappropriately restrictive after legitimate phase progression.

---

## Meta-Cognition

Hooks make philosophical commitments operational, not just aspirational.

| Without Hooks | With Hooks |
|---------------|------------|
| User might skip Stage 1 | PreStage2 blocks Stage 2 access |
| Lose interpretive depth | Forcing foundational engagement |
| Treat AI as calculator | Ensuring genuine partnership |
