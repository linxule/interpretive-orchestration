#!/usr/bin/env python3
"""
saturation_tracker.py
Multi-dimensional tracking of theoretical saturation

Saturation is NOT just repetition - it's understanding the full range of variation.
This script tracks:
- Code generation rate (are we creating fewer new codes?)
- Code coverage (how well do codes cover the corpus?)
- Refinement activity (are we still refining definitions?)
- Conceptual redundancy (are we hearing the same things?)

Usage:
    python saturation_tracker.py --project-path /path/to/project --status
    python saturation_tracker.py --project-path /path/to/project --record-document --doc-id "INT_001" --doc-name "Interview 1" --new-codes 5
    python saturation_tracker.py --project-path /path/to/project --record-refinement --code-id "coping" --change-type "split" --rationale "Distinct coping mechanisms"
    python saturation_tracker.py --project-path /path/to/project --update-redundancy --score 0.72 --notes "Still seeing new variations in resilience theme"
    python saturation_tracker.py --project-path /path/to/project --assess
"""

import argparse
import json
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any


def load_config(project_path: Path) -> Optional[Dict[str, Any]]:
    """Load project configuration from .interpretive-orchestration/config.json"""
    config_path = project_path / '.interpretive-orchestration' / 'config.json'
    if not config_path.exists():
        return None

    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(json.dumps({
            'success': False,
            'error': f'Failed to load config: {str(e)}'
        }), file=sys.stderr)
        return None


def save_config(project_path: Path, config: Dict[str, Any]) -> None:
    """Save project configuration to .interpretive-orchestration/config.json"""
    config_path = project_path / '.interpretive-orchestration' / 'config.json'
    config_path.parent.mkdir(parents=True, exist_ok=True)

    with open(config_path, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2, ensure_ascii=False)


def init_saturation_tracking(config: Dict[str, Any]) -> Dict[str, Any]:
    """Initialize saturation tracking structure if not present"""
    if 'saturation_tracking' not in config:
        config['saturation_tracking'] = {
            'code_generation': {
                'total_codes': 0,
                'codes_by_document': [],
                'generation_rate': 0,
                'stabilized_at_document': None
            },
            'code_coverage': {
                'coverage_by_code': {},
                'rare_codes': [],
                'universal_codes': []
            },
            'refinement': {
                'definition_changes': [],
                'changes_last_5_documents': 0,
                'split_merge_count': 0
            },
            'redundancy': {
                'redundancy_score': 0,
                'last_assessment': None,
                'assessment_notes': '',
                'threshold': 0.85
            },
            'saturation_signals': {
                'overall_level': 'low',
                'last_assessment': None,
                'recommendation': '',
                'evidence': {}
            },
            'thresholds': {
                'code_generation_stable': 0.5,
                'refinement_stable': 2,
                'redundancy_high': 0.85,
                'coverage_adequate': 0.7
            }
        }
    return config['saturation_tracking']


def log_to_journal(project_path: Path, message: str) -> None:
    """Log message to reflexivity journal"""
    journal_path = project_path / '.interpretive-orchestration' / 'reflexivity-journal.md'
    if not journal_path.exists():
        return

    now = datetime.now()
    entry = f"""
---

### Saturation Tracking Update
**Date:** {now.strftime('%Y-%m-%d')}
**Time:** {now.strftime('%H:%M:%S')}

{message}

---
"""

    try:
        with open(journal_path, 'a', encoding='utf-8') as f:
            f.write(entry)
    except IOError:
        # Non-critical
        pass


def record_document(
    config: Dict[str, Any],
    doc_id: str,
    doc_name: str,
    new_codes: int
) -> Dict[str, Any]:
    """
    Record a document coding event

    Args:
        config: Project configuration dictionary
        doc_id: Document identifier
        doc_name: Human-readable document name
        new_codes: Number of new codes created for this document

    Returns:
        Result dictionary with success status and metrics
    """
    tracking = init_saturation_tracking(config)
    now = datetime.now().isoformat()

    # Add to codes_by_document
    tracking['code_generation']['codes_by_document'].append({
        'document_id': doc_id,
        'document_name': doc_name,
        'new_codes_created': new_codes,
        'timestamp': now
    })

    # Update total codes
    tracking['code_generation']['total_codes'] += new_codes

    # Calculate rolling average (last 5 documents)
    recent_docs = tracking['code_generation']['codes_by_document'][-5:]
    avg_rate = sum(d['new_codes_created'] for d in recent_docs) / len(recent_docs)
    tracking['code_generation']['generation_rate'] = round(avg_rate, 2)

    # Check if stabilized (rate dropped below threshold)
    threshold = tracking['thresholds'].get('code_generation_stable', 0.5)
    if (not tracking['code_generation']['stabilized_at_document'] and
        avg_rate < threshold and len(recent_docs) >= 3):
        tracking['code_generation']['stabilized_at_document'] = doc_id

    return {
        'success': True,
        'document': doc_id,
        'new_codes': new_codes,
        'total_codes': tracking['code_generation']['total_codes'],
        'generation_rate': tracking['code_generation']['generation_rate'],
        'stabilized': tracking['code_generation']['stabilized_at_document'] is not None,
        'stabilized_at': tracking['code_generation']['stabilized_at_document']
    }


