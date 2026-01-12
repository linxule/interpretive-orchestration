---
name: analysis-orchestration
description: "This skill should be used when users ask about which AI model to use for coding, mentions 'cost', 'batch', 'API', 'configure analysis', wants to process multiple documents, or needs to understand model capabilities and costs for Stage 2."
---

# analysis-orchestration

Model selection, cost estimation, and batch processing setup for AI-assisted coding. Helps researchers configure their analysis approach with awareness of tradeoffs.

## When to Use

Use this skill when:
- User asks about which AI model to use for coding
- User mentions "cost", "batch", "API", or "configure analysis"
- User wants to process multiple documents
- User needs to understand model capabilities and costs
- Starting Stage 2 and needing to plan the approach

## Capabilities

1. **Model Selection Guidance** - Help choose between models based on task needs
2. **Cost Estimation** - Estimate API costs before processing
3. **Batch Strategy** - Plan efficient document processing
4. **API Configuration** - Set up for programmatic coding (future)

## Model Selection Guide

### For Document Coding (Stage 2)

| Model | Best For | Cost | Quality |
|-------|----------|------|---------|
| Claude Opus 4.5 | Complex interpretive coding, nuanced themes | $$$ | Highest |
| Claude Sonnet 4 | Balanced quality and cost for systematic coding | $$ | High |
| Claude Haiku | Initial passes, high volume, simple categorization | $ | Good |

### Recommendation by Task

**Deep Interpretive Coding (@dialogical-coder)**
- Use: Opus 4.5 or Sonnet 4
- Why: Requires nuanced understanding, theoretical sensitivity
- Pattern: Process 5-10 documents per session with reflection

**Initial Categorization**
- Use: Sonnet 4 or Haiku
- Why: Applying established codes is less interpretively demanding
- Pattern: Batch process with human review

**Pattern Characterization**
- Use: Opus 4.5
- Why: Requires integration across documents, theoretical abstraction

## Cost Estimation

### Rough Estimates (2025 pricing)

| Documents | Model | Estimated Cost |
|-----------|-------|----------------|
| 10 interviews (~50 pages) | Opus | $15-25 |
| 10 interviews (~50 pages) | Sonnet | $5-10 |
| 50 documents | Opus | $75-125 |
| 50 documents | Sonnet | $25-50 |

**Variables:**
- Document length (tokens)
- Coding depth (passes per document)
- Output verbosity (full reasoning vs brief)

### Scripts

#### estimate-costs.js
Estimates API costs based on document characteristics.

```bash
node skills/analysis-orchestration/scripts/estimate-costs.js \
  --documents 25 \
  --avg-pages 5 \
  --model sonnet \
  --passes 2
```

**Returns:** Estimated cost range and token counts.

## Batch Processing Strategy

### Small Corpus (10-30 documents)
- Process individually with full dialogical coding
- High engagement, rich reasoning
- Best for: Interpretive research, theory building

### Medium Corpus (30-100 documents)
- Batch in groups of 10
- First pass: categorization
- Second pass: deep coding on interesting cases
- Best for: Mixed-methods, systematic reviews

### Large Corpus (100+ documents)
- Strategic sampling for deep coding
- Batch categorization with random quality checks
- Best for: Large-scale studies, triangulation

## Decision Trees

### Which Model Should I Use?

```
Is this initial exploratory coding?
├── Yes → Consider Haiku for volume, validate with Sonnet
└── No, this is interpretive coding
    ├── Budget constrained?
    │   ├── Yes → Sonnet 4 (good balance)
    │   └── No → Opus 4.5 (best quality)
    └── Need to process >50 documents?
        ├── Yes → Two-pass: Haiku then Sonnet on subset
        └── No → Single-pass with Sonnet or Opus
```

### How Many Documents Per Session?

```
Using @dialogical-coder (4-stage process)?
├── Yes → 5-10 documents per session (reflection breaks)
└── No, systematic application?
    ├── Complex coding scheme → 10-15 documents
    └── Simple categorization → 20-30 documents
```

## Integration with Interpretive Orchestration

### Stage 1
- No AI models needed (manual coding)
- Focus on human theoretical sensitivity

### Stage 2 Phase 1 (Parallel Streams)
- Stream A (theoretical): Sonnet for literature analysis
- Stream B (empirical): Start with Sonnet, elevate complex cases to Opus

### Stage 2 Phase 2 (Synthesis)
- Opus recommended for integration work
- Cross-stream synthesis requires nuanced reasoning

### Stage 2 Phase 3 (Pattern Characterization)
- Opus for pattern identification
- Sonnet for validation passes

## Related

- **Commands:** `/qual-configure-analysis` triggers this skill
- **Agents:** @research-configurator provides interactive guidance
- **Skills:** `coding-workflow/` for batch processing execution
