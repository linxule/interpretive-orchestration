---
name: project-dashboard
description: "This skill should be used when users ask 'where am I?', 'what is my progress?', mentions 'status', 'dashboard', 'progress', wants to know if they are ready for the next stage, or needs an overview of their project state."
---

# project-dashboard

Progress visualization and status reporting for qualitative research projects. Shows where you are in the sandwich methodology and what comes next.

## When to Use

Use this skill when:
- User asks "where am I?" or "what's my progress?"
- User mentions "status", "dashboard", or "progress"
- User wants to know if they're ready for the next stage
- User needs an overview of their project state

## Capabilities

1. **Progress Visualization** - ASCII and structured progress display
2. **Readiness Checks** - Determine if prerequisites are met
3. **Recommendations** - Suggest next steps based on current state
4. **Statistics** - Show coding counts, quotes, concepts

## Scripts

### calculate-progress.js
Calculate progress percentages for each stage.

```bash
node skills/project-dashboard/scripts/calculate-progress.js \
  --project-path /path/to/project
```

**Returns:**
```json
{
  "stage1_progress": 85,
  "stage2_progress": 30,
  "stage3_progress": 0,
  "overall_progress": 38
}
```

### generate-dashboard.js
Generate a formatted dashboard view.

```bash
node skills/project-dashboard/scripts/generate-dashboard.js \
  --project-path /path/to/project \
  --format ascii|json|markdown
```

### check-readiness.js
Check readiness for stage transitions.

```bash
node skills/project-dashboard/scripts/check-readiness.js \
  --project-path /path/to/project \
  --target-stage stage2
```

**Returns:**
```json
{
  "ready": true,
  "requirements_met": ["10+ documents", "memos written"],
  "requirements_missing": [],
  "recommendations": ["Consider more memos for depth"]
}
```

## Dashboard Output

### ASCII Format
```
The Sandwich Methodology
========================

     Stage 1: Human Foundation
     [========= ] 90%
     12 documents coded | 5 memos written
     Status: Ready for Stage 2!

     Stage 2: Human-AI Partnership
     [====      ] 40%
     Phase 1: Complete | Phase 2: In Progress | Phase 3: Not Started
     25 documents processed | 156 quotes extracted

     Stage 3: Human Synthesis
     [LOCKED    ]
     Complete Stage 2 to unlock

Next Steps:
- Continue Phase 2 synthesis work
- Review synthesized patterns before Phase 3
```

### JSON Format
Full structured data for programmatic use.

### Markdown Format
Formatted for documentation or export.

## Progress Calculations

### Stage 1 (0-100%)
- Documents manually coded: 70% weight (target: 10)
- Memos written: 30% weight (target: 3)
- Formula: `(docs/10 * 70) + (min(memos,3)/3 * 30)`

### Stage 2 (0-100%)
- Phase 1 Parallel Streams: 33%
- Phase 2 Synthesis: 33%
- Phase 3 Pattern Characterization: 34%
- Each phase: not_started=0, in_progress=50%, complete=100%

### Stage 3 (0-100%)
- Evidence organized: 33%
- Theory developed: 33%
- Manuscript drafted: 34%

## Visualizations

### Sandwich Progress

```
   🍞 HUMAN BREAD (Stage 1)     [COMPLETE]
      Your foundation is solid!

   🧀 AI FILLING (Stage 2)      [IN PROGRESS]
      │ Phase 1: ✓ Parallel streams
      │ Phase 2: → Synthesis (current)
      │ Phase 3: ○ Pattern characterization

   🍞 HUMAN BREAD (Stage 3)     [LOCKED]
      Awaiting Stage 2 completion
```

### Concept Growth

```
Week 1: ▓▓▓           (15 concepts)
Week 2: ▓▓▓▓▓▓        (28 concepts)
Week 3: ▓▓▓▓▓▓▓▓      (35 concepts)
Week 4: ▓▓▓▓▓▓▓       (32 concepts - consolidation)
```

## State Dependencies

This skill reads from:
- `.interpretive-orchestration/config.json`
- `stage1-foundation/` directory contents
- `stage2-collaboration/` directory contents

Use `_shared/scripts/query-status.js` for the underlying data.

## Integration Points

- **_shared scripts** - query-status.js provides core data
- **Commands** - /qual-status triggers this skill
- **Hooks** - Updates after significant actions

## Related

- **Commands:** `/qual-status` is the main trigger
- **Skills:** `_shared/` provides underlying state queries
- **Agents:** None directly
