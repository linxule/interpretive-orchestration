#!/usr/bin/env python3
"""
Create the Interpretive Orchestration project structure.

Initializes all directories and default files for a new research project.
"""

import os
import json
from datetime import datetime
from pathlib import Path


def create_project_structure(project_path: str, project_name: str = "",
                             research_question: str = "") -> dict:
    """
    Create the full atelier folder structure.
    
    Args:
        project_path: Root directory for the project
        project_name: Optional project name
        research_question: Optional research question
    
    Returns:
        Dict with created paths
    """
    paths = {}
    
    # Main config directory
    config_dir = os.path.join(project_path, ".interpretive-orchestration")
    os.makedirs(config_dir, exist_ok=True)
    paths["config_dir"] = config_dir
    
    # Reasoning directory
    reasoning_dir = os.path.join(project_path, ".kimi", "reasoning")
    os.makedirs(reasoning_dir, exist_ok=True)
    paths["reasoning_dir"] = reasoning_dir
    
    # Stage directories
    stages = {
        "stage1": os.path.join(project_path, "stage1-foundation"),
        "stage2": os.path.join(project_path, "stage2-collaboration"),
        "stage3": os.path.join(project_path, "stage3-synthesis")
    }
    
    for stage_name, stage_path in stages.items():
        os.makedirs(stage_path, exist_ok=True)
        paths[stage_name] = stage_path
        
        # Create subdirectories
        if stage_name == "stage1":
            os.makedirs(os.path.join(stage_path, "manual-codes"), exist_ok=True)
            os.makedirs(os.path.join(stage_path, "memos"), exist_ok=True)
            os.makedirs(os.path.join(stage_path, "data"), exist_ok=True)
        
        elif stage_name == "stage2":
            os.makedirs(os.path.join(stage_path, "stream-a-theoretical"), exist_ok=True)
            os.makedirs(os.path.join(stage_path, "stream-b-empirical"), exist_ok=True)
            os.makedirs(os.path.join(stage_path, "synthesis"), exist_ok=True)
            os.makedirs(os.path.join(stage_path, "coded-data"), exist_ok=True)
        
        elif stage_name == "stage3":
            os.makedirs(os.path.join(stage_path, "evidence-tables"), exist_ok=True)
            os.makedirs(os.path.join(stage_path, "theoretical-integration"), exist_ok=True)
            os.makedirs(os.path.join(stage_path, "manuscript"), exist_ok=True)
    
    # Outputs directory
    outputs_dir = os.path.join(project_path, "outputs")
    os.makedirs(outputs_dir, exist_ok=True)
    paths["outputs"] = outputs_dir
    
    # Create default files
    _create_config_json(config_dir, project_name, research_question)
    _create_reflexivity_journal(config_dir)
    _create_epistemic_stance_template(config_dir)
    _create_readme(project_path, project_name)
    
    return paths


def _create_config_json(config_dir: str, project_name: str, 
                        research_question: str) -> None:
    """Create initial config.json."""
    config = {
        "version": 1,
        "current_stage": "stage1",
        "documents_manually_coded": 0,
        "stage1_complete": False,
        "ontology": "interpretivist",
        "epistemology": "systematic_interpretation",
        "tradition": "gioia_corley",
        "total_documents": 0,
        "documents_coded": 0,
        "memos_written": 0,
        "codes_created": 0,
        "created_at": datetime.now().isoformat(),
        "last_updated": datetime.now().isoformat(),
        "project_name": project_name,
        "research_question": research_question,
        "reflexivity_entries": []
    }
    
    config_path = os.path.join(config_dir, "config.json")
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)


def _create_reflexivity_journal(config_dir: str) -> None:
    """Create empty reflexivity journal."""
    journal_path = os.path.join(config_dir, "reflexivity-journal.md")
    
    content = f"""# Reflexivity Journal

*Created: {datetime.now().strftime('%Y-%m-%d')}*

This journal tracks your reflexive practice throughout the research process.

## Purpose

Use this space to record:
- Your evolving understanding of the data
- Moments of surprise or uncertainty
- How your position shapes your interpretation
- Methodological decisions and their rationale

## Prompts

**After each session, consider:**
- What caught my attention today?
- What assumptions am I bringing to this analysis?
- How might someone else see this differently?
- What would change my interpretation?

---

## Entries

"""
    
    with open(journal_path, 'w') as f:
        f.write(content)


