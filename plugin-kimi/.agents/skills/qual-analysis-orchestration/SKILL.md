# qual-analysis-orchestration

Cost estimation and analysis planning for Kimi K2.5 AI-assisted qualitative coding.

## When to Use

Use this skill when:
- User asks about costs or budget for Stage 2
- User mentions "estimate", "pricing", or "how much will this cost"
- Starting Stage 2 and planning the coding approach
- User wants to understand multi-pass strategies
- User is migrating from Claude and comparing costs

## Capabilities

1. **Cost Estimation** - Estimate Kimi API costs before processing
2. **Caching Strategy** - Model 83% savings from context caching
3. **Multi-Pass Planning** - Plan efficient 2-pass workflows
4. **Claude Migration** - Compare costs for users moving from Claude

## Kimi K2.5 Pricing (2026)

| Component | Price per 1M tokens | Notes |
|-----------|---------------------|-------|
| Input | $0.60 | Standard input tokens |
| Cached Input | $0.10 | 83% discount on repeated input |
| Output | $3.00 | Generated tokens |

**Key advantage:** Context caching makes multi-pass workflows extremely affordable.

## Model Selection

**Kimi K2.5** is the flagship model for all qualitative coding tasks:
- **Multimodal:** Handles text, images, and video
- **Agentic:** Sophisticated reasoning for interpretive work
- **Affordable:** 25x cheaper than Claude Opus, 5x cheaper than Claude Sonnet
- **Quality:** State-of-the-art open model performance

**No model selection needed** - Kimi K2.5 handles everything from initial coding to deep interpretation.

## Cost Estimates (Typical Projects)

| Project Size | Estimated Cost | Notes |
|--------------|---------------|-------|
| 10 interviews (~50 pages) | $0.20 - $0.40 | Single pass |
| 10 interviews (2-pass) | $0.25 - $0.45 | With caching benefit |
| 50 documents (~250 pages) | $1.00 - $1.50 | Single pass |
| 50 documents (2-pass) | $1.25 - $1.75 | With caching benefit |
| 100 interviews (~500 pages) | $2.00 - $3.00 | Single pass |
| 100 interviews (2-pass) | $2.50 - $3.50 | With caching benefit |

**Key insight:** Even large-scale projects cost less than $5 with Kimi K2.5.

## Multi-Pass Strategy

### Why 2-Pass Coding Works Well with Kimi

**Pass 1: Categorization**
- Apply established coding framework
- Quick pass through all documents
- Build familiarity with corpus

**Pass 2: Deep Coding**
- Focus on theoretically interesting segments
- Full 4-stage dialogical reasoning
- 83% of input tokens cached → only $0.10/M

**Cost comparison (50 documents):**
- Single pass: ~$1.25
- Two-pass with caching: ~$1.50 (+$0.25 for much richer analysis)

## Usage

### Estimate Costs

```bash
python3 .agents/skills/qual-analysis-orchestration/scripts/estimate_costs.py \
  --documents 25 \
  --avg-pages 5 \
  --passes 2 \
  --enable-caching
```

**Returns:**
```json
{
  "success": true,
  "costs": {
    "total": "$0.62",
    "caching_savings": "$0.15",
    "range": "$0.43 - $0.81"
  },
  "recommendations": [...]
}
```

### From Kimi Agent

When @research-configurator is active, just ask:

```
How much will it cost to code my 30 interviews?
```

The agent will invoke this skill and provide estimates.

## Decision Trees

### How Many Passes Should I Use?

```
Do you have an established coding framework?
├── Yes → 2-pass workflow recommended
│   └── Pass 1: Apply framework (fast categorization)
│   └── Pass 2: Deep coding on interesting cases (83% cached)
└── No, exploratory coding
    └── Single pass with full dialogical coding throughout
```

### Batch Strategy

```
How many documents?
├── < 20 documents
│   └── Process individually with full attention
├── 20-50 documents
│   └── Batches of 10-15 with review breaks
├── 50-100 documents
│   └── Batches of 20-30, strategic sampling for deep passes
└── 100+ documents
    └── Stratified sampling + batch categorization
```

## Integration with Interpretive Orchestration

### Stage 1
- **No AI costs** - Manual coding builds foundation
- Use this skill to plan Stage 2 approach

### Stage 2 Phase 1 (Parallel Streams)
- Stream A (theoretical): Kimi K2.5 for literature analysis
- Stream B (empirical): Kimi K2.5 for document coding
- **Strategy:** Two-pass with caching for efficiency

### Stage 2 Phase 2 (Synthesis)
- Kimi K2.5 for cross-stream integration
- **Strategy:** Single pass, high verbosity for nuanced reasoning

### Stage 2 Phase 3 (Pattern Characterization)
- Kimi K2.5 for pattern identification and validation
- **Strategy:** Iterative refinement, caching benefits accumulate

## Comparing to Claude (Migration Users)

If you're migrating from Claude:

| Task | Claude Opus | Claude Sonnet | Kimi K2.5 | Savings |
|------|-------------|---------------|-----------|---------|
| 10 interviews | $15-25 | $5-10 | $0.20-0.40 | 95-99% |
| 50 documents | $75-125 | $25-50 | $1.00-1.50 | 97-99% |

**Migration insight:** At Kimi K2.5 prices, optimize for quality and theoretical depth, not cost.

## Recommendations Philosophy

Because Kimi K2.5 is so affordable, our recommendations focus on:
- **Quality** over cost optimization
- **Multi-pass workflows** to deepen analysis
- **Full dialogical coding** rather than shortcuts
- **Theoretical richness** without budget constraints

Cost is no longer the limiting factor. Prioritize interpretive depth.

## Related

- **Agents:** @research-configurator provides interactive planning
- **Skills:** `qual-coding` for executing the coding workflow
- **Skills:** `qual-status` shows cost tracking during analysis

---

*Powered by Kimi K2.5 - Affordable intelligence for rigorous research.*
