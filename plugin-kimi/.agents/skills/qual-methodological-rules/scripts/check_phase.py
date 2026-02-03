#!/usr/bin/env python3
"""
check_phase.py
Returns current phase and which rules should be relaxed

Usage:
    python3 check_phase.py --project-path /path/to/project

Returns JSON with:
    - current_phase
    - rules_should_relax (array of rule names)
    - phase_details
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Dict, List, Optional, Any

# Import qual-shared infrastructure
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "qual-shared" / "scripts"))
try:
    from state_manager import StateManager
except ImportError:
    # Fallback if qual-shared not available
    StateManager = None


def get_current_phase(sandwich_status: Optional[Dict[str, Any]]) -> str:
    """
    Determine current phase from sandwich_status

    Args:
        sandwich_status: The sandwich_status section from config

    Returns:
        str: Current phase identifier
    """
    if not sandwich_status:
        return 'stage1_foundation'

    stage = sandwich_status.get('current_stage', 'stage1_foundation')

    if stage == 'stage1_foundation':
        return 'stage1_foundation'

    if stage == 'stage2_collaboration':
        progress = sandwich_status.get('stage2_progress', {})
        if progress.get('phase3_pattern_characterization') in ('in_progress', 'complete'):
            return 'phase3_pattern_characterization'
        if progress.get('phase2_synthesis') in ('in_progress', 'complete'):
            return 'phase2_synthesis'
        return 'phase1_parallel_streams'

    if stage == 'stage3_synthesis':
        return 'stage3_synthesis'

    return stage


def should_relax(relaxes_at: str, current_phase: str) -> bool:
    """
    Check if a rule should relax at the current phase

    Args:
        relaxes_at: Phase when rule relaxes
        current_phase: Current phase

    Returns:
        bool: True if rule should be relaxed
    """
    phase_order = [
        'stage1_foundation',
        'phase1_parallel_streams',
        'phase2_synthesis',
        'phase3_pattern_characterization',
        'cross_wave_analysis',
        'stage3_synthesis'
    ]

    try:
        current_index = phase_order.index(current_phase)
        relax_index = phase_order.index(relaxes_at)
        return current_index >= relax_index
    except ValueError:
        return False


def check_phase(project_path: str) -> Dict[str, Any]:
    """
    Check current phase and rule relaxation status

    Args:
        project_path: Path to project directory

    Returns:
        dict: Phase information and rule status
    """
    project_path = Path(project_path).resolve()

    # Use StateManager if available, otherwise read directly
    if StateManager:
        try:
            state_manager = StateManager(str(project_path))
            state = state_manager.load()
            config = state.to_dict() if hasattr(state, 'to_dict') else state
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to load state: {e}"
            }
    else:
        # Fallback: Direct file reading
        config_path = project_path / ".interpretive-orchestration" / "config.json"
        if not config_path.exists():
            return {
                "success": False,
                "error": "Config not found"
            }

        try:
            with open(config_path, 'r') as f:
                config = json.load(f)
        except json.JSONDecodeError as e:
            return {
                "success": False,
                "error": f"Failed to parse config: {e}"
            }

    # Get current phase
    sandwich_status = config.get('sandwich_status', {})
    current_phase = get_current_phase(sandwich_status)

    # Get research design
    design = config.get('research_design', {})
    isolation = design.get('isolation_config', {})

    result = {
        "success": True,
        "current_phase": current_phase,
        "sandwich_status": sandwich_status,
        "rules_should_relax": [],
        "rules_still_active": [],
        "phase_details": {
            "stage": sandwich_status.get('current_stage'),
            "stage1_complete": sandwich_status.get('stage1_complete'),
            "stage2_progress": sandwich_status.get('stage2_progress')
        }
    }

    # Check case isolation
    if isolation.get('case_isolation', {}).get('enabled', True) and design.get('cases', []):
        relaxes_at = isolation.get('case_isolation', {}).get('relaxes_at', 'phase3_pattern_characterization')
        rule_info = {"name": "case-isolation", "relaxes_at": relaxes_at}
        if should_relax(relaxes_at, current_phase):
            result['rules_should_relax'].append(rule_info)
        else:
            result['rules_still_active'].append(rule_info)

    # Check wave isolation
    if isolation.get('wave_isolation', {}).get('enabled', True) and design.get('waves', []):
        relaxes_at = isolation.get('wave_isolation', {}).get('relaxes_at', 'cross_wave_analysis')
        rule_info = {"name": "wave-isolation", "relaxes_at": relaxes_at}
        if should_relax(relaxes_at, current_phase):
            result['rules_should_relax'].append(rule_info)
        else:
            result['rules_still_active'].append(rule_info)

    # Check stream separation
    if isolation.get('stream_separation', {}).get('enabled', True):
        relaxes_at = isolation.get('stream_separation', {}).get('relaxes_at', 'phase2_synthesis')
        rule_info = {"name": "stream-separation", "relaxes_at": relaxes_at}
        if should_relax(relaxes_at, current_phase):
            result['rules_should_relax'].append(rule_info)
        else:
            result['rules_still_active'].append(rule_info)

    return result


def main():
    """CLI entry point"""
    parser = argparse.ArgumentParser(
        description="Check current phase and rule relaxation status"
    )
    parser.add_argument(
        '--project-path',
        type=str,
        required=True,
        help='Path to project directory'
    )

    args = parser.parse_args()

    result = check_phase(args.project_path)

    print(json.dumps(result, indent=2))

    return 0 if result.get('success') else 1


if __name__ == '__main__':
    sys.exit(main())
