#!/usr/bin/env python3
"""
strain_check.py
Detects and handles methodological strain from repeated rule overrides

Usage:
    python3 strain_check.py --project-path /path/to/project --rule-id case-isolation
    python3 strain_check.py --project-path /path/to/project --record-override --rule-id case-isolation --justification "Building cross-cutting theme"

What is "strain"?
When a rule is overridden 3+ times in the same phase, it suggests the rule
may not fit the researcher's evolving methodology. Instead of just logging
violations, we trigger a methodological review conversation.
"""

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any

# Import qual-shared infrastructure
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "qual-shared" / "scripts"))
try:
    from state_manager import StateManager
    from conversation_logger import ConversationLogger
except ImportError:
    # Fallback if qual-shared not available
    StateManager = None
    ConversationLogger = None

# Import get_current_phase from check_phase.py
from check_phase import get_current_phase


def load_config(project_path: Path) -> Optional[Dict[str, Any]]:
    """
    Load project configuration with StateManager fallback

    Args:
        project_path: Path to project directory

    Returns:
        dict: Configuration data or None if not found
    """
    # Use StateManager if available
    if StateManager:
        try:
            state_manager = StateManager(str(project_path))
            state = state_manager.load()
            return state.to_dict() if hasattr(state, 'to_dict') else state
        except Exception:
            pass

    # Fallback: Direct file reading
    config_path = project_path / ".interpretive-orchestration" / "config.json"
    if not config_path.exists():
        return None

    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except json.JSONDecodeError:
        return None


def save_config(project_path: Path, config: Dict[str, Any]) -> bool:
    """
    Save project configuration with StateManager fallback

    Args:
        project_path: Path to project directory
        config: Configuration data

    Returns:
        bool: True on success
    """
    # Use StateManager if available
    if StateManager:
        try:
            state_manager = StateManager(str(project_path))
            # If config is ProjectState, save directly; otherwise convert
            if hasattr(config, 'to_dict'):
                state_manager.save(config)
            else:
                # Update existing state with config changes
                state = state_manager.load()
                for key, value in config.items():
                    if hasattr(state, key):
                        setattr(state, key, value)
                state_manager.save(state)
            return True
        except Exception:
            pass

    # Fallback: Direct file writing
    config_path = project_path / ".interpretive-orchestration" / "config.json"
    config_path.parent.mkdir(parents=True, exist_ok=True)

    try:
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)
        return True
    except IOError:
        return False


def log_to_journal(project_path: Path, message: str) -> None:
    """
    Log strain event to reflexivity journal

    Args:
        project_path: Path to project directory
        message: Message to log
    """
    # Use ConversationLogger if available
    if ConversationLogger:
        try:
            logger = ConversationLogger(str(project_path))
            logger.log({
                "event_type": "methodological_strain",
                "agent": "strain-detector",
                "content": {
                    "message": message
                }
            })
        except Exception:
            pass

    # Fallback: Direct append to markdown journal
    journal_path = project_path / ".interpretive-orchestration" / "reflexivity-journal.md"
    if not journal_path.exists():
        return

    now = datetime.now()
    entry = f"""
---

### Methodological Strain Detected
**Date:** {now.strftime('%Y-%m-%d')}
**Time:** {now.strftime('%H:%M:%S')}

{message}

---
"""

    try:
        with open(journal_path, 'a') as f:
            f.write(entry)
    except IOError:
        # Non-critical failure
        pass


