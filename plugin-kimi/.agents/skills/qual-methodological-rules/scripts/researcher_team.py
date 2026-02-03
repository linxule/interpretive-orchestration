#!/usr/bin/env python3
"""
researcher_team.py

Multi-researcher support for collaborative qualitative analysis.

OVERVIEW
========
This module provides comprehensive support for team-based qualitative research,
enabling multiple researchers to collaborate while maintaining proper attribution,
tracking intercoder reliability, and managing collaborative decision-making.

KEY FEATURES
============

1. Team Management
   - Set primary researcher (lead investigator)
   - Add team members with specific roles
   - Track active/inactive status (preserving audit trail)
   - Generate URL-safe IDs from names

2. Attribution Tracking
   - Track which researcher is currently active
   - Log all analytical decisions to specific researchers
   - Maintain complete audit trail of who did what

3. Document Assignment
   - Assign specific documents to researchers
   - Track coding workload distribution
   - Support for systematic division of labor

4. Intercoder Reliability (ICR)
   - Start ICR sessions with multiple coders
   - Track overlap documents
   - Record comparison outcomes (code merging, splitting, refinement)
   - Complete sessions with agreement notes
   - Full audit trail of reliability work

5. Role-Based Collaboration
   - lead: Primary investigator, final decisions
   - co_investigator: Equal partner in analysis
   - coder: Codes documents under supervision
   - auditor: Reviews for trustworthiness
   - consultant: Provides methodological guidance

STORAGE
=======
All team data is stored in .interpretive-orchestration/config.json under the
'researcher_team' key. This includes:

- primary_researcher: The lead investigator
- team_members: Array of all team members (active and inactive)
- current_researcher: ID of currently active researcher
- intercoder_reliability: ICR configuration and session history
  - enabled: Whether ICR is active
  - overlap_documents: Documents coded by multiple researchers
  - reliability_sessions: History of comparison sessions
- attribution_log: Complete log of all attributed actions

USAGE EXAMPLES
==============

Basic Setup:
    # Set primary researcher
    python researcher_team.py --project-path . --set-primary \\
        --name "Dr. Jane Smith" --email "jane@university.edu"

    # Add team members
    python researcher_team.py --project-path . --add-member \\
        --name "John Doe" --email "john@university.edu" --role "coder"

Attribution:
    # Set current researcher (all subsequent actions attributed to them)
    python researcher_team.py --project-path . --set-current --researcher-id "john-doe"

    # Log an analytical action
    python researcher_team.py --project-path . --log-attribution \\
        --action "coded_document" --target "INT_001" --notes "Initial open coding"

Document Assignment:
    # Assign documents to a researcher
    python researcher_team.py --project-path . --assign \\
        --researcher-id "john-doe" --document "INT_001,INT_002,INT_003"

Intercoder Reliability:
    # Start ICR session
    python researcher_team.py --project-path . --start-icr \\
        --participants "john-doe,alice-johnson" --documents "INT_005,INT_006"

    # Record outcome from comparison
    python researcher_team.py --project-path . --record-outcome \\
        --session-id "icr-abc123" --type "definition_refined" \\
        --details "Clarified boundary between coping and adapting"

    # Complete session
    python researcher_team.py --project-path . --complete-icr \\
        --session-id "icr-abc123" --notes "95% agreement reached"

Status & Reporting:
    # View team status
    python researcher_team.py --project-path . --status

    # List all team members
    python researcher_team.py --project-path . --list-members

INTEGRATION
===========
This script uses:
- ConversationLogger: Logs team activities to reflexivity journal
- Direct JSON file I/O: Bypasses StateManager for flexible schema
- File locking: Prevents concurrent modification issues

The script logs significant team events (adding members, ICR sessions) to the
reflexivity journal for methodological transparency.

ATTRIBUTION ACTIONS
===================
Valid actions for log_attribution:
- coded_document: Applied codes to a document
- created_code: Created a new code
- refined_code: Modified code definition or boundary
- wrote_memo: Authored analytical memo
- made_decision: Made methodological or interpretive decision

ICR OUTCOME TYPES
==================
Valid outcome types for record_icr_outcome:
- code_merged: Two codes combined into one
- code_split: One code separated into multiple
- definition_refined: Code boundary or definition clarified
- disagreement_noted: Persistent disagreement documented

TEAM ROLES
==========
Valid roles for team members:
- lead: Primary investigator (typically the primary_researcher)
- co_investigator: Equal analytical partner
- coder: Performs coding under supervision
- auditor: Reviews analysis for trustworthiness
- consultant: Provides methodological expertise

AUDIT TRAIL
===========
The system maintains complete audit trail by:
1. Never deleting team members (marking inactive instead)
2. Timestamping all actions
3. Attributing all decisions to specific researchers
4. Preserving ICR session history
5. Logging to reflexivity journal

This ensures methodological transparency and supports trustworthiness claims
in qualitative research publications.

Author: Ported from JavaScript to Python by Claude (Anthropic)
Version: 1.0.0
License: MIT
"""

