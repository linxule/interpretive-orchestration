---
name: deep-reasoning
description: "This skill should be used when users need to think through a complex analytical decision, asks 'how should I approach this?' or 'help me think through...', is stuck on a difficult coding boundary, needs to plan dimensional analysis, or is building theoretical frameworks in Stage 3."
---

# deep-reasoning

Structured step-by-step thinking for complex analytical decisions. Invokes Sequential Thinking MCP with qualitative research framing.

## When to Use

Use this skill when:
- User needs to think through a complex analytical decision
- User asks "how should I approach this?" or "help me think through..."
- User is stuck on a difficult coding boundary
- User needs to plan dimensional analysis
- Deciding between interpretive alternatives
- Building theoretical frameworks in Stage 3

## MCP Used

**Sequential Thinking** (bundled, no API key required)

## How It Works

Sequential Thinking creates dynamic thought sequences that:
- Break complex problems into manageable steps
- Allow branching and revision as understanding deepens
- Make reasoning explicit and traceable
- Generate hypotheses and verify them

## When to Invoke

### Stage 1
- Planning manual analysis approach
- Thinking through sampling strategy
- Working through initial conceptualization

### Stage 2 Phase 1
- Deep analysis of theoretical patterns from literature
- Comparing frameworks and their implications

### Stage 2 Phase 2
- Working through synthesis challenges
- Integrating theoretical and empirical patterns
- Resolving tensions between streams

### Stage 2 Phase 3
- Dimensional analysis for pattern characterization
- Identifying systematic variations
- Building pattern properties

### Stage 3
- Constructing final theoretical framework
- Organizing evidence for arguments
- Building publication-ready structure

## Invocation Pattern

When this skill is relevant, invoke Sequential Thinking with appropriate framing:

```
Use Sequential Thinking to work through: [PROBLEM]

Context:
- Research question: [from config]
- Current stage: [from config]
- Philosophical stance: [from config]

Please think step-by-step, showing your reasoning at each stage.
Feel free to revise earlier steps if new understanding emerges.
```

## Example Prompts

### Coding Decision
```
Help me think through whether this quote belongs under
"Adaptive Routine Building" or "Navigating Healthcare Systems".

The quote: "I finally found a doctor who would listen, and together
we figured out a medication schedule that actually works for my life."

Think through: What's the primary conceptual focus? Does it fit
existing concept definitions? Would it require definition expansion?
```

### Theoretical Integration
```
Help me think through how to integrate these findings:
- Empirical pattern: Participants describe feeling "in control" when...
- Theoretical concept: Weick's sensemaking emphasizes retrospection...

What's the relationship? Does my data extend, confirm, or challenge
the theoretical framework?
```

### Dimensional Analysis
```
Help me think through the dimensions of the "Adaptive Routine Building" theme:
- What varies across participants?
- What conditions affect how routines are built?
- Are there distinct types or a continuum?
```

## Output Format

Sequential Thinking produces a chain of thoughts:
```
Thought 1/N: [Initial framing]
Thought 2/N: [Analysis of first aspect]
Thought 3/N: [Revision based on new consideration]
...
Thought N/N: [Conclusion/hypothesis]
```

Each thought can:
- Build on previous thoughts
- Revise earlier conclusions
- Branch into alternatives
- Express uncertainty

## Integration Notes

- **Preserves audit trail** - Reasoning steps are visible
- **Aligns with reflexive practice** - Makes interpretive moves explicit
- **Supports human authority** - Provides reasoning for YOUR decision

## Related

- **MCPs:** Sequential Thinking (bundled)
- **Commands:** `/qual-think-through` triggers this skill
- **Skills:** paradox-navigation for tensions, coherence-check for assumptions
