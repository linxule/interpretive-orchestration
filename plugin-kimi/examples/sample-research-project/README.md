# Sample Research Project: Remote Work Identity

This is an example qualitative research project demonstrating the Interpretive Orchestration methodology in Kimi CLI.

## Project Overview

**Research Question:** How do software engineers construct and negotiate professional identity when transitioning to fully remote work?

**Methodology:** Gioia & Corley's systematic interpretivist approach

**Data:** 12 semi-structured interviews with software engineers who transitioned to remote work during 2020-2022

---

## Project Structure

```
sample-research-project/
├── README.md                           # This file
├── .interpretive-orchestration/
│   ├── config.json                     # Project state
│   ├── epistemic-stance.md            # Philosophical framework
│   ├── conversation-log.jsonl         # AI-researcher interactions
│   └── reflexivity-journal.md         # Researcher's reflections
│
├── stage1-foundation/
│   └── manual-codes/                  # YOUR initial coding
│       ├── P001-alex.md
│       ├── P002-sam.md
│       └── ...
│
├── stage2-collaboration/
│   ├── ai-coded/                      # AI-assisted coding
│   ├── stream-a-theoretical/          # Literature & theory
│   │   └── papers/
│   │       ├── weick-1995-sensemaking.md
│   │       └── gioia-2013-identity.md
│   │
│   └── stream-b-empirical/            # Data analysis
│       └── memos/
│           ├── memo-001-boundary-work.md
│           └── memo-002-identity-negotiation.md
│
└── stage3-synthesis/
    ├── themes/                        # Emerging themes
    └── draft-outputs/                 # Working drafts
```

---

## Getting Started

### 1. Start Kimi CLI with the Router Agent

```bash
kimi --agent-file .agents/agents/interpretive-orchestrator.yaml
```

### 2. Initialize the Project

```bash
# In Kimi CLI
/flow:qual-init

# Answer the Socratic questions:
# - Ontology: Constructivist (identities are constructed, not discovered)
# - Epistemology: Systematic interpretation with reflexivity
# - Methodology: Gioia & Corley's approach
# - AI Relationship: Partnership with visible reasoning
```

### 3. Check Your Epistemic Stance

Read `.interpretive-orchestration/epistemic-stance.md` to see your philosophical framework.

### 4. Stage 1: Manual Coding

**Goal:** Code 10+ documents manually to build foundation

```bash
# View your progress
/flow:qual-status

# Work with Stage 1 listener
@stage1-listener Help me code this interview

# Sample coding session:
# 1. Read P001-alex.md
# 2. Create initial codes (close to participant language)
# 3. Write analytic memo in stage2-collaboration/stream-b-empirical/memos/
```

### 5. Stage 2: AI Collaboration

After manually coding 10+ documents:

```bash
# Dialogical coding with 4-stage visible reasoning
@dialogical-coder Code this interview using the emerging framework

# Research configuration
@research-configurator How should I configure batch analysis?

# Literature integration
/skill:qual-literature Search for "remote work identity boundary theory"
```

### 6. Stage 3: Synthesis

```bash
# Theoretical dialogue
@scholarly-companion How does my framework relate to boundary theory?

# Build data structure
/skill:qual-gioia Validate my emerging structure
```

---

## Sample Workflow

### Example: First Coding Session (Stage 1)

```markdown
## Document: P001-alex.md

**Participant:** Alex, Senior Engineer, transitioned to remote in March 2020

**Initial codes (close to participant language):**
- "losing the watercooler conversations"
- "having to be more intentional about visibility"
- "my home office became my identity"
- "missing spontaneous collaborations"

**Analytic memo (memo-001-boundary-work.md):**
```

### Example: Stage 2 Dialogical Coding

```markdown
Researcher: @dialogical-coder Please code P007-jordan.md

AI: I'll apply the emerging framework with visible reasoning:

## 4-Stage Reasoning

**Stage 1 - Tentative Mapping:**
Jordan describes "zoom fatigue" and "always being on camera." 
Initially, I see this as boundary dissolution.

**Stage 2 - Self-Challenge:**
But I could be wrong—this might also be about performance anxiety
rather than boundary work. Let me check against other codes...

**Stage 3 - Structured Output:**
- Codes: boundary_dissolution, performance_pressure
- Evidence: "I feel like I have to perform being busy"
- Rationale: Connects to existing boundary-work theme
- Confidence: Medium

**Stage 4 - Reflective Audit:**
I'm uncertain about the performance_pressure code—it's new
and doesn't have many supporting quotes yet. Needs validation.

## Summary
Applied codes: boundary_dissolution (primary), performance_pressure (tentative)
```

---

## Key Concepts in This Project

### 1. Identity Work
How engineers construct and maintain professional identity without physical workplace cues.

### 2. Boundary Management
Strategies for separating/integrating work and personal life in shared spaces.

### 3. Visibility Practices
How remote workers make their work visible to colleagues and managers.

---

## Using This Example

### For Learning
1. Read the sample coded documents
2. Observe the progression from Stage 1 to Stage 3
3. Study the conversation log for AI-researcher interactions

### For Teaching
1. Use as a template for methodology workshops
2. Demonstrate the 3-stage sandwich methodology
3. Show examples of 4-stage visible reasoning

### For Testing
1. Test Kimi CLI skills against known data
2. Validate Gioia structure export
3. Benchmark performance with 12-document dataset

---

## Files Explained

### Stage 1: Foundation

**P001-alex.md** - Sample interview transcript with initial manual coding
- Shows first-order codes (close to participant language)
- Demonstrates memo-writing practice

### Stage 2: Collaboration

**ai-coded/** - Examples of AI-assisted coding output
- Shows 4-stage visible reasoning
- Demonstrates dialogical process

**stream-a-theoretical/papers/** - Literature
- Key papers on sensemaking, identity, boundary theory
- Linked to empirical analysis

**stream-b-empirical/memos/** - Analytic memos
- Researcher's evolving interpretations
- Connections between data and theory

### Stage 3: Synthesis

**themes/** - Emerging themes and dimensions
- 2nd-order themes from 1st-order concepts
- Aggregate dimensions

---

## Tips for Success

### Stage 1 Tips
- Stay close to participant language for 1st-order codes
- Write memos after every 2-3 documents
- Don't rush to themes—let patterns emerge

### Stage 2 Tips
- Challenge AI interpretations (it's expected!)
- Use @research-configurator for technical decisions
- Keep theoretical and empirical streams balanced

### Stage 3 Tips
- Return to literature for theoretical framing
- Test themes against extreme cases
- Use @scholarly-companion for Socratic dialogue

---

## Common Questions

**Q: Can I use this example as a template for my own project?**
A: Yes! Copy the structure and adapt the content.

**Q: How long should Stage 1 take?**
A: Typically 2-4 weeks for 10-15 documents. Quality over speed.

**Q: What if my codes are different from the AI's suggestions?**
A: Your interpretation takes precedence. AI is a partner, not authority.

**Q: How do I know when I'm ready for Stage 2?**
A: Run `/flow:qual-status`—it will validate your foundation.

---

## Resources

- [Interpretive Orchestration Documentation](../../README.md)
- [Gioia Methodology Guide](../../.agents/skills/qual-gioia/templates/gioia-structure-guide.md)
- [Kimi CLI Documentation](https://moonshotai.github.io/kimi-cli/)

---

*This example project is part of the Interpretive Orchestration plugin for Kimi CLI.*
