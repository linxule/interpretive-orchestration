---
description: Mark Stage 1 as complete after validating manual coding foundation
---

# /qual-complete-stage1 - Complete Stage 1 Foundation

Validate your manual coding foundation and transition to Stage 2 partnership.

---

## What This Command Does

1. **Validates** your Stage 1 progress against requirements
2. **Reviews** your foundation (documents, memos, framework)
3. **Marks** Stage 1 as complete in config.json
4. **Unlocks** Stage 2 AI-assisted tools
5. **Generates** methodological rules if research design is configured

---

## Minimum Requirements

Before completing Stage 1, you need:

| Requirement | Minimum | Your Progress |
|-------------|---------|---------------|
| Documents coded | 10 | [checked at runtime] |
| Analytical memos | 5 | [checked at runtime] |
| Data structure | Created | [checked at runtime] |
| Reflexivity entries | 3 | [checked at runtime] |

---

## Validation Process

When you run this command:

### Step 1: Check Minimums
System verifies you've met minimum requirements.

### Step 2: Review Your Foundation
You'll be asked to confirm:
- "Do you feel you understand your data's key patterns?"
- "Can you articulate your conceptual boundaries?"
- "Are you ready to evaluate AI suggestions critically?"

### Step 3: Document the Transition
A transition memo is created capturing:
- Your Stage 1 summary
- Key insights developed
- Framework state at transition
- Your readiness assessment

### Step 4: Update Configuration
```json
{
  "sandwich_status": {
    "current_stage": "stage2_collaboration",
    "stage1_complete": true,
    "stage1_completion_date": "[timestamp]",
    "stage1_details": {
      "documents_manually_coded": [count],
      "memos_written": [count],
      "initial_structure_created": true
    }
  }
}
```

### Step 5: Generate Rules (if applicable)
If you've configured research design (cases, waves, isolation), methodological rules are generated for Stage 2.

---

## What Changes After Completion

### Unlocked
- @dialogical-coder agent (AI-assisted coding)
- Batch processing capabilities
- Stage 2 synthesis tools
- Pattern characterization tools

### Still Active
- Stage 1 enforcement hooks (to remind you of foundation)
- Reflexivity prompts
- Philosophical coherence checks

---

## Important Notes

**This is a one-way transition** in terms of unlocking tools, but:
- You can always do more manual coding
- Stage 1 skills remain available
- Your foundation continues to deepen through Stage 2

**Only you can assess theoretical readiness** - the system checks minimums, but you decide if you're genuinely ready.

---

## If You're Not Ready

If validation fails or you want to continue Stage 1:
- Run `/qual-status` to see what's needed
- Run `/qual-stage1-guide` for guidance
- Talk to @stage1-listener for thinking partnership

**There's no rush.** Better to have a strong foundation than to move forward prematurely.

---

## Implementation

*For Claude: When user runs /qual-complete-stage1:*

### Scripts to Use
- Read config: `node skills/_shared/scripts/read-config.js --project-path <path>`
- Update config: `node skills/_shared/scripts/update-progress.js --project-path <path>`
- Generate rules: `node skills/methodological-rules/scripts/generate-rules.js --project-path <path>`

### Step-by-Step Process

1. **Read configuration**
   ```
   node skills/_shared/scripts/read-config.js --project-path .
   ```
   Load `.interpretive-orchestration/config.json`

2. **Check Stage 1 requirements** (all must pass):
   - `coding_progress.documents_coded >= 10`
   - `coding_progress.memos_written >= 5`
   - `coding_progress.reflexivity_entries >= 3`
   - `data_structure` exists with at least:
     - 3+ concepts in `data_structure.concepts[]`, OR
     - 1+ themes in `data_structure.themes[]`

3. **If requirements NOT met:**
   - Show current progress vs requirements
   - Identify specific gaps
   - Suggest: "Run `/qual-stage1-guide` for guidance"
   - Do NOT update config

4. **If requirements met:**
   - Ask confirmation questions:
     - "Do you feel you understand your data's key patterns?"
     - "Can you articulate your conceptual boundaries?"
     - "Are you ready to evaluate AI suggestions critically?"
   - Create transition memo at:
     `.interpretive-orchestration/memos/stage1-transition-[timestamp].md`
   - Update config using script:
     ```bash
     node skills/_shared/scripts/update-progress.js --project-path . \
       --stage1-complete \
       --current-stage stage2_collaboration \
       --documents-coded [count] \
       --memos-written [count]
     ```
     This updates `sandwich_status` to:
     ```json
     {
       "sandwich_status": {
         "current_stage": "stage2_collaboration",
         "stage1_complete": true,
         "stage1_details": {
           "documents_manually_coded": [count],
           "memos_written": [count],
           "initial_structure_created": true
         }
       }
     }
     ```

5. **Generate methodological rules** (if applicable):
   If `research_design` is configured in config.json:
   ```
   node skills/methodological-rules/scripts/generate-rules.js --project-path .
   ```

6. **Log transition** to `.interpretive-orchestration/conversation-log.jsonl`:
   ```json
   {
     "timestamp": "[ISO]",
     "event": "stage1_completion",
     "from": "human_researcher",
     "details": {
       "documents_coded": [count],
       "memos_written": [count],
       "researcher_confirmed_readiness": true
     }
   }
   ```

7. **Celebrate the milestone!**
   - Acknowledge the hard work of Stage 1
   - Explain what's now available in Stage 2
   - Suggest next steps with @dialogical-coder
