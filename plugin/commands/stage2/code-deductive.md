---
description: Apply established theoretical patterns to remaining data in a deductive coding pass
---

# Deductive Coding Command

This command guides you through applying your synthesized patterns to the remaining documents in a more deductive manner, while remaining open to emergent insights.

## Overview

After synthesis, you have an integrated framework of patterns. Now you apply this framework to code your remaining documents, testing and refining as you go.

This is NOT mechanical application. It's a dialogue between your framework and new data.

## When to Use Deductive Coding

Use this approach when:
- You've completed parallel streams and synthesis
- Your integrated framework feels solid
- You have remaining documents to code
- You want to test framework coverage

## The Deductive Coding Process

### Step 1: Prepare Your Framework

Before coding, ensure you have:
- [ ] Clear pattern definitions
- [ ] Example quotes for each pattern
- [ ] Inclusion/exclusion criteria
- [ ] Noted variations and edge cases

### Step 2: Code with Your Framework

For each document:

1. **Initial read:** Get the overall sense
2. **Apply patterns:** Match segments to your framework
3. **Note fit:** How well do patterns capture the data?
4. **Flag anomalies:** What doesn't fit? What's new?

### Step 3: Remain Inductively Open

Deductive doesn't mean closed. Watch for:
- **New patterns:** Data that needs a new category
- **Pattern refinement:** Existing patterns need adjustment
- **Dimension discovery:** Variations you hadn't seen
- **Disconfirming evidence:** Cases that challenge patterns

### Step 4: Update Your Framework

After each batch of documents:
- Revise pattern definitions as needed
- Add new patterns that emerged
- Note dimensional variations
- Document disconfirming cases

## Using @dialogical-coder for Deductive Coding

Request @dialogical-coder to:

1. **Code against your framework:** "Apply patterns X, Y, Z to this document"
2. **Show reasoning:** Why does this segment match this pattern?
3. **Flag uncertainties:** Where is the fit ambiguous?
4. **Identify exceptions:** What doesn't fit existing patterns?

Example prompt:
> "Using my established patterns [list them], code this document. Show your reasoning for each assignment and flag anything that doesn't fit well."

## Quality Checks During Deductive Coding

### Every 5 Documents (PostFiveDocuments Hook)
- Are patterns still working?
- What refinements are needed?
- Any new patterns emerging?
- Overall framework coherence?

### Pattern Saturation Check
- Are patterns being applied without refinement?
- Are new documents confirming without extending?
- Have you reached theoretical saturation?

## Common Issues and Solutions

### Issue: Everything Fits Everywhere
**Problem:** Patterns are too broad
**Solution:** Tighten definitions; add subcategories

### Issue: Too Many Anomalies
**Problem:** Framework may be underdeveloped
**Solution:** Return to synthesis; revisit pattern construction

### Issue: Coding Feels Mechanical
**Problem:** Lost the interpretive engagement
**Solution:** Ask "What is this informant REALLY saying?" before coding

### Issue: Framework Isn't Capturing Richness
**Problem:** Deductive approach is flattening data
**Solution:** Allow new patterns; don't force fit

## Documentation During Deductive Coding

Track as you go:
```
Document: [ID]
Patterns applied: [list]
Strong fits: [which patterns, which quotes]
Weak fits: [ambiguous assignments]
Anomalies: [what doesn't fit]
Refinements needed: [suggested changes]
```

## Tools

- **@dialogical-coder:** Primary coding assistant
- **Sequential Thinking:** Work through ambiguous coding decisions
- **Lotus Wisdom:** When data seems to both fit and not fit a pattern

## Philosophical Note

Deductive coding in qualitative research is different from deductive coding in quantitative research. You're not just "applying codes" - you're continuing the interpretive dialogue. Your framework is a conversation partner, not a straightjacket.

## Next Steps

After deductive coding pass:
1. Review framework refinements
2. Run `/qual-characterize-patterns` for dimensional analysis
3. Prepare for Stage 3: Dialogue with Tradition
