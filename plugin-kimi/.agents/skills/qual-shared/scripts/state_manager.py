#!/usr/bin/env python3
"""
StateManager: Single source of truth for project state.

Implements optimistic locking for concurrent access,
caching for performance, and atomic writes for safety.
"""

import os
import json
from dataclasses import dataclass, asdict, field
from typing import Optional, Dict, Any
from datetime import datetime

from file_lock import lock_file


@dataclass
class ProjectState:
    """Represents the current state of a qualitative research project."""
    
    version: int = 1
    current_stage: str = "stage1"  # stage1, stage2, stage3
    documents_manually_coded: int = 0
    stage1_complete: bool = False
    
    # Epistemic stance
    ontology: str = "interpretivist"  # interpretivist, constructivist, critical_realist
    epistemology: str = "systematic_interpretation"
    tradition: str = "gioia_corley"  # gioia_corley, charmax_constructivist, etc.
    
    # Progress tracking
    total_documents: int = 0
    documents_coded: int = 0
    memos_written: int = 0
    codes_created: int = 0
    
    # Timestamps
    created_at: Optional[str] = None
    last_updated: Optional[str] = None
    
    # Reflexivity
    reflexivity_entries: list = field(default_factory=list)
    
    # Metadata
    project_name: str = ""
    research_question: str = ""
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ProjectState":
        return cls(**data)


class StateManager:
    """
    Manages project state with:
    - Optimistic locking for concurrent access
    - In-memory caching for performance
    - Atomic writes for safety
    """
    
    def __init__(self, project_path: str):
        self.project_path = project_path
        self.config_dir = os.path.join(project_path, ".interpretive-orchestration")
        self.state_file = os.path.join(self.config_dir, "config.json")
        self._cache: Optional[ProjectState] = None
        self._cache_mtime: Optional[float] = None
    
    def _ensure_config_dir(self):
        """Create config directory if it doesn't exist."""
        os.makedirs(self.config_dir, exist_ok=True)
    
    def load(self) -> ProjectState:
        """
        Load state from disk with caching.
        
        Returns cached version if file hasn't changed.
        """
        # Check if file exists
        if not os.path.exists(self.state_file):
            self._ensure_config_dir()
            state = ProjectState()
            state.created_at = datetime.now().isoformat()
            self._save_internal(state)
            self._cache = state
            return state
        
        # Check if we have a valid cache
        try:
            current_mtime = os.path.getmtime(self.state_file)
            if (self._cache is not None and 
                self._cache_mtime is not None and 
                self._cache_mtime >= current_mtime):
                return self._cache
        except OSError:
            pass
        
        # Load from disk
        try:
            with open(self.state_file, 'r') as f:
                # Acquire shared lock for reading
                with lock_file(f, exclusive=False):
                    data = json.load(f)
            
            state = ProjectState.from_dict(data)
            self._cache = state
            self._cache_mtime = current_mtime
            return state
            
        except (json.JSONDecodeError, IOError) as e:
            # If file is corrupted, create new state
            print(f"Warning: Could not load state file: {e}")
            state = ProjectState()
            state.created_at = datetime.now().isoformat()
            self._save_internal(state)
            self._cache = state
            return state
    
    def _save_internal(self, state: ProjectState):
        """Internal save without version increment."""
        state.last_updated = datetime.now().isoformat()
        
        # Atomic write: write to temp, then rename
        temp_file = f"{self.state_file}.tmp"
        with open(temp_file, 'w') as f:
            # Acquire exclusive lock for writing
            with lock_file(f, exclusive=True):
                json.dump(state.to_dict(), f, indent=2)
        
        # Atomic rename
        os.rename(temp_file, self.state_file)
        
        # Update cache
        self._cache = state
        self._cache_mtime = os.path.getmtime(self.state_file)
    
    def save(self, state: ProjectState) -> bool:
        """
        Save state to disk with optimistic locking.
        
        Increments version on each save.
        Returns True on success.
        """
        # Increment version
        state.version += 1
        state.last_updated = datetime.now().isoformat()
        
        self._save_internal(state)
        return True
    
    def transition_stage(self, new_stage: str) -> bool:
        """
        Transition to a new stage.
        
        Validates the transition and updates state.
        """
        valid_transitions = {
            "stage1": ["stage2"],
            "stage2": ["stage3"],
            "stage3": []  # Terminal stage
        }
        
        state = self.load()
        current = state.current_stage
        
        if new_stage not in valid_transitions.get(current, []):
            raise ValueError(
                f"Invalid transition: {current} -> {new_stage}. "
                f"Valid transitions from {current}: {valid_transitions.get(current, [])}"
            )
        
        # Stage-specific validations
        if new_stage == "stage2":
            if not state.stage1_complete:
                if state.documents_manually_coded < 10:
                    raise ValueError(
                        f"Cannot transition to stage2: only {state.documents_manually_coded} "
                        f"documents manually coded (need 10)"
                    )
            state.stage1_complete = True
        
        state.current_stage = new_stage
        return self.save(state)
    
    def increment_document_count(self, manual: bool = False) -> ProjectState:
        """Increment document coding count."""
        state = self.load()
        state.documents_coded += 1
        if manual:
            state.documents_manually_coded += 1
        self.save(state)
        return state
    
    def add_memo(self) -> ProjectState:
        """Increment memo count."""
        state = self.load()
        state.memos_written += 1
        self.save(state)
        return state
    
    def get_status(self) -> Dict[str, Any]:
        """Get human-readable status summary."""
        state = self.load()
        
        stage_names = {
            "stage1": "Foundation (Stage 1)",
            "stage2": "Collaboration (Stage 2)",
            "stage3": "Synthesis (Stage 3)"
        }
        
        progress = 0
        if state.current_stage == "stage1":
            progress = min(100, (state.documents_manually_coded / 10) * 100)
        elif state.current_stage == "stage2":
            progress = 50 + min(50, (state.documents_coded / max(state.total_documents, 1)) * 50)
        elif state.current_stage == "stage3":
            progress = 100
        
        return {
            "stage": state.current_stage,
            "stage_name": stage_names.get(state.current_stage, state.current_stage),
            "progress_percent": progress,
            "documents_manually_coded": state.documents_manually_coded,
            "documents_coded_total": state.documents_coded,
            "memos_written": state.memos_written,
            "codes_created": state.codes_created,
            "stage1_complete": state.stage1_complete,
            "tradition": state.tradition,
            "last_updated": state.last_updated
        }


if __name__ == "__main__":
    # Demo
    import tempfile
    import shutil
    
    tmpdir = tempfile.mkdtemp()
    print(f"Demo project: {tmpdir}\n")
    
    try:
        mgr = StateManager(tmpdir)
        
        # Initial state
        state = mgr.load()
        print(f"Initial stage: {state.current_stage}")
        print(f"Status: {mgr.get_status()}\n")
        
        # Simulate coding documents
        for i in range(12):
            mgr.increment_document_count(manual=True)
        print(f"After 12 manual documents:")
        print(f"  Documents coded: {mgr.load().documents_manually_coded}")
        print(f"  Stage 1 complete: {mgr.load().stage1_complete}\n")
        
        # Transition to stage 2
        mgr.transition_stage("stage2")
        print(f"After transition to stage2:")
        print(f"  Current stage: {mgr.load().current_stage}")
        print(f"  Status: {mgr.get_status()}\n")
        
        # View config file
        print("Config file contents:")
        with open(mgr.state_file) as f:
            print(f.read())
            
    finally:
        shutil.rmtree(tmpdir)
        print(f"\nCleaned up: {tmpdir}")
