#!/usr/bin/env python3
"""
workspace_branch.py
Versioning for interpretation - support non-linear, exploratory analysis

The "messy middle" of qualitative analysis is non-linear. This script enables:
- Forking interpretive branches to explore alternatives
- Tracking the methodological framing of each branch
- Merging branches with required synthesis memos
- Audit trail of interpretive decisions

Usage:
    python workspace_branch.py --project-path /path/to/project --status
    python workspace_branch.py --project-path /path/to/project --list
    python workspace_branch.py --project-path /path/to/project --fork --name "alternative-structure" --framing "exploratory" --rationale "Testing whether..."
    python workspace_branch.py --project-path /path/to/project --switch --branch-id "alt-001"
    python workspace_branch.py --project-path /path/to/project --merge --branch-id "alt-001" --memo "Synthesis notes..."
    python workspace_branch.py --project-path /path/to/project --abandon --branch-id "alt-001" --rationale "Why abandoning..."
"""

import os
import sys
import json
import argparse
from datetime import datetime
from typing import Dict, Any, List, Optional, Literal
from pathlib import Path

# Add qual-shared to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "qual-shared" / "scripts"))

from state_manager import StateManager


BranchFraming = Literal["exploratory", "confirmatory", "negative_case", "alternative_interpretation"]
BranchStatus = Literal["active", "merged", "abandoned"]
BranchAction = Literal["fork", "switch", "merge", "abandon"]


