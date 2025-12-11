# /qual-init - Initialize Qualitative Research Project

Start a new qualitative research project with **epistemic partnership** at its core.

---

## Choose Your Setup Mode

**Welcome to Interpretive Orchestration!**

**[A] Full Setup (15 minutes)** - Recommended
Complete Socratic onboarding exploring your philosophical stance through dialogue.

**[B] Quick Start (3 minutes)**
Use Gioia/Systematic Interpretivist defaults. Deepen engagement later.

---

## Quick Start Defaults

If you choose B, we'll use:
- Ontology: Interpretivist
- Epistemology: Systematic co-construction (Gioia & Corley)
- AI Relationship: Epistemic partner
- Language: "construct," "characterize," "interpret"

**Quick Start still requires Stage 1 manual coding** - no shortcuts to theoretical sensitivity!

---

## What Happens Next

1. Socratic dialogue about your philosophical stance
2. Project folder structure creation
3. Configuration file generation
4. Partnership agreement establishment

---

## Implementation

*This command uses the `project-setup` skill for the complete workflow.*

**For Claude:** When user runs /qual-init:

1. Ask: "Would you prefer [A] Full Setup or [B] Quick Start?"

2. **If Full Setup (A):**
   - Read `skills/project-setup/templates/epistemic-stance.md` for questions
   - Guide through the 5 Socratic questions (adapt based on answers)
   - Create project structure using `skills/project-setup/scripts/create-structure.js`
   - Generate config using `skills/project-setup/scripts/generate-config.js`
   - Show partnership agreement and next steps

3. **If Quick Start (B):**
   - Confirm project name and research question
   - Create structure with defaults: `--ontology interpretivist --epistemology systematic_interpretation --tradition gioia_corley --ai-relationship epistemic_partner`
   - Show quick setup summary and Stage 1 guidance

4. **After either path:**
   - Validate setup: `skills/project-setup/scripts/validate-setup.js`
   - Show dashboard with Stage 1 progress
   - If Stage 1 incomplete, guide to manual coding

---

## Related

- **Skill:** `project-setup` (handles the actual implementation)
- **Templates:** `skills/project-setup/templates/epistemic-stance.md`
- **After init:** `/qual-status` to check progress, `/qual-memo` for Stage 1 work
