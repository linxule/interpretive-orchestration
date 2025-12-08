# Conversation Log Specification
## AI-to-AI Transparent Communication System

**File:** `.interpretive-orchestration/conversation-log.jsonl`
**Format:** JSON Lines (one JSON object per line)
**Purpose:** Make all AI analytical work visible and traceable

---

## Philosophy

### Why This Matters

**Traditional AI tools:** Agents work in black boxes, decisions are opaque
**Our approach:** All AI reasoning is logged and human-readable

**Transparency enables:**
- Researchers can audit AI analytical moves
- Future agents can learn from past decisions
- Reproducibility and confirmability
- Trust through visibility

**This embodies:** "AI as data source, not interpreter" - all AI work is traceable evidence

---

## Log Entry Schema

Each line in conversation-log.jsonl is a JSON object:

```json
{
  "timestamp": "ISO 8601 timestamp",
  "from": "agent_name or 'human_researcher'",
  "to": "recipient_name or 'human_researcher'",
  "message": "Human-readable summary of communication",
  "stage": "stage1_foundation | stage2_phase1 | stage2_phase2 | stage2_phase3 | stage3_synthesis",
  "activity_type": "coding | synthesis | pattern_extraction | reflection | decision",
  "metadata": {
    "context-specific fields": "values"
  },
  "philosophy_check": "Confirmation of philosophical coherence",
  "human_review_required": true | false,
  "uncertainty_areas": ["list", "of", "uncertainties"]
}
```

---

## Entry Types

### 1. Coding Activity (@dialogical-coder)

```json
{
  "timestamp": "2025-10-11T14:30:00Z",
  "from": "@dialogical-coder",
  "to": "human_researcher",
  "message": "Coded document D042. High confidence: 15 quotes. Medium: 8. Uncertain: 5. Need human interpretation on {conceptual distinctions}. Suggested 2 data structure refinements.",
  "stage": "stage2_phase2_deductive_coding",
  "activity_type": "coding",
  "metadata": {
    "document_id": "D042",
    "quotes_coded": 28,
    "confidence_distribution": {"high": 15, "medium": 8, "low": 5},
    "refinements_suggested": 2,
    "coding_duration_minutes": 12
  },
  "philosophy_check": "Used constructivist vocabulary per config.json",
  "human_review_required": true,
  "uncertainty_areas": [
    "{Conceptual distinction where human sensitivity needed}",
    "{Pattern that resists current framework}",
    "{Boundary case requiring interpretation}"
  ]
}
```

### 2. Agent-to-Agent Communication

```json
{
  "timestamp": "2025-10-11T11:00:00Z",
  "from": "@theoretical-analyzer",
  "to": "@synthesis-composer",
  "message": "Extracted 7 theoretical patterns from literature. Pattern 3 and Pattern 5 show tension - both address {aspect} but from different ontological assumptions. Human feedback needed before synthesis.",
  "stage": "stage2_phase1_parallel_discovery",
  "activity_type": "pattern_extraction",
  "metadata": {
    "patterns_identified": 7,
    "literature_sources": 9,
    "tensions_identified": 1
  },
  "philosophy_check": "Maintained {philosophical_stance} framing throughout",
  "human_review_required": true,
  "uncertainty_areas": ["Tension between Pattern 3 and Pattern 5"]
}
```

### 3. Human Feedback/Decision

```json
{
  "timestamp": "2025-10-11T15:45:00Z",
  "from": "human_researcher",
  "to": "@synthesis-composer",
  "message": "Focus on {aspect} dimensions - this is theoretically important based on my Stage 1 memos. Don't force alignment between Pattern 3 and 5; the tension is productive. Consider them as dialectical rather than contradictory.",
  "stage": "stage2_phase2_synthesis",
  "activity_type": "human_guidance",
  "metadata": {
    "decision_type": "theoretical_direction",
    "frameworks_consulted": ["{Theory A}", "{Theory B}"],
    "rationale": "Stage 1 analysis revealed {aspect} as central organizing concept"
  },
  "affects_agents": ["@synthesis-composer", "@pattern-characterizer"]
}
```

### 4. Reflexive Observations

```json
{
  "timestamp": "2025-10-11T17:00:00Z",
  "from": "human_researcher",
  "to": "self",
  "message": "Realized I'm more confident coding concrete actions than abstract orientations. This might reflect my theoretical sensitivity being stronger in processual analysis. Consider: Am I under-coding psychological/affective dimensions?",
  "stage": "stage2_phase2_deductive_coding",
  "activity_type": "reflexive_insight",
  "metadata": {
    "insight_type": "positionality_awareness",
    "action_taken": "Added memo to examine affective coding more carefully"
  },
  "follow_up": "Review documents for emotional/psychological content with fresh eyes"
}
```

### 5. MCP Tool Usage

```json
{
  "timestamp": "2025-10-11T16:20:00Z",
  "from": "human_researcher",
  "to": "sequential_thinking_mcp",
  "message": "Invoked Sequential Thinking to work through synthesis challenge: How to integrate theoretical patterns from literature with empirical patterns from extreme cases when they seem incompatible.",
  "stage": "stage2_phase2_synthesis",
  "activity_type": "deep_reasoning",
  "metadata": {
    "mcp_used": "mcp-sequentialthinking-tools",
    "thinking_steps": 12,
    "resolution": "Both patterns valid at different abstraction levels - create hierarchical integration"
  },
  "epistemic_value": "Helped me see that apparent contradiction was actually levels-of-analysis issue"
}
```

---

## Reading the Log

### For Humans

**Purpose:** Audit trail of all analytical work

