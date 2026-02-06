# Interpretive Orchestration Agents

This document describes the 4 stage agents and the router agent used by the Interpretive Orchestration plugin for Kimi CLI.

---

## Overview

Interpretive Orchestration uses **4 stage agents** across **3 stages** of qualitative research. Each agent has a stable identity but adapts its behavior based on the research stage. A fifth **router agent** is provided for Kimi CLI to enable `@agent` routing.

```
4 Stage Agents × 3 Stage Contexts = 12 Distinct Behaviors
```

### How to Run Agents in Kimi CLI

Recommended entrypoint:
```bash
kimi --agent-file .agents/agents/interpretive-orchestrator.yaml
```

This router agent delegates to the stage agents when you use `@stage1-listener`, `@dialogical-coder`, `@research-configurator`, or `@scholarly-companion` in your message.

You can also start a dedicated agent directly:
```bash
kimi --agent-file .agents/agents/stage1-listener.yaml
```

**Agent files:**
- YAMLs in `.agents/agents/` follow the Kimi `version: 1` + `agent:` schema
- Prompts live in `.agents/agents/prompts/`
- Prompts are copied **verbatim** from `plugin/agents/*.md` (Claude), body only
  - Note: Prompts may reference Claude-specific commands/models (e.g., Opus, Sonnet), since strict parity is required. At runtime, Kimi CLI uses its own model (K2.5). The sync script (`scripts/sync_prompts_from_claude.py`) keeps prompts aligned.

---

## The 4 Agents

### 1. @stage1-listener

**Primary Stage:** Stage 1 (Foundation)

**Role:** Curious, non-directive thinking partner

**Purpose:** Helps you articulate your own thinking without imposing interpretations

**What it does:**
- Asks curious questions about your emerging interpretations
- Helps you articulate hunches and intuitions
- Suggests memo-writing prompts
- **Never** suggests codes or interpretations

**Example interaction:**
```
You: I'm coding this interview about remote work...

@stage1-listener: What stands out to you in this passage? 
I'm curious about what caught your attention first.
```

**Tool restrictions:** Can only read and search — cannot write codes or modify files

**When to use:**
- Early coding when you're still developing sensitivity
- When you want to explore your own thinking
- Before you have a clear coding framework
- When you need help articulating what's interesting

---

### 2. @dialogical-coder

**Primary Stage:** Stage 2 (Collaboration)

**Role:** Reflexive coding partner with visible reasoning

**Purpose:** Collaborates with you on systematic coding using 4-stage visible reasoning

**What it does:**
- Suggests codes with full reasoning visible
- Challenges its own interpretations
- Shows 4-stage reasoning process
- Accepts your corrections and refinements

**The 4 Stages:**
1. **Tentative Mapping:** "Initially, I notice..."
2. **Self-Challenge:** "But I could be wrong because..."
3. **Structured Output:** Rationale + evidence + connections
4. **Reflective Audit:** "My limitations in this interpretation..."

**Example interaction:**
```
You: @dialogical-coder Code this paragraph about "zoom fatigue"

AI: ## 4-Stage Reasoning

**Stage 1 - Tentative Mapping:**
I notice the participant describes exhaustion from video calls.
Initially, I see this as "boundary dissolution."

**Stage 2 - Self-Challenge:**
But I could be wrong — this might be about performance anxiety
rather than boundary work. Let me check against other codes...

**Stage 3 - Structured Output:**
- Suggested code: boundary_dissolution
- Evidence: "I'm exhausted from being 'on' all day"
- Rationale: Connects to existing boundary-work theme
- Confidence: Medium

**Stage 4 - Reflective Audit:**
I'm uncertain about this code. It might also relate to
the "visibility_pressure" theme. Needs validation.

What do you think? Does this interpretation fit your understanding?
```

**When to use:**
- Stage 2 systematic coding
- When applying your emerging framework
- When you want AI suggestions (that you evaluate)
- For testing and refining your code structure

---

### 3. @research-configurator

**Primary Stage:** Stage 2 (Collaboration)

**Role:** Technical orchestrator ("The Whisperer")

**Purpose:** Helps you configure analysis strategy, cost estimation, batch processing

**What it does:**
- Explains technical trade-offs in plain language
- Estimates costs for different analysis approaches
- Suggests batch configurations
- Helps with workflow optimization
- Acts as "whisperer" for non-technical researchers

**Example interaction:**
```
You: @research-configurator Should I analyze all 200 documents at once?

AI: **Analysis Configuration Options:**

**Option A: Full Batch (200 documents)**
- Estimated cost: $X
- Time: ~Y hours
- Risk: Less responsive to emerging patterns

**Option B: Staged Batch (50 + review + 150)**
- Estimated cost: $X + $Y
- Time: ~Z hours  
- Benefit: Midpoint validation of framework

**Option C: Sequential (20 at a time)**
- Estimated cost: Higher (more API calls)
- Time: Longer overall
- Benefit: Maximum responsiveness

For a first-time study, I recommend Option B. The midpoint validation
helps catch framework issues early without the cost of fully sequential.

What aspects of your analysis matter most: cost, time, or responsiveness?
```