class WorkspaceBranch:
    """Git-like branching for exploratory qualitative analysis."""

    def __init__(self, project_path: str):
        self.project_path = project_path
        self.config_dir = os.path.join(project_path, ".interpretive-orchestration")
        self.config_file = os.path.join(self.config_dir, "config.json")
        self.journal_file = os.path.join(self.config_dir, "reflexivity-journal.md")
        self.state_mgr = StateManager(project_path)

    def _load_config(self) -> Optional[Dict[str, Any]]:
        """Load configuration from disk."""
        if not os.path.exists(self.config_file):
            return None

        with open(self.config_file, 'r') as f:
            return json.load(f)

    def _save_config(self, config: Dict[str, Any]) -> None:
        """Save configuration to disk."""
        with open(self.config_file, 'w') as f:
            json.dump(config, f, indent=2)

    def _init_workspace_branches(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Initialize workspace_branches structure if it doesn't exist."""
        if "workspace_branches" not in config:
            now = datetime.now().isoformat()
            config["workspace_branches"] = {
                "current_branch": "main",
                "branches": [{
                    "id": "main",
                    "name": "Main Analysis",
                    "parent_branch": None,
                    "forked_at_version": "initial",
                    "created_at": now,
                    "methodological_framing": None,
                    "status": "active",
                    "merge_memo": None
                }],
                "branch_decisions": []
            }

        return config["workspace_branches"]

    def _generate_branch_id(self, name: str) -> str:
        """Generate unique branch ID from name and timestamp."""
        import time

        # Base36 encode timestamp
        timestamp_ms = int(time.time() * 1000)
        chars = "0123456789abcdefghijklmnopqrstuvwxyz"
        timestamp = ""
        while timestamp_ms:
            timestamp = chars[timestamp_ms % 36] + timestamp
            timestamp_ms //= 36

        sanitized = ''.join(c if c.isalnum() else '-' for c in name.lower())[:20]
        return f"{sanitized}-{timestamp}"

    def _get_current_version(self, config: Dict[str, Any]) -> str:
        """Get current version from data_structure or use timestamp."""
        if "data_structure" in config and "version_history" in config["data_structure"]:
            versions = config["data_structure"]["version_history"]
            if versions:
                return versions[-1]["version"]

        return datetime.now().date().isoformat()

    def _log_to_journal(self, message: str) -> None:
        """Log branch activity to reflexivity journal."""
        if not os.path.exists(self.journal_file):
            return

        now = datetime.now()
        entry = f"""
---

### Workspace Branch Activity
**Date:** {now.date().isoformat()}
**Time:** {now.time().strftime('%H:%M:%S')}

{message}

---
"""

        try:
            with open(self.journal_file, 'a') as f:
                f.write(entry)
        except Exception:
            # Non-critical
            pass

    def fork_branch(
        self,
        config: Dict[str, Any],
        name: str,
        framing: Optional[BranchFraming] = None,
        rationale: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Fork a new interpretive branch.

        Args:
            config: Project configuration
            name: Branch name
            framing: Methodological framing (exploratory, confirmatory, negative_case, alternative_interpretation)
            rationale: Why creating this branch

        Returns:
            Result dict with success status and branch info
        """
        branches = self._init_workspace_branches(config)
        now = datetime.now().isoformat()
        branch_id = self._generate_branch_id(name)
        current_version = self._get_current_version(config)

        # Validate framing
        valid_framings = ["exploratory", "confirmatory", "negative_case", "alternative_interpretation"]
        if framing and framing not in valid_framings:
            return {
                "success": False,
                "error": f"Invalid framing. Must be one of: {', '.join(valid_framings)}"
            }

        # Create new branch
        new_branch = {
            "id": branch_id,
            "name": name,
            "parent_branch": branches["current_branch"],
            "forked_at_version": current_version,
            "created_at": now,
            "methodological_framing": framing or "exploratory",
            "status": "active",
            "merge_memo": None
        }

        branches["branches"].append(new_branch)

        # Log decision
        branches["branch_decisions"].append({
            "action": "fork",
            "branch_id": branch_id,
            "target_branch": branches["current_branch"],
            "timestamp": now,
            "rationale": rationale or ""
        })

        # Switch to new branch
        previous_branch = branches["current_branch"]
        branches["current_branch"] = branch_id

        branches["branch_decisions"].append({
            "action": "switch",
            "branch_id": branch_id,
            "target_branch": previous_branch,
            "timestamp": now,
            "rationale": "Auto-switch after fork"
        })

        return {
            "success": True,
            "branch_id": branch_id,
            "name": name,
            "forked_from": previous_branch,
            "forked_at_version": current_version,
            "framing": framing or "exploratory",
            "message": f'Created and switched to branch "{name}". You can now explore this interpretive direction safely.'
        }

    def switch_branch(self, config: Dict[str, Any], branch_id: str) -> Dict[str, Any]:
        """
        Switch to a different branch.

        Args:
            config: Project configuration
            branch_id: Branch ID to switch to

        Returns:
            Result dict with success status
        """
        branches = self._init_workspace_branches(config)
        now = datetime.now().isoformat()

        # Find branch
        branch = next((b for b in branches["branches"] if b["id"] == branch_id), None)
        if not branch:
            return {
                "success": False,
                "error": f'Branch "{branch_id}" not found'
            }

        if branch["status"] != "active":
            return {
                "success": False,
                "error": f'Branch "{branch_id}" is {branch["status"]}, cannot switch to it'
            }

        previous_branch = branches["current_branch"]
        branches["current_branch"] = branch_id

        branches["branch_decisions"].append({
            "action": "switch",
            "branch_id": branch_id,
            "target_branch": previous_branch,
            "timestamp": now,
            "rationale": ""
        })

        return {
            "success": True,
            "switched_to": branch_id,
            "switched_from": previous_branch,
            "branch_name": branch["name"],
            "framing": branch["methodological_framing"]
        }

    def merge_branch(
        self,
        config: Dict[str, Any],
        branch_id: str,
        memo: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Merge a branch back (requires synthesis memo).

        Args:
            config: Project configuration
            branch_id: Branch ID to merge
            memo: Synthesis memo (min 50 chars)

        Returns:
            Result dict with success status
        """
        branches = self._init_workspace_branches(config)
        now = datetime.now().isoformat()

        if not memo or len(memo.strip()) < 50:
            return {
                "success": False,
                "error": "Merge requires a synthesis memo (at least 50 characters) explaining what you learned and how you're integrating this exploration."
            }

        # Find branch
        branch = next((b for b in branches["branches"] if b["id"] == branch_id), None)
        if not branch:
            return {
                "success": False,
                "error": f'Branch "{branch_id}" not found'
            }

        if branch["status"] != "active":
            return {
                "success": False,
                "error": f'Branch "{branch_id}" is already {branch["status"]}'
            }

        if branch_id == "main":
            return {
                "success": False,
                "error": "Cannot merge the main branch"
            }

        # Mark as merged
        branch["status"] = "merged"
        branch["merge_memo"] = memo

        # Log decision
        branches["branch_decisions"].append({
            "action": "merge",
            "branch_id": branch_id,
            "target_branch": branch["parent_branch"] or "main",
            "timestamp": now,
            "rationale": memo
        })

        # Switch back to parent if we're on this branch
        if branches["current_branch"] == branch_id:
            branches["current_branch"] = branch["parent_branch"] or "main"

        return {
            "success": True,
            "merged_branch": branch_id,
            "merged_into": branch["parent_branch"] or "main",
            "current_branch": branches["current_branch"],
            "message": f'Branch "{branch["name"]}" merged. Your synthesis memo has been recorded for the audit trail.'
        }

    def abandon_branch(
        self,
        config: Dict[str, Any],
        branch_id: str,
        rationale: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Abandon a branch (with rationale).

        Args:
            config: Project configuration
            branch_id: Branch ID to abandon
            rationale: Why abandoning this branch

        Returns:
            Result dict with success status
        """
        branches = self._init_workspace_branches(config)
        now = datetime.now().isoformat()

        # Find branch
        branch = next((b for b in branches["branches"] if b["id"] == branch_id), None)
        if not branch:
            return {
                "success": False,
                "error": f'Branch "{branch_id}" not found'
            }

        if branch["status"] != "active":
            return {
                "success": False,
                "error": f'Branch "{branch_id}" is already {branch["status"]}'
            }

        if branch_id == "main":
            return {
                "success": False,
                "error": "Cannot abandon the main branch"
            }

        # Mark as abandoned
        branch["status"] = "abandoned"

        # Log decision
        branches["branch_decisions"].append({
            "action": "abandon",
            "branch_id": branch_id,
            "target_branch": None,
            "timestamp": now,
            "rationale": rationale or "No rationale provided"
        })

        # Switch back to parent if we're on this branch
        if branches["current_branch"] == branch_id:
            branches["current_branch"] = branch["parent_branch"] or "main"

        return {
            "success": True,
            "abandoned_branch": branch_id,
            "current_branch": branches["current_branch"],
            "message": f'Branch "{branch["name"]}" abandoned. Note: Abandoned branches are preserved in the audit trail - interpretive dead ends are data too.'
        }

    def list_branches(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        List all branches.

        Args:
            config: Project configuration

        Returns:
            Result dict with branch list
        """
        branches = self._init_workspace_branches(config)

        branch_list = []
        for b in branches["branches"]:
            created_date = b.get("created_at", "").split("T")[0] if b.get("created_at") else None
            branch_list.append({
                "id": b["id"],
                "name": b["name"],
                "status": b["status"],
                "framing": b["methodological_framing"],
                "parent": b["parent_branch"],
                "forked_at": b["forked_at_version"],
                "created": created_date,
                "is_current": b["id"] == branches["current_branch"]
            })

        return {
            "success": True,
            "current_branch": branches["current_branch"],
            "branches": branch_list,
            "active_count": sum(1 for b in branch_list if b["status"] == "active"),
            "merged_count": sum(1 for b in branch_list if b["status"] == "merged"),
            "abandoned_count": sum(1 for b in branch_list if b["status"] == "abandoned")
        }

    def get_status(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get current status.

        Args:
            config: Project configuration

        Returns:
            Result dict with status info
        """
        if "workspace_branches" not in config:
            return {
                "success": True,
                "initialized": False,
                "current_branch": "main",
                "message": "Workspace branching not yet initialized. Use --fork to create your first exploratory branch."
            }

        branches = config["workspace_branches"]
        current_branch = next(
            (b for b in branches["branches"] if b["id"] == branches["current_branch"]),
            None
        )
        recent_decisions = branches["branch_decisions"][-5:]

        return {
            "success": True,
            "initialized": True,
            "current_branch": branches["current_branch"],
            "current_branch_name": current_branch["name"] if current_branch else None,
            "current_framing": current_branch["methodological_framing"] if current_branch else None,
            "total_branches": len(branches["branches"]),
            "active_branches": sum(1 for b in branches["branches"] if b["status"] == "active"),
            "recent_activity": [
                {
                    "action": d["action"],
                    "branch": d["branch_id"],
                    "date": d.get("timestamp", "").split("T")[0] if d.get("timestamp") else None
                }
                for d in recent_decisions
            ]
        }


def main():
    parser = argparse.ArgumentParser(
        description="Git-like branching for exploratory qualitative analysis"
    )
    parser.add_argument("--project-path", required=True, help="Path to project directory")

    # Actions
    parser.add_argument("--status", action="store_true", help="Show current branch status")
    parser.add_argument("--list", action="store_true", help="List all branches")
    parser.add_argument("--fork", action="store_true", help="Fork a new branch")
    parser.add_argument("--switch", action="store_true", help="Switch to a branch")
    parser.add_argument("--merge", action="store_true", help="Merge a branch")
    parser.add_argument("--abandon", action="store_true", help="Abandon a branch")

    # Parameters
    parser.add_argument("--branch-id", help="Branch ID for switch/merge/abandon")
    parser.add_argument("--name", help="Branch name for fork")
    parser.add_argument("--framing", choices=["exploratory", "confirmatory", "negative_case", "alternative_interpretation"],
                       help="Methodological framing for fork")
    parser.add_argument("--rationale", help="Rationale for fork/abandon")
    parser.add_argument("--memo", help="Synthesis memo for merge")

    args = parser.parse_args()

    # Validate project path
    project_path = os.path.abspath(args.project_path)
    if not os.path.exists(project_path):
        print(json.dumps({
            "success": False,
            "error": f"Project path does not exist: {project_path}"
        }), file=sys.stderr)
        sys.exit(1)

    # Load config
    wb = WorkspaceBranch(project_path)
    config = wb._load_config()

    if not config:
        print(json.dumps({
            "success": False,
            "error": "Config not found. Run /qual-init first."
        }), file=sys.stderr)
        sys.exit(1)

    # Handle actions
    result = None

    if args.status:
        result = wb.get_status(config)
        print(json.dumps(result, indent=2))
        sys.exit(0)

    if args.list:
        result = wb.list_branches(config)
        print(json.dumps(result, indent=2))
        sys.exit(0)

    if args.fork:
        if not args.name:
            print(json.dumps({"success": False, "error": "Missing --name for fork"}), file=sys.stderr)
            sys.exit(1)

        result = wb.fork_branch(config, args.name, args.framing, args.rationale)
        if result["success"]:
            wb._save_config(config)

            rationale_section = f"\n**Rationale:** {args.rationale}" if args.rationale else ""
            wb._log_to_journal(f"""**New Interpretive Branch Created**

Branch: {result['name']} ({result['branch_id']})
Forked from: {result['forked_from']}
At version: {result['forked_at_version']}
Framing: {result['framing']}
{rationale_section}

This branch provides a safe space to explore an alternative interpretive direction.
When ready, merge with a synthesis memo or abandon with notes on what you learned.""")

        print(json.dumps(result, indent=2))
        sys.exit(0 if result["success"] else 1)

    if args.switch:
        if not args.branch_id:
            print(json.dumps({"success": False, "error": "Missing --branch-id for switch"}), file=sys.stderr)
            sys.exit(1)

        result = wb.switch_branch(config, args.branch_id)
        if result["success"]:
            wb._save_config(config)

        print(json.dumps(result, indent=2))
        sys.exit(0 if result["success"] else 1)

    if args.merge:
        if not args.branch_id:
            print(json.dumps({"success": False, "error": "Missing --branch-id for merge"}), file=sys.stderr)
            sys.exit(1)

        result = wb.merge_branch(config, args.branch_id, args.memo)
        if result["success"]:
            wb._save_config(config)

            wb._log_to_journal(f"""**Branch Merged**

Merged: {args.branch_id} → {result['merged_into']}

**Synthesis Memo:**
{args.memo}

This interpretive exploration has been integrated into the main analysis.""")

        print(json.dumps(result, indent=2))
        sys.exit(0 if result["success"] else 1)

    if args.abandon:
        if not args.branch_id:
            print(json.dumps({"success": False, "error": "Missing --branch-id for abandon"}), file=sys.stderr)
            sys.exit(1)

        result = wb.abandon_branch(config, args.branch_id, args.rationale)
        if result["success"]:
            wb._save_config(config)

            wb._log_to_journal(f"""**Branch Abandoned**

Abandoned: {args.branch_id}
Rationale: {args.rationale or 'Not provided'}

Note: This is preserved in the audit trail. Dead ends are valuable methodological data.""")

        print(json.dumps(result, indent=2))
        sys.exit(0 if result["success"] else 1)

    # Default: show status
    result = wb.get_status(config)
    print(json.dumps(result, indent=2))
    sys.exit(0)


if __name__ == "__main__":
    main()
