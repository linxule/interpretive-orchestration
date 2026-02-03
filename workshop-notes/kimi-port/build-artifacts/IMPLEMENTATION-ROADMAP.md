# Implementation Roadmap: Interpretive Orchestration for Kimi CLI

## Goal
Build a fully functional, production-ready plugin for Kimi CLI that implements the Interpretive Orchestration methodology.

## Architecture Overview

```
plugin-kimi/
├── .agents/skills/                      # Kimi CLI skills (auto-discoverable)
│   ├── qual-init/               # Flow skill: Socratic onboarding
│   ├── qual-status/             # Flow skill: Progress dashboard
│   ├── qual-coding/             # Standard skill: Dialogical coding
│   ├── qual-reflection/         # Standard skill: MCP integration
│   ├── qual-gioia/              # Gioia methodology
│   ├── qual-literature/         # Literature sweep
│   ├── qual-ingest/             # Document ingest
│   ├── qual-convert/            # Conversion guidance
│   └── qual-shared/             # Shared infrastructure
├── .agents/agents/                      # Agent definitions (YAML)
│   ├── interpretive-orchestrator.yaml
│   ├── stage1-listener.yaml
│   ├── research-configurator.yaml
│   ├── dialogical-coder.yaml
│   └── scholarly-companion.yaml
├── docs/                        # Documentation
├── tests/                       # Test suite
└── examples/                    # Example projects
```

## Phase 1: Foundation (Week 1)

### 1.1 qual-shared: State Management Infrastructure
**Purpose:** Shared utilities all skills depend on

**Components:**
- `StateManager` class (config.json I/O, optimistic locking)
- `ReasoningBuffer` (batched file writes)
- `DefensiveSkillRouter` (stage enforcement)
- `ConversationLogger` (hybrid JSONL + Markdown)

**Key Decisions from Validation:**
- File-based state with optimistic locking
- Batched writes (flush every 5 docs)
- ~150ms cold start acceptable

### 1.2 Project Structure Creation
**Purpose:** Create the atelier folder structure

**Output:**
```
my-research/
├── .interpretive-orchestration/
│   ├── config.json              # Machine-readable state
│   ├── epistemic-stance.md      # Human-readable philosophy
│   ├── conversation-log.jsonl   # AI-to-AI transparency
│   └── reflexivity-journal.md   # Researcher reflections
├── stage1-foundation/
├── stage2-collaboration/
├── stage3-synthesis/
└── .kimi/reasoning/             # Extended 4-stage analysis
```

## Phase 2: Onboarding (Week 1-2)

### 2.1 qual-init: Flow Skill
**Purpose:** Socratic onboarding with 5 philosophical questions

**Features:**
- Mermaid flow diagram with branching
- Savepoints for backtracking
- "It depends" handling
- Generates config.json + epistemic-stance.md

**Key Decisions from Validation:**
- Flow skills act as gatekeepers
- Hybrid A + B approach (defensive + atelier routing)
- Teaching moments embedded in flow

### 2.2 qual-status: Progress Dashboard
**Purpose:** Visual progress tracking

**Features:**
- Stage progress visualization
- Document coding statistics
- Saturation indicators
- Next steps guidance

## Phase 3: Core Functionality (Week 2-3)

### 3.1 qual-coding: Dialogical Coding Skill
**Purpose:** 4-stage visible reasoning for qualitative coding

**Features:**
- Stage 1: Thinking partner mode (@stage1-listener)
- Stage 2: 4-stage dialogical coding (@dialogical-coder)
- Hybrid visibility (inline summary + extended files)
- Defensive checks (can't bypass Stage 1)

**Key Decisions from Validation:**
- 4 agents × 3 contexts model
- ~60-80 tokens inline, full reasoning in files
- Context loading with caching

### 3.2 Agent Definitions (YAML)
**Purpose:** 4 agent personalities with stage contexts

**Agents:**
1. **stage1-listener:** Curious, non-directive, never suggests codes
2. **research-configurator:** Technical orchestration ("The Whisperer")
3. **dialogical-coder:** 4-stage reflexive reasoning
4. **scholarly-companion:** Theoretical dialogue partner

**Contexts:**
- stage1-context.md: Solo practice framing
- stage2-context.md: AI-assisted analysis framing
- stage3-context.md: Theoretical synthesis framing

## Phase 4: Advanced Features (Week 3)

### 4.1 qual-reflection: MCP Integration
**Purpose:** Epistemic tools (Sequential Thinking, Lotus Wisdom)

**Features:**
- MCP wrapper with graceful fallback
- Auto-detect complexity, route appropriately
- Native reasoning for simple tasks (~85% as good)
- MCP for paradox/complex tasks

**Key Decisions from Validation:**
- Fail-open with fallback strategy
- Sequential → Parallel → Synthesis pattern
- True parallelism via Task tool

### 4.2 Methodological Rules System
**Purpose:** Prevent "calculator mindset"

**Features:**
- Four-level friction: SILENT → NUDGE → CHALLENGE → HARD_STOP
- Adaptive based on researcher sophistication
- Reflexivity prompts (18 curated across 3 categories)
- Epistemic coherence checking (60+ vocabulary signals)

## Phase 5: Polish & Validation (Week 4)

### 5.1 Testing
- Unit tests for StateManager, ReasoningBuffer
- Integration tests for flow skills
- End-to-end tests with sample data
- Performance benchmarks

### 5.2 Documentation
- README with installation instructions
- User guide with examples
- Architecture documentation
- Chinese localization framework

### 5.3 Examples
- Sample research project
- Tutorial walkthrough
- Best practices guide

## Implementation Principles

### 1. Defensive Design
Every skill entry point checks state and enforces stage requirements.

### 2. Progressive Disclosure
- Simple defaults for new users
- Advanced options available on request
- Technical details hidden by default

### 3. Partnership Agency
- AI never decides final meaning
- Visible reasoning mandatory
- Reflexivity embedded, not optional
- Human authority maintained

### 4. Performance Conscious
- Batched I/O for scale
- Caching for repeated operations
- Async for non-critical paths
- File I/O <5% of total time

## Success Metrics

### Functional
- [ ] Can initialize new project via `/flow:qual-init`
- [ ] Stage 1 enforcement works (can't bypass)
- [ ] 4-stage reasoning visible and audit-able
- [ ] Can code 264 documents without performance issues
- [ ] MCP integration degrades gracefully

### Philosophical
- [ ] Human interpretive authority maintained
- [ ] Reflexivity prompts trigger appropriately
- [ ] Epistemic coherence checked
- [ ] Partnership, not automation

### User Experience
- [ ] Onboarding completes in <15 minutes
- [ ] Cold start <250ms
- [ ] Clear error messages (plain language)
- [ ] Visual progress indicators

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| File I/O performance | Batched writes, async logging |
| Context loading latency | Caching, lazy loading |
| MCP unavailability | Graceful fallback, enhanced native |
| User confusion | Atelier metaphor, clear routing |
| Stage bypass | Defensive checks on every skill |

## Deliverables

### Week 1: Foundation
- [ ] qual-shared infrastructure
- [ ] Project structure creation
- [ ] State management tested

### Week 2: Onboarding
- [ ] qual-init flow skill
- [ ] qual-status dashboard
- [ ] Agent YAMLs defined

### Week 3: Core
- [ ] qual-coding skill
- [ ] 4-stage reasoning implemented
- [ ] MCP integration

### Week 4: Polish
- [ ] Testing complete
- [ ] Documentation
- [ ] Examples
- [ ] Release ready

---

**Status:** 🚀 Implementation in progress
