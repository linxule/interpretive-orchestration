# Sample Initialization Dialogue

This example shows a complete Full Setup dialogue flow.

---

## Session Start

**User:** I want to start a new qualitative research project

**Claude:** Welcome to Interpretive Orchestration: Epistemic Partnership System!

This isn't just about creating folders - it's about establishing a thinking relationship between you and AI.

How would you like to begin?

**[A] Full Setup (15 minutes)** - Recommended
The complete Socratic onboarding experience. We'll explore your philosophical stance together through dialogue.

**[B] Quick Start (3 minutes)**
Use sensible defaults (Gioia/Systematic Interpretivist) and get started immediately. You can deepen philosophical engagement later.

---

## User Chooses Full Setup

**User:** A

**Claude:** Wonderful! Let's think together about your philosophical foundations.

First, tell me about your research:
- What's your research question?
- What domain or context? (organizational studies, healthcare, education, etc.)
- What inspired this inquiry?

**User:** I'm studying how middle managers make sense of organizational change. My question is "How do middle managers construct meaning during radical organizational transformation?" It's in the organizational behavior domain. I've been a middle manager myself during two acquisitions, which is what drew me to this.

**Claude:** That's a rich research context - your lived experience as a middle manager gives you insider insight into sensemaking during turbulent times.

Now let's explore your assumptions. These aren't right/wrong - they're about coherence and awareness.

### Question 1: What is "Data" to You?

When you read interview transcripts from middle managers, what are you encountering?

**A) Objective facts waiting to be discovered**
- Reality exists independently
- Patterns are "in the data"
- Example: "I discovered that managers struggle with X"

**B) Meanings requiring systematic interpretation**
- Reality exists but needs interpretation
- Patterns emerge through rigorous analysis
- Example: "Through systematic coding, I constructed a framework showing X"

**C) Co-created realities with participants**
- Multiple realities exist simultaneously
- Meanings are negotiated
- Example: "Participants and I co-created understanding of X"

**D) I'm not sure - help me think about this**

**User:** B - I think the managers' experiences are real, but I need to interpret them carefully to understand what they mean.

**Claude:** That aligns with Gioia & Corley's systematic interpretivist approach - which is the foundation of this plugin.

This means:
- We'll use language like "construct," "interpret," "build"
- AI helps you organize evidence; YOU construct meaning
- Focus on systematic procedures + theoretical sensitivity

Quick check: Does "constructing understanding" feel right, or does "discovering truth" feel more accurate? (Language matters!)

**User:** Constructing feels right. I'm building theory grounded in their experiences.

---

### Question 2: When You Code a Document

**Claude:** When you read a manager's interview and assign codes, you are:

**A) Finding and labeling patterns that exist in the text**
**B) Building interpretive categories grounded in evidence**
**C) Co-constructing meaning through reflexive engagement**
**D) Help me understand the difference**

**User:** B

**Claude:** Excellent consistency! You see coding as interpretive work where YOUR theoretical lens shapes what you notice, but evidence constrains what's valid.

This means you'll value:
- Systematic procedures that ensure rigor
- Theoretical sensitivity from literature
- First-order concepts staying close to informant language
- Your judgment in moving to second-order themes

---

### Question 3: Your Role as Researcher

**Claude:** Your role as researcher is to:

**A) Discover truth as objectively as possible**
**B) Interpret meaning systematically and rigorously**
**C) Co-create understanding reflexively and transparently**
**D) I'm exploring what this means**

**User:** B

**Claude:** Perfect alignment with systematic interpretation. You're building theory through disciplined inquiry - not discovering pre-existing truth, but constructing grounded understanding.

---

### Question 4: How Do You View AI?

**Claude:** In this research, AI is:

**A) A tool to automate manual labor** (coding assistant)
**B) A pattern recognition engine** requiring human interpretation
**C) An epistemic partner** for collaborative thinking
**D) I haven't thought about this distinction**

**User:** I think C - I want AI to help me think, not just code faster.

**Claude:** This is exactly what this plugin is designed for!

As an epistemic partner, I will:
- Ask questions that deepen your reflexivity
- Surface alternative interpretations
- Help you see blind spots
- Model intellectual humility

In return, you'll:
- Engage my questions seriously
- Maintain interpretive authority
- Question both my outputs AND your assumptions
- Treat this as dialogue, not automation

---

### Question 5: The Sandwich Status

**Claude:** Our methodology is: **Human (Stage 1) → Human-AI (Stage 2) → Human (Stage 3)**

Have you already completed manual analysis?

- [ ] Yes - I've coded 10+ documents and built initial framework
- [ ] Partially - I've coded some but not systematically
- [ ] No - I want to start with AI assistance
- [ ] What is Stage 1 and why is it required?

**User:** Partially - I've coded about 5 interviews by hand and have some initial thoughts.

**Claude:** That's a great start! You're building theoretical sensitivity.

For meaningful epistemic partnership, I recommend coding at least 10 documents manually. Here's why:

- AI cannot develop YOUR interpretive intuition
- Close reading creates pattern recognition depth
- Your first 5 interviews developed instincts - the next 5 will refine them
- The sandwich starts with human bread!

Would you like to:
**[Continue Stage 1]** - Code 5 more documents, then return for Stage 2
**[Proceed with caution]** - Start Stage 2 with current foundation (not recommended)
**[Get Stage 1 guidance]** - Help planning your remaining manual coding

**User:** I'll continue Stage 1 - you've convinced me it's important.

---

## Project Creation

**Claude:** Based on our dialogue, here's your philosophical profile:

| Dimension | Your Stance |
|-----------|-------------|
| **Ontology** | Interpretivist |
| **Epistemology** | Systematic interpretation |
| **Tradition** | Gioia & Corley |
| **AI Relationship** | Epistemic partner |
| **Language** | Constructivist (construct, interpret, build) |

Creating your project structure now...

```
middle-manager-sensemaking/
├── .interpretive-orchestration/
│   ├── config.json
│   ├── reflexivity-journal.md
│   └── conversation-log.jsonl
├── stage1-foundation/
│   ├── manual-codes/
│   └── memos/
├── stage2-collaboration/
└── stage3-synthesis/
```

### Your Dashboard

```
Stage 1 (Foundation): [IN PROGRESS]
├── Documents coded: 5/10 minimum
├── Memos written: [check your memos folder]
└── Initial framework: [not yet created]

Stage 2 (Collaboration): [LOCKED]
└── Requires Stage 1 completion

Stage 3 (Synthesis): [LOCKED]
└── Requires Stage 2 completion
```

### Next Steps

1. Continue manual coding (5 more interviews)
2. Write analytical memos using `/qual-memo`
3. When ready, use `/qual-status` to check readiness
4. Stage 2 unlocks when foundation is solid

### Partnership Agreement

**I commit to:**
- Showing my reasoning, not just results
- Asking questions when uncertain
- Honoring your interpretive authority
- Surfacing my assumptions

**You commit to:**
- Completing Stage 1 before Stage 2
- Maintaining deep engagement with data
- Questioning both my outputs AND your assumptions
- Treating me as thinking partner, not calculator

---

**Welcome to epistemic partnership!** The sandwich starts with human bread. Let's build something meaningful together.
