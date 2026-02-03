#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "jinja2>=3.1.0",
# ]
# ///
"""
generate_rules.py
Generates methodological rules from research design configuration

Usage:
    uv run generate_rules.py --project-path /path/to/project
    # OR (if uv not available):
    python3 generate_rules.py --project-path /path/to/project

Reads:
    - .interpretive-orchestration/config.json (research_design section)
    - skills/qual-methodological-rules/templates/*.template.md (Jinja2 templates)

Writes:
    - .interpretive-orchestration/methodological-rules.json (structured data)
    - .interpretive-orchestration/reflexivity-journal.md (logs changes)

Returns JSON with generated rules data structure
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime

# Import Jinja2 for template rendering
try:
    from jinja2 import Environment, FileSystemLoader, Template
except ImportError:
    print("Error: jinja2 not installed. Run: uv add jinja2", file=sys.stderr)
    sys.exit(1)

# Import phase detection logic from check_phase.py
from check_phase import get_current_phase, should_relax

# Import qual-shared infrastructure
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "qual-shared" / "scripts"))
try:
    from state_manager import StateManager
    from conversation_logger import ConversationLogger
except ImportError:
    StateManager = None
    ConversationLogger = None


def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(
        description="Generate methodological rules from research design"
    )
    parser.add_argument(
        '--project-path',
        type=str,
        required=True,
        help='Path to project directory'
    )
    return parser.parse_args()


def load_config(project_path: Path) -> Optional[Dict[str, Any]]:
    """
    Load project configuration using StateManager if available,
    otherwise fall back to direct file reading
    """
    if StateManager:
        try:
            state_manager = StateManager(str(project_path))
            state = state_manager.load()
            # StateManager returns ProjectState, we need full config
            # Fall back to direct read for now
        except Exception:
            pass

    # Direct file reading (fallback)
    config_path = project_path / ".interpretive-orchestration" / "config.json"
    if not config_path.exists():
        return None

    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error parsing config: {e}", file=sys.stderr)
        return None


def log_to_journal(project_path: Path, message: str):
    """
    Log message to reflexivity journal using ConversationLogger if available,
    otherwise fall back to manual append
    """
    if ConversationLogger:
        try:
            logger = ConversationLogger(str(project_path))
            logger.log({
                "event_type": "methodological_rules_update",
                "agent": "generate_rules",
                "content": {
                    "message": message
                }
            })
        except Exception:
            pass  # Non-critical

    # Fallback: Manual append to journal
    journal_path = project_path / ".interpretive-orchestration" / "reflexivity-journal.md"
    if not journal_path.exists():
        return

    timestamp = datetime.now()
    entry = f"""
---

### Methodological Rules Update
**Date:** {timestamp.strftime('%Y-%m-%d')}
**Time:** {timestamp.strftime('%H:%M:%S')}

{message}

