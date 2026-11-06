# 🎨 Plugin Architecture: Visual Blueprint

**The Atelier of Co-Apprenticeship - Complete System Design**

*This diagram serves as: Reference guide, design verification, presentation material, and craft documentation*

---

## System Overview

```mermaid
graph TB
    subgraph Stage1["STAGE 1: Solo Practice"]
        S1[Human Apprentice Alone]
        S1 --> Manual[Manual Coding]
        S1 --> Memos[Analytical Memos]
        S1 --> Framework[Initial Framework]

        Listener[@stage1-listener<br/>Thinking partner<br/>Never suggests codes]
        Think1[/qual-think-through<br/>Plan approach]
        Assume1[/qual-examine-assumptions<br/>Check stance]

        S1 -.Uses.-> Listener
        S1 -.Uses.-> Think1
        S1 -.Uses.-> Assume1
    end

    subgraph Enforcement["ENFORCEMENT"]
        PreStage2[PreStage2 Hook<br/>Asks to confirm without Stage 1]
        Framework --> PreStage2
    end

    subgraph Stage2["STAGE 2: Side-by-Side Collaboration"]
        PreStage2 --> S2[Two Apprentices Together]

        Config[@research-configurator<br/>The Whisperer<br/>Technical orchestration]
        Coder[@dialogical-coder<br/>4-stage reflexive coding]
        Reflect[/qual-reflect<br/>Synthesis dialogue]
        Synth[/qual-synthesize<br/>Merge streams]

        S2 --> Config
        Config --> Coder
        Coder --> Reflect
        Reflect --> Synth

        Think2[/qual-think-through]
        Wisdom[/qual-wisdom-check]
        Assume2[/qual-examine-assumptions]

        Reflect -.Uses.-> Think2
        Reflect -.Uses.-> Wisdom
        Reflect -.Uses.-> Assume2

        Pause[PostFiveDocuments<br/>Interpretive pauses]
        Coherence[EpistemicCoherence<br/>Philosophy check]

        Coder -.Triggers.-> Pause
        Coder -.Triggers.-> Coherence

        Audit[PostSynthesis<br/>Audit trail]
        Synth -.Triggers.-> Audit
    end

    subgraph Stage3["STAGE 3: Dialogue with Tradition"]
        S2 --> S3[Examining the Work]

        Scholar[@scholarly-companion<br/>Theoretical dialogue]
        Think3[/qual-think-through<br/>Framework building]
        Wisdom3[/qual-wisdom-check<br/>Integration]

        S3 --> Scholar
        Scholar -.Uses.-> Think3
        Scholar -.Uses.-> Wisdom3
    end

    subgraph MCPs["EPISTEMIC SCAFFOLDING - MCPs"]
        LotusW[Lotus Wisdom<br/>Paradox navigation]
        Zen[Zen MCP<br/>Multi-model validation]
        Jina[Jina + Exa<br/>Literature]

        Wisdom -.Invokes.-> LotusW
        Wisdom3 -.Invokes.-> LotusW
    end

    subgraph Continuous["CONTINUOUS SUPPORT"]
        Status[/qual-status<br/>Navigate journey]
        Session[SessionEnd<br/>Reflexivity prompt]

        S1 -.Checks.-> Status
        S2 -.Checks.-> Status
        S3 -.Checks.-> Status

        S2 -.Ends.-> Session
    end

    style S1 fill:#e1f5e1
    style S2 fill:#e1e5f5
    style S3 fill:#f5e1f5
    style Listener fill:#98fb98
    style Coder fill:#ffd700
    style Scholar fill:#87ceeb
    style Config fill:#ffb347
```

---

## Component Inventory

### Skills (12 auto-loaded, plus 17 commands)

Skills are auto-discoverable capability packages. Claude loads them when relevant to the user's request. Since 0.3.0 the `/qual-*` commands are skills too (see Commands below).

