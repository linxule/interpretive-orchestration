# Case Isolation Rule
---
paths: {{case_paths}}
---

## Methodological Rule: Case Isolation

**Study Type:** {{study_type}}
**Cases:** {{case_names}} ({{case_count}} total)
**Current Phase:** {{current_phase}}
**Rule Status:** {{rule_status}}
**Friction Level:** {{friction_level}}

---

### When This Rule Is ACTIVE

You are working within a **multi-case comparative study**. During individual case analysis:

1. **Focus exclusively** on the current case folder
2. **Let themes emerge** from THIS case's data independently
3. **Do NOT reference** findings, codes, or patterns from other cases
4. **Note cross-case hunches** in memos, but don't act on them yet

### Why This Matters

Cross-case contamination during open coding prevents genuine pattern emergence. When you know what you found in Case A, you unconsciously look for (or against) it in Case B. This undermines the inductive power of your analysis.

Each case deserves **analytical fresh eyes** before comparison.

**Epistemological threat avoided:** Premature closure, pattern imposition
**Validity concern addressed:** Credibility, confirmability

### What To Do Instead

- When you notice a potential cross-case pattern: Write a memo titled "Cross-case hunch: [topic]"
- Keep these memos in a separate location until synthesis phase
- Trust that synthesis will come - and will be richer for the wait

### When This Relaxes

This rule relaxes when you enter: **{{relaxes_at_phase}}**

At that point, cross-case comparison becomes methodologically appropriate. The system will automatically update this rule's status.

**Check:** `config.json` → `sandwich_status.stage2_progress`

---

### If You Need to Override

If you have a strong methodological reason to cross case boundaries now:

1. The agent will ask for justification (friction level: {{friction_level}})
2. Document your reasoning in the reflexivity journal
3. Note what validity threats this might introduce
4. Describe compensatory moves you'll make

Overrides become part of your **audit trail** - valuable methodological data, not errors.

---

*Rule Intent: Preserve phenomenological distinctness of each case*
*Generated: {{timestamp}}*
*Relaxes at: {{relaxes_at_phase}}*