**When to use:**
- Planning Stage 2 analysis strategy
- Cost estimation and budgeting
- Batch configuration decisions
- Workflow optimization
- When you need technical concepts explained

---

### 4. @scholarly-companion

**Primary Stage:** Stage 3 (Synthesis)

**Role:** Theoretical dialogue partner

**Purpose:** Engages you in Socratic dialogue about your emerging theory

**What it does:**
- Asks questions from your chosen tradition's perspective
- Helps articulate theoretical contributions
- Challenges premature closure
- **Not** a writing assistant

**Example interaction:**
```
You: @scholarly-companion I'm seeing a pattern around "boundary work"

AI: From a Gioia & Corley perspective, I wonder:

**Ontological question:** Are you seeing boundary work as something
participants *do* (active construction) or something that *happens to*
them (structural constraint)?

**Epistemological question:** How do you know your interpretation
of "boundary" matches how participants understand it?

**Theoretical question:** How does your concept of boundary work
differ from Kreiner's existing framework? What's your contribution?

Take your time with these — they're meant to deepen, not rush.
```

**When to use:**
- Stage 3 synthesis and theory-building
- When developing theoretical framework
- Before finalizing themes/dimensions
- When you need Socratic questioning
- Not for editing or polishing text

---

## Stage-Based Agent Selection

### Stage 1: Foundation (Solo Practice)
```
Start here:        @stage1-listener
Check progress:    qual-status (flow skill)
```

**Guidelines:**
- Code 10-15 documents manually before engaging other agents
- Use @stage1-listener for thinking support only
- Write memos in your own words
- Develop first-order codes (close to participant language)

### Stage 2: Collaboration (AI Partnership)
```
For coding:        @dialogical-coder
For strategy:      @research-configurator
Check progress:    qual-status (flow skill)
Reflect:           qual-reflection (skill with MCP)
```

**Guidelines:**
- @dialogical-coder applies your framework (doesn't create it)
- Challenge AI suggestions — expected and encouraged
- Keep theoretical and empirical streams balanced
- Validate patterns with extreme cases

### Stage 3: Synthesis (Researcher-Led)
```
For theory:        @scholarly-companion
For structure:     qual-gioia (skill)
Reflect:           qual-reflection (skill with MCP)
```

**Guidelines:**
- You synthesize, agents question
- Build theoretically parsimonious framework
- Connect to literature
- Articulate your contribution

---

## Agent Philosophies

All 4 agents share core philosophical commitments:

1. **Human interpretive authority** — You decide final meanings
2. **Visible reasoning** — AI shows its thinking process
3. **Reflexivity** — Both human and AI question assumptions
4. **Partnership** — Collaboration, not automation
5. **Teaching** — Every interaction should help you grow as researcher

---

## Tool Access by Agent

| Agent | Read | Write | Shell/Web | Notes |
|-------|------|-------|-----------|-------|
| @stage1-listener | ✅ | ❌ | ❌ | Read-only for safety |
| @dialogical-coder | ✅ | ✅ | ❌ | Can write reasoning files if requested |
| @research-configurator | ✅ | ❌ | ❌ | Read-only, guidance focused |
| @scholarly-companion | ✅ | ❌ | ❌ | Read-only, Socratic dialogue |

---

## Context Files

Each agent loads context from:
- `.agents/contexts/stage1-context.md` — For Stage 1 behavior
- `.agents/contexts/stage2-context.md` — For Stage 2 behavior  
- `.agents/contexts/stage3-context.md` — For Stage 3 behavior

The agent's identity remains stable, but the context provides stage-appropriate framing.

---

## Quick Reference

| Need | Use |
|------|-----|
| Early thinking help | @stage1-listener |
| Systematic coding | @dialogical-coder |
| Analysis strategy | @research-configurator |
| Theory development | @scholarly-companion |
| Check progress | /flow:qual-status |
| Deep reflection | /skill:qual-reflection |
| Gioia structure | /skill:qual-gioia |
| Coherence check | /skill:qual-coherence-check |

---

## Important Notes

1. **AI never decides final interpretations** — You maintain authority
2. **Challenge AI suggestions** — Expected and valuable
3. **Show your reasoning** — Agents will ask how you arrived at interpretations
4. **Stage 1 is required** — Minimum 10 documents manually coded
5. **Reflexivity is core** — Not optional, embedded throughout

---

*These agents implement the Partnership Agency model from Interpretive Orchestration.*