**Core Skills:**
| Skill | Triggers On | Purpose |
|-------|-------------|---------|
| `project-setup` | "initialize", "setup", "new project" | Socratic onboarding + project creation |
| `gioia-methodology` | "Gioia", "data structure", "themes" | Data structure building + validation |
| `project-dashboard` | "status", "progress", "where am I" | Progress visualization |
| `analysis-orchestration` | "cost", "model", "configure" | Model selection + cost estimation |
| `coding-workflow` | "batch", "systematic coding" | Document coding management |
| `methodological-rules` | "generate rules", "isolation rules", after `/qual-design` | Rule generation + phase updates |

**Composite MCP Skills (with graceful degradation):**
| Skill | Tiers | Purpose |
|-------|-------|---------|
| `literature-sweep` | Exa+Jina → Jina → WebFetch | Academic literature search + fetch |
| `interview-ingest` | MinerU → manual | Audio/PDF conversion |
| `document-conversion` | MinerU → manual | Intelligent format conversion |

**Mindset Skills:**
| Skill | Invokes | Purpose |
|-------|---------|---------|
| `deep-reasoning` | None (asks the model to think deeply and step by step) | Step-by-step analytical thinking |
| `paradox-navigation` | Lotus Wisdom MCP | Navigate contradictions |
| `coherence-check` | None (self-contained) | Philosophical assumption check |

**Shared Infrastructure:**
- `_shared/scripts/` - State I/O (read-config.js, update-progress.js, append-log.js, query-status.js)

### Commands (17)

Each command is a skill at `skills/qual-<name>/SKILL.md`.

| Command | Purpose | Stage | Triggers Skill |
|---------|---------|-------|----------------|
| `/qual-init` | Socratic onboarding | Entry | `project-setup` |
| `/qual-status` | Journey navigation | All | `project-dashboard` |
| `/qual-check-setup` | Verify installation | Entry | - |
| `/qual-configure-analysis` | Technical orchestration | Stage 2 | `analysis-orchestration` |
| `/qual-design` | Research design (cases, waves, isolation) | Entry | `methodological-rules` |
| `/qual-advance-stage` | Move between stages | All | - |
| `/qual-memo` | Analytical memos | Stage 1 | - |
| `/qual-stage1-guide` | Manual coding guidance | Stage 1 | - |
| `/qual-complete-stage1` | Validate the Stage 1 foundation | Stage 1 | `methodological-rules` |
| `/qual-parallel-streams` | Theoretical + empirical streams | Stage 2 | - |
| `/qual-synthesize` | Merge streams | Stage 2 | - |
| `/qual-code-deductive` | Apply established patterns | Stage 2 | - |
| `/qual-characterize-patterns` | Dimensional analysis | Stage 2 | - |
| `/qual-reflect` | Synthesis dialogue | 2 & 3 | - |
| `/qual-think-through` | Deep reasoning | All | `deep-reasoning` |
| `/qual-wisdom-check` | Paradox navigation | All | `paradox-navigation` |
| `/qual-examine-assumptions` | Philosophy check | All | `coherence-check` |

### Agents (4)
| Agent | Stage | Function | Key Feature |
|-------|-------|----------|-------------|
| `@stage1-listener` | Stage 1 | Thinking partner for manual coding | Curious questioning, NEVER suggests codes |
| `@research-configurator` | Stage 2 | The Whisperer - Technical orchestration | 12 capabilities, no coding required |
| `@dialogical-coder` | Stage 2 | Reflexive coding | 4-stage visible reasoning (THE CROWN JEWEL) |
| `@scholarly-companion` | Stage 3 | Theoretical dialogue | Socratic questioning, not writing |

### Hooks (7)
| Hook | Trigger | Purpose | Philosophy |
|------|---------|---------|------------|
| PreStage2 | Before Stage 2 tools | Enforce Solo Practice completion (asks the researcher to confirm) | Atelier door locks |
| PostFiveDocuments | Every 5 coded | Interpretive pause | From methodology! |
| SessionStart | Session start | Partnership stance and Stage 1 status | Shared foundations |
| SessionEnd | Session close | Reflexivity prompt (logged; Claude Code does not show it) | Constructivist practice |
| EpistemicCoherence | After coding | Philosophy check | Language consistency |
| PostSynthesis | After synthesis | Audit trail generation | Confirmability |
| PostPhaseTransition | After stage or phase changes | Update methodological rules | Rules relax as the analysis matures |

