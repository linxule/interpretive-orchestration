# /qual-status - Your Analytical Journey Dashboard

Show where you are in the sandwich methodology and what comes next.

---

## What This Command Shows

1. **The Sandwich Visualization** - Progress through Human → Human-AI → Human stages
2. **Current Work** - What stage/phase you're in, what's been accomplished
3. **Epistemic Growth** - How your reflexive practice is developing
4. **Next Steps** - Context-aware guidance on what comes next
5. **Partnership Health** - How well the human-AI collaboration is functioning

---

## Quick Reference

**Stage 1:** Human-Led Foundation (YOU build interpretive depth)
**Stage 2:** Human-AI Collaborative Enhancement (Partnership in action)
**Stage 3:** Human Synthesis & Theorization (YOU construct final theory)

---

## Implementation

*This command uses the `project-dashboard` skill for progress visualization.*

**For Claude:** When user runs /qual-status:

1. **Read Project State**
   - Use `skills/_shared/scripts/query-status.js` to get current state
   - Load config.json sandwich_status
   - Count documents, memos, coded quotes

2. **Calculate Progress**
   - Use `skills/project-dashboard/scripts/calculate-progress.js`
   - Determine percentages for each stage

3. **Check Readiness**
   - Use `skills/project-dashboard/scripts/check-readiness.js`
   - Determine if ready for stage transitions

4. **Display Dashboard**
   - Show sandwich visualization with current position highlighted
   - Include progress bars for each stage/phase
   - Show statistics (documents coded, memos written, etc.)

5. **Provide Context-Aware Guidance**
   - Based on current stage/phase, suggest next steps
   - List available tools appropriate to current work
   - Offer quick actions for common tasks

6. **Show Partnership Health**
   - Balance of human-AI communication
   - Reflexivity engagement level
   - Philosophy coherence status

**Tone:** Supportive guide, not just data display
**Feel:** Companion on journey, not status report

---

## Related

- **Skill:** `project-dashboard` (handles visualization and calculations)
- **Scripts:** `skills/_shared/scripts/query-status.js` (underlying data)
- **After status:** `/qual-reflect` for deeper reflection, continue current work