def record_refinement(
    config: Dict[str, Any],
    code_id: str,
    change_type: str,
    old_state: Optional[str] = None,
    new_state: Optional[str] = None,
    rationale: Optional[str] = None
) -> Dict[str, Any]:
    """
    Record a code refinement (split, merge, redefinition, etc.)

    Args:
        config: Project configuration dictionary
        code_id: Code identifier being refined
        change_type: Type of change (split, merge, redefinition, etc.)
        old_state: Previous state/definition (optional)
        new_state: New state/definition (optional)
        rationale: Reason for the change (optional)

    Returns:
        Result dictionary with success status and metrics
    """
    tracking = init_saturation_tracking(config)
    now = datetime.now().isoformat()

    # Add to definition_changes
    tracking['refinement']['definition_changes'].append({
        'code_id': code_id,
        'change_type': change_type,
        'old_state': old_state or '',
        'new_state': new_state or '',
        'rationale': rationale or '',
        'timestamp': now
    })

    # Update split_merge_count
    if change_type in ['split', 'merge']:
        tracking['refinement']['split_merge_count'] += 1

    # Calculate changes in last 5 documents
    # (approximation: last 10 changes within recent timeframe)
    recent_changes = tracking['refinement']['definition_changes'][-10:]
    five_days_ago = (datetime.now() - timedelta(days=5)).isoformat()
    recent_count = sum(1 for c in recent_changes if c['timestamp'] > five_days_ago)
    tracking['refinement']['changes_last_5_documents'] = min(recent_count, 10)

    return {
        'success': True,
        'code_id': code_id,
        'change_type': change_type,
        'total_refinements': len(tracking['refinement']['definition_changes']),
        'split_merge_count': tracking['refinement']['split_merge_count'],
        'recent_activity': tracking['refinement']['changes_last_5_documents']
    }


def update_coverage(
    config: Dict[str, Any],
    coverage_data: Dict[str, Dict[str, int]]
) -> Dict[str, Any]:
    """
    Update code coverage statistics

    Args:
        config: Project configuration dictionary
        coverage_data: Dictionary mapping code_id to {document_count, case_count}

    Returns:
        Result dictionary with success status and metrics
    """
    tracking = init_saturation_tracking(config)
    total_documents = config.get('coding_progress', {}).get('documents_coded', 1)

    # Update coverage by code
    for code_id, data in coverage_data.items():
        coverage_percent = (data['document_count'] / total_documents) * 100
        tracking['code_coverage']['coverage_by_code'][code_id] = {
            'document_count': data['document_count'],
            'case_count': data.get('case_count', 0),
            'coverage_percent': round(coverage_percent, 1)
        }

    # Identify rare and universal codes
    rare_codes = []
    universal_codes = []

    for code_id, data in tracking['code_coverage']['coverage_by_code'].items():
        if data['coverage_percent'] < 10:
            rare_codes.append(code_id)
        elif data['coverage_percent'] > 80:
            universal_codes.append(code_id)

    tracking['code_coverage']['rare_codes'] = rare_codes
    tracking['code_coverage']['universal_codes'] = universal_codes

    return {
        'success': True,
        'total_codes_tracked': len(tracking['code_coverage']['coverage_by_code']),
        'rare_codes': len(rare_codes),
        'universal_codes': len(universal_codes)
    }


