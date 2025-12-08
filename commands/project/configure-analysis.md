# /qual-configure-analysis - Technical Decision Support (No Coding Required!)

## Purpose
Get help choosing AI models, thinking budgets, and processing strategies for YOUR research - without needing programming knowledge.

---

## When to Use This

### Perfect For:
- **Before Stage 2 begins** - planning your analysis approach
- **When choosing models** - Opus vs Sonnet vs Gemini?
- **Setting up batch processing** - how to handle large datasets efficiently
- **Understanding costs** - budget planning and optimization
- **If you don't code** - need technical setup help

### You Should Use This If:
- "I don't know which AI model to use for my data"
- "What's a thinking budget and how do I choose?"
- "How do I process 200 items without coding?"
- "What will this cost me?"
- "I need setup help for API access"

---

## What This Command Does

**Invokes:** `@research-configurator` agent - your technical advisor

**Process:**
1. Asks about YOUR research (data volume, complexity, goals, budget)
2. Recommends appropriate model configurations
3. Explains trade-offs in research terms (not tech jargon)
4. Estimates costs transparently
5. Can generate processing scripts if you want batch/parallel coding

**You don't need to code** - the agent handles technical complexity.
**You DO need to decide** - what trade-offs matter for YOUR research.

---

## Example Dialogue

```
User: /qual-configure-analysis

Plugin: Connecting you with @research-configurator...

@research-configurator:
Let's figure out the right configuration for YOUR analysis.

Tell me about your research:
1. How many data items? (interviews, documents, field notes, etc.)
2. How complex is each?
3. What's your analysis goal?
4. Any budget constraints?

User: I have 45 interviews to code. They're moderately complex.
      I've built my framework in Stage 1. Limited budget as PhD student.

@research-configurator:
Perfect setup for efficient analysis!

My recommendation:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Model: Claude Sonnet 4.5
Why: Great balance for deductive coding with established framework
     Good quality, cost-effective for your budget

Thinking Budget: Medium (5k tokens)
Why: Sufficient for nuanced coding, not overkill for deductive work

Processing: Batches of 10
Why: Review and refine every 10, framework can evolve
     Not so big you lose touch, efficient enough

Estimated Cost: ~$45-55 total
Breakdown: ~$1 per interview on average
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Timeline: ~5-7 days
- Day 1: Batch 1 (10 interviews)
- Days 2-3: Review, adjust if needed
- Days 4-7: Remaining batches

Sound good?
[Yes, set this up] [Explore other options] [Explain more about Sonnet]

User: Yes, set this up

@research-configurator:
Excellent! I'll create a simple processing script for you.

Steps:
1. I generate: batch-process.sh
2. You run: ./batch-process.sh
3. It processes your 45 interviews automatically
4. Results save to: stage2-collaboration/coded-data/
5. You review and provide feedback

Need API key first (if not already configured).
Want me to walk you through getting that? [Guide API setup]
Or already have it? [Proceed with script generation]
```

---

## For Different Research Scenarios

### Small Dataset (10-20 items)
**Recommendation:** Sequential with Opus
- Deep engagement, no batch needed
- Cost: $20-30 total
- "Process one-by-one with highest quality"

### Medium Dataset (40-80 items)
**Recommendation:** Batches with Sonnet
- Balance depth and efficiency
- Cost: $40-80 total
- "Batch process with quality checks"

### Large Dataset (100-300 items)
**Recommendation:** Parallel with Gemini Flash
- Volume requires efficiency
- Cost: $30-60 total
- "API-based parallel, then systematic review"

### Complex/Exploratory
**Recommendation:** Opus regardless of size
- Interpretation depth crucial
- Cost: Higher but justified
- "Quality over speed for framework building"

### Multi-Modal (interviews + documents + notes)
**Recommendation:** Differentiated strategy
- Match model to data type
- Cost: Optimized per type
- "Different tools for different data"

---

## Technical Setup Support

### API Configuration (Guided)
```
I'll create .env file with your API key.

Content:
ANTHROPIC_API_KEY=your_key_here

Location: interpretive-orchestration/.env (git-ignored for security)

This enables: Batch/parallel processing without manual API calls

You just: Paste key when prompted, I handle rest
```

### Batch Script Generation
```
I create: process-batch.sh

#!/bin/bash
for file in stage2-collaboration/data/*.txt; do
    claude-api code-with-dialogical "$file" \
    --model sonnet-4.5 \
    --thinking-budget medium \
    --output stage2-collaboration/coded/
    sleep 2  # Rate limiting
done

You run: ./process-batch.sh
```

### Progress Monitoring
```
I create: monitor-progress.sh

Shows real-time:
- Items processed: 15/45
- Current item: interview-023.txt
- Estimated completion: 2 hours
- Cost so far: $18.50
```

**All generated for you. No coding required.**

---

## Integration with Atelier Workflow

**Typical Usage:**

**Planning (Before Stage 2):**
```
/qual-configure-analysis
[Decide on model, thinking, processing strategy]
```

**Setup (Beginning Stage 2):**
```
@research-configurator Help me set up batch processing
[Get API guidance, script generation]
```

**Midway Adjustment:**
```
@research-configurator The quality isn't quite right, should I switch models?
[Discuss whether to upgrade/downgrade]
```

**Budget Check:**
```
@research-configurator How much have I spent? What's remaining?
[Cost tracking and projection]
```

---

## Philosophical Note

**Why This Agent Matters:**

**Without it:**
- Plugin only accessible to programmers
- Technical barriers prevent Partnership Agency
- Excellent philosophy, limited reach

**With it:**
- Any researcher can engage
- Technical complexity handled
- Focus stays on research, not infrastructure

**This embodies:**
- Democratization of AI-assisted methods
- Accessibility as philosophical commitment
- **Partnership extends to non-technical researchers**

**Making Partnership Agency accessible to all qualitative researchers, regardless of coding skill.**

---

**No programming knowledge required. Research expertise valued.** 🎓✨
