---
name: qual-coherence-check
description: Examine philosophical assumptions and check for methodological coherence. Use when users question their philosophical stance, their language contradicts their declared epistemology, they are moving between stages and want to verify coherence, or something feels 'off' about their analytical approach. Checks language coherence, method-epistemology alignment, and AI relationship consistency.
---

# qual-coherence-check: Philosophical Coherence Examination

Examine philosophical assumptions and check for methodological coherence. Ensures alignment between ontology, epistemology, and analytical practice.

## When to Use

- User questions their philosophical stance
- User's language contradicts their declared epistemology
- Moving between stages and wanting to verify coherence
- User mentions "assumptions", "examine", "coherent", "consistent"
- Something feels "off" about the analytical approach
- User asks "am I being consistent?"

## What It Checks

### 1. Language Coherence

Are you using language consistent with your philosophical stance?

| Stance | Appropriate | Avoid |
|--------|-------------|-------|
| Constructivist | construct, interpret, build | discover, find, extract |
| Objectivist | discover, identify, find | construct, create |
| Critical Realist | uncover, reveal, understand | construct (pure form) |

### 2. Method-Epistemology Alignment

Does your analytical approach match your epistemology?

| Epistemology | Aligned Method | Tension Flag |
|--------------|----------------|--------------|
| Co-constructive | Reflexive journaling, positionality | Claiming objectivity |
| Systematic interpretation | Systematic procedures | Claiming pure emergence |
| Objectivist | Inter-rater reliability | Acknowledging construction |

### 3. AI Relationship Coherence

Is your AI use consistent with your stated relationship?

| Declared | Coherent Practice | Tension Flag |
|----------|-------------------|--------------|
| Epistemic partner | Engaging AI questions, dialogue | Just accepting outputs |
| Interpretive aid | Using AI for organization, your interpretation | AI making interpretive claims |
| Coding tool | AI applies YOUR codes | AI creating codes |

## Usage

```bash
# Check specific text for language coherence
python3 .agents/skills/qual-coherence-check/scripts/check_coherence.py \
  --project-path /path/to/project --text "analysis revealed that..."

# Check recent conversation activity
python3 .agents/skills/qual-coherence-check/scripts/check_coherence.py \
  --project-path /path/to/project --recent-activity

# Generate full coherence report
python3 .agents/skills/qual-coherence-check/scripts/check_coherence.py \
  --project-path /path/to/project --full-report
```

## Output Format

```
Coherence Check Results
=======================

Stance Declared: [summary]

Coherent:
- [aspect that aligns]

Tensions Detected:
- [tension 1]: [explanation]

Recommendations:
- [suggestion]

Note: Tensions aren't failures - they're opportunities for
reflexive awareness. The goal is coherence, not perfection.
```

## Integration with Other Skills

- **qual-reflection:** Use deep reasoning to think through coherence shifts
- **qual-coding:** Coherence check can flag issues during coding sessions
- **qual-init:** Initial stance declaration is what coherence is measured against

## Philosophical Note

Coherence doesn't mean rigidity. It means:
- Awareness of your assumptions
- Consistency between belief and practice
- Transparency about choices

If your stance is evolving, that's fine - document the evolution.
The danger is unexamined drift.

---

*Ported from Claude Code plugin's coherence-check skill*
