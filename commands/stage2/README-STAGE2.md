# Stage 2 Commands: Human-AI Collaborative Enhancement

## Why Commands Live Elsewhere

You might notice: **This folder is empty (or minimal).**

**This is intentional organization, not incompleteness.**

---

## Where Stage 2 Tools Actually Live

Stage 2 tools are distributed based on their FUNCTION, not their stage:

### In `/commands/analysis/`
✅ `/qual-reflect` - Synthesis dialogue (used throughout Stage 2)

### In `/agents/`
✅ `@dialogical-coder` - The core Stage 2 collaborative coding agent

### In `/commands/project/`
✅ `/qual-status` - Shows Stage 2 progress

### MCP Tools (Available Throughout)
✅ `/qual-think-through` - Deep reasoning
✅ `/qual-wisdom-check` - Paradox navigation
✅ `/qual-examine-assumptions` - Coherence checking

---

## 🎯 Stage 2 Overview: The Three Phases

### Phase 1: Parallel Discovery
**FUTURE:** Commands for this will include:
- `/qual-parallel-streams` - Launch theoretical + empirical analysis
- `/qual-search-literature` - Exa search for Stream A
- `/qual-fetch-article` - Jina retrieval for literature

**Current MVEP:** Use existing MCP tools + manual coordination

### Phase 2: Synthesis & Deductive Coding
**CURRENT TOOLS:**
- `@dialogical-coder` - Apply your framework to documents
- `/qual-reflect` - Synthesis dialogue after coding batches
- `/qual-think-through` - Work through integration challenges
- `/qual-wisdom-check` - Navigate tensions
- `/qual-get-perspectives` - Multi-model validation (Zen MCP)

**This is the heart of collaborative work!**

### Phase 3: Pattern Characterization
**FUTURE:** Commands for this will include:
- `/qual-characterize-patterns` - Identify systematic variations
- `/qual-dimensional-analysis` - Analyze variation dimensions

**Current MVEP:** Use `/qual-reflect` + `/qual-think-through` for this work

---

## Why This Organizational Choice?

### Option A: Put everything in stage2/
- Pro: Clear stage designation
- Con: Users searching for "thinking tools" wouldn't find them

### Option B: Organize by function (our choice)
- Pro: Commands grouped by what they DO
- Con: Stage designation less obvious

**We chose B because:**
- `/qual-think-through` is used in Stage 1, 2, AND 3
- `/qual-reflect` spans Stage 2 and 3
- Functional organization makes tools more discoverable

**Stage designation comes from /qual-status, not folder location.**

---

## Stage 2 Workflow (With Current MVEP Tools)

### Beginning Stage 2

**After Stage 1 validation:**
```
/qual-status
# Shows: Stage 1 complete ✓, Stage 2 ready to begin
```

### Phase 2: Collaborative Coding

**For each document or batch:**
```
# 1. Code with reflexive agent
@dialogical-coder Code document {ID} with 4-stage process

# 2. Review AI's 4-stage reasoning
#    - Stage 1: Tentative mapping
#    - Stage 2: AI's self-challenge
#    - Stage 3: Structured output
#    - Stage 4: Reflective audit

# 3. Provide theoretical guidance where AI is uncertain

# 4. If paradox emerges
/qual-wisdom-check {Describe contradiction}

# 5. If complex decision needed
/qual-think-through {Question}

# 6. Every 5-10 documents
/qual-reflect
# Synthesis dialogue, consolidate patterns

# 7. Check progress
/qual-status
```

### Phase 3: Pattern Variations (If Applicable)

**If systematic differences emerge:**
```
# Use existing tools
/qual-reflect Notice different pattern types emerging...
/qual-think-through How should I characterize these variations systematically?
/qual-wisdom-check Patterns seem contradictory but both valid...

# Future: Specialized commands will streamline this
```

---

## The Partnership in Action

**Stage 2 is where:**
- YOU maintain interpretive authority (always)
- AI scales your coding (4-stage process)
- Both learn from dialogue (reflexive partnership)
- Tensions are navigated (wisdom tools)
- Decisions are systematically considered (thinking tools)

**This is collaboration, not automation.**

**You direct. AI scales. You interpret.**

---

## Future Expansion (Phase 2 of Plugin Development)

**Eventually this folder might contain:**
- `/qual-parallel-streams` - Orchestrates Phase 1
- `/qual-synthesize` - Guides Phase 2 synthesis
- `/qual-characterize-patterns` - Supports Phase 3 analysis
- `/qual-code-batch` - Batch processing interface

**But MVEP works without these** - core partnership is functional now.

**We build more as community needs emerge, not because we can.**

---

## A Note on Minimalism

**Fewer commands ≠ less capable**
**Fewer commands = more intentional design**

Each tool we built serves transformation purpose.
We didn't build commands for completeness.
We built for epistemic partnership.

**Quality over quantity. Depth over breadth.**

---

*This folder's minimalism is philosophical, not accidental.*

**Stage 2 lives throughout the plugin, wherever its functions naturally belong.**