**How to read:**
```bash
# See all AI activities
cat .interpretive-orchestration/conversation-log.jsonl | grep '"from":"@'

# See all human decisions
cat .interpretive-orchestration/conversation-log.jsonl | grep '"from":"human_researcher"'

# See uncertainties
cat .interpretive-orchestration/conversation-log.jsonl | grep '"uncertainty_areas"'

# See specific agent's work
cat .interpretive-orchestration/conversation-log.jsonl | grep '@dialogical-coder'

# See philosophy checks
cat .interpretive-orchestration/conversation-log.jsonl | grep '"philosophy_check"'
```

### For AI Agents

**Purpose:** Context awareness across sessions

**When coding a new document, @dialogical-coder should:**
1. Read last 10-20 log entries
2. Note what uncertainties previous sessions encountered
3. Check what human feedback has been provided
4. Adapt approach based on learned patterns

**Example:**
```javascript
// Agent reads log and learns:
// "Previous sessions struggled with {conceptual distinction}.
//  Human provided guidance: {decision criteria}.
//  I should apply those criteria to this document."
```

---

## Automatic Logging

Agents automatically log when they:
- Complete a coding session
- Identify patterns
- Encounter uncertainty
- Suggest refinements
- Make any analytical move

**Researchers manually log when they:**
- Provide feedback to agents
- Make theoretical decisions
- Have reflexive insights
- Use MCP tools for epistemic work

---

## Privacy & Data

**What gets logged:**
- Analytical activities and decisions
- Uncertainties and questions
- Methodological notes
- Philosophical coherence checks

**What does NOT get logged:**
- Actual document content (privacy)
- Participant identifying information
- Sensitive data

**Only:** Metadata about analytical process, not raw data

---

## Example Log Timeline

```jsonl
{"timestamp":"2025-10-11T09:00:00Z","from":"human_researcher","to":"self","message":"Starting Stage 2 Phase 1. Completed Stage 1 with 12 manually coded documents. Feel ready for AI collaboration.","stage":"stage2_phase1_parallel_discovery","activity_type":"milestone"}
{"timestamp":"2025-10-11T10:30:00Z","from":"@theoretical-analyzer","to":"human_researcher","message":"Analyzed 9 articles. Extracted 14 theoretical patterns. Ready for your refinement feedback.","stage":"stage2_phase1_stream_a","activity_type":"pattern_extraction","human_review_required":true}
{"timestamp":"2025-10-11T14:00:00Z","from":"human_researcher","to":"@theoretical-analyzer","message":"Consolidate patterns 3, 5, 7 - they describe same phenomenon at different abstraction levels. Emphasize {aspect} more explicitly.","stage":"stage2_phase1_stream_a","activity_type":"human_guidance"}
{"timestamp":"2025-10-11T15:30:00Z","from":"@empirical-interpreter","to":"human_researcher","message":"Coded 20 extreme case documents. Identified 12 empirical patterns. Pattern E8 doesn't align with theoretical patterns - potential important gap.","stage":"stage2_phase1_stream_b","activity_type":"pattern_extraction","uncertainty_areas":["Gap between theoretical and empirical patterns"]}
{"timestamp":"2025-10-11T16:45:00Z","from":"human_researcher","to":"sequential_thinking_mcp","message":"Need to think through synthesis challenge systematically","stage":"stage2_phase2_synthesis","activity_type":"deep_reasoning"}
{"timestamp":"2025-10-11T17:30:00Z","from":"human_researcher","to":"@synthesis-composer","message":"Integration approach decided: Create hierarchical structure where empirical patterns elaborate theoretical patterns. Gap in Pattern E8 is theoretically significant - preserve it.","stage":"stage2_phase2_synthesis","activity_type":"human_guidance"}
{"timestamp":"2025-10-11T18:00:00Z","from":"@dialogical-coder","to":"human_researcher","message":"Coded first document with synthesized framework. 18 quotes assigned, 6 uncertain. Learning your conceptual boundaries.","stage":"stage2_phase2_deductive_coding","activity_type":"coding","human_review_required":true}
```

**Reading this timeline shows:**
- Progression through stages
- Human guidance at key decisions
- AI uncertainties flagged
- Epistemic tools used
- **Complete transparency of analytical process**

---

## For Methods Papers

The conversation-log.jsonl becomes **evidence** of:
- Systematic human-AI collaboration (not automation)
- Human interpretive authority maintained (decision entries)
- Reflexive practice (human reflexive entries)
- Confirmability (complete audit trail)
- Philosophical coherence (philosophy_check fields)

**Include in appendix:** "See conversation-log.jsonl for complete analytical transparency"

---

## Template for Initial Log Entry

When project is initialized, create:

```jsonl
{"timestamp":"{ISO_TIMESTAMP}","from":"qualitative_ai_plugin","to":"human_researcher","message":"Project initialized. Philosophical stance: {STANCE}. Sandwich methodology active. Stage 1 manual analysis required before Stage 2 collaboration.","stage":"initialization","activity_type":"project_setup","philosophy_check":"Epistemic partnership established with {ontology} ontology, {epistemology} epistemology, {tradition} tradition"}
```

---

## Living Document

This log grows with your project:
- Every AI analytical move → logged
- Every human decision → logged
- Every epistemic tool use → logged
- Every reflexive insight → logged

**Result:** Complete transparency from raw data to theoretical claims

**This is confirmability through design!** 📊

---

## Context-Agnostic Note

This logging system works for:
- ANY domain (organizational, healthcare, education, etc.)
- ANY GT tradition (Gioia, Charmaz, Straussian, etc.)
- ANY research question

**The STRUCTURE of transparent communication transfers.**
**The CONTENT of what's communicated is yours.** 🌟