---
"""

    try:
        with open(journal_path, 'a') as f:
            f.write(entry)
    except Exception:
        pass  # Non-critical


def generate_case_isolation_rule(
    config: Dict[str, Any],
    templates_dir: Path,
    current_phase: str
) -> Optional[Dict[str, Any]]:
    """Generate case isolation rule"""
    design = config.get('research_design', {})
    if not design or not design.get('cases') or len(design['cases']) == 0:
        return None

    isolation = design.get('isolation_config', {}).get('case_isolation', {})
    if isolation.get('enabled') == False:
        return None

    template_path = templates_dir / 'case-isolation.template.md'
    if not template_path.exists():
        return {"error": "Template not found: case-isolation.template.md"}

    # Load and render template with Jinja2
    env = Environment(loader=FileSystemLoader(templates_dir))
    template = env.get_template('case-isolation.template.md')

    relaxes_at = isolation.get('relaxes_at', 'phase3_pattern_characterization')
    is_relaxed = should_relax(relaxes_at, current_phase)
    friction_level = isolation.get('friction_level', 'challenge')

    # Prepare template data
    cases = design['cases']
    case_paths = [c.get('folder_path', '') for c in cases if c.get('folder_path')]
    case_paths_pattern = ', '.join([p + '/**' for p in case_paths]) if case_paths else 'data/cases/**'

    data = {
        'study_type': design.get('study_type', 'multi_case'),
        'case_count': len(cases),
        'case_names': ', '.join([c.get('name', '') for c in cases]),
        'case_paths': case_paths_pattern,
        'current_phase': current_phase,
        'rule_status': 'RELAXED' if is_relaxed else 'ACTIVE',
        'friction_level': 'SILENT' if is_relaxed else friction_level.upper(),
        'relaxes_at_phase': relaxes_at,
        'timestamp': datetime.now().isoformat()
    }

    rendered = template.render(**data)

    return {
        'rule_id': 'case-isolation',
        'rule_type': 'case_isolation',
        'status': 'relaxed' if is_relaxed else 'active',
        'friction_level': friction_level,
        'relaxes_at_phase': relaxes_at,
        'current_phase': current_phase,
        'config': {
            'study_type': data['study_type'],
            'case_count': data['case_count'],
            'case_names': data['case_names'],
            'case_paths': data['case_paths']
        },
        'rendered_content': rendered,
        'last_updated': data['timestamp']
    }


def generate_wave_isolation_rule(
    config: Dict[str, Any],
    templates_dir: Path,
    current_phase: str
) -> Optional[Dict[str, Any]]:
    """Generate wave isolation rule"""
    design = config.get('research_design', {})
    if not design or not design.get('waves') or len(design['waves']) == 0:
        return None

    isolation = design.get('isolation_config', {}).get('wave_isolation', {})
    if isolation.get('enabled') == False:
        return None

    template_path = templates_dir / 'wave-isolation.template.md'
    if not template_path.exists():
        return {"error": "Template not found: wave-isolation.template.md"}

    # Load and render template with Jinja2
    env = Environment(loader=FileSystemLoader(templates_dir))
    template = env.get_template('wave-isolation.template.md')

    relaxes_at = isolation.get('relaxes_at', 'cross_wave_analysis')
    is_relaxed = should_relax(relaxes_at, current_phase)
    friction_level = isolation.get('friction_level', 'challenge')

    # Prepare template data
    waves = design['waves']
    wave_paths = [w.get('folder_path', '') for w in waves if w.get('folder_path')]
    wave_paths_pattern = ', '.join([p + '/**' for p in wave_paths]) if wave_paths else 'data/waves/**'

    data = {
        'study_type': design.get('study_type', 'longitudinal'),
        'wave_count': len(waves),
        'wave_names': ', '.join([w.get('name', '') for w in waves]),
        'wave_paths': wave_paths_pattern,
        'waves': waves,
        'current_phase': current_phase,
        'rule_status': 'RELAXED' if is_relaxed else 'ACTIVE',
        'friction_level': 'SILENT' if is_relaxed else friction_level.upper(),
        'relaxes_at_phase': relaxes_at,
        'timestamp': datetime.now().isoformat()
    }

    rendered = template.render(**data)

    return {
        'rule_id': 'wave-isolation',
        'rule_type': 'wave_isolation',
        'status': 'relaxed' if is_relaxed else 'active',
        'friction_level': friction_level,
        'relaxes_at_phase': relaxes_at,
        'current_phase': current_phase,
        'config': {
            'study_type': data['study_type'],
            'wave_count': data['wave_count'],
            'wave_names': data['wave_names'],
            'wave_paths': data['wave_paths'],
            'waves': [{'name': w.get('name'), 'id': w.get('id'),
                      'collection_period': w.get('collection_period', 'Not specified'),
                      'status': w.get('status', 'pending')} for w in waves]
        },
        'rendered_content': rendered,
        'last_updated': data['timestamp']
    }


def generate_stream_separation_rule(
    config: Dict[str, Any],
    templates_dir: Path,
    current_phase: str
) -> Optional[Dict[str, Any]]:
    """Generate stream separation rule"""
    design = config.get('research_design', {})
    if not design:
        return None

    isolation = design.get('isolation_config', {}).get('stream_separation', {})
    if isolation.get('enabled') == False:
        return None

    template_path = templates_dir / 'stream-separation.template.md'
    if not template_path.exists():
        return {"error": "Template not found: stream-separation.template.md"}

    # Load and render template with Jinja2
    env = Environment(loader=FileSystemLoader(templates_dir))
    template = env.get_template('stream-separation.template.md')

    relaxes_at = isolation.get('relaxes_at', 'phase2_synthesis')
    is_relaxed = should_relax(relaxes_at, current_phase)
    friction_level = isolation.get('friction_level', 'nudge')

    # Prepare template data
    streams = design.get('streams', {})
    theoretical = streams.get('theoretical', {})
    empirical = streams.get('empirical', {})

    theoretical_path = theoretical.get('folder_path', 'literature')
    empirical_path = empirical.get('folder_path', 'data')
    stream_paths = f"{theoretical_path}/**, {empirical_path}/**"

    data = {
        'study_type': design.get('study_type', 'single_case'),
        'theoretical_path': theoretical_path,
        'empirical_path': empirical_path,
        'theoretical_sources': ', '.join(theoretical.get('sources', [])) or 'Not specified',
        'empirical_sources': ', '.join(empirical.get('sources', [])) or 'Not specified',
        'stream_paths': stream_paths,
        'current_phase': current_phase,
        'rule_status': 'RELAXED' if is_relaxed else 'ACTIVE',
        'friction_level': 'SILENT' if is_relaxed else friction_level.upper(),
        'relaxes_at_phase': relaxes_at,
        'timestamp': datetime.now().isoformat()
    }

    rendered = template.render(**data)

    return {
        'rule_id': 'stream-separation',
        'rule_type': 'stream_separation',
        'status': 'relaxed' if is_relaxed else 'active',
        'friction_level': friction_level,
        'relaxes_at_phase': relaxes_at,
        'current_phase': current_phase,
        'config': {
            'study_type': data['study_type'],
            'theoretical_path': theoretical_path,
            'empirical_path': empirical_path,
            'theoretical_sources': data['theoretical_sources'],
            'empirical_sources': data['empirical_sources'],
            'stream_paths': stream_paths
        },
        'rendered_content': rendered,
        'last_updated': data['timestamp']
    }


def main():
    """Main execution"""
    args = parse_args()

    project_path = Path(args.project_path).resolve()

    # Load config
    config = load_config(project_path)
    if config is None:
        result = {
            "success": False,
            "error": "Config not found. Run /qual-init first.",
            "path": str(project_path / ".interpretive-orchestration" / "config.json")
        }
        print(json.dumps(result, indent=2))
        return 1

    # Check if research_design exists
    if not config.get('research_design'):
        result = {
            "success": True,
            "message": "No research_design configured. No rules generated.",
            "rules_generated": 0,
            "rules": []
        }
        print(json.dumps(result, indent=2))
        return 0

    # Get current phase
    sandwich_status = config.get('sandwich_status', {})
    current_phase = get_current_phase(sandwich_status)

    # Find templates directory (relative to this script)
    templates_dir = Path(__file__).parent.parent / 'templates'

    # Generate rules
    results = {
        "success": True,
        "current_phase": current_phase,
        "rules_generated": [],
        "rules_skipped": [],
        "errors": [],
        "rules": []
    }

    # Case isolation
    case_rule = generate_case_isolation_rule(config, templates_dir, current_phase)
    if case_rule:
        if case_rule.get('error'):
            results['errors'].append(case_rule['error'])
        else:
            results['rules'].append(case_rule)
            results['rules_generated'].append({
                "name": "case-isolation",
                "status": case_rule['status'],
                "friction": case_rule['friction_level']
            })
    else:
        results['rules_skipped'].append('case-isolation (no cases or disabled)')

    # Wave isolation
    wave_rule = generate_wave_isolation_rule(config, templates_dir, current_phase)
    if wave_rule:
        if wave_rule.get('error'):
            results['errors'].append(wave_rule['error'])
        else:
            results['rules'].append(wave_rule)
            results['rules_generated'].append({
                "name": "wave-isolation",
                "status": wave_rule['status'],
                "friction": wave_rule['friction_level']
            })
    else:
        results['rules_skipped'].append('wave-isolation (no waves or disabled)')

    # Stream separation
    stream_rule = generate_stream_separation_rule(config, templates_dir, current_phase)
    if stream_rule:
        if stream_rule.get('error'):
            results['errors'].append(stream_rule['error'])
        else:
            results['rules'].append(stream_rule)
            results['rules_generated'].append({
                "name": "stream-separation",
                "status": stream_rule['status'],
                "friction": stream_rule['friction_level']
            })
    else:
        results['rules_skipped'].append('stream-separation (disabled)')

    # Write rules to JSON file
    if results['rules']:
        output_path = project_path / ".interpretive-orchestration" / "methodological-rules.json"
        output_path.parent.mkdir(parents=True, exist_ok=True)

        try:
            with open(output_path, 'w') as f:
                json.dump({"rules": results['rules']}, f, indent=2)
        except Exception as e:
            results['errors'].append(f"Failed to write rules JSON: {e}")

    # Log to journal
    if results['rules_generated']:
        rules_summary = '\n'.join([
            f"- **{r['name']}**: {r['status'].upper()} (friction: {r['friction']})"
            for r in results['rules_generated']
        ])
        log_message = f"**Rules Generated/Updated:**\n{rules_summary}\n\n**Current Phase:** {current_phase}"
        log_to_journal(project_path, log_message)

    # Set success based on errors
    results['success'] = len(results['errors']) == 0

    print(json.dumps(results, indent=2))
    return 0 if results['success'] else 1


if __name__ == '__main__':
    sys.exit(main())
