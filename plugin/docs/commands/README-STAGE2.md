# Stage 2 commands: human-AI collaborative enhancement

## Where Stage 2 tools live

Stage 2 tools are spread across the plugin by FUNCTION, not by stage. Every command is a skill in `skills/qual-<name>/`.

### Stage 2 commands
✅ `/qual-parallel-streams` - Phase 1, launch theoretical and empirical streams
✅ `/qual-synthesize` - Phase 2, merge the streams into unified patterns
✅ `/qual-code-deductive` - Phase 2, apply established patterns to the remaining data
✅ `/qual-characterize-patterns` - Phase 3, dimensional analysis of patterns

### Agents in `agents/`
✅ `@dialogical-coder` - The core Stage 2 collaborative coding agent

### Analysis commands (available throughout)
✅ `/qual-reflect` - Synthesis dialogue (used throughout Stage 2)
✅ `/qual-think-through` - Deep reasoning
✅ `/qual-wisdom-check` - Paradox navigation
✅ `/qual-examine-assumptions` - Coherence checking

### Project commands
✅ `/qual-status` - Shows Stage 2 progress

### Supporting skills (loaded when relevant)
✅ `literature-sweep` - Search and fetch papers for Stream A (uses Exa and Jina if configured)
✅ `coding-workflow` - Track batch coding progress and audit documentation

When Stage 1 is not complete, Claude Code asks you to confirm before @dialogical-coder or one of the 4 Stage 2 commands runs.

---

## 🎯 Stage 2 Overview: The Three Phases

### Phase 1: Parallel Discovery
- `/qual-parallel-streams` - Launch theoretical + empirical analysis
- `literature-sweep` skill - Literature search and retrieval for Stream A

### Phase 2: Synthesis & Deductive Coding
- `/qual-synthesize` - Merge the streams
- `/qual-code-deductive` - Apply your framework to the remaining documents
- `@dialogical-coder` - Apply your framework to documents
- `/qual-reflect` - Synthesis dialogue after coding batches
- `/qual-think-through` - Work through integration challenges
- `/qual-wisdom-check` - Navigate tensions

**This is the heart of collaborative work!**

### Phase 3: Pattern Characterization
- `/qual-characterize-patterns` - Identify systematic variations and their dimensions
- `/qual-reflect` + `/qual-think-through` - Talk through what the variations mean

---

## Why This Organizational Choice?

### Option A: List everything under Stage 2
- Pro: Clear stage designation
- Con: Users searching for "thinking tools" wouldn't find them

### Option B: Organize by function (our choice)
- Pro: Commands grouped by what they DO
- Con: Stage designation less obvious

**We chose B because:**
- `/qual-think-through` is used in Stage 1, 2, AND 3
- `/qual-reflect` spans Stage 2 and 3
- Functional organization makes tools more discoverable

**Stage designation comes from /qual-status, not where a command is listed.**

---

## Stage 2 Workflow

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
/qual-characterize-patterns
/qual-reflect Notice different pattern types emerging...
/qual-think-through How should I characterize these variations systematically?
/qual-wisdom-check Patterns seem contradictory but both valid...
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

## A Note on Minimalism

**Fewer commands ≠ less capable**
**Fewer commands = more intentional design**

Each tool we built serves transformation purpose.
We didn't build commands for completeness.
We built for epistemic partnership.

**Quality over quantity. Depth over breadth.**

---

*This minimalism is philosophical, not accidental.*

**Stage 2 lives throughout the plugin, wherever its functions naturally belong.**
