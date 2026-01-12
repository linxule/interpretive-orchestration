---
description: Advance to the next stage of the sandwich methodology with validation
---

# /qual-advance-stage - Advance to Next Stage

Transition between stages of the sandwich methodology with appropriate validation.

---

## The Three Stages

| Stage | Name | Focus | AI Role |
|-------|------|-------|---------|
| **Stage 1** | Solo Practice | Manual coding, theoretical sensitivity | Thinking partner only |
| **Stage 2** | Side-by-Side Collaboration | AI-assisted coding, synthesis | Epistemic partner |
| **Stage 3** | Dialogue with Tradition | Theoretical integration, manuscript | Scholarly companion |

---

## Stage Transitions

### Stage 1 → Stage 2
**Use:** `/qual-complete-stage1` instead
- Validates manual coding foundation
- Specific requirements and checks
- Unlocks AI-assisted tools

### Stage 2 → Stage 3
**Requirements:**
- All three phases of Stage 2 complete:
  - Phase 1: Parallel streams developed
  - Phase 2: Synthesis achieved
  - Phase 3: Patterns characterized
- Data structure stabilized
- Evidence organized for theoretical work

**What happens:**
- Updates `sandwich_status.current_stage` to `stage3_synthesis`
- Unlocks @scholarly-companion agent
- Prepares evidence tables for manuscript development
- Relaxes methodological rules for integration

---

## How to Use

### Check Readiness
```
/qual-status
```
Shows your current stage and progress toward next stage.

### Advance When Ready
```
/qual-advance-stage
```
System will:
1. Check current stage
2. Validate requirements for next stage
3. Ask for confirmation
4. Update configuration
5. Log the transition

---

## Validation Details

### For Stage 2 → Stage 3

**Phase Completion Checks:**
- Phase 1 (Parallel Streams):
  - Stream A (theory) developed
  - Stream B (empirical) developed
  - Both streams have documented patterns

- Phase 2 (Synthesis):
  - Streams integrated
  - Synthesis memos written
  - Framework coherent

- Phase 3 (Pattern Characterization):
  - Dimensional analysis complete
  - Variations documented
  - Saturation assessed

**Data Structure Check:**
- All aggregate dimensions defined
- Themes connected to dimensions
- Concepts have evidence

---

## If Not Ready

If validation fails:
- Current progress is shown
- Specific gaps are identified
- Guidance is provided for completion
- No configuration is changed

**There's no penalty for not being ready** - continue your work and try again.

---

## Manual Override

In exceptional cases, you can force advancement:
```
/qual-advance-stage --force
```

This:
- Skips validation
- Logs the override with justification
- Records in reflexivity journal
- Requires you to explain why

**Use sparingly** - the validations exist for methodological rigor.

---

## Post-Transition

After advancing:
- New stage tools become available
- Some methodological rules may relax
- PostPhaseTransition hook triggers
- Progress is logged

---

## Implementation

*For Claude: When user runs /qual-advance-stage:*

### Scripts to Use
- Read config: `node skills/_shared/scripts/read-config.js --project-path <path>`
- Update config: `node skills/_shared/scripts/update-progress.js --project-path <path>`
- Post-transition hook: `hooks/post-phase-transition.js`

### Step-by-Step Process

1. **Read configuration**
   ```
   node skills/_shared/scripts/read-config.js --project-path .
   ```
   Load `.interpretive-orchestration/config.json`

2. **Check current stage** from `sandwich_status.current_stage`

3. **If Stage 1 → Stage 2:**
   - Redirect to `/qual-complete-stage1` (has its own validation)

4. **If Stage 2 → Stage 3:**
   Check phase completion in config (all must equal "complete"):
   - `sandwich_status.stage2_progress.phase1_parallel_streams === "complete"`
   - `sandwich_status.stage2_progress.phase2_synthesis === "complete"`
   - `sandwich_status.stage2_progress.phase3_pattern_characterization === "complete"`
   - `data_structure.aggregate_dimensions[]` has at least 1 entry
   - `data_structure.second_order_themes[]` connected to dimensions

5. **If requirements NOT met:**
   - Show current phase progress
   - Identify which phases are incomplete
   - Suggest: "Complete Phase X before advancing"
   - Do NOT update config

6. **If requirements met:**
   - Ask confirmation: "Are you ready for theoretical integration with the scholarly tradition?"
   - Update config using script:
     ```bash
     node skills/_shared/scripts/update-progress.js --project-path . \
       --current-stage stage3_synthesis
     ```
     Note: For `stage2_complete` and `stage2_completion_date`, read the config, add these fields
     to `sandwich_status`, and write back (or extend `update-progress.js` with these flags).
     Target structure:
     ```json
     {
       "sandwich_status": {
         "current_stage": "stage3_synthesis",
         "stage2_complete": true,
         "stage2_completion_date": "[ISO timestamp]"
       }
     }
     ```

7. **Run post-phase-transition hook**
   The hook at `hooks/post-phase-transition.js` will:
   - Update methodological rules for Stage 3
   - Relax isolation constraints
   - Log the transition

8. **If already Stage 3:**
   - Inform user they're at final stage
   - Suggest @scholarly-companion for theoretical dialogue
   - Point to `/qual-reflect` for synthesis

9. **Log transition** to `.interpretive-orchestration/conversation-log.jsonl`:
   ```json
   {
     "timestamp": "[ISO]",
     "event": "stage_advancement",
     "from": "human_researcher",
     "details": {
       "from_stage": "stage2_collaboration",
       "to_stage": "stage3_synthesis",
       "phases_completed": ["phase1", "phase2", "phase3"]
     }
   }
   ```

10. **Celebrate the milestone!**
    - Acknowledge the analytical work of Stage 2
    - Introduce @scholarly-companion agent
    - Explain theoretical integration focus
