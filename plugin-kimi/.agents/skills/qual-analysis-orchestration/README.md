# qual-analysis-orchestration

Cost estimation and planning for Kimi K2.5 qualitative research.

## Quick Start

```bash
# Estimate costs for your project
python3 scripts/estimate_costs.py \
  --documents 50 \
  --avg-pages 5 \
  --passes 2 \
  --enable-caching
```

## What's Included

- **`scripts/estimate_costs.py`** - Main cost estimation script
- **`config/pricing.yaml`** - Kimi K2.5 pricing configuration
- **`SKILL.md`** - User documentation
- **`scripts/test_estimate_costs.py`** - Test suite (11 tests, all passing)

## Key Features

- **83% caching discount** on multi-pass workflows
- **Accurate token estimation** (500 tokens/page baseline)
- **Smart recommendations** for batch strategy and quality optimization
- **Claude comparison** for migrating users

## Example Output

```json
{
  "costs": {
    "total": "$0.85",
    "caching_savings": "$0.05",
    "range": "$0.60 - $1.11"
  },
  "recommendations": [
    {
      "type": "affordability",
      "suggestion": "At this price point, prioritize quality over cost optimization",
      "note": "Total estimated cost ($0.85) is minimal for qualitative research"
    }
  ]
}
```

## Testing

```bash
cd scripts
python3 test_estimate_costs.py
```

**Status:** 11/11 tests passing ✓

## Integration

This skill integrates with:
- **@research-configurator** - Interactive planning during Stage 2 setup
- **qual-status** - Cost tracking during analysis
- **qual-coding** - Execution of coding workflows

---

*Part of the Interpretive Orchestration plugin for Kimi CLI.*
