# Wave Isolation Rule
---
paths: {{wave_paths}}
---

## Methodological Rule: Wave Isolation

**Study Type:** {{study_type}}
**Waves:** {{wave_names}} ({{wave_count}} total)
**Current Phase:** {{current_phase}}
**Rule Status:** {{rule_status}}
**Friction Level:** {{friction_level}}

---

### When This Rule Is ACTIVE

You are working within a **longitudinal study** with multiple data collection waves. During individual wave analysis:

1. **Analyze each wave independently** before cross-wave comparison
2. **Let concepts emerge** from THIS time point's data
3. **Do NOT project later developments** onto earlier data
4. **Track emergence naturally** - don't impose known trajectories

### Why This Matters

Temporal contamination undermines longitudinal analysis. When you know how the story ends, you unconsciously:
- See early signs that weren't actually visible at the time
- Miss genuine surprises because you know what's coming
- Impose a narrative arc that participants didn't experience

Each wave deserves analysis as if you **don't know what comes next**.

**Epistemological threat avoided:** Retrospective coherence bias, premature narrative closure
**Validity concern addressed:** Dependability, authenticity

### What To Do Instead

- Analyze Wave 1 completely before opening Wave 2 data
- Write analytical memos about what you expect to change (before looking)
- When analyzing later waves, note genuine surprises
- Track conceptual evolution explicitly in your data structure

### Collection Periods

{{#waves}}
- **{{name}}** ({{id}}): {{collection_period}} - Status: {{status}}
{{/waves}}

### When This Relaxes

This rule relaxes when you enter: **{{relaxes_at_phase}}**

Cross-wave analysis becomes the focus - examining change over time, comparing how concepts evolved, tracing trajectories.

**Check:** `config.json` → `sandwich_status` or explicit cross-wave analysis phase

---

### If You Need to Override

If you have a strong methodological reason to examine cross-wave patterns now:

1. The agent will ask for justification (friction level: {{friction_level}})
2. Consider: Is this theoretical sampling? Negative case analysis?
3. Document your reasoning and what you're protecting against
4. Note how you'll maintain temporal integrity despite the override

Overrides become part of your **audit trail** - documenting your methodological decisions.

---

*Rule Intent: Preserve temporal integrity and track genuine conceptual evolution*
*Generated: {{timestamp}}*
*Relaxes at: {{relaxes_at_phase}}*