`hooks/hooks.json` runs every hook through an adapter, `hooks/run-hook.js`, which connects the scripts to Claude Code. [docs/HOOKS-PHILOSOPHY.md](docs/HOOKS-PHILOSOPHY.md#how-the-hooks-are-wired) explains the wiring.

### MCPs (Bundled + Optional)

**Bundled (No API Keys Required):**
| MCP | Function | When Used | Epistemic Role |
|-----|----------|-----------|----------------|
| Lotus Wisdom | Paradox navigation | Tensions | Transcend contradictions |

**Optional (Require API Keys):**
| MCP | Function | When Used | Epistemic Role |
|-----|----------|-----------|----------------|
| MinerU | Parse complex PDFs | Document import | Data preparation |
| Zen MCP | Multi-model validation | Major decisions | Triangulation |
| Jina | Fetch articles | Literature work | Knowledge access |
| Exa | Search literature | Discovery | Knowledge discovery |
| Zotero | Bibliography | Citations | Scholarly infrastructure |

---

## Information Architecture

### Data Flow

```
Entry Point
    ↓
/qual-init (Socratic dialogue)
    ↓
.interpretive-orchestration/config.json (Philosophy captured)
    ↓
Stage 1: Manual coding (Human solo)
    ↓
PreStage2 Hook (Validates completion)
    ↓
/qual-configure-analysis (@research-configurator orchestrates)
    ↓
Stage 2: @dialogical-coder (4-stage coding)
    ├→ Every 5: PostFiveDocuments pause
    ├→ Each: EpistemicCoherence check
    ├→ Throughout: /qual-reflect synthesis
    └→ /qual-synthesize: PostSynthesis audit trail
    ↓
Stage 2 Complete: Evidence organized
    ↓
Stage 3: @scholarly-companion (Theoretical dialogue)
    ├→ /qual-think-through (framework building)
    └→ /qual-wisdom-check (integration)
    ↓
Theory Articulated
```

### File Organization Logic

```
interpretive-orchestration/
│
├── 📄 Entry & Core Docs
│   └── [README, QUICK-START, CHANGELOG, CONTRIBUTING, DESIGN-DECISIONS, LICENSE]
│   └── [ARCHITECTURE, DEPENDENCIES, INSTALL, TROUBLESHOOTING]
│
├── 🎭 Active Components
│   ├── agents/ (4) - Dialogue partners for each stage
│   └── hooks/ (7 scripts + run-hook.js adapter + hooks.json) - Enforcement & prompting
│
├── 🧩 Skills (12 skills + 17 qual-* commands)
│   ├── qual-*/ - The /qual-* commands, one SKILL.md each
│   ├── project-setup/ - Socratic onboarding + project creation
│   │   ├── SKILL.md, scripts/, templates/, examples/
│   ├── gioia-methodology/ - Data structure building + validation
│   │   ├── SKILL.md, scripts/, templates/, examples/
│   ├── analysis-orchestration/ - Model selection + cost estimation
│   ├── coding-workflow/ - Document coding management
│   ├── project-dashboard/ - Progress visualization
│   ├── literature-sweep/ - Academic literature (3-tier graceful degradation)
│   ├── interview-ingest/ - Audio/PDF conversion (3-tier)
│   ├── document-conversion/ - Format conversion (MinerU/manual)
│   ├── deep-reasoning/ - Step-by-step reasoning prompt
│   ├── paradox-navigation/ - Lotus Wisdom wrapper
│   ├── coherence-check/ - Philosophical alignment
│   ├── methodological-rules/ - Rule generation + phase updates
│   └── _shared/ - State I/O scripts (read-config, update-progress, etc.)
│
├── 📚 Meta-Research
│   └── docs/ - Hook philosophy, rules system, command guides
│
├── 🌱 Examples
│   └── examples/tutorial-quickstart/
│
└── ⚙️ Configuration (hidden)
    └── [.claude-plugin/, .codex-plugin/, .mcp.json]
```

---

## The Three-Stage Journey (Visual)

```
╔════════════════════════════════════════════════════════════╗
║  THE ATELIER OF CO-APPRENTICESHIP                         ║
║  Both human and AI apprentice to craft tradition          ║
╚════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────┐
│ 🎨 STAGE 1: Solo Practice                                │
│ ─────────────────────────────────────────────────────────│
│                                                           │
│ Human apprentice alone with data                         │
│ • Manual coding builds theoretical sensitivity           │
│ • Close reading develops interpretive depth              │
│ • Framework emerges from engagement                      │
│                                                           │
│ Tools: Minimal AI (thinking tools for planning)          │
│ Agent: @stage1-listener (thinking partner, NOT coder)    │
│ MCP: Lotus Wisdom (guidance)                              │
│                                                           │
│ ✓ Creates: Initial framework, theoretical foundation     │
└──────────────────────────────────────────────────────────┘
                         ↓
              ┌──────────────────┐
              │ 🔒 PreStage2 Hook│
              │   Checks, asks   │
              └──────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│ 🤝 STAGE 2: Side-by-Side Collaboration                   │
│ ─────────────────────────────────────────────────────────│
│                                                           │
│ Two apprentices working together                         │
│ • @research-configurator: Orchestrates analysis (NEW!)   │
│ • @dialogical-coder: 4-stage reflexive coding            │
│ • Human provides theoretical sensitivity                 │
│ • AI provides scale and organization                     │
│                                                           │
│ Tools: Full collaboration suite                          │
│ Agent: Whisperer + Coder                                 │
│ MCP: Lotus Wisdom + optional MCPs (scaffolding)          │
│ Hooks: Pauses every 5, coherence checks, audit trail     │
│                                                           │
│ ✓ Creates: Coded data, refined framework, patterns       │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│ 💭 STAGE 3: Dialogue with Tradition                      │
│ ─────────────────────────────────────────────────────────│
│                                                           │
│ Examining work through craft wisdom                      │
│ • @scholarly-companion: Asks tradition's questions       │
│ • "What does this contribute?"                           │
│ • "How does it honor scholarly rigor?"                   │
│ • Human articulates theoretical meaning                  │
│                                                           │
│ Tools: Theoretical dialogue + integration                │
│ Agent: Scholarly companion                               │
│ MCP: Lotus Wisdom (synthesis)                            │
│                                                           │
│ ✓ Creates: Theory, manuscript, contribution              │
└──────────────────────────────────────────────────────────┘

╔════════════════════════════════════════════════════════════╗
║  Throughout: Partnership Agency Configuration             ║
║  Preventing: Directed Agency (calculator mindset)         ║
║  Enabling: Emergent cognition neither could achieve alone ║
╚════════════════════════════════════════════════════════════╝
```

---

## Partnership Agency Components (Cognitio Emergens)

### How We Prevent Epistemic Alienation

```
Visible AI Reasoning (Interpretive Intelligence)
    ↓
4-Stage Dialogical Process
    ├─ Stage 1: Tentative mapping (AI shows thinking)
    ├─ Stage 2: Self-challenge (AI questions itself)
    ├─ Stage 3: Structured output (rationale explicit)
    └─ Stage 4: Reflective audit (limitations acknowledged)
    ↓
Human ALWAYS sees HOW AI interpreted
    ↓
Critical evaluation possible
    ↓
Maintains interpretive control
```

### How We Enable Recursive Evolution

```
Conversation Log (Both learn)
    ↓
AI learns: Human's framework, conceptual boundaries, theoretical sensitivity
Human learns: Reflexive practice, philosophical awareness, meta-cognition
    ↓
Config tracks: Epistemic growth over time
    ↓
Both adapt continuously
    ↓
Co-evolution, not static tool use
```

### How We Maintain Epistemic Ambidexterity

```
Balance Point
    ├─ Exploration: AI capability, pattern recognition, scale
    └─ Control: Human authority, theoretical sensitivity, interpretation
    ↓
Mechanisms:
    ├─ Reflexive pauses (prevent over-reliance)
    ├─ Human authority (final decisions always human)
    └─ Visible reasoning (enable critical evaluation)
    ↓
Partnership without alienation
```

---

## The Whisperer's Role (NEW!)

```mermaid
graph LR
    Research[Research Goals<br/>& Constraints] --> Whisp[@research-configurator<br/>THE WHISPERER]

    Whisp --> Models[Model Selection<br/>Opus/Sonnet/Gemini]
    Whisp --> Budget[Thinking Budgets<br/>Cost Optimization]
    Whisp --> Strategy[Batching Strategies<br/>Sequential/Batch/Parallel]
    Whisp --> Prompts[Prompt Crafting<br/>Context-sensitive]
    Whisp --> Quality[Quality Assessment<br/>Metrics → Insights]
    Whisp --> Setup[Technical Setup<br/>No coding required!]

    Models --> Config[Technical<br/>Configuration]
    Budget --> Config
    Strategy --> Config
    Prompts --> Config

    Config --> Execute[Execution<br/>via @dialogical-coder]
    Setup --> Execute

    Execute --> Results[Coded Data]
    Results --> Quality
    Quality --> Insights[Research Insights]

    style Whisp fill:#ffb347
```

---

## Epistemic Tool Ecosystem

```
┌─────────────────────────────────────────────────────────┐
│ EPISTEMIC SCAFFOLDING (MCPs)                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  🧠 Step-by-step reasoning (no MCP; a prompt)           │
│     When: Complex decisions, systematic reasoning       │
│     Invoked by: /qual-think-through                     │
│     Used in: ALL stages                                 │
│                                                          │
│  ☯️  Lotus Wisdom                                        │
│     When: Paradoxes, contradictions, tensions           │
│     Invoked by: /qual-wisdom-check                      │
│     Used in: Theoretical integration (Stages 2 & 3)     │
│                                                          │
│  📄 MinerU (Optional - requires API key)                │
│     When: Converting complex PDFs                       │
│     Invoked by: document-conversion, interview-ingest   │
│     Used in: Data preparation (all stages)              │
│                                                          │
│  🎯 Zen MCP (Optional - requires API key)                                              │
│     When: Multi-model validation, major decisions       │
│     Invoked by: Via commands or @research-configurator  │
│     Used in: Quality checking (Stage 2)                 │
│                                                          │
│  📚 Literature Tools (Jina, Exa, Zotero)                │
│     When: Phase 1 parallel streams, manuscript prep     │
│     Used in: Stream A (theoretical), Stage 3 (writing)  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Skills Architecture (NEW!)

Skills are auto-discoverable capability packages that Claude loads when relevant.

### Why Skills?

| Before (Commands) | After (Skills) |
|-------------------|----------------|
| Complex multi-hundred line commands | Commands = simple triggers (~50 lines) |
| Logic embedded in prompts | Logic in executable scripts |
| No state management | Atomic state I/O with validation |
| No graceful degradation | 3-tier degradation for optional MCPs |

### Skill Structure

```
skills/<skill-name>/
├── SKILL.md           # Discovery info + usage guide
├── scripts/           # Executable JS scripts
│   ├── operation1.js
│   └── operation2.js
├── templates/         # Bundled templates (optional)
└── examples/          # Usage examples (optional)
```

### State I/O Pattern

All skills use shared state scripts for reliable config management:

```bash
# Read current state
node "${CLAUDE_PLUGIN_ROOT}/skills/_shared/scripts/read-config.js" --project-path /path

# Update progress
node "${CLAUDE_PLUGIN_ROOT}/skills/_shared/scripts/update-progress.js" \
  --project-path /path \
  --documents-coded 12 \
  --memos-written 5
```

Features:
- Atomic writes (temp file + rename)
- Schema validation against config.schema.json
- Path guards (only touches .interpretive-orchestration/)

### Graceful Degradation

Skills that use optional MCPs implement tier systems:

```
Tier 1: Full capability (all MCPs available)
Tier 2: Reduced capability (some MCPs)
Tier 3: Basic capability (bundled MCPs only)
```

Example - `literature-sweep`:
- Tier 1: Exa search + Jina fetch
- Tier 2: User URLs + Jina fetch
- Tier 3: User URLs + WebFetch

### Hook Remediation

Hooks now return structured JSON for better error handling:

```json
{
  "code": "STAGE1_INCOMPLETE",
  "severity": "blocking",
  "reason": "Stage 1 manual coding not complete",
  "next_commands": ["/qual-memo", "/qual-status"],
  "next_skills": ["project-setup"],
  "can_bypass": true,
  "details": { "documents_coded": 5, "documents_required": 10 }
}
```

For an incomplete Stage 1 check, the adapter turns this result into an `ask` decision so the researcher can confirm whether to proceed.

---

## Enforcement & Prompting System

```
┌──────────────┐
│ User Action  │
└──────┬───────┘
       │
       ↓
┌──────────────────────┐
│ PreToolUse Hooks     │ ← PreStage2: Ask to confirm if Stage 1 incomplete
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│ Tool Execution       │ ← Commands/Agents run
│ (Coding, Analysis)   │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│ PostToolUse Hooks    │ ← PostFiveDocuments: Pause
└──────┬───────────────┘  ← EpistemicCoherence: Check
       │                  ← PostSynthesis: Audit (Stop hook of /qual-synthesize)
       ↓
┌──────────────────────┐
│ SessionEnd Hook      │ ← Reflexivity prompt
└──────────────────────┘

All hooks: Pedagogical, not punitive
Purpose: Maintain Partnership Agency through design
```

---

## Data & Configuration Flow

```mermaid
graph TD
    Init[/qual-init Socratic dialogue]
    Init --> Human[epistemic-stance.md<br/>Human-readable]
    Init --> AI[config.json<br/>Machine-readable]

    AI --> Adapt[Agents read & adapt]
    Adapt --> Lang[Vocabulary matches stance]
    Adapt --> Depth[Reflexivity matches preference]

    Coding[@dialogical-coder codes data]
    Coding --> Log[conversation-log.jsonl<br/>AI-to-AI transparency]
    Coding --> Quotes[Coded quotes]

    Human2[Human provides feedback]
    Human2 --> Log

    Log --> Growth[Config updates<br/>Epistemic growth tracked]

    Growth --> Recursive[Recursive Evolution<br/>Both learn!]

    style Human fill:#e1f5e1
    style AI fill:#e1e5f5
    style Log fill:#fff9e6
```

---

## Design Principles (Visual)

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  SIX DESIGN PRINCIPLES                                  ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                          ┃
┃  1. Dialogue Over Commands                              ┃
┃     → Conversational, not instructional                 ┃
┃                                                          ┃
┃  2. Questions Over Instructions                         ┃
┃     → Prompts reflection before action                  ┃
┃                                                          ┃
┃  3. Transparency Over Opacity                           ┃
┃     → Visible reasoning always (4-stage)                ┃
┃                                                          ┃
┃  4. Partnership Over Service                            ┃
┃     → Co-apprentices, not tool-user                     ┃
┃                                                          ┃
┃  5. Growth Over Efficiency                              ┃
┃     → Epistemic maturity > productivity                 ┃
┃                                                          ┃
┃  6. Philosophy Over Features                            ┃
┃     → Depth > breadth, argued structure                 ┃
┃                                                          ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## Success Metrics

```
Traditional Tool Success:
    ├─ Speed: How fast can you code?
    ├─ Volume: How many units processed?
    └─ Cost: How cheap was it?

Our Success (Transformation):
    ├─ Understanding: "I think differently about interpretation now"
    ├─ Awareness: "I understand my philosophical commitments explicitly"
    ├─ Practice: "I'm naturally reflexive in my analytical work"
    └─ Partnership: "AI and I co-create insights together"

Measure: Epistemic maturity, not productivity
```

---

## Comparison Matrix

| Aspect | Traditional CAQDAS | Ad-hoc ChatGPT | Our Atelier |
|--------|-------------------|----------------|-------------|
| **Philosophy** | Implicit | None | Explicit & configurable |
| **AI Role** | Automation feature | Calculator | Co-apprentice partner |
| **Reasoning** | Black box | Opaque | 4-stage visible |
| **Structure** | Manual clicks | Ad-hoc prompts | Argued architecture |
| **Accessibility** | $$$ proprietary | Free but unreliable | Free & rigorous |
| **Learning** | Tool training | Trial & error | Progressive depth |
| **Stage 1** | Optional | Skipped | **Enforced** |
| **Reflexivity** | Up to user | Absent | **Embedded** |
| **For non-coders** | GUI only | Yes but risky | **Yes + rigorous!** |

---

## Cognitio Emergens Instantiation

```
CE Framework Concepts → Plugin Implementation

Partnership Agency
    → Co-apprenticeship architecture
    → Both serve craft tradition

Interpretive Intelligence
    → 4-stage visible reasoning
    → Conversation-log transparency

Epistemic Alienation (prevent)
    → Human authority maintained
    → Reflexive pauses
    → Visible AI reasoning

Recursive Evolution (enable)
    → Both learn and adapt
    → Config tracks growth
    → Conversation-log documents

Epistemic Ambidexterity
    → Balance structure & emergence
    → Argued constraints that liberate
    → Partnership without alienation
```

---

## For Different Audiences

### For Researchers (5-Second Scan)
**What:** Atelier of co-apprenticeship for qualitative research
**Why:** Transform thinking, not just code faster
**How:** 3 stages, 4 agents, Partnership Agency

### For Scholars (Deep Understanding)
**Framework:** Cognitio Emergens Partnership Agency instantiation
**Innovation:** Structure as liberation, co-apprenticeship without hierarchy
**Contribution:** Building as scholarship, philosopher-builder synthesis

### For Developers (Technical)
**Architecture:** 12 skills, 17 commands (as skills), 4 agents, 7 hooks, 1 bundled + 5 optional MCPs
**Design:** Skills-first architecture, commands as triggers, graceful degradation for optional MCPs
**Quality:** Atomic state writes, schema validation, structured hook remediation

### For Apprentices (Learning)
**Craft:** Micro-details matter, organization teaches, invisible excellence
**Philosophy:** Argued structure, accessibility commitment, clarity over apology
**Meta:** Building demonstrates what's being built (meta-recursivity)

---

## 🎯 Quick Reference

**Need to navigate?** → /qual-status
**Need to configure?** → /qual-configure-analysis (@research-configurator)
**Need to code?** → @dialogical-coder
**Need to reflect?** → /qual-reflect
**Need to think deeply?** → /qual-think-through
**Need to navigate paradox?** → /qual-wisdom-check
**Need to check assumptions?** → /qual-examine-assumptions
**Stage 3 theory work?** → @scholarly-companion

---

## 📐 The Blueprint is Complete

**This document:**
- ✓ Shows complete system architecture
- ✓ Verifies all components present
- ✓ Serves as presentation material
- ✓ Functions as reference guide
- ✓ Documents our craft decisions
- ✓ Visual + textual (accessible to all)

**Use for:**
- Checking completeness ✓
- Explaining to others ✓
- Presentations & papers ✓
- Future maintenance ✓

**The craft documented visually.** 📸✨

---

*Built by: Xule Lin, Kevin Corley & Claude 4.5, co-apprentices*
*Frameworks: Cognitio Emergens (Lin) | Interpretive Orchestration (Lin & Corley)*
*Last updated: November 6, 2026 (0.3.0: commands as skills, hook adapter)*

**The atelier's blueprint - preserved and enhanced.** 🎨🙏