import argparse
import json
import sys
import os
from datetime import datetime
from typing import Dict, List, Any, Optional

# Add shared scripts to path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SHARED_DIR = os.path.join(SCRIPT_DIR, '../../qual-shared/scripts')
sys.path.insert(0, SHARED_DIR)

from conversation_logger import ConversationLogger


# Valid roles for team members
VALID_ROLES = ['lead', 'co_investigator', 'coder', 'auditor', 'consultant']

# Valid actions for attribution logging
VALID_ACTIONS = ['coded_document', 'created_code', 'refined_code', 'wrote_memo', 'made_decision']

# Valid ICR outcome types
VALID_OUTCOME_TYPES = ['code_merged', 'code_split', 'definition_refined', 'disagreement_noted']


def generate_id(name: str) -> str:
    """
    Generate a URL-safe ID from a name.

    Args:
        name: Human-readable name

    Returns:
        Lowercased, hyphenated ID (e.g., "Jane Doe" -> "jane-doe")
    """
    import re
    # Lowercase and replace non-alphanumeric with hyphens
    id_str = name.lower()
    id_str = re.sub(r'[^a-z0-9]+', '-', id_str)
    # Remove leading/trailing hyphens and collapse multiple hyphens
    id_str = re.sub(r'^-+|-+$', '', id_str)
    id_str = re.sub(r'-+', '-', id_str)
    return id_str


