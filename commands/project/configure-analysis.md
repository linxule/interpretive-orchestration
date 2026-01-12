---
description: Configure AI model selection, batch processing, and analysis parameters for Stage 2
---

# /qual-configure-analysis - Technical Decision Support

Get help choosing AI models, thinking budgets, and processing strategies for YOUR research - without needing programming knowledge.

---

## When to Use This

- **Before Stage 2 begins** - planning your analysis approach
- **When choosing models** - Opus vs Sonnet vs Gemini?
- **Setting up batch processing** - how to handle large datasets efficiently
- **Understanding costs** - budget planning and optimization
- **If you don't code** - need technical setup help

---

## What Happens

**Invokes:** `@research-configurator` agent - your technical advisor

The agent will:
1. Ask about YOUR research (data volume, complexity, goals, budget)
2. Recommend appropriate model configurations
3. Explain trade-offs in research terms (not tech jargon)
4. Estimate costs transparently
5. Generate processing scripts if you want batch/parallel coding

**You don't need to code** - the agent handles technical complexity.
**You DO need to decide** - what trade-offs matter for YOUR research.

---

## Quick Reference

| Dataset Size | Recommended Model | Estimated Cost |
|--------------|-------------------|----------------|
| Small (10-20) | Opus - deep engagement | $20-30 |
| Medium (40-80) | Sonnet - balanced | $40-80 |
| Large (100-300) | Flash/Haiku + review | $30-60 |
| Complex/Exploratory | Opus regardless | Higher |

---

## Implementation

*This command uses the `analysis-orchestration` skill and `@research-configurator` agent.*

**For Claude:** When user runs /qual-configure-analysis:

1. **Connect to @research-configurator**
   - This agent specializes in technical translation for non-programmers

2. **Gather Research Context**
   - Ask about data volume, complexity, budget constraints
   - Understand their analytical goals

3. **Use analysis-orchestration Skill**
   - Read `skills/analysis-orchestration/SKILL.md` for model selection guidance
   - Use `skills/analysis-orchestration/scripts/estimate-costs.js` for cost estimation

4. **Provide Recommendations**
   - Model selection with research-focused rationale
   - Cost estimates with transparency
   - Processing strategy (sequential, batch, parallel)

5. **Offer Setup Assistance**
   - API configuration if needed
   - Script generation for batch processing
   - Progress monitoring setup

**Philosophy:** Making Partnership Agency accessible to all qualitative researchers, regardless of coding skill.

---

## Related

- **Skill:** `analysis-orchestration` (model selection, cost estimation)
- **Agent:** `@research-configurator` (interactive technical guidance)
- **Skill:** `coding-workflow` (for batch processing execution)