def update_redundancy(
    config: Dict[str, Any],
    score: float,
    notes: Optional[str] = None
) -> Dict[str, Any]:
    """
    Update redundancy assessment (typically done by researcher/AI)

    Args:
        config: Project configuration dictionary
        score: Redundancy score (0-1, where 1 is complete redundancy)
        notes: Optional notes about the assessment

    Returns:
        Result dictionary with success status and metrics
    """
    tracking = init_saturation_tracking(config)
    now = datetime.now().isoformat()

    tracking['redundancy']['redundancy_score'] = max(0, min(1, float(score)))
    tracking['redundancy']['last_assessment'] = now
    tracking['redundancy']['assessment_notes'] = notes or ''

    return {
        'success': True,
        'redundancy_score': tracking['redundancy']['redundancy_score'],
        'threshold': tracking['redundancy']['threshold'],
        'above_threshold': tracking['redundancy']['redundancy_score'] >= tracking['redundancy']['threshold']
    }


def assess_saturation(config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Assess overall saturation level

    Calculates saturation score (0-100) based on four dimensions:
    - Code generation (30%): Lower generation rate = higher saturation
    - Coverage (25%): Higher adequate coverage = higher saturation
    - Refinement (25%): Fewer recent changes = higher saturation
    - Redundancy (20%): Higher redundancy score = higher saturation

    Args:
        config: Project configuration dictionary

    Returns:
        Result dictionary with saturation level, score, evidence, and recommendation
    """
    tracking = init_saturation_tracking(config)
    thresholds = tracking['thresholds']
    now = datetime.now().isoformat()

    evidence = {
        'code_generation_signal': '',
        'coverage_signal': '',
        'refinement_signal': '',
        'redundancy_signal': ''
    }

    saturation_score = 0

    # 1. Code Generation Assessment (weight: 30%)
    gen_rate = tracking['code_generation']['generation_rate']
    if gen_rate < thresholds['code_generation_stable']:
        evidence['code_generation_signal'] = (
            f"STABLE: {gen_rate} new codes/doc (threshold: {thresholds['code_generation_stable']})"
        )
        saturation_score += 30
    elif gen_rate < thresholds['code_generation_stable'] * 2:
        evidence['code_generation_signal'] = f"SLOWING: {gen_rate} new codes/doc"
        saturation_score += 15
    else:
        evidence['code_generation_signal'] = f"ACTIVE: {gen_rate} new codes/doc - still generating"

    # 2. Coverage Assessment (weight: 25%)
    coverage_data = tracking['code_coverage']['coverage_by_code']
    code_count = len(coverage_data)
    if code_count > 0:
        codes_with_adequate_coverage = sum(
            1 for c in coverage_data.values() if c['coverage_percent'] >= 20
        )
        coverage_ratio = codes_with_adequate_coverage / code_count

        if coverage_ratio >= thresholds['coverage_adequate']:
            evidence['coverage_signal'] = (
                f"ADEQUATE: {round(coverage_ratio * 100)}% of codes have >20% coverage"
            )
            saturation_score += 25
        else:
            evidence['coverage_signal'] = f"DEVELOPING: {round(coverage_ratio * 100)}% coverage ratio"
            saturation_score += round(coverage_ratio * 15)
    else:
        evidence['coverage_signal'] = 'NO DATA: Coverage not yet tracked'

    # 3. Refinement Assessment (weight: 25%)
    recent_refinements = tracking['refinement']['changes_last_5_documents']
    if recent_refinements <= thresholds['refinement_stable']:
        evidence['refinement_signal'] = (
            f"STABLE: {recent_refinements} changes recently (threshold: {thresholds['refinement_stable']})"
        )
        saturation_score += 25
    else:
        evidence['refinement_signal'] = (
            f"ACTIVE: {recent_refinements} recent refinements - concepts still evolving"
        )
        saturation_score += 5

    # 4. Redundancy Assessment (weight: 20%)
    redundancy_score = tracking['redundancy']['redundancy_score']
    if redundancy_score >= thresholds['redundancy_high']:
        evidence['redundancy_signal'] = f"HIGH: {round(redundancy_score * 100)}% redundancy"
        saturation_score += 20
    elif redundancy_score >= thresholds['redundancy_high'] * 0.7:
        evidence['redundancy_signal'] = f"EMERGING: {round(redundancy_score * 100)}% redundancy"
        saturation_score += 12
    else:
        evidence['redundancy_signal'] = (
            f"LOW: {round(redundancy_score * 100)}% redundancy - still finding novelty"
        )

    # Determine overall level and recommendation
    if saturation_score >= 90:
        level = 'saturated'
        recommendation = (
            "Strong saturation signals. Consider: Are there negative cases you haven't explored? "
            "If variation is understood, ready for theoretical integration."
        )
    elif saturation_score >= 70:
        level = 'high'
        recommendation = (
            "Approaching saturation. Theoretical sampling: seek cases most different from your "
            "current sample to test your codes."
        )
    elif saturation_score >= 50:
        level = 'approaching'
        recommendation = (
            "Emerging saturation patterns. Continue coding but watch for diminishing returns. "
            "Write memos on variation."
        )
    elif saturation_score >= 25:
        level = 'emerging'
        recommendation = (
            "Early saturation signals. Still actively generating codes and refining concepts. "
            "Stay open to new patterns."
        )
    else:
        level = 'low'
        recommendation = "Low saturation. Actively developing codes. Focus on open coding and memo writing."

    # Update tracking
    tracking['saturation_signals'] = {
        'overall_level': level,
        'last_assessment': now,
        'recommendation': recommendation,
        'evidence': evidence
    }

    return {
        'success': True,
        'saturation_level': level,
        'saturation_score': saturation_score,
        'recommendation': recommendation,
        'evidence': evidence,
        'metrics': {
            'code_generation_rate': gen_rate,
            'total_codes': tracking['code_generation']['total_codes'],
            'documents_coded': len(tracking['code_generation']['codes_by_document']),
            'stabilized_at': tracking['code_generation']['stabilized_at_document'],
            'recent_refinements': recent_refinements,
            'redundancy_score': redundancy_score,
            'rare_codes': len(tracking['code_coverage']['rare_codes']),
            'universal_codes': len(tracking['code_coverage']['universal_codes'])
        }
    }


def get_status(config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Get current saturation tracking status

    Args:
        config: Project configuration dictionary

    Returns:
        Status dictionary with all tracking dimensions
    """
    tracking = config.get('saturation_tracking')
    if not tracking:
        return {
            'success': True,
            'initialized': False,
            'message': 'Saturation tracking not yet initialized. Record your first document to begin.'
        }

    return {
        'success': True,
        'initialized': True,
        'code_generation': {
            'total_codes': tracking['code_generation']['total_codes'],
            'documents_tracked': len(tracking['code_generation']['codes_by_document']),
            'generation_rate': tracking['code_generation']['generation_rate'],
            'stabilized': tracking['code_generation']['stabilized_at_document'] is not None
        },
        'refinement': {
            'total_changes': len(tracking['refinement']['definition_changes']),
            'recent_activity': tracking['refinement']['changes_last_5_documents'],
            'splits_merges': tracking['refinement']['split_merge_count']
        },
        'redundancy': {
            'score': tracking['redundancy']['redundancy_score'],
            'last_assessed': tracking['redundancy']['last_assessment']
        },
        'saturation': tracking['saturation_signals']
    }


def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description='Multi-dimensional theoretical saturation tracking',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --project-path /path/to/project --status
  %(prog)s --project-path /path/to/project --record-document --doc-id INT_001 --doc-name "Interview 1" --new-codes 5
  %(prog)s --project-path /path/to/project --record-refinement --code-id coping --change-type split --rationale "Distinct mechanisms"
  %(prog)s --project-path /path/to/project --update-redundancy --score 0.72 --notes "Still seeing variations"
  %(prog)s --project-path /path/to/project --assess
        """
    )

    # Required arguments
    parser.add_argument('--project-path', required=True, type=Path,
                        help='Path to project directory')

    # Mode selection
    parser.add_argument('--status', action='store_true',
                        help='Show current saturation status')
    parser.add_argument('--record-document', action='store_true',
                        help='Record a coded document')
    parser.add_argument('--record-refinement', action='store_true',
                        help='Record a code refinement')
    parser.add_argument('--update-coverage', action='store_true',
                        help='Update code coverage statistics')
    parser.add_argument('--update-redundancy', action='store_true',
                        help='Update redundancy assessment')
    parser.add_argument('--assess', action='store_true',
                        help='Perform full saturation assessment')

    # Document recording arguments
    parser.add_argument('--doc-id', help='Document identifier')
    parser.add_argument('--doc-name', help='Document name (defaults to doc-id)')
    parser.add_argument('--new-codes', type=int, default=0,
                        help='Number of new codes created')

    # Refinement recording arguments
    parser.add_argument('--code-id', help='Code identifier')
    parser.add_argument('--change-type', help='Type of change (split, merge, redefinition, etc.)')
    parser.add_argument('--old-state', help='Previous state/definition')
    parser.add_argument('--new-state', help='New state/definition')
    parser.add_argument('--rationale', help='Reason for change')

    # Coverage update arguments
    parser.add_argument('--coverage-json', help='JSON coverage data')

    # Redundancy update arguments
    parser.add_argument('--score', type=float, help='Redundancy score (0-1)')
    parser.add_argument('--notes', help='Assessment notes')

    args = parser.parse_args()

    # Resolve project path
    project_path = args.project_path.resolve()

    # Load config
    config = load_config(project_path)
    if not config:
        print(json.dumps({
            'success': False,
            'error': 'Config not found. Run /qual-init first.'
        }), file=sys.stderr)
        sys.exit(1)

    # Handle different modes
    try:
        if args.status or not any([
            args.record_document, args.record_refinement,
            args.update_coverage, args.update_redundancy, args.assess
        ]):
            result = get_status(config)
            print(json.dumps(result, indent=2))

        elif args.record_document:
            if not args.doc_id:
                print(json.dumps({'success': False, 'error': 'Missing --doc-id'}), file=sys.stderr)
                sys.exit(1)

            result = record_document(
                config,
                args.doc_id,
                args.doc_name or args.doc_id,
                args.new_codes
            )
            save_config(project_path, config)

            # Log to journal if stabilized
            if result['stabilized'] and args.doc_id == result['stabilized_at']:
                log_to_journal(project_path, f"""**Code Generation Stabilized**

Code generation rate has dropped below threshold at document: {args.doc_id}
Current rate: {result['generation_rate']} new codes per document
Total codes: {result['total_codes']}

This is a positive saturation signal, but remember: saturation isn't just about stopping code creation.
Consider: Are you understanding the full range of variation in your codes?""")

            print(json.dumps(result, indent=2))

        elif args.record_refinement:
            if not args.code_id or not args.change_type:
                print(json.dumps({
                    'success': False,
                    'error': 'Missing --code-id or --change-type'
                }), file=sys.stderr)
                sys.exit(1)

            result = record_refinement(
                config,
                args.code_id,
                args.change_type,
                args.old_state,
                args.new_state,
                args.rationale
            )
            save_config(project_path, config)

            # Log to journal if split
            if args.change_type == 'split':
                log_to_journal(project_path, f"""**Code Split Recorded**

Code "{args.code_id}" was split.
Rationale: {args.rationale or 'Not provided'}

This indicates theoretical elaboration - your understanding is becoming more nuanced.""")

            print(json.dumps(result, indent=2))

        elif args.update_coverage:
            coverage_data = {}
            if args.coverage_json:
                try:
                    coverage_data = json.loads(args.coverage_json)
                except json.JSONDecodeError:
                    print(json.dumps({
                        'success': False,
                        'error': 'Invalid coverage JSON'
                    }), file=sys.stderr)
                    sys.exit(1)

            result = update_coverage(config, coverage_data)
            save_config(project_path, config)
            print(json.dumps(result, indent=2))

        elif args.update_redundancy:
            if args.score is None:
                print(json.dumps({'success': False, 'error': 'Missing --score'}), file=sys.stderr)
                sys.exit(1)

            result = update_redundancy(config, args.score, args.notes)
            save_config(project_path, config)

            # Log to journal if above threshold
            if result['above_threshold']:
                log_to_journal(project_path, f"""**High Redundancy Detected**

Redundancy score: {round(result['redundancy_score'] * 100)}%
Notes: {args.notes or 'None'}

High redundancy is a saturation signal, but verify:
- Have you explored negative cases?
- Do you understand what accounts for variation?
- Are there theoretical dimensions you haven't fully developed?""")

            print(json.dumps(result, indent=2))

        elif args.assess:
            result = assess_saturation(config)
            save_config(project_path, config)

            log_to_journal(project_path, f"""**Saturation Assessment**

Overall Level: {result['saturation_level'].upper()}
Score: {result['saturation_score']}/100

**Evidence:**
- Code Generation: {result['evidence']['code_generation_signal']}
- Coverage: {result['evidence']['coverage_signal']}
- Refinement: {result['evidence']['refinement_signal']}
- Redundancy: {result['evidence']['redundancy_signal']}

**Recommendation:** {result['recommendation']}""")

            print(json.dumps(result, indent=2))

    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': f'Unexpected error: {str(e)}'
        }), file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