def record_override(
    config: Dict[str, Any],
    rule_id: str,
    justification: Optional[str],
    current_phase: str
) -> Dict[str, Any]:
    """
    Record an override and check for strain

    Args:
        config: Project configuration
        rule_id: Rule being overridden
        justification: Reason for override
        current_phase: Current research phase

    Returns:
        dict: Override result with strain status
    """
    # Initialize strain tracking if needed
    if 'research_design' not in config:
        config['research_design'] = {}

    if 'strain_tracking' not in config['research_design']:
        config['research_design']['strain_tracking'] = {
            'override_counts': {},
            'strain_threshold': 3,
            'strained_rules': [],
            'strain_reviews': []
        }

    tracking = config['research_design']['strain_tracking']
    now = datetime.now().isoformat()

    # Initialize count for this rule if needed
    if rule_id not in tracking['override_counts']:
        tracking['override_counts'][rule_id] = {
            'count': 0,
            'last_override': None,
            'phase_when_overridden': current_phase
        }

    rule_count = tracking['override_counts'][rule_id]

    # Check if phase changed - reset count if so
    if rule_count['phase_when_overridden'] != current_phase:
        rule_count['count'] = 0
        rule_count['phase_when_overridden'] = current_phase

    # Increment count
    rule_count['count'] += 1
    rule_count['last_override'] = now

    # Also log to rule_overrides array
    if 'rule_overrides' not in config['research_design']:
        config['research_design']['rule_overrides'] = []

    config['research_design']['rule_overrides'].append({
        'rule_id': rule_id,
        'timestamp': now,
        'justification': justification or '',
        'compensatory_moves': [],
        'outcome': 'pending'
    })

    # Check if strain threshold reached
    threshold = tracking.get('strain_threshold', 3)
    is_strained = rule_count['count'] >= threshold

    if is_strained and rule_id not in tracking['strained_rules']:
        tracking['strained_rules'].append(rule_id)

    return {
        'rule_id': rule_id,
        'override_count': rule_count['count'],
        'threshold': threshold,
        'is_strained': is_strained,
        'phase': current_phase,
        'first_time_strained': is_strained and rule_count['count'] == threshold
    }


def check_strain(
    config: Dict[str, Any],
    rule_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Check strain status for all rules or specific rule

    Args:
        config: Project configuration
        rule_id: Optional rule to check (None = check all)

    Returns:
        dict: Strain status information
    """
    if 'research_design' not in config or 'strain_tracking' not in config['research_design']:
        return {
            'has_strain': False,
            'strained_rules': [],
            'override_counts': {}
        }

    tracking = config['research_design']['strain_tracking']
    threshold = tracking.get('strain_threshold', 3)

    if rule_id:
        # Check specific rule
        rule_count = tracking['override_counts'].get(rule_id)
        if not rule_count:
            return {
                'has_strain': False,
                'rule_id': rule_id,
                'override_count': 0,
                'threshold': threshold
            }

        return {
            'has_strain': rule_count['count'] >= threshold,
            'rule_id': rule_id,
            'override_count': rule_count['count'],
            'threshold': threshold,
            'last_override': rule_count.get('last_override')
        }

    # Check all rules
    strained_rules = []
    for rid, counts in tracking.get('override_counts', {}).items():
        if counts['count'] >= threshold:
            strained_rules.append({
                'rule_id': rid,
                'override_count': counts['count'],
                'last_override': counts.get('last_override')
            })

    return {
        'has_strain': len(strained_rules) > 0,
        'strained_rules': strained_rules,
        'threshold': threshold,
        'override_counts': tracking.get('override_counts', {})
    }


def record_strain_resolution(
    config: Dict[str, Any],
    rule_id: str,
    resolution: str,
    notes: Optional[str]
) -> Dict[str, Any]:
    """
    Record resolution of a strain review

    Args:
        config: Project configuration
        rule_id: Rule being resolved
        resolution: Type of resolution (e.g., 'phase_transition', 'adjust_rule')
        notes: Optional notes about resolution

    Returns:
        dict: Resolution result
    """
    if 'research_design' not in config or 'strain_tracking' not in config['research_design']:
        return {'success': False, 'error': 'No strain tracking data'}

    tracking = config['research_design']['strain_tracking']

    # Add to strain reviews log
    tracking['strain_reviews'].append({
        'rule_id': rule_id,
        'triggered_at': datetime.now().isoformat(),
        'override_count': tracking['override_counts'].get(rule_id, {}).get('count', 0),
        'resolution': resolution,
        'notes': notes or ''
    })

    # If resolution involves phase transition, reset counts
    if resolution == 'phase_transition':
        if rule_id in tracking['override_counts']:
            tracking['override_counts'][rule_id]['count'] = 0

    # Remove from strained list if resolved
    if rule_id in tracking.get('strained_rules', []):
        tracking['strained_rules'].remove(rule_id)

    return {
        'success': True,
        'resolution': resolution,
        'rule_id': rule_id
    }


def generate_strain_prompt(rule_id: str, override_count: int) -> str:
    """
    Generate the strain review prompt

    Args:
        rule_id: Rule that reached strain threshold
        override_count: Number of overrides

    Returns:
        str: Conversational prompt for methodological review
    """
    prompts = {
        'case-isolation': f"""You've overridden case isolation {override_count} times this phase. That's not wrong—it might mean your study is evolving.

Quick check: Are you...
[A] Moving toward cross-case synthesis (ready for phase transition?)
[B] Finding the rule too strict for your methodology
[C] Just exploring—keep the rule but note the pattern

What feels right?""",

        'wave-isolation': f"""You've crossed wave boundaries {override_count} times this phase. Let's check in on this pattern.

Are you...
[A] Ready for cross-wave analysis (natural progression?)
[B] Finding temporal isolation doesn't fit your approach
[C] Exploring specific connections (legitimate but note it)

What's happening in your analysis?""",

        'stream-separation': f"""You've integrated theory and data {override_count} times before the synthesis phase.

Are you...
[A] Ready to move to synthesis (streams mature enough?)
[B] Finding parallel streams too artificial for your work
[C] Using theoretical sampling (methodologically appropriate)

How would you characterize what's happening?"""
    }

    return prompts.get(
        rule_id,
        f"You've overridden the {rule_id} rule {override_count} times. Let's review whether this rule fits your evolving methodology."
    )


