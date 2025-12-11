# coherence-check

Examine philosophical assumptions and check for methodological coherence. Ensures alignment between ontology, epistemology, and analytical practice.

## When to Use

Use this skill when:
- User questions their philosophical stance
- User's language contradicts their declared epistemology
- Moving between stages and wanting to verify coherence
- User mentions "assumptions", "examine", "coherent"
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

## How It Works

The skill reviews:
1. Your declared stance in config.json
2. Recent interactions and language
3. Analytical decisions made
4. Flags tensions or confirmations

## Invocation Pattern

```
Check the coherence of my approach:

My declared stance:
- Ontology: [from config]
- Epistemology: [from config]
- Tradition: [from config]

Recent analytical decision: [describe]

Is this coherent? What tensions exist?
```

## Example Checks

### Language Check
```
Check my language coherence:

Declared stance: Constructivist
In my last session, I wrote:
"Analysis revealed that participants discover their own paths..."

Is this consistent?
```

**Response might be:**
```
Tension detected:
- "revealed" and "discover" suggest objectivist language
- Your constructivist stance would prefer:
  "Analysis constructed an understanding that participants
  characterize their own paths..."

Consider: Is this a slip in language, or are your underlying
assumptions shifting? Both are okay, but be aware.
```

### Method Check
```
Check my method coherence:

Declared epistemology: Systematic interpretation (Gioia)
Current practice: I'm not using inter-rater reliability, but I am
keeping detailed audit trails and seeking disconfirming cases.

Is this coherent with Gioia method?
```

### AI Relationship Check
```
Check my AI relationship:

Declared: Epistemic partner
Current practice: I've been accepting all of @dialogical-coder's
suggestions without much questioning.

Is this coherent?
```

**Response might be:**
```
Tension detected:
- Epistemic partnership implies dialogue, not acceptance
- You committed to "questioning both AI outputs AND your assumptions"

Recommendation: Before accepting next suggestion, ask:
- Why does this interpretation make sense?
- What alternative readings exist?
- What would I lose if this code changed?
```

## Output Format

```
Coherence Check Results
=======================

Stance Declared: [summary]

✓ Coherent:
- [aspect that aligns]
- [aspect that aligns]

⚠ Tensions Detected:
- [tension 1]: [explanation]
- [tension 2]: [explanation]

Recommendations:
- [suggestion 1]
- [suggestion 2]

Note: Tensions aren't failures - they're opportunities for
reflexive awareness. The goal is coherence, not perfection.
```

## Integration with Hooks

The `check-coherence.js` hook may flag issues automatically.
This skill provides deeper examination when issues arise.

## Philosophical Note

Coherence doesn't mean rigidity. It means:
- Awareness of your assumptions
- Consistency between belief and practice
- Transparency about choices

If your stance is evolving, that's fine - document the evolution.
The danger is unexamined drift.

## Related

- **Hooks:** check-coherence.js (automated checking)
- **Templates:** epistemic-stance.md (original declarations)
- **Skills:** deep-reasoning for thinking through shifts