def _create_epistemic_stance_template(config_dir: str) -> None:
    """Create epistemic stance questionnaire template."""
    stance_path = os.path.join(config_dir, "epistemic-stance.md")
    
    content = f"""# Epistemic Stance

*Completed via Socratic dialogue on {datetime.now().strftime('%Y-%m-%d')}*

## Ontology: What is "data"?

**Your stance:** Interpretivist
> Data represents meanings that require systematic interpretation. 
> Patterns don't exist independent of the researcher — they emerge 
> through the interpretive process.

## Epistemology: How do we know?

**Your stance:** Systematic Interpretation
> Knowledge is constructed through rigorous, transparent procedures 
> that balance empirical grounding with theoretical sensitivity.

## Methodology: Your role as researcher

**Your stance:** Gioia & Corley Systematic Approach
> You systematically build data structures from 1st-order concepts 
> to 2nd-order themes to aggregate dimensions.

## AI Relationship: How do you view AI?

**Your stance:** Epistemic Partner
> AI is a thinking partner that deepens your reflexivity and helps 
> organize evidence. You maintain interpretive authority.

## Language Guidelines

**Use:**
- "construct", "interpret", "characterize"
- "build understanding", "organize evidence"
- "our analysis suggests"

**Avoid:**
- "discover", "find", "extract" (implies data has inherent meaning)
- "identify patterns" (implies patterns exist independent of interpretation)
- "the data shows" (implies objective truth)

---

*Your philosophical stance shapes how the AI assistant works with you.*
"""
    
    with open(stance_path, 'w') as f:
        f.write(content)


def _create_readme(project_path: str, project_name: str) -> None:
    """Create project README."""
    readme_path = os.path.join(project_path, "README.md")
    
    name_display = project_name or "My Qualitative Research Project"
    
    content = f"""# {name_display}

An Interpretive Orchestration project for qualitative research.

## Getting Started

1. **Initialize your project:**
   ```
   /flow:qual-init
   ```

2. **Check your progress:**
   ```
   /flow:qual-status
   ```

3. **Start Kimi CLI with the router agent:**
   ```
   kimi --agent-file .agents/agents/interpretive-orchestrator.yaml
   ```

4. **Begin manual coding** (Stage 1):
   - Code 10-15 documents manually
   - Write analytical memos
   - Develop your initial framework
   - Use `@stage1-listener` for thinking partnership

5. **Collaborate with AI** (Stage 2):
   - After completing Stage 1, use `@dialogical-coder`
   - Maintain interpretive authority
   - See visible 4-stage reasoning

## Project Structure

```
.
├── .interpretive-orchestration/  # Project configuration
├── stage1-foundation/            # Manual coding work
├── stage2-collaboration/         # AI-assisted analysis
├── stage3-synthesis/             # Theoretical integration
└── outputs/                      # Final deliverables
```

## Documentation

- `.interpretive-orchestration/epistemic-stance.md` — Your philosophical stance
- `.interpretive-orchestration/reflexivity-journal.md` — Your reflections
- `.interpretive-orchestration/conversation-log.md` — AI interaction history

## Need Help?

- Type `/help` in Kimi CLI
- Refer to the Interpretive Orchestration documentation
- Use `@research-configurator` for technical setup

---

*This project follows the Interpretive Orchestration methodology.*
"""
    
    with open(readme_path, 'w') as f:
        f.write(content)


if __name__ == "__main__":
    import tempfile
    import shutil
    
    # Demo
    tmpdir = tempfile.mkdtemp(prefix="io_project_")
    print(f"Creating project structure in: {tmpdir}\n")
    
    try:
        paths = create_project_structure(
            tmpdir,
            project_name="Workplace Identity Study",
            research_question="How do remote workers construct professional identity?"
        )
        
        print("Created directories:")
        for key, path in paths.items():
            print(f"  {key}: {path}")
        
        print("\nFiles created:")
        for root, dirs, files in os.walk(tmpdir):
            level = root.replace(tmpdir, '').count(os.sep)
            indent = ' ' * 2 * level
            print(f'{indent}{os.path.basename(root)}/')
            subindent = ' ' * 2 * (level + 1)
            for file in files:
                filepath = os.path.join(root, file)
                size = os.path.getsize(filepath)
                print(f'{subindent}{file} ({size} bytes)')
                
    finally:
        print(f"\nCleaned up: {tmpdir}")
        shutil.rmtree(tmpdir)
