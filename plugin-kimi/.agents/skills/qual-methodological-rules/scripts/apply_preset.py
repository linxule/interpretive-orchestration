#!/usr/bin/env python3
"""
apply_preset.py
Applies a methodology preset to configure rules, prompts, and defaults

Usage:
    python3 apply_preset.py --project-path /path/to/project --preset gioia_corley
    python3 apply_preset.py --list-presets

Presets configure:
- Isolation rule defaults (case, wave, stream)
- Proactive prompts appropriate for the methodology
- Philosophical defaults (if not already set)
- Coding vocabulary
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime

# Import qual-shared infrastructure
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "qual-shared" / "scripts"))
try:
    from state_manager import StateManager
    from conversation_logger import ConversationLogger
except ImportError:
    StateManager = None
    ConversationLogger = None


def load_presets() -> Dict[str, Any]:
    """Load methodology presets from JSON"""
    presets_path = Path(__file__).parent.parent / "templates" / "methodology-presets.json"
    with open(presets_path, 'r') as f:
        return json.load(f)


def load_proactive_prompts() -> Dict[str, Any]:
    """Load proactive prompts configuration from JSON"""
    prompts_path = Path(__file__).parent.parent / "templates" / "proactive-prompts.json"
    with open(prompts_path, 'r') as f:
        return json.load(f)


def log_to_journal(project_path: Path, message: str):
    """
    Log preset application to reflexivity journal

    Args:
        project_path: Path to project
        message: Message to log
    """
    # Use ConversationLogger if available
    if ConversationLogger:
        try:
            logger = ConversationLogger(str(project_path))
            logger.log_event("methodology_preset_applied", {"message": message})
            return
        except:
            pass  # Fall through to manual append

    # Fallback: Manual journal append
    journal_path = project_path / ".interpretive-orchestration" / "reflexivity-journal.md"
    if not journal_path.exists():
        return

    today = datetime.now().strftime('%Y-%m-%d')
    time = datetime.now().strftime('%H:%M:%S')

    entry = f"""
---

### Methodology Preset Applied
**Date:** {today}
**Time:** {time}

{message}

---
"""

    try:
        with open(journal_path, 'a') as f:
            f.write(entry)
    except Exception:
        # Non-critical
        pass


def apply_preset(
    config: Dict[str, Any],
    preset_name: str,
    presets_data: Dict[str, Any],
    prompts_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Apply methodology preset to configuration

    Args:
        config: Project configuration dict
        preset_name: Preset identifier (e.g., 'gioia_corley')
        presets_data: Loaded presets JSON
        prompts_data: Loaded prompts JSON

    Returns:
        dict: Result with success status and applied settings
    """
    if preset_name not in presets_data['presets']:
        return {
            "success": False,
            "error": f"Unknown preset: {preset_name}"
        }

    preset = presets_data['presets'][preset_name]

    # Initialize research_design if needed
    if 'research_design' not in config:
        config['research_design'] = {}

    # Apply methodology preset
    config['research_design']['methodology_preset'] = preset_name

    # Apply isolation defaults (only if not already configured)
    if 'isolation_config' not in config['research_design']:
        config['research_design']['isolation_config'] = {}

    isolation = config['research_design']['isolation_config']
    preset_isolation = preset['isolation_defaults']

    # Apply each isolation type if not already set
    for key, defaults in preset_isolation.items():
        if key not in isolation or isolation[key].get('enabled') is None:
            isolation[key] = dict(defaults)

    # Apply proactive prompts configuration
    if 'proactive_prompts' not in config['research_design']:
        config['research_design']['proactive_prompts'] = {
            "enabled": True,
            "cooldown_turns": 5,
            "suppressed_prompts": [],
            "prompt_history": []
        }

    # Set which prompts are active for this methodology
    config['research_design']['proactive_prompts']['active_prompts'] = (
        preset.get('proactive_prompts', [])
    )

    # Apply philosophical defaults (only if not already set)
    if preset.get('philosophical_defaults'):
        if 'philosophical_stance' not in config:
            config['philosophical_stance'] = {}

        for key, value in preset['philosophical_defaults'].items():
            if key not in config['philosophical_stance']:
                config['philosophical_stance'][key] = value

    # Apply coding vocabulary (only if not already set)
    if preset.get('coding_verbs'):
        if not config.get('philosophical_stance', {}).get('coding_verbs'):
            if 'philosophical_stance' not in config:
                config['philosophical_stance'] = {}
            config['philosophical_stance']['coding_verbs'] = preset['coding_verbs']

    if preset.get('avoid_verbs'):
        if not config.get('philosophical_stance', {}).get('avoid_verbs'):
            if 'philosophical_stance' not in config:
                config['philosophical_stance'] = {}
            config['philosophical_stance']['avoid_verbs'] = preset['avoid_verbs']

    return {
        "success": True,
        "preset": preset_name,
        "preset_name": preset['name'],
        "description": preset['description'],
        "applied": {
            "isolation_rules": [
                k for k, v in preset_isolation.items()
                if v.get('enabled', True)
            ],
            "proactive_prompts": len(preset.get('proactive_prompts', [])),
            "key_practices": preset.get('key_practices', [])
        }
    }


