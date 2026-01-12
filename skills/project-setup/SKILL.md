---
name: project-setup
description: "This skill should be used when users want to initialize a new qualitative research project, mentions 'setup', 'initialize', 'new project', 'getting started', or asks about establishing philosophical foundations and epistemic stance. Triggers on phrases like 'start my research project', 'create a new study', 'configure my stance'."
---

# project-setup

Initialize qualitative research projects with epistemic partnership at the core. This skill guides researchers through philosophical foundation establishment via Socratic dialogue, then creates the project infrastructure.

## When to Use

Use this skill when:
- User wants to start a new qualitative research project
- User mentions "initialize", "setup", "new project", or "getting started"
- User asks about establishing philosophical foundations
- User needs to configure their epistemic stance

## Capabilities

1. **Socratic Onboarding** - Guide researchers through 5 key philosophical questions
2. **Project Structure Creation** - Create the sandwich methodology folder hierarchy
3. **Configuration Generation** - Generate config.json from dialogue responses
4. **Partnership Agreement** - Establish mutual commitments

## Two Modes

### Full Setup (15 min) - Recommended
Complete Socratic dialogue exploring:
- What is "data" to you? (ontology)
- When you code, you are...? (epistemology)
- Your role as researcher? (methodology)
- How do you view AI? (relationship)
- Stage 1 status? (sandwich methodology)

### Quick Start (3 min)
Use sensible defaults (Gioia/Systematic Interpretivist):
- Ontology: interpretivist
- Epistemology: systematic_interpretation
- Tradition: gioia_corley
- AI Relationship: epistemic_partner

**Quick Start still requires Stage 1 manual coding** - no shortcuts to theoretical sensitivity!

## Scripts

### create-structure.js
Creates the project folder hierarchy:
```
project-name/
├── .interpretive-orchestration/
│   ├── config.json
│   ├── reflexivity-journal.md
│   ├── conversation-log.jsonl
│   └── decision-history.md
├── stage1-foundation/
│   ├── manual-codes/
│   └── memos/
├── stage2-collaboration/
│   ├── stream-a-theoretical/
│   ├── stream-b-empirical/
│   └── synthesis/
├── stage3-synthesis/
│   ├── evidence-tables/
│   └── theoretical-integration/
└── outputs/
```

**Usage:**
```bash
node skills/project-setup/scripts/create-structure.js --project-path /path/to/project --project-name "My Research"
```

### generate-config.js
Generates config.json from dialogue responses.

**Usage:**
```bash
node skills/project-setup/scripts/generate-config.js \
  --project-path /path/to/project \
  --name "My Research" \
  --research-question "How do..." \
  --ontology interpretivist \
  --epistemology systematic_interpretation \
  --tradition gioia_corley \
  --ai-relationship epistemic_partner
```

### validate-setup.js
Validates project setup completeness.

**Usage:**
```bash
node skills/project-setup/scripts/validate-setup.js --project-path /path/to/project
```

**Returns:** JSON with validation status and any missing components.

## Dialogue Flow Example

```
Claude: Welcome to Interpretive Orchestration! Would you prefer:
        [A] Full Setup (15 min) - Socratic exploration
        [B] Quick Start (3 min) - Use defaults

User: A

Claude: Let's explore your philosophical foundations together.

        Question 1: When you read research data, what are you encountering?

        A) Objective facts waiting to be discovered
        B) Meanings requiring systematic interpretation
        C) Co-created realities with participants
        D) Help me think about this

User: B

Claude: You've chosen a systematic interpretivist stance - aligning
        with Gioia & Corley's approach. This means:

        - We'll use language like "construct", "interpret", "build"
        - AI helps you organize evidence; YOU construct meaning
        - Focus on systematic procedures + theoretical sensitivity

        Does "constructing understanding" feel right, or does
        "discovering truth" feel more accurate?

[dialogue continues through all 5 questions]
```

## Templates

This skill bundles these templates (moved from templates/ directory):
- `templates/epistemic-stance.md` - Human-readable stance questionnaire
- `templates/config.schema.json` - JSON schema for config validation
- `templates/example-config.json` - Example configuration file

## Defense-in-Depth

While hooks enforce Stage 1 completion deterministically, this skill includes a pre-check:

> **Before proceeding to Stage 2 features**, verify that `config.json` shows
> `stage1_complete: true` and `documents_manually_coded >= 10`. If not,
> guide the researcher through Stage 1 instead of proceeding.

## Output

After completion, creates:
1. Project folder structure
2. `.interpretive-orchestration/config.json` with researcher's stance
3. `.interpretive-orchestration/reflexivity-journal.md` initialized
4. Welcome message with next steps based on Stage 1 status

## Related

- **Commands:** `/qual-init` triggers this skill
- **Agents:** None directly, but configuration affects all agents
- **Hooks:** `check-stage1-complete.js` enforces Stage 1 status
- **Other Skills:** `gioia-methodology/` for data structure templates