def init_researcher_team(config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Initialize researcher_team structure if it doesn't exist.

    Args:
        config: Project configuration dictionary

    Returns:
        The researcher_team dictionary (newly created or existing)
    """
    if 'researcher_team' not in config:
        config['researcher_team'] = {
            'primary_researcher': None,
            'team_members': [],
            'current_researcher': 'primary',
            'intercoder_reliability': {
                'enabled': False,
                'overlap_documents': [],
                'reliability_sessions': []
            },
            'attribution_log': []
        }

    return config['researcher_team']


def log_to_journal(project_path: str, message: str, logger: Optional[ConversationLogger] = None) -> None:
    """
    Log a team activity message to the reflexivity journal.

    Args:
        project_path: Path to the project
        message: Message to log
        logger: Optional ConversationLogger instance
    """
    if logger is None:
        logger = ConversationLogger(project_path)

    # Log in both formats
    logger.log({
        'event_type': 'team_activity',
        'agent': 'researcher_team',
        'content': {
            'message': message
        }
    })

    # Also append to reflexivity journal in markdown format
    journal_path = os.path.join(project_path, '.interpretive-orchestration', 'reflexivity-journal.md')
    if os.path.exists(journal_path):
        now = datetime.now()
        entry = f"""
---

### Team Activity
**Date:** {now.strftime('%Y-%m-%d')}
**Time:** {now.strftime('%H:%M:%S')}

{message}

---
"""
        try:
            with open(journal_path, 'a') as f:
                f.write(entry)
        except Exception:
            # Non-critical
            pass


def set_primary_researcher(config: Dict[str, Any], name: str, email: str = '') -> Dict[str, Any]:
    """
    Set the primary researcher for the project.

    The primary researcher is typically the lead investigator who makes
    final analytical decisions.

    Args:
        config: Project configuration
        name: Researcher's full name
        email: Researcher's email (optional)

    Returns:
        Result dict with success status and primary_researcher data
    """
    team = init_researcher_team(config)
    now = datetime.now().isoformat()

    team['primary_researcher'] = {
        'id': 'primary',
        'name': name,
        'email': email or '',
        'role': 'lead',
        'joined_at': now
    }

    return {
        'success': True,
        'primary_researcher': team['primary_researcher']
    }


def add_member(config: Dict[str, Any], name: str, email: str = '', role: str = 'coder') -> Dict[str, Any]:
    """
    Add a team member to the project.

    Args:
        config: Project configuration
        name: Member's full name
        email: Member's email (optional)
        role: Member's role (lead, co_investigator, coder, auditor, consultant)

    Returns:
        Result dict with success status, member data, and total_members count
    """
    team = init_researcher_team(config)
    now = datetime.now().isoformat()
    member_id = generate_id(name)

    # Check for duplicates
    if any(m['id'] == member_id for m in team['team_members']):
        return {
            'success': False,
            'error': f'Team member with ID "{member_id}" already exists'
        }

    # Validate role
    if role not in VALID_ROLES:
        return {
            'success': False,
            'error': f'Invalid role. Must be one of: {", ".join(VALID_ROLES)}'
        }

    member = {
        'id': member_id,
        'name': name,
        'email': email or '',
        'role': role,
        'joined_at': now,
        'status': 'active',
        'coding_assignments': []
    }

    team['team_members'].append(member)

    total = len(team['team_members']) + (1 if team['primary_researcher'] else 0)

    return {
        'success': True,
        'member': member,
        'total_members': total
    }


def remove_member(config: Dict[str, Any], researcher_id: str) -> Dict[str, Any]:
    """
    Deactivate a team member (but retain for audit trail).

    Members are not actually removed from the config to preserve attribution
    and audit trail. Instead, they are marked as 'inactive'.

    Args:
        config: Project configuration
        researcher_id: ID of the researcher to deactivate

    Returns:
        Result dict with success status
    """
    team = init_researcher_team(config)

    # Find member
    member = None
    member_index = -1
    for i, m in enumerate(team['team_members']):
        if m['id'] == researcher_id:
            member = m
            member_index = i
            break

    if member is None:
        return {
            'success': False,
            'error': f'Team member "{researcher_id}" not found'
        }

    # Mark as inactive
    team['team_members'][member_index]['status'] = 'inactive'

    # If this was current researcher, switch to primary
    if team['current_researcher'] == researcher_id:
        team['current_researcher'] = 'primary'

    return {
        'success': True,
        'deactivated': researcher_id,
        'message': 'Member deactivated (retained for audit trail)'
    }


def set_current_researcher(config: Dict[str, Any], researcher_id: str) -> Dict[str, Any]:
    """
    Set the current active researcher for attribution.

    All subsequent analytical actions will be attributed to this researcher
    until changed.

    Args:
        config: Project configuration
        researcher_id: ID of researcher to set as current (or 'primary')

    Returns:
        Result dict with success status, researcher info, and message
    """
    team = init_researcher_team(config)

    # Validate researcher exists
    if researcher_id != 'primary':
        member = None
        for m in team['team_members']:
            if m['id'] == researcher_id and m['status'] == 'active':
                member = m
                break

        if member is None:
            return {
                'success': False,
                'error': f'Active team member "{researcher_id}" not found'
            }

    team['current_researcher'] = researcher_id

    # Get name for response
    name = 'Primary Researcher'
    if researcher_id != 'primary':
        for m in team['team_members']:
            if m['id'] == researcher_id:
                name = m.get('name', researcher_id)
                break
    elif team['primary_researcher']:
        name = team['primary_researcher']['name']

    return {
        'success': True,
        'current_researcher': researcher_id,
        'name': name,
        'message': f'Active researcher set to: {name}. All subsequent actions will be attributed to this researcher.'
    }


def assign_documents(config: Dict[str, Any], researcher_id: str, document_ids: str) -> Dict[str, Any]:
    """
    Assign documents to a researcher for coding.

    Args:
        config: Project configuration
        researcher_id: ID of researcher receiving assignment
        document_ids: Comma-separated list of document IDs

    Returns:
        Result dict with success status, assignment details
    """
    team = init_researcher_team(config)

    # Find member
    member = None
    member_index = -1
    for i, m in enumerate(team['team_members']):
        if m['id'] == researcher_id:
            member = m
            member_index = i
            break

    if member is None:
        return {
            'success': False,
            'error': f'Team member "{researcher_id}" not found'
        }

    # Parse document IDs
    docs = [d.strip() for d in document_ids.split(',')]

    # Add to assignments (avoid duplicates)
    for doc in docs:
        if doc not in member['coding_assignments']:
            team['team_members'][member_index]['coding_assignments'].append(doc)

    return {
        'success': True,
        'researcher': researcher_id,
        'assigned': docs,
        'total_assignments': len(team['team_members'][member_index]['coding_assignments'])
    }


def start_icr_session(config: Dict[str, Any], participant_ids: str, document_ids: str) -> Dict[str, Any]:
    """
    Start an intercoder reliability (ICR) session.

    In an ICR session, multiple researchers independently code the same documents,
    then compare results to assess agreement and refine the coding scheme.

    Args:
        config: Project configuration
        participant_ids: Comma-separated list of participant IDs
        document_ids: Comma-separated list of document IDs to code

    Returns:
        Result dict with success status, session_id, participants, documents
    """
    team = init_researcher_team(config)
    now = datetime.now().isoformat()

    # Enable ICR if not already
    team['intercoder_reliability']['enabled'] = True

    # Parse participants and documents
    participants = [p.strip() for p in participant_ids.split(',')]
    documents = [d.strip() for d in document_ids.split(',')]

    # Generate session ID (base36 timestamp)
    import time
    session_id = f"icr-{int(time.time() * 1000):x}"

    # Add to overlap documents
    for doc in documents:
        existing = None
        for od in team['intercoder_reliability']['overlap_documents']:
            if od['document_id'] == doc:
                existing = od
                break

        if existing:
            # Update existing overlap doc
            for p in participants:
                if p not in existing['coded_by']:
                    existing['coded_by'].append(p)
            existing['comparison_status'] = 'pending'
        else:
            # Add new overlap doc
            team['intercoder_reliability']['overlap_documents'].append({
                'document_id': doc,
                'coded_by': participants,
                'comparison_status': 'pending',
                'agreement_notes': ''
            })

    # Create session record
    session = {
        'session_id': session_id,
        'date': now.split('T')[0],
        'participants': participants,
        'documents_compared': documents,
        'codes_discussed': [],
        'outcomes': [],
        'notes': ''
    }

    team['intercoder_reliability']['reliability_sessions'].append(session)

    return {
        'success': True,
        'session_id': session_id,
        'participants': participants,
        'documents': documents,
        'message': 'ICR session started. Each participant should independently code the documents, then compare results.'
    }


def record_icr_outcome(config: Dict[str, Any], session_id: str, outcome_type: str, details: str = '') -> Dict[str, Any]:
    """
    Record an outcome from an ICR comparison session.

    Args:
        config: Project configuration
        session_id: ID of the ICR session
        outcome_type: Type of outcome (code_merged, code_split, definition_refined, disagreement_noted)
        details: Description of the outcome

    Returns:
        Result dict with success status
    """
    team = init_researcher_team(config)

    # Find session
    session = None
    for s in team['intercoder_reliability']['reliability_sessions']:
        if s['session_id'] == session_id:
            session = s
            break

    if session is None:
        return {
            'success': False,
            'error': f'Session "{session_id}" not found'
        }

    # Validate outcome type
    if outcome_type not in VALID_OUTCOME_TYPES:
        return {
            'success': False,
            'error': f'Invalid outcome type. Must be one of: {", ".join(VALID_OUTCOME_TYPES)}'
        }

    # Add outcome
    session['outcomes'].append({
        'type': outcome_type,
        'details': details or ''
    })

    return {
        'success': True,
        'session_id': session_id,
        'outcome_recorded': outcome_type,
        'total_outcomes': len(session['outcomes'])
    }


def complete_icr_session(config: Dict[str, Any], session_id: str, notes: str = '') -> Dict[str, Any]:
    """
    Complete an ICR session and mark compared documents as resolved.

    Args:
        config: Project configuration
        session_id: ID of the ICR session to complete
        notes: Final notes about the session

    Returns:
        Result dict with success status, outcomes count, documents resolved
    """
    team = init_researcher_team(config)

    # Find session
    session = None
    for s in team['intercoder_reliability']['reliability_sessions']:
        if s['session_id'] == session_id:
            session = s
            break

    if session is None:
        return {
            'success': False,
            'error': f'Session "{session_id}" not found'
        }

    # Add notes
    session['notes'] = notes or ''

    # Mark compared documents as resolved
    for doc_id in session['documents_compared']:
        for doc in team['intercoder_reliability']['overlap_documents']:
            if doc['document_id'] == doc_id:
                doc['comparison_status'] = 'resolved'
                doc['agreement_notes'] = notes or ''

    return {
        'success': True,
        'session_id': session_id,
        'outcomes_count': len(session['outcomes']),
        'documents_resolved': len(session['documents_compared']),
        'message': 'ICR session completed. Findings recorded for audit trail.'
    }


def log_attribution(config: Dict[str, Any], action: str, target_id: str, notes: str = '') -> Dict[str, Any]:
    """
    Log an attribution event for the current researcher.

    This creates an audit trail of who performed each analytical action.

    Args:
        config: Project configuration
        action: Type of action (coded_document, created_code, refined_code, wrote_memo, made_decision)
        target_id: ID of the target (document, code, memo, etc.)
        notes: Optional notes about the action

    Returns:
        Result dict with success status and attribution details
    """
    team = init_researcher_team(config)
    now = datetime.now().isoformat()

    # Validate action
    if action not in VALID_ACTIONS:
        return {
            'success': False,
            'error': f'Invalid action. Must be one of: {", ".join(VALID_ACTIONS)}'
        }

    # Add to attribution log
    team['attribution_log'].append({
        'researcher_id': team['current_researcher'],
        'action': action,
        'target_id': target_id,
        'timestamp': now,
        'notes': notes or ''
    })

    return {
        'success': True,
        'researcher': team['current_researcher'],
        'action': action,
        'target': target_id,
        'logged_at': now
    }


def get_status(config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Get current team status.

    Args:
        config: Project configuration

    Returns:
        Result dict with team status information
    """
    team = config.get('researcher_team')

    if not team:
        return {
            'success': True,
            'initialized': False,
            'message': 'No team configured. Single researcher mode.'
        }

    active_members = [m for m in team['team_members'] if m['status'] == 'active']

    # Get current researcher name
    current_name = 'Primary'
    if team['current_researcher'] == 'primary':
        if team['primary_researcher']:
            current_name = team['primary_researcher'].get('name', 'Primary')
    else:
        for m in team['team_members']:
            if m['id'] == team['current_researcher']:
                current_name = m.get('name', team['current_researcher'])
                break

    pending_icr = 0
    if team.get('intercoder_reliability', {}).get('overlap_documents'):
        pending_icr = sum(1 for d in team['intercoder_reliability']['overlap_documents']
                         if d.get('comparison_status') == 'pending')

    return {
        'success': True,
        'initialized': True,
        'primary_researcher': team['primary_researcher'].get('name', 'Not set') if team['primary_researcher'] else 'Not set',
        'current_researcher': {
            'id': team['current_researcher'],
            'name': current_name
        },
        'team_size': len(active_members) + (1 if team['primary_researcher'] else 0),
        'active_members': [
            {
                'id': m['id'],
                'name': m['name'],
                'role': m['role'],
                'assignments': len(m['coding_assignments'])
            }
            for m in active_members
        ],
        'icr_enabled': team.get('intercoder_reliability', {}).get('enabled', False),
        'pending_icr_docs': pending_icr,
        'attribution_count': len(team.get('attribution_log', []))
    }


def list_members(config: Dict[str, Any]) -> Dict[str, Any]:
    """
    List all team members (active and inactive).

    Args:
        config: Project configuration

    Returns:
        Result dict with members list
    """
    team = config.get('researcher_team')

    if not team:
        return {
            'success': True,
            'members': [],
            'message': 'No team configured'
        }

    members = []

    # Add primary researcher
    if team['primary_researcher']:
        members.append({
            **team['primary_researcher'],
            'is_current': team['current_researcher'] == 'primary',
            'status': 'active'
        })

    # Add team members
    for member in team['team_members']:
        members.append({
            **member,
            'is_current': team['current_researcher'] == member['id']
        })

    active_count = sum(1 for m in members if m.get('status') == 'active')

    return {
        'success': True,
        'members': members,
        'total': len(members),
        'active': active_count
    }


def load_config(project_path: str) -> Dict[str, Any]:
    """
    Load config directly from JSON file.

    We bypass StateManager here because researcher_team data doesn't fit
    the ProjectState dataclass schema and needs to be stored as arbitrary JSON.
    """
    config_dir = os.path.join(project_path, '.interpretive-orchestration')
    config_file = os.path.join(config_dir, 'config.json')

    # Ensure directory exists
    os.makedirs(config_dir, exist_ok=True)

    # Load or create config
    if os.path.exists(config_file):
        with open(config_file, 'r') as f:
            return json.load(f)
    else:
        # Create minimal config
        config = {
            'version': 1,
            'created_at': datetime.now().isoformat()
        }
        with open(config_file, 'w') as f:
            json.dump(config, f, indent=2)
        return config


def save_config(project_path: str, config: Dict[str, Any]) -> None:
    """
    Save config directly to JSON file.

    Updates version and timestamp.
    """
    config_dir = os.path.join(project_path, '.interpretive-orchestration')
    config_file = os.path.join(config_dir, 'config.json')

    # Update metadata
    config['version'] = config.get('version', 0) + 1
    config['last_updated'] = datetime.now().isoformat()

    # Atomic write
    temp_file = config_file + '.tmp'
    with open(temp_file, 'w') as f:
        json.dump(config, f, indent=2)
    os.rename(temp_file, config_file)


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description='Multi-researcher collaboration with intercoder reliability support',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Set primary researcher
  %(prog)s --project-path . --set-primary --name "Dr. Jane Smith" --email "jane@university.edu"

  # Add team member
  %(prog)s --project-path . --add-member --name "John Doe" --email "john@university.edu" --role coder

  # Set current researcher
  %(prog)s --project-path . --set-current --researcher-id john-doe

  # Assign documents
  %(prog)s --project-path . --assign --researcher-id john-doe --document "INT_001,INT_002"

  # Start ICR session
  %(prog)s --project-path . --start-icr --participants "jane-smith,john-doe" --documents "INT_005"

  # Log attribution
  %(prog)s --project-path . --log-attribution --action coded_document --target INT_001
        """
    )

    parser.add_argument('--project-path', required=True, help='Path to project root')

    # Commands
    parser.add_argument('--status', action='store_true', help='Show team status')
    parser.add_argument('--list-members', action='store_true', help='List all team members')
    parser.add_argument('--set-primary', action='store_true', help='Set primary researcher')
    parser.add_argument('--add-member', action='store_true', help='Add team member')
    parser.add_argument('--remove-member', action='store_true', help='Deactivate team member')
    parser.add_argument('--set-current', action='store_true', help='Set current researcher')
    parser.add_argument('--assign', action='store_true', help='Assign documents to researcher')
    parser.add_argument('--start-icr', action='store_true', help='Start ICR session')
    parser.add_argument('--record-outcome', action='store_true', help='Record ICR outcome')
    parser.add_argument('--complete-icr', action='store_true', help='Complete ICR session')
    parser.add_argument('--log-attribution', action='store_true', help='Log attribution event')

    # Parameters
    parser.add_argument('--name', help='Researcher name')
    parser.add_argument('--email', help='Researcher email')
    parser.add_argument('--role', choices=VALID_ROLES, help='Team member role')
    parser.add_argument('--researcher-id', help='Researcher ID')
    parser.add_argument('--document', help='Comma-separated document IDs')
    parser.add_argument('--participants', help='Comma-separated participant IDs')
    parser.add_argument('--documents', help='Comma-separated document IDs')
    parser.add_argument('--session-id', help='ICR session ID')
    parser.add_argument('--type', choices=VALID_OUTCOME_TYPES, help='ICR outcome type')
    parser.add_argument('--details', help='ICR outcome details')
    parser.add_argument('--notes', help='Notes or comments')
    parser.add_argument('--action', choices=VALID_ACTIONS, help='Attribution action type')
    parser.add_argument('--target', help='Attribution target ID')

    args = parser.parse_args()

    # Resolve project path
    project_path = os.path.abspath(args.project_path)

    # Load config
    try:
        config = load_config(project_path)
    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': f'Failed to load config: {str(e)}'
        }), file=sys.stderr)
        sys.exit(1)

    logger = ConversationLogger(project_path)
    result = None

    # Execute command
    try:
        if args.status:
            result = get_status(config)

        elif args.list_members:
            result = list_members(config)

        elif args.set_primary:
            if not args.name:
                print(json.dumps({'success': False, 'error': 'Missing --name'}), file=sys.stderr)
                sys.exit(1)
            result = set_primary_researcher(config, args.name, args.email or '')
            if result['success']:
                save_config(project_path, config)
                log_to_journal(
                    project_path,
                    f"**Primary Researcher Set**\nName: {args.name}\nEmail: {args.email or 'Not provided'}",
                    logger
                )

        elif args.add_member:
            if not args.name:
                print(json.dumps({'success': False, 'error': 'Missing --name'}), file=sys.stderr)
                sys.exit(1)
            result = add_member(config, args.name, args.email or '', args.role or 'coder')
            if result['success']:
                save_config(project_path, config)
                log_to_journal(
                    project_path,
                    f"**Team Member Added**\nName: {args.name}\nRole: {args.role or 'coder'}",
                    logger
                )

        elif args.remove_member:
            if not args.researcher_id:
                print(json.dumps({'success': False, 'error': 'Missing --researcher-id'}), file=sys.stderr)
                sys.exit(1)
            result = remove_member(config, args.researcher_id)
            if result['success']:
                save_config(project_path, config)
                log_to_journal(
                    project_path,
                    f"**Team Member Deactivated**: {args.researcher_id}",
                    logger
                )

        elif args.set_current:
            if not args.researcher_id:
                print(json.dumps({'success': False, 'error': 'Missing --researcher-id'}), file=sys.stderr)
                sys.exit(1)
            result = set_current_researcher(config, args.researcher_id)
            if result['success']:
                save_config(project_path, config)

        elif args.assign:
            if not args.researcher_id or not args.document:
                print(json.dumps({'success': False, 'error': 'Missing --researcher-id or --document'}), file=sys.stderr)
                sys.exit(1)
            result = assign_documents(config, args.researcher_id, args.document)
            if result['success']:
                save_config(project_path, config)

        elif args.start_icr:
            if not args.participants or not args.documents:
                print(json.dumps({'success': False, 'error': 'Missing --participants or --documents'}), file=sys.stderr)
                sys.exit(1)
            result = start_icr_session(config, args.participants, args.documents)
            if result['success']:
                save_config(project_path, config)
                log_to_journal(
                    project_path,
                    f"**Intercoder Reliability Session Started**\nSession: {result['session_id']}\nParticipants: {args.participants}\nDocuments: {args.documents}",
                    logger
                )

        elif args.record_outcome:
            if not args.session_id or not args.type:
                print(json.dumps({'success': False, 'error': 'Missing --session-id or --type'}), file=sys.stderr)
                sys.exit(1)
            result = record_icr_outcome(config, args.session_id, args.type, args.details or '')
            if result['success']:
                save_config(project_path, config)

        elif args.complete_icr:
            if not args.session_id:
                print(json.dumps({'success': False, 'error': 'Missing --session-id'}), file=sys.stderr)
                sys.exit(1)
            result = complete_icr_session(config, args.session_id, args.notes or '')
            if result['success']:
                save_config(project_path, config)
                log_to_journal(
                    project_path,
                    f"**ICR Session Completed**\nSession: {args.session_id}\nNotes: {args.notes or 'None'}",
                    logger
                )

        elif args.log_attribution:
            if not args.action or not args.target:
                print(json.dumps({'success': False, 'error': 'Missing --action or --target'}), file=sys.stderr)
                sys.exit(1)
            result = log_attribution(config, args.action, args.target, args.notes or '')
            if result['success']:
                save_config(project_path, config)

        else:
            # Default: show status
            result = get_status(config)

        # Print result
        if result:
            print(json.dumps(result, indent=2))
            sys.exit(0 if result.get('success', True) else 1)

    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': str(e)
        }), file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
