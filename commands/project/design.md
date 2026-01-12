---
description: Configure research design for multi-case, longitudinal, or parallel stream studies
---

# /qual-design - Configure Research Design Structure

Configure detailed research design for complex studies (multi-case, longitudinal, parallel streams).

---

## When to Use This Command

Use `/qual-design` when your study involves:
- **Multiple cases** that need independent analysis before comparison
- **Longitudinal data** collected across different time points
- **Parallel streams** (theoretical and empirical analyzed separately)
- **Custom isolation requirements** for your methodology

Simple single-case studies can skip this - basic design is handled in `/qual-init`.

---

## What This Command Does

1. Guides you through detailed research design configuration
2. Creates appropriate folder structure for cases/waves
3. Generates methodological rules that adapt based on your phase
4. Sets up isolation constraints to prevent analytical contamination

---

## Design Configuration Sections

### Section 1: Case Structure

**For comparative studies:**
- Define each case/site with ID and name
- Specify folder paths for case data
- Set case analysis status

Example prompt flow:
```
"How many cases are in your study?"
"Let's name them. Case 1?"
"What folder should hold Case 1 data? (default: data/cases/case1)"
```

### Section 2: Longitudinal Waves

**For studies with multiple time points:**
- Define each wave with ID and name
- Specify collection periods
- Set wave folders and status

Example prompt flow:
```
"How many waves of data collection?"
"What's Wave 1 called? (e.g., 'Pre-implementation')"
"When was/will Wave 1 be collected?"
```

### Section 3: Stream Configuration

**For parallel streams methodology:**
- Configure theoretical stream folder and sources
- Configure empirical stream folder and sources
- Set integration point

Example prompt flow:
```
"Will you analyze theory and data in parallel streams?"
"What theoretical traditions are you drawing from?"
"Where should literature materials go? (default: literature/)"
```

### Section 4: Isolation Rules

**Configure methodological constraints:**

| Isolation Type | Default Friction | Relaxes At |
|---------------|------------------|------------|
| Case isolation | CHALLENGE | Phase 3 Pattern Characterization |
| Wave isolation | CHALLENGE | Cross-wave analysis |
| Stream separation | NUDGE | Phase 2 Synthesis |

**Friction levels explained:**
- **SILENT**: Auto-logged, no interruption
- **NUDGE**: Gentle reminder injected in response
- **CHALLENGE**: Pause and request justification
- **HARD_STOP**: Block action completely

---

## Implementation

**For Claude:** When user runs /qual-design:

1. **Check if project exists**
   - Read config from `.interpretive-orchestration/config.json`
   - If no project, suggest `/qual-init` first
   - If project exists, show current research_design (if any)

2. **Case configuration** (if study_type includes "comparative"):
   ```
   Ask: "How many cases/sites are you studying?"
   For each case:
     - Ask for name (e.g., "TechCorp Alpha")
     - Ask for ID (auto-generate from name if not provided)
     - Ask for folder path (suggest default)
     - Ask for brief description
   ```

3. **Wave configuration** (if study_type includes "longitudinal"):
   ```
   Ask: "How many data collection waves?"
   For each wave:
     - Ask for name (e.g., "Pre-implementation")
     - Ask for collection period
     - Ask for folder path
   ```

4. **Stream configuration**:
   ```
   Ask: "Do you want theory and data analyzed in parallel streams?"
   If yes:
     - Ask for theoretical sources
     - Confirm folder paths
   ```

5. **Isolation configuration**:
   ```
   Show current isolation defaults
   Ask: "Do you want to adjust friction levels?"
   If yes, walk through each isolation type
   ```

6. **Generate structure and rules**:
   ```
   Run: node skills/project-setup/scripts/create-structure.js \
        --project-path [path] \
        --research-design '[JSON]'

   Update config.json with research_design section

   Run: node skills/methodological-rules/scripts/generate-rules.js \
        --project-path [path]
   ```

7. **Show summary**:
   ```
   Display created folders
   Display active isolation rules
   Explain when rules will relax
   ```

---

## Example Outputs

### Multi-case Longitudinal Study

```
Research Design Configured!

Study Type: comparative_longitudinal

Cases:
├── org_alpha (TechCorp Alpha) → data/cases/alpha/
├── org_beta (HealthCo Beta) → data/cases/beta/
└── org_gamma (FinServ Gamma) → data/cases/gamma/

Waves:
├── wave_1 (Pre-implementation) → Jan-Mar 2025
└── wave_2 (6-month follow-up) → Jul-Sep 2025

Active Rules:
├── Case Isolation [CHALLENGE] - relaxes at Phase 3
├── Wave Isolation [CHALLENGE] - relaxes at cross-wave analysis
└── Stream Separation [NUDGE] - relaxes at Phase 2 synthesis

Folders created: 8
Rules generated: 3
```

---

## Related

- **Prerequisite:** `/qual-init` (creates base project)
- **After design:** `/qual-status` to see design summary
- **Rules skill:** `skills/methodological-rules/` (handles rule generation)
- **Templates:** See `skills/project-setup/templates/config.schema.json` for full schema

---

## Methodological Note

Research design configuration isn't just technical setup - it's an **epistemological commitment**.

When you declare "3 cases, analyzed separately before comparison," you're committing to a methodological discipline that protects the integrity of your analysis.

The system will help you maintain this discipline through graduated friction:
- **Not blocking** your analytical moves
- **Surfacing implications** when you cross boundaries
- **Documenting deviations** for your audit trail

This is the "methodological conscience" approach - supporting responsible choice, not enforcing compliance.