def list_presets(presets_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    List all available presets

    Args:
        presets_data: Loaded presets JSON

    Returns:
        dict: List of presets with metadata
    """
    preset_list = []
    for preset_id, preset in presets_data['presets'].items():
        preset_list.append({
            "id": preset_id,
            "name": preset['name'],
            "description": preset['description'],
            "key_practices": preset.get('key_practices', [])[:3]  # First 3 practices
        })

    return {
        "success": True,
        "presets": preset_list,
        "selection_guide": presets_data.get('preset_selection_guide', {})
    }


def main():
    """CLI entry point"""
    parser = argparse.ArgumentParser(
        description="Apply methodology preset to project"
    )
    parser.add_argument(
        '--project-path',
        type=str,
        help='Path to project directory'
    )
    parser.add_argument(
        '--preset',
        type=str,
        help='Preset identifier (e.g., gioia_corley)'
    )
    parser.add_argument(
        '--list-presets',
        action='store_true',
        help='List available presets'
    )

    args = parser.parse_args()

    # Load preset data
    try:
        presets_data = load_presets()
        prompts_data = load_proactive_prompts()
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": f"Failed to load preset data: {e}"
        }))
        return 1

    # List presets mode
    if args.list_presets:
        result = list_presets(presets_data)
        print(json.dumps(result, indent=2))
        return 0

    # Apply preset mode
    if not args.project_path:
        print(json.dumps({
            "success": False,
            "error": "Missing required argument: --project-path"
        }))
        return 1

    if not args.preset:
        print(json.dumps({
            "success": False,
            "error": "Missing required argument: --preset",
            "hint": "Use --list-presets to see available presets"
        }))
        return 1

    project_path = Path(args.project_path).resolve()

    # Load config
    if StateManager:
        try:
            state_manager = StateManager(str(project_path))
            state = state_manager.load()
            config = state.to_dict() if hasattr(state, 'to_dict') else state
        except Exception as e:
            print(json.dumps({
                "success": False,
                "error": f"Failed to load config: {e}",
                "hint": "Run /flow:qual-init first"
            }))
            return 1
    else:
        # Fallback: Direct file reading
        config_path = project_path / ".interpretive-orchestration" / "config.json"
        if not config_path.exists():
            print(json.dumps({
                "success": False,
                "error": "Config not found. Run /flow:qual-init first."
            }))
            return 1

        try:
            with open(config_path, 'r') as f:
                config = json.load(f)
        except Exception as e:
            print(json.dumps({
                "success": False,
                "error": f"Failed to parse config: {e}"
            }))
            return 1

    # Apply preset
    result = apply_preset(config, args.preset, presets_data, prompts_data)

    if result['success']:
        # Save config
        if StateManager:
            try:
                state_manager = StateManager(str(project_path))
                # If StateManager uses dataclass, convert back
                if hasattr(state_manager, 'save'):
                    # Just save the dict directly for now
                    config_path = project_path / ".interpretive-orchestration" / "config.json"
                    with open(config_path, 'w') as f:
                        json.dump(config, f, indent=2)
            except Exception as e:
                print(json.dumps({
                    "success": False,
                    "error": f"Failed to save config: {e}"
                }))
                return 1
        else:
            # Fallback: Direct write
            config_path = project_path / ".interpretive-orchestration" / "config.json"
            with open(config_path, 'w') as f:
                json.dump(config, f, indent=2)

        # Log to journal
        applied = result['applied']
        isolation_list = ', '.join(applied['isolation_rules']) if applied['isolation_rules'] else 'None'

        message = f"""**Applied Methodology Preset: {result['preset_name']}**

{result['description']}

**Configured:**
- Isolation rules: {isolation_list}
- Proactive prompts: {applied['proactive_prompts']}

**Key Practices for {result['preset_name']}:**
{chr(10).join(f"- {p}" for p in applied['key_practices'])}"""

        log_to_journal(project_path, message)

        print(json.dumps(result, indent=2))
        return 0
    else:
        print(json.dumps(result))
        return 1


if __name__ == '__main__':
    sys.exit(main())