def main() -> int:
    """CLI entry point"""
    parser = argparse.ArgumentParser(
        description="Detect and handle methodological strain from repeated rule overrides"
    )
    parser.add_argument(
        '--project-path',
        type=str,
        required=True,
        help='Path to project directory'
    )
    parser.add_argument(
        '--record-override',
        action='store_true',
        help='Record an override'
    )
    parser.add_argument(
        '--record-resolution',
        action='store_true',
        help='Record resolution of strain review'
    )
    parser.add_argument(
        '--rule-id',
        type=str,
        help='Rule identifier'
    )
    parser.add_argument(
        '--justification',
        type=str,
        help='Justification for override'
    )
    parser.add_argument(
        '--resolution',
        type=str,
        help='Type of resolution (phase_transition, adjust_rule, etc.)'
    )
    parser.add_argument(
        '--notes',
        type=str,
        help='Notes about resolution'
    )

    args = parser.parse_args()

    project_path = Path(args.project_path).resolve()
    config = load_config(project_path)

    if not config:
        print(json.dumps({
            'success': False,
            'error': 'Config not found'
        }))
        return 1

    current_phase = get_current_phase(config.get('sandwich_status'))

    # Handle different modes
    if args.record_override:
        # Recording an override
        if not args.rule_id:
            print(json.dumps({
                'success': False,
                'error': 'Missing --rule-id for override recording'
            }))
            return 1

        result = record_override(config, args.rule_id, args.justification, current_phase)
        save_config(project_path, config)

        # If first time strained, log to journal and generate prompt
        if result['first_time_strained']:
            prompt = generate_strain_prompt(args.rule_id, result['override_count'])
            log_to_journal(
                project_path,
                f"""**Rule "{args.rule_id}" has reached strain threshold ({result['override_count']} overrides)**

This triggers a methodological review. Consider:
- Is this rule appropriate for your current phase?
- Has your study design evolved?
- Should you transition to the next phase?

{prompt}"""
            )

            result['strain_prompt'] = prompt
            result['action_required'] = 'methodological_review'

        print(json.dumps(result, indent=2))

    elif args.record_resolution:
        # Recording resolution of strain review
        if not args.rule_id or not args.resolution:
            print(json.dumps({
                'success': False,
                'error': 'Missing --rule-id or --resolution'
            }))
            return 1

        result = record_strain_resolution(config, args.rule_id, args.resolution, args.notes)
        save_config(project_path, config)

        log_to_journal(
            project_path,
            f"""**Strain review resolved for "{args.rule_id}"**
Resolution: {args.resolution}
Notes: {args.notes or 'None provided'}"""
        )

        print(json.dumps(result, indent=2))

    else:
        # Just checking strain status
        result = check_strain(config, args.rule_id)
        result['current_phase'] = current_phase

        # Add prompts for any strained rules
        if result['has_strain']:
            if args.rule_id:
                result['strain_prompt'] = generate_strain_prompt(
                    args.rule_id,
                    result['override_count']
                )
            else:
                result['strain_prompts'] = {}
                for rule in result['strained_rules']:
                    result['strain_prompts'][rule['rule_id']] = generate_strain_prompt(
                        rule['rule_id'],
                        rule['override_count']
                    )

        print(json.dumps(result, indent=2))

    return 0


if __name__ == '__main__':
    sys.exit(main())
