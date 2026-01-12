---
name: coding-workflow
description: "This skill should be used when users are ready to start Stage 2 coding, asks about processing documents systematically, needs to track coding progress, wants to generate audit documentation, or mentions 'batch', 'coding session', 'systematic coding'."
---

# coding-workflow

Document coding orchestration for Stage 2. Manages the systematic coding process, tracks progress, and generates audit trails.

## When to Use

Use this skill when:
- User is ready to start Stage 2 coding
- User asks about processing documents systematically
- User needs to track coding progress
- User wants to generate audit documentation
- User mentions "batch", "coding session", or "systematic coding"

## Prerequisites

**Before using this skill, verify:**
1. Stage 1 is complete (10+ documents manually coded)
2. Initial data structure exists
3. Project is properly initialized

Use `skills/_shared/scripts/read-config.js` to check readiness.

## Workflow Stages

### Stage 2 Phase 1: Parallel Streams

**Stream A (Theoretical)**
- Analyze foundational literature
- Extract theoretical patterns
- Use @scholarly-companion for Socratic dialogue

**Stream B (Empirical)**
- Apply @dialogical-coder to documents
- Follow 4-stage visible reasoning
- Build evidence for concepts

### Stage 2 Phase 2: Synthesis

- Compare theoretical and empirical patterns
- Identify alignments and tensions
- Refine data structure

### Stage 2 Phase 3: Pattern Characterization

- Identify systematic variations
- Document pattern properties
- Prepare for Stage 3 theorizing

## Scripts

### process-batch.js
Process a batch of documents through coding workflow.

```bash
node skills/coding-workflow/scripts/process-batch.js \
  --project-path /path/to/project \
  --documents "D001,D002,D003" \
  --agent dialogical-coder \
  --phase phase2_synthesis
```

### track-documents.js
Track which documents have been coded and their status.

```bash
node skills/coding-workflow/scripts/track-documents.js \
  --project-path /path/to/project \
  --list  # List all documents and status
  --mark-coded D004  # Mark document as coded
```

### generate-audit.js
Generate audit trail documentation.

```bash
node skills/coding-workflow/scripts/generate-audit.js \
  --project-path /path/to/project \
  --output audit-trail.md
```

## Coding Session Flow

### Recommended Session Structure

1. **Pre-Session (5 min)**
   - Check config state: `read-config.js`
   - Review recent conversation log
   - Set session goals

2. **Coding (45-60 min)**
   - Process 5-10 documents with @dialogical-coder
   - Full 4-stage reasoning for each
   - Log interactions: `append-log.js`

3. **Reflection (10-15 min)**
   - Write analytical memo
   - Update data structure if needed
   - Note emerging questions

4. **Post-Session**
   - Update progress: `update-progress.js`
   - Queue documents for next session

### Interpretive Pauses

Every 5 documents, the system prompts:
> "You've coded 5 documents. Before continuing, reflect:
> - What patterns are emerging?
> - Any surprises or tensions?
> - Does the data structure still fit?"

This is enforced by the `interpretive-pause.js` hook.

## Templates

### conversation-log-spec.md
Specification for the JSONL log format used for AI-to-AI transparency.

Entry structure:
```json
{
  "timestamp": "ISO-8601",
  "agent": "dialogical-coder",
  "action": "coding",
  "document_id": "D003",
  "concept_id": "AD1_T1_C1",
  "content": "Applied code with reasoning...",
  "metadata": {}
}
```

## Document Status Tracking

| Status | Meaning |
|--------|---------|
| `pending` | Not yet coded |
| `in_progress` | Currently being coded |
| `coded` | First pass complete |
| `reviewed` | Human has reviewed AI coding |
| `finalized` | Coding complete, quotes extracted |

## Integration Points

- **@dialogical-coder** - Primary coding agent
- **interpretive-pause hook** - Enforces reflection breaks
- **_shared scripts** - State management
- **gioia-methodology skill** - Data structure validation

## Related

- **Commands:** Various coding commands trigger this skill
- **Agents:** @dialogical-coder for visible reasoning
- **Hooks:** interpretive-pause.js, check-stage1-complete.js
- **Other Skills:** project-dashboard for progress visualization
