#!/usr/bin/env python3
"""
update_rules.py
Update rule statuses after phase transitions

Usage:
    python3 update_rules.py --project-path /path/to/project

This script:
1. Checks current phase
2. Determines which rules need status updates
3. Regenerates affected rules
4. Logs changes to reflexivity journal
"""

import argparse
import json
import sys
from pathlib import Path
from datetime import datetime

# Import sibling scripts
try:
    from check_phase import check_phase
    from generate_rules import generate_rules
except ImportError:
    # Fallback: add current directory to path
    sys.path.insert(0, str(Path(__file__).parent))
    from check_phase import check_phase
    from generate_rules import generate_rules

# Import qual-shared
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "qual-shared" / "scripts"))
try:
    from conversation_logger import ConversationLogger
except ImportError:
    ConversationLogger = None


def log_to_journal(project_path: Path, message: str):
    """
    Log phase transition to reflexivity journal

    Args:
        project_path: Path to project
        message: Message to log
    """
    # Use ConversationLogger if available
    if ConversationLogger:
        try:
            logger = ConversationLogger(str(project_path))
            logger.log_event("phase_transition_rules_updated", {"message": message})
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

### Phase Transition - Rules Updated
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


def update_rules(project_path: str):
    """
    Update rule statuses after phase transition

    Args:
        project_path: Path to project directory

    Returns:
        dict: Update result with status information
    """
    project_path = Path(project_path).resolve()

    # Check current phase
    phase_info = check_phase(str(project_path))
    if not phase_info.get('success'):
        return phase_info

    # Load existing rules to check what needs updating
    rules_file = project_path / ".interpretive-orchestration" / "methodological-rules.json"
    existing_rules = []

    if rules_file.exists():
        try:
            with open(rules_file, 'r') as f:
                existing_data = json.load(f)
                existing_rules = existing_data.get('rules', [])
        except Exception:
            existing_rules = []

    # Determine what changed
    relaxed_rule_names = [r['name'] for r in phase_info['rules_should_relax']]
    rules_needing_update = []

    for rule in existing_rules:
        is_currently_active = rule.get('status') == 'active'
        should_be_relaxed = rule.get('rule_id') in relaxed_rule_names

        # Need update if status mismatch
        if is_currently_active and should_be_relaxed:
            rules_needing_update.append(rule.get('rule_id', 'unknown'))

    if not rules_needing_update:
        return {
            "success": True,
            "message": "No rules need updating",
            "current_phase": phase_info['current_phase'],
            "rules_checked": len(existing_rules)
        }

    # Regenerate all rules (ensures consistency)
    generate_result = generate_rules(str(project_path))

    if not generate_result.get('success'):
        return {
            "success": False,
            "error": f"Failed to regenerate rules: {generate_result.get('error', 'Unknown error')}"
        }

    # Log the transition
    active_rules_text = '\n'.join(
        f"- {r['name']} (until {r['relaxes_at']})"
        for r in phase_info['rules_still_active']
    ) if phase_info['rules_still_active'] else '- None'

    relaxed_rules_text = '\n'.join(
        f"- {rule_id}"
        for rule_id in rules_needing_update
    ) if rules_needing_update else '- None'

    transition_message = f"""**Phase Transition Detected**

**New Phase:** {phase_info['current_phase']}

**Rules Relaxed:**
{relaxed_rules_text}

**Rules Still Active:**
{active_rules_text}

This is a natural part of your analytical progression. Rules relax when methodologically appropriate."""

    log_to_journal(project_path, transition_message)

    # Output result
    return {
        "success": True,
        "current_phase": phase_info['current_phase'],
        "rules_updated": rules_needing_update,
        "rules_regenerated": len(generate_result.get('rules', [])),
        "message": f"Phase transition: {len(rules_needing_update)} rule(s) relaxed"
    }


def main():
    """CLI entry point"""
    parser = argparse.ArgumentParser(
        description="Update rule statuses after phase transition"
    )
    parser.add_argument(
        '--project-path',
        type=str,
        required=True,
        help='Path to project directory'
    )

    args = parser.parse_args()

    result = update_rules(args.project_path)

    print(json.dumps(result, indent=2))

    return 0 if result.get('success') else 1


if __name__ == '__main__':
    sys.exit(main())
