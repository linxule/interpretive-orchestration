# The Methodological Rules System

## Encoding Epistemological Commitment as Adaptive Infrastructure

---

**Purpose:** This document captures the design philosophy, theoretical contributions, and implementation details of the Methodological Rules System—a 4-wave innovation that transforms research design from implicit knowledge into enforceable, adaptive methodological guardrails.

**Status:** Complete implementation, pending beta testing.

**Relationship to METHODS-PAPER-OUTLINE.md:** This document can stand alone as a focused methods paper on the rules system, or integrate as Section 4.X / Appendix D of the broader plugin paper.

---

## Table of Contents

1. [Introduction: The Problem of Methodological Drift](#1-introduction-the-problem-of-methodological-drift)
2. [Theoretical Foundation: Rules as Epistemological Commitment](#2-theoretical-foundation-rules-as-epistemological-commitment)
3. [Wave 1: Foundation—Making Research Design Explicit](#3-wave-1-foundation-making-research-design-explicit)
4. [Wave 2: Intelligence—Rule Generation and Adaptation](#4-wave-2-intelligence-rule-generation-and-adaptation)
5. [Wave 3: Adaptation—Learning from Resistance](#5-wave-3-adaptation-learning-from-resistance)
6. [Wave 4: Advanced—Supporting the Messy Middle](#6-wave-4-advanced-supporting-the-messy-middle)
7. [Integration: How the Waves Work Together](#7-integration-how-the-waves-work-together)
8. [Theoretical Contributions](#8-theoretical-contributions)
9. [Connection to Existing Architecture](#9-connection-to-existing-architecture)
10. [Future Directions](#10-future-directions)

---

## 1. Introduction: The Problem of Methodological Drift

### 1.1 The Acceleration Problem

AI accelerates qualitative analysis. This is both its promise and its peril.

The same capability that helps a researcher move through transcripts more quickly can also accelerate *methodological contamination*—the subtle drift from declared research design to actual analytical practice that compounds with each AI-assisted decision.

Consider a researcher conducting a three-case comparative study. In traditional CAQDAS, maintaining case isolation during open coding requires discipline. You physically work in one case folder, write memos about that case, and deliberately avoid the other folders until you're ready for cross-case comparison. The friction of switching between files provides a natural check.

Now imagine the same researcher with an AI assistant. "What patterns are emerging across the cases?" is an easy question to ask—and an easy question for AI to answer. The AI has access to all the data. It doesn't know that cross-case comparison should wait until Phase 3. It doesn't understand that premature synthesis risks contaminating the emergence of patterns unique to each case. It simply answers the question.

This isn't a failure of the AI. It's a failure of the system to encode what the researcher knows implicitly: that their research design carries methodological commitments that shouldn't be violated, even when violations would be convenient.

### 1.2 The Gap in Current Tools

Current tools fail qualitative researchers in complementary ways:

**Traditional CAQDAS (NVivo, Atlas.ti, MAXQDA):**
- Manual operation enforces nothing about AI behavior
- No AI awareness of research design
- Researcher discipline alone prevents methodological drift

**Generic LLMs (ChatGPT, Claude without orchestration):**
- No methodology awareness whatsoever
- Equally happy to compare cases or keep them separate
- Research design is just context, not constraint

**Neither:**
- Research design as enforceable structure
- Rules that know when to relax
- Graduated friction that respects researcher agency

### 1.3 Our Contribution

The Methodological Rules System addresses this gap through a novel approach: **research design becomes methodological guardrails that adapt as the research evolves**.

This isn't rule enforcement in the traditional sense—binary allow/block that treats researchers as compliance problems. Instead, we implement *graduated friction* that treats researchers as methodologists making reasoned choices, while ensuring those choices are conscious, documented, and aligned with their declared epistemological commitments.

When a researcher declares a three-case comparative study with case isolation during open coding, the system:

1. Generates rules that guide behavior when working in case folders
2. Provides gentle reminders when actions might cross case boundaries
3. Asks for reasoning when boundaries are crossed during restricted phases
4. Documents overrides as methodological data points for the audit trail
5. Automatically relaxes rules when the researcher enters synthesis phases

The researcher remains in control. The system ensures that control is exercised consciously.

---

## 2. Theoretical Foundation: Rules as Epistemological Commitment

### 2.1 Why Generic Rules Fail

Claude Code supports path-based rules in `.claude/rules/`. You can specify that when working in `/api/**`, Claude should follow certain patterns. This is powerful for software engineering—different folders have different conventions, different teams, different concerns.

But qualitative research needs *methodology-aware* constraints, not just path-aware ones.

Consider: "Don't reference Case B while analyzing Case A" isn't a file path constraint—it's a phenomenological commitment. It emerges from the researcher's belief that each case deserves analytical fresh eyes, that patterns should emerge independently before comparison, that premature synthesis risks contamination.

Path-based rules can help (trigger different behavior in different case folders), but they can't capture the *why*. And without the why, they can't adapt. When should the rule relax? What counts as a violation? What if the researcher has a good reason to cross boundaries?

### 2.2 The Friction Model: Not Binary Enforcement

We reject binary allow/block for methodological constraints. Binary enforcement treats researchers as:

- **Compliance problems** rather than methodological thinkers
- **Unable to make reasoned exceptions** when exceptions are warranted
- **Subjects of a system** rather than partners with it

Instead, we implement **graduated friction**:

| Level | Behavior | Respects Agency? |
|-------|----------|------------------|
| **SILENT** | Log only, no interruption | Yes—researcher uninterrupted, system tracks pattern |
| **NUDGE** | Gentle reminder in response | Yes—researcher decides whether to adjust |
| **CHALLENGE** | Pause, request justification | Yes—with required reflection |
| **HARD_STOP** | Block action | No—but with explicit rationale |

Most methodological constraints operate at NUDGE or CHALLENGE. The researcher sees implications, reflects, and chooses. The choice is documented. The audit trail captures not just what was done, but *why deviations were considered appropriate*.

HARD_STOP is reserved for truly critical integrity requirements—like blocking AI-assisted coding before Stage 1 foundation is complete. Even then, the researcher can override with explicit acknowledgment of the risks.

### 2.3 Methodological Conscience, Not Methodological Police

This distinction is essential. Consider two ways an agent might respond to a researcher attempting cross-case comparison during open coding:

**Methodological Police:**
> "ERROR: Cannot compare cases during open coding phase. Please complete individual case analysis first."

**Methodological Conscience:**
> "Interesting move—you're reaching across case boundaries. Usually we keep cases separate during open coding to prevent pattern contamination. Are you:
>
> [A] Building a cross-cutting theme that transcends cases?
> [B] Noting a hunch for later exploration?
> [C] Oops, let me refocus on the current case?"

The police approach blocks. The conscience approach *surfaces implications* and lets the researcher decide. If they choose [A], the system asks what cross-cutting pattern they're seeing and documents it. If they choose [B], it notes the hunch without acting. If they choose [C], it refocuses.

Both approaches maintain methodological integrity. But the conscience approach treats the researcher as a methodologist capable of reasoned judgment—and generates richer audit trail data in the process.

### 2.4 Rules That Know Their Own Intent

For the conscience approach to work, rules must store *why* they exist, not just *what* they prohibit.

A rule isn't just text. It's a bundle of:

```javascript
{
  "id": "case_isolation",
  "text": "During individual case analysis, focus exclusively on the current case",

  // The crucial additions:
  "intent": {
    "purpose": "prevent_contamination",
    "epistemologicalThreat": "premature_closure",
    "validityConcern": "credibility",
    "methodologicalTradition": "grounded_theory"
  },

  "lifecycle": {
    "activePhases": ["open_coding", "axial_coding"],
    "relaxesAt": "phase3_pattern_characterization"
  },

  "friction": {
    "level": "challenge",
    "escalation": [
      { "afterOverrides": 3, "escalateTo": "hard_stop" }
    ]
  }
}
```

When the agent encounters a potential violation, it doesn't just check whether the action is allowed. It understands:

- **What threat** the rule protects against (premature closure)
- **What validity concern** it addresses (credibility)
- **What tradition** it emerges from (grounded theory)
- **When it relaxes** (pattern characterization phase)

This understanding enables the agent to:

1. Explain *why* the rule matters in context
2. Assess whether the researcher's action addresses the same threat differently
3. Determine if the rule should still apply given current phase
4. Suggest compensatory moves if the researcher proceeds with deviation

Intent transforms rules from static constraints into adaptive companions that reason about methodology.

---

## 3. Wave 1: Foundation—Making Research Design Explicit

### 3.1 The Problem of Implicit Knowledge

Before Wave 1, research design existed only in researchers' heads (and perhaps their IRB applications). The system knew the project existed, but not its structure—not whether it was comparative, longitudinal, or single-case; not which elements should stay separate during analysis; not when synthesis became appropriate.

This implicit knowledge couldn't be enforced because it wasn't expressed.

### 3.2 Schema Extension

Wave 1 extends the project configuration schema to capture research design as structured data:

```json
{
  "research_design": {
    "study_type": "comparative_longitudinal",
    "cases": [
      { "id": "case_a", "name": "TechCorp Alpha", "folder_path": "data/cases/techcorp" },
      { "id": "case_b", "name": "HealthCo Beta", "folder_path": "data/cases/healthco" },
      { "id": "case_c", "name": "FinServ Gamma", "folder_path": "data/cases/finserv" }
    ],
    "waves": [
      { "id": "wave_1", "name": "Initial Interviews", "collection_period": "2024-Q1" },
      { "id": "wave_2", "name": "Follow-up", "collection_period": "2024-Q3" }
    ],
    "streams": {
      "enabled": true,
      "theoretical": { "folder_path": "literature/theoretical" },
      "empirical": { "folder_path": "data/empirical" }
    },
    "isolation_config": {
      "case_isolation": {
        "enabled": true,
        "relaxes_at": "phase3_pattern_characterization",
        "friction_level": "challenge"
      },
      "wave_isolation": {
        "enabled": true,
        "relaxes_at": "cross_wave_analysis",
        "friction_level": "challenge"
      },
      "stream_separation": {
        "enabled": true,
        "relaxes_at": "phase2_synthesis",
        "friction_level": "nudge"
      }
    }
  }
}
```

This schema makes research design *machine-readable*. Cases, waves, and streams become first-class entities with defined boundaries. Isolation requirements specify what should stay separate, when separation relaxes, and how strongly the system should enforce boundaries.

### 3.3 Onboarding Questions

Research design doesn't appear from nowhere. Wave 1 adds questions to the Socratic onboarding process (`/qual-init`):

**Basic questions added to `/qual-init`:**
- "How many cases or sites are you studying?"
- "Is this longitudinal? How many waves of data collection?"
- "What should stay separate during initial analysis?"

**Complex studies trigger `/qual-design`:**
For studies with multiple cases, waves, or custom isolation requirements, a dedicated command guides detailed configuration:

```
/qual-design

[Researcher provides answers through dialogue]

System: "You've described a 3-case comparative study with 2 waves.
I'll configure:
- Case isolation (active during open coding, relaxes at synthesis)
- Wave isolation (analyze each wave before cross-wave comparison)
- Folder structure: data/cases/{techcorp,healthco,finserv}/wave_{1,2}/

Does this match your research design?"
```

### 3.4 From Design to Structure

Research design answers generate tangible project structure:

1. **Folder hierarchy**: `data/cases/`, `data/cases/{name}/wave_{n}/`
2. **Isolation configuration**: Which boundaries to enforce
3. **Relaxation schedule**: When boundaries dissolve
4. **Rule templates**: Which rules to generate

The researcher declares intent; the system operationalizes it.

### 3.5 Theoretical Significance

Wave 1's contribution seems mundane—just configuration and folders. But the theoretical significance is substantial:

**Research design is no longer implicit knowledge—it's explicit, machine-readable, and enforceable.**

When a researcher says "I'm doing a three-case comparative study," this isn't just description. It's *commitment*. Commitment to keeping cases separate during open coding. Commitment to letting patterns emerge independently. Commitment to a particular understanding of how knowledge is constructed.

By making these commitments explicit, Wave 1 enables Waves 2-4 to enforce, adapt, and learn from them. The foundation makes the intelligence possible.

---

## 4. Wave 2: Intelligence—Rule Generation and Adaptation

### 4.1 The Rule Generation Skill

Wave 2 creates the `skills/methodological-rules/` skill, which reads research design and generates appropriate rules for `.claude/rules/`.

**Trigger conditions:**
- After `/qual-design` completes
- When `research_design` changes in config
- When phase transitions occur (via hook)

**Rule templates:**

The skill includes templates for three core isolation types:

| Template | When Generated | Purpose |
|----------|----------------|---------|
| `case-isolation.template.md` | `study_type` includes "comparative" | Keep cases separate during open coding |
| `wave-isolation.template.md` | `is_longitudinal` = true | Keep waves separate until cross-wave analysis |
| `stream-separation.template.md` | `streams.enabled` = true | Keep theory and empirical streams separate until synthesis |

Each template includes:
- What it enforces (clear behavioral guidance)
- Why it matters (epistemological rationale)
- When it relaxes (phase-awareness)

### 4.2 Example Generated Rule

When the system generates a case isolation rule for a three-case comparative study:

```markdown
# .claude/rules/case-isolation.md
---
paths: data/cases/**
---
## Methodological Rule: Case Isolation

**Study:** 3-case comparative study
**Cases:** TechCorp Alpha, HealthCo Beta, FinServ Gamma
**Status:** ACTIVE
**Friction:** CHALLENGE

### Guidance

When analyzing data from a specific case folder:

1. Focus ONLY on the current case's data
2. Let themes emerge from THIS case independently
3. Do NOT reference findings from other cases yet
4. Note cross-case hunches in memos, but don't act on them

### Why This Matters

Cross-case contamination during open coding prevents genuine pattern
emergence. Each case deserves analytical fresh eyes before comparison.
If you see patterns in Case A that remind you of Case B, that's a hunch—
valuable, but premature to act on.

### When This Relaxes

This rule relaxes when you enter **Phase 3: Pattern Characterization**.
At that point, cross-case comparison becomes methodologically appropriate.

Check: config.json → sandwich_status.stage2_progress.phase3_pattern_characterization

---
*Generated: 2025-12-13 | Friction: CHALLENGE | Relaxes: phase3_pattern_characterization*
```

The rule exists as a markdown file in `.claude/rules/`, where Claude Code automatically discovers it. The `paths` frontmatter triggers the rule when working in case folders. The body provides clear guidance, explains why, and specifies when it no longer applies.

### 4.3 Phase-Aware Rules

Rules contain lifecycle information:

```json
"isolation_config": {
  "case_isolation": {
    "enabled": true,
    "relaxes_at": "phase3_pattern_characterization",
    "friction_level": "challenge"
  }
}
```

This means:
- Rule is active during open coding and axial coding
- Rule relaxes when `phase3_pattern_characterization` becomes true in config
- Friction level is CHALLENGE (pause and request justification)

### 4.4 Automatic Phase Transitions

Wave 2 introduces the `PostPhaseTransition` hook. When `sandwich_status` changes in config (indicating phase progression):

1. Hook detects the change
2. Calls `update-rules.js`
3. Script checks which rules should relax
4. Regenerates rules with updated status
5. Logs transition to reflexivity journal

```javascript
// Post-phase-transition.js (simplified)
const previousPhase = getPreviousPhase();
const currentPhase = getCurrentPhase();

if (currentPhase === 'phase3_pattern_characterization') {
  await updateRule('case-isolation', { status: 'relaxed' });
  await logToJournal(`Case isolation relaxed: entering synthesis phase`);
}
```

The researcher doesn't manage rule states manually. They progress through their analytical phases using existing commands (`/qual-phase-check`), and rules adapt automatically.

### 4.5 Theoretical Significance

Wave 2's contribution is *dynamic methodological guidance*:

**Rules are not static constraints but dynamic companions that evolve with the research.**

A rule that makes sense during open coding might be inappropriate during synthesis. A constraint that protects pattern emergence might impede theoretical integration. The same behavior (cross-case comparison) might be contamination in one phase and essential methodology in another.

Phase-aware rules understand this. They apply when appropriate and dissolve when their purpose has been served. The system doesn't just enforce—it knows when to stop enforcing.

---

## 5. Wave 3: Adaptation—Learning from Resistance

### 5.1 The Strain Insight

Wave 1 made research design explicit. Wave 2 generated adaptive rules. But something was missing: *what happens when rules don't fit?*

Researchers are not passive subjects of their research designs. Methodologies evolve. Unexpected patterns emerge. A rule that seemed appropriate at the start might create friction that signals something important about how the study is developing.

Wave 3 introduces a crucial insight: **If a rule is overridden repeatedly, that's not compliance failure—it's methodological data.**

### 5.2 Strain Detection

The strain detection system tracks rule overrides:

```javascript
// Strain tracking data structure
{
  "strain_tracking": {
    "case-isolation": {
      "overrides": [
        {
          "timestamp": "2025-12-13T10:30:00Z",
          "justification": "Noticed similar coping mechanism across cases",
          "context": "Coding INT_005"
        },
        // ... more overrides
      ],
      "strainTriggered": false,
      "lastReviewTimestamp": null
    }
  }
}
```

When override count reaches the threshold (default: 3), the system triggers a methodological review:

```
"You've overridden case isolation 3 times this phase. That's not wrong—
it might mean your study is evolving.

Quick check: Are you...
[A] Moving toward cross-case synthesis? (Ready for phase transition?)
[B] Finding the rule too strict for your methodology?
[C] Just exploring—keep the rule but note the pattern

What feels right?"
```

### 5.3 Resolution Outcomes

Each strain review choice leads to different outcomes:

| Choice | Outcome | System Action |
|--------|---------|---------------|
| [A] Phase transition | Advance to synthesis phase | Update `sandwich_status`, regenerate rules |
| [B] Adjust rule | Modify friction level or scope | Update rule configuration, log change |
| [C] Continue pattern | Log as methodological exploration | Record pattern, maintain rule |

The key insight: *the researcher decides*, but the decision is made consciously and documented. Strain becomes audit trail data, not just friction to push through.

### 5.4 Proactive Prompts (SHOULD_PROMPT)

Wave 3 also introduces positive methodological nudges—not just restrictions (MUST_NOT), but encouragements (SHOULD_PROMPT):

| Trigger | Prompt |
|---------|--------|
| New code created | "Could this be an in-vivo code? What's the participant's exact language?" |
| No memo in 3+ codes | "You've coded several passages without a memo. What's catching your attention?" |
| Saturation boundary | "Analytic memo required: What accounts for variations in this category?" |
| Approaching synthesis | "Before synthesis: Have you actively sought negative cases?" |

These prompts fire when conditions are met, include cooldown periods to prevent annoyance, and can be suppressed if the researcher finds them unhelpful. They're suggestions, not requirements—the conscience offering good practice reminders, not the police enforcing compliance.

### 5.5 Methodology Presets

Different methodological traditions have different expectations. Wave 3 introduces presets that configure the system for specific traditions:

**Available presets:**

| Preset | Tradition | Key Characteristics |
|--------|-----------|---------------------|
| `gioia_corley` | Gioia & Corley | Data structure building, parallel streams, systematic interpretive |
| `charmaz_constructivist` | Constructivist GT | Co-construction emphasis, gerund-based codes, maximal reflexivity |
| `straussian` | Straussian GT | Coding paradigm, axial coding, conditional matrix |
| `glaserian` | Classic GT | Emergence focus, delay literature, hard boundaries |
| `phenomenology` | Phenomenological | Bracketing, lived experience, essence of phenomena |
| `ethnography` | Ethnographic | Thick description, emic/etic, cultural interpretation |

Applying a preset configures:

1. **Isolation defaults**: Which isolation types to enable, when they relax
2. **Proactive prompts**: Which positive nudges are active
3. **Philosophical defaults**: Ontology, epistemology (if not already set)
4. **Coding vocabulary**: Preferred verbs and terms for the tradition

```bash
node apply-preset.js --project-path /path/to/project --preset gioia_corley
```

### 5.6 Theoretical Significance

Wave 3's contributions are about *learning and tradition*:

**Strain as methodological signal:** The system doesn't just log violations—it interprets patterns of resistance as data about research evolution. Rules that consistently create friction might be too strict, or the research might be ready to advance. Either way, the pattern is meaningful.

**Methodological tradition as configuration:** A researcher's tradition isn't just context—it's operational defaults. When you say "I'm using Gioia's method," the system knows what that means: parallel streams, data structure building, specific proactive prompts. Tradition becomes embodied in system behavior.

---

## 6. Wave 4: Advanced—Supporting the Messy Middle

### 6.1 Recognizing Non-Linearity

Qualitative analysis isn't linear. The "messy middle"—that period between initial coding and final theory—involves iteration, backtracking, exploratory dead ends, and insights that reshape everything that came before.

Wave 4 addresses what earlier waves couldn't: the practical reality that analysis proceeds non-linearly, that multiple researchers might collaborate, that saturation is a complex phenomenon, and that progress needs to be visible.

### 6.2 Multi-Dimensional Saturation Tracking

Theoretical saturation is a core concept in grounded theory, but its assessment has historically been intuitive rather than systematic. When have you sampled enough? When have your categories stabilized?

Wave 4 implements multi-dimensional saturation tracking:

| Dimension | What It Tracks | Signal |
|-----------|---------------|--------|
| **Code Generation** | New codes per document | Rate dropping (< 0.5/doc) |
| **Code Coverage** | How widely codes apply | Adequate (>70% with coverage) |
| **Refinement** | Definition changes, splits, merges | Stabilization (<2 changes in 5 docs) |
| **Redundancy** | Conceptual repetition | High (>0.85 score) |

These dimensions combine into a composite saturation assessment:

```
Saturation Level: APPROACHING (62/100)

Evidence:
- Code Generation: SLOWING (0.8 new codes/doc average)
- Coverage: ADEQUATE (75% of codes with >20% coverage)
- Refinement: ACTIVE (4 recent definition changes)
- Redundancy: EMERGING (68% conceptual overlap)

Recommendation: Continue coding but watch for diminishing returns.
Consider writing memos on what accounts for variation in core categories.
```

Saturation isn't a binary threshold—it's a multi-signal assessment that helps researchers make informed decisions about sampling and analysis.

### 6.3 Workspace Branching

The "messy middle" often involves exploring interpretive alternatives. What if the codes were structured differently? What if we followed a different theoretical thread? What if this negative case changes everything?

Workspace branching provides **interpretive versioning**:

```bash
# Fork a new exploratory branch
node workspace-branch.js --project-path /path --fork \
  --name "alternative-structure" \
  --framing "exploratory" \
  --rationale "Testing whether coping and resilience should be separate dimensions"

# Work in the branch (current workspace switches)
# ... coding, memos, experiments ...

# Merge back with required synthesis memo
node workspace-branch.js --project-path /path --merge \
  --branch-id "alternative-structure-abc123" \
  --memo "Explored separating coping/resilience. Found they are better as
         sub-themes of adaptive response because both involve temporal
         projection and resource mobilization."
```

Key design choices:

1. **Merge requires a memo**: You cannot merge a branch without explaining what you learned. This enforces synthesis thinking.
2. **Abandoned branches are preserved**: Dead ends are methodological data. The audit trail shows what was explored, not just what was kept.
3. **Methodological framing is tracked**: Was this exploratory, confirmatory, or negative case analysis? The framing matters for interpretation.

### 6.4 Visualization Dashboard

Wave 4 includes CLI dashboards for monitoring methodological status:

```
╔════════════════════════════════════════════════════════════╗
║              Organizational Resilience Study               ║
║          Interpretive Orchestration Dashboard              ║
╚════════════════════════════════════════════════════════════╝

Stage Progress: ●─●─○  [Collaboration - Phase 2]

┌─ SATURATION TRACKING ──────────────────────────────────────┐
│ Saturation Level: APPROACHING ●●●○○                        │
│                                                            │
│ CODE GENERATION (new codes per document)                   │
│   █ █ █ █ ▓ ▒ ▒ ░ ░   4                                   │
│   ──────────────────── 0                                   │
│   Rate: 0.8/doc | Total: 24 codes | Stabilized: Doc 12    │
│                                                            │
│ REDUNDANCY                                                 │
│   Score: ████████████░░░ 72%                              │
└────────────────────────────────────────────────────────────┘

┌─ ACTIVE RULES ─────────────────────────────────────────────┐
│ Case Isolation      │ ACTIVE    │ Friction: CHALLENGE      │
│ Wave Isolation      │ ACTIVE    │ Friction: CHALLENGE      │
│ Stream Separation   │ RELAXED   │ (Phase 2 synthesis)      │
└────────────────────────────────────────────────────────────┘
```

Dashboards render in the terminal with ASCII art and box drawing. For documentation, Mermaid diagrams can be exported:

```bash
node viz-dashboard.js --project-path /path --mermaid lineage
# Outputs Mermaid syntax for code evolution diagram
```

### 6.5 Multi-Researcher Support

Qualitative research is often collaborative. Wave 4 adds team support:

**Team roles:**
- `lead`: Primary investigator, makes final decisions
- `co_investigator`: Equal partner in analysis
- `coder`: Codes documents under supervision
- `auditor`: Reviews for trustworthiness
- `consultant`: Provides methodological guidance

**Attribution tracking:**
All analytical decisions are attributed to the current researcher:

```bash
node researcher-team.js --project-path /path \
  --log-attribution --action "created_code" --target "adaptive_coping"
```

**Intercoder reliability:**
For studies requiring ICR, sessions can be formally tracked:

```bash
# Start ICR session
node researcher-team.js --project-path /path \
  --start-icr-session --participants "jane,john" --documents "INT_005,INT_006"

# Record outcome after discussion
node researcher-team.js --project-path /path \
  --record-icr-outcome --session-id "icr-abc123" \
  --type "definition_refined" --details "Clarified boundary between coping and adapting"
```

### 6.6 Theoretical Significance

Wave 4 acknowledges what qualitative methodology has always known:

**Non-linearity is the workflow, not a bug.** Branching supports exploration without fear of losing the main thread. Merge memos document what was learned. Abandoned branches become methodological data.

**Saturation is multi-dimensional.** It's not just "are codes repeating?"—it's code generation rates, coverage patterns, refinement stability, and conceptual redundancy. Multiple signals inform a complex assessment.

**Collaboration is the norm.** Qualitative research rarely happens in isolation. Team roles, attribution tracking, and ICR support acknowledge the social nature of interpretation.

---

## 7. Integration: How the Waves Work Together

### 7.1 The Full Flow

The four waves aren't independent features—they're a coherent system:

```
1. Researcher declares research design (/qual-init or /qual-design)
                    ↓
2. Wave 1 captures design as structured data in config.json
                    ↓
3. Wave 2 generates rules based on cases, waves, streams
                    ↓
4. Rules provide guidance during analysis (friction model)
                    ↓
5. Wave 3: Strain detected → Methodological review triggered
                    ↓
6. Phase transition → Wave 2 rules auto-relax (via hook)
                    ↓
7. Wave 4: Saturation signals → Recommendations for next steps
                    ↓
8. Branching supports exploration → Merge memos document synthesis
                    ↓
9. All decisions attributed → Complete audit trail
```

Each wave builds on the previous:
- Wave 1 makes design explicit → Wave 2 can generate rules
- Wave 2 creates adaptive rules → Wave 3 can detect strain
- Wave 3 adds proactive guidance → Wave 4 can track saturation
- Wave 4 visualizes status → Researcher sees integrated picture

### 7.2 The Audit Trail

Every methodological choice is documented:

| Event | What's Captured |
|-------|-----------------|
| Rule creation | Research design that generated it, timestamp, friction level |
| Phase transitions | What changed, which rules updated, timestamp |
| Rule overrides | Justification, context, who made the decision |
| Strain reviews | Which resolution chosen, notes, timestamp |
| Saturation assessments | All dimension values, composite score, recommendations |
| Branch decisions | Rationale for fork, merge memo, framing |
| Attribution | Who did what, when, in what context |

This becomes **trustworthiness/confirmability evidence**. When writing the methods section or responding to reviewers, the audit trail provides concrete documentation of analytical decisions.

### 7.3 The Hook Ecosystem

Hooks connect the waves:

| Hook | Wave Connection |
|------|-----------------|
| `PostPhaseTransition` | Wave 2 → Triggers rule regeneration on phase change |
| `PostFiveDocuments` | Wave 3 → Triggers interpretive pause, saturation check |
| `EpistemicCoherence` | Wave 3 → Ensures choices align with tradition |
| `SessionEnd` | Wave 4 → Prompts reflexivity, updates attribution |

The researcher doesn't manage these connections. They work through their analysis naturally, and the system maintains integrity.

---

## 8. Theoretical Contributions

### 8.1 Research Design as Epistemological Commitment

Research design isn't just description—it's commitment. When a researcher declares a three-case comparative study with case isolation during open coding, they're not just describing their study. They're committing to a particular understanding of how cross-case patterns should emerge.

The Methodological Rules System makes this commitment **enforceable**. Not through rigid blockades, but through graduated friction that ensures deviations are conscious. The commitment becomes operational, not aspirational.

### 8.2 Friction as Respect for Agency

Binary allow/block treats researchers as compliance problems. Graduated friction treats them as methodologists making reasoned choices.

NUDGE says: "Here's something to consider."
CHALLENGE says: "Help me understand your reasoning."
HARD_STOP says: "This really matters—let's discuss."

At each level, the researcher retains agency. The system provides information, asks questions, surfaces implications. The researcher decides. This isn't permissiveness—it's partnership.

### 8.3 Strain as Methodological Signal

Traditional systems log violations and move on. The Methodological Rules System interprets patterns of resistance as data about research evolution.

When a rule is overridden three times, something is happening. Maybe the rule is too strict for this methodology. Maybe the research is ready to advance to a new phase. Maybe there's a cross-cutting insight that transcends the boundaries. Whatever the case, the pattern is meaningful.

Strain detection transforms friction from obstacle to signal. The system learns from resistance.

### 8.4 The "Messy Middle" as Design Goal

Most tools treat non-linearity as a problem to solve—force linear workflow, prevent backtracking, hide complexity. The Methodological Rules System treats it as the fundamental nature of qualitative work.

Workspace branching makes exploration safe. Merge memos enforce synthesis thinking. Abandoned branches preserve the full intellectual journey. The system supports the messy middle rather than trying to tidy it up.

### 8.5 Violation as Audit Asset

In compliance-oriented systems, violations are failures. In the Methodological Rules System, violations are *methodological data points*.

An override memo that explains why a researcher crossed case boundaries during open coding isn't a confession—it's documentation. When reviewers ask "How did you handle cross-case contamination?", the audit trail shows exactly what happened, why it happened, and what compensatory moves were made.

Violations documented with justification strengthen rather than weaken trustworthiness.

---

## 9. Connection to Existing Architecture

### 9.1 Links to DESIGN-PHILOSOPHY.md

The Methodological Rules System implements core principles from the plugin's design philosophy:

**Cognitive hygiene:** Rules are the mechanism. They don't just encourage good practice—they make methodological boundaries visible and crossings conscious.

**Parallel streams:** Stream separation rules enforce the architecture. Theory and data develop independently until synthesis is methodologically appropriate.

**Interpretive authority remains human:** The friction model ensures this. Even at CHALLENGE level, the researcher decides. The system surfaces implications; it never makes interpretive choices.

### 9.2 Links to ARCHITECTURE.md

The rules system adds new components to the plugin architecture:

**New skill:** `skills/methodological-rules/`
- Scripts: `generate-rules.js`, `check-phase.js`, `update-rules.js`, `strain-check.js`, `apply-preset.js`, `saturation-tracker.js`, `workspace-branch.js`, `viz-dashboard.js`, `researcher-team.js`
- Templates: Case, wave, stream isolation
- Data files: Proactive prompts, methodology presets

**New hooks:** `PostPhaseTransition`
- Watches for changes to `sandwich_status`
- Triggers rule regeneration when phases advance

**Extended config schema:**
- `research_design`: Cases, waves, streams, isolation config
- `saturation_tracking`: Multi-dimensional saturation data
- `workspace_branches`: Branch history and status
- `researcher_team`: Team members and attribution

### 9.3 Links to METHODS-PAPER-OUTLINE.md

This document can integrate with the broader methods paper in several ways:

**Option A: Section 4.X—"Methodological Rules Infrastructure"**
Insert after section on Stage enforcement but before section on trustworthiness. Emphasize how rules operationalize research design.

**Option B: Appendix D—"Design Decision Log: Methodological Rules"**
Include as detailed appendix for readers interested in implementation. Summarize theoretical contributions in main text.

**Option C: Standalone Paper**
Expand theoretical contributions into journal article format. Focus on friction model and strain detection as novel contributions. Use implementation as illustration.

---

## 10. Future Directions

### 10.1 Immediate (Beta Testing Phase)

**Collect usage data:**
- Which presets are most used?
- What friction levels work best?
- How often does strain detection trigger?
- What are common override patterns?

**Refine based on feedback:**
- Adjust default thresholds
- Expand proactive prompt library
- Add new methodology presets based on demand

**Integration testing:**
- Test with real research projects
- Validate audit trail completeness
- Assess saturation accuracy

### 10.2 Near-Term Enhancements

**Event-sourced methodological log:**
Store all decisions as immutable events rather than cumulative state. Enables temporal queries: "Show me all decisions made during week 3."

**Graph database for audit trail:**
Enable queries like "Which codes were affected by Case B contamination?" or "How did the 'resilience' category evolve through the study?"

**Enhanced visualization:**
Move beyond CLI dashboards to web-based visualization for complex projects.

### 10.3 Long-Term Vision

**Methodology-specific rule factories:**
Rather than templates, generate rules dynamically based on deep understanding of methodological traditions. "Generate rules for a phenomenological study of lived experience with chronic illness."

**Integration with existing CAQDAS:**
Export audit trails to NVivo/Atlas.ti. Import coding structures. Serve as methodological layer over traditional tools.

**Cross-project learning:**
Anonymized aggregation of strain patterns, saturation curves, override justifications. Enable comparative methodology research: "How do Gioia studies differ from Charmaz studies in their phase progression?"

---

## Conclusion

The Methodological Rules System transforms research design from implicit knowledge into adaptive infrastructure. Through four waves of implementation, we've built a system where:

1. **Design is explicit**: Cases, waves, streams captured as structured data
2. **Rules are intelligent**: Generated from design, aware of phases, adaptive to transitions
3. **Friction is graduated**: Respecting researcher agency while ensuring conscious choices
4. **Resistance is data**: Strain patterns trigger reflection, not just logging
5. **Traditions are operational**: Presets configure the system for specific methodologies
6. **Non-linearity is supported**: Branching, saturation tracking, visualization
7. **Collaboration is enabled**: Team roles, attribution, intercoder reliability

This isn't automation of qualitative research. It's infrastructure for qualitative partnership—where AI provides methodological conscience, the researcher retains interpretive authority, and the audit trail captures the full intellectual journey.

The system doesn't make qualitative research faster (though it might). It makes it more rigorous, more conscious, more documented. When reviewers ask "How did you ensure methodological integrity?", researchers have concrete evidence: rules generated from their design, overrides documented with justification, strain reviews showing conscious evolution, saturation assessments informing sampling decisions.

The rules don't replace methodological judgment. They make methodological judgment visible.

---

**Document History:**
- Created: 2025-12-13
- Status: Complete, pending beta testing
- Authors: Xule Lin (Imperial College London), Claude Opus 4.5 (Anthropic)
- Related: METHODS-PAPER-OUTLINE.md, DESIGN-PHILOSOPHY.md, ARCHITECTURE.md

---

*This document is part of the Interpretive Orchestration plugin documentation.*
*Keep local until beta testing complete.*
