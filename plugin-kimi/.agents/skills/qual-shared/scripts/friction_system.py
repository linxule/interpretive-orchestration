#!/usr/bin/env python3
"""
Friction System: Methodological integrity through graduated intervention.

Implements four-level friction: SILENT → NUDGE → CHALLENGE → HARD_STOP
"""

import os
import json
from enum import Enum
from typing import Dict, Any, Optional, List
from datetime import datetime
from state_manager import StateManager


class FrictionLevel(Enum):
    SILENT = "silent"           # Log only, no interruption
    NUDGE = "nudge"             # Gentle reminder
    CHALLENGE = "challenge"     # Requires acknowledgment
    HARD_STOP = "hard_stop"     # Blocks action


class FrictionTrigger(Enum):
    PRE_STAGE2 = "pre_stage2"                    # Before Stage 2 access
    POST_FIVE_DOCUMENTS = "post_five_documents"  # Every 5 docs coded
    EPISTEMIC_COHERENCE = "epistemic_coherence"  # After coding session
    SESSION_END = "session_end"                  # Session closing
    RAPID_CODING = "rapid_coding"                # Detected fast coding


class FrictionSystem:
    """
    Enforces methodological rigor through graduated friction.
    
    Philosophy: "If it feels heavy, that's intentional."
    Prevents calculator mindset while teaching methodology.
    """
    
    # Friction configurations by trigger
    FRICTION_CONFIG = {
        FrictionTrigger.PRE_STAGE2: {
            "level": FrictionLevel.HARD_STOP,
            "message": """🚪 Stage 2 tools require grounded foundation.

You've coded {documents_manually_coded} documents manually.
Stage 2 requires at least 10 for theoretical sensitivity.

Without this foundation, you risk the "calculator mindset" — 
accepting AI-generated codes without understanding why.

[Continue Stage 1 work →]""",
            "bypassable": False
        },
        
        FrictionTrigger.POST_FIVE_DOCUMENTS: {
            "level": FrictionLevel.CHALLENGE,
            "message": """💭 Interpretive Pause

You've coded 5 documents. Before continuing:

What pattern surprised you?
What are you now seeing differently?
What deserves an analytical memo?

[I've reflected →] [Take me to memos →]""",
            "bypassable": True,
            "cooldown_minutes": 30
        },
        
        FrictionTrigger.EPISTEMIC_COHERENCE: {
            "level": FrictionLevel.SILENT,
            "message": None,  # Handled by coherence checker
            "bypassable": True
        },
        
        FrictionTrigger.SESSION_END: {
            "level": FrictionLevel.NUDGE,
            "message": """📝 Before ending this session:

What interpretive decision are you least certain about?
What would change your mind?

(Response optional but encouraged)""",
            "bypassable": True
        },
        
        FrictionTrigger.RAPID_CODING: {
            "level": FrictionLevel.CHALLENGE,
            "message": """⚠️ Rapid Coding Detected

You've coded {count} documents in {minutes} minutes.
This suggests surface-level engagement.

Qualitative analysis requires deep reading.
Consider:
- Slowing down for close reading
- Writing memos on what surprises you
- Questioning your initial interpretations

[I'll slow down →] [I have good reason →]""",
            "bypassable": True
        }
    }
    
    def __init__(self, project_path: str):
        self.project_path = project_path
        self.state_manager = StateManager(project_path)
        self.friction_log_file = os.path.join(
            project_path, ".interpretive-orchestration",
            "friction-log.jsonl"
        )
        
        # Track recent triggers for cooldown
        self._recent_triggers: Dict[str, datetime] = {}
    
    def check_friction(
        self, 
        trigger: FrictionTrigger,
        context: Optional[Dict] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Check if friction should be applied.
        
        Returns:
            Friction result dict if triggered, None otherwise
        """
        config = self.FRICTION_CONFIG.get(trigger)
        if not config:
            return None
        
        # Check cooldown
        if self._is_in_cooldown(trigger, config):
            return None
        
        # Check if trigger condition is met
        if not self._check_trigger_condition(trigger, context):
            return None
        
        # Build friction result
        result = self._build_friction_result(trigger, config, context)
        
        # Log the friction event
        self._log_friction(trigger, config["level"], result)
        
        # Update cooldown tracker
        self._recent_triggers[trigger.value] = datetime.now()
        
        return result
    
    def _is_in_cooldown(self, trigger: FrictionTrigger, config: Dict) -> bool:
        """Check if trigger is in cooldown period."""
        cooldown_minutes = config.get("cooldown_minutes", 0)
        if cooldown_minutes == 0:
            return False
        
        last_trigger = self._recent_triggers.get(trigger.value)
        if last_trigger is None:
            return False
        
        elapsed = (datetime.now() - last_trigger).total_seconds() / 60
        return elapsed < cooldown_minutes
    
    def _check_trigger_condition(
        self, 
        trigger: FrictionTrigger, 
        context: Optional[Dict]
    ) -> bool:
        """Check if the specific trigger condition is met."""
        state = self.state_manager.load()
        
        if trigger == FrictionTrigger.PRE_STAGE2:
            # Trigger when trying to access Stage 2 without completion
            return (
                context.get("requested_stage") == "stage2" and
                not state.stage1_complete and
                state.documents_manually_coded < 10
            )
        
        elif trigger == FrictionTrigger.POST_FIVE_DOCUMENTS:
            # Trigger every 5 documents
            docs_coded = context.get("documents_coded", 0) if context else 0
            return docs_coded > 0 and docs_coded % 5 == 0
        
        elif trigger == FrictionTrigger.SESSION_END:
            # Always trigger at session end
            return True
        
        elif trigger == FrictionTrigger.RAPID_CODING:
            # Trigger if coding too fast
            if context:
                count = context.get("count", 0)
                minutes = context.get("minutes", 1)
                # More than 3 docs per 10 minutes is "rapid"
                return count >= 3 and minutes <= 10
            return False
        
        elif trigger == FrictionTrigger.EPISTEMIC_COHERENCE:
            # Always check (but may be SILENT)
            return True
        
        return False
    
    def _build_friction_result(
        self,
        trigger: FrictionTrigger,
        config: Dict,
        context: Optional[Dict]
    ) -> Dict[str, Any]:
        """Build the friction result dict."""
        state = self.state_manager.load()
        
        # Format message with context
        message_template = config.get("message", "")
        format_context = {"documents_manually_coded": state.documents_manually_coded}
        format_context.update(context or {})
        message = message_template.format(**format_context)
        
        return {
            "trigger": trigger.value,
            "level": config["level"].value,
            "message": message,
            "bypassable": config.get("bypassable", True),
            "timestamp": datetime.now().isoformat()
        }
    
    def _log_friction(
        self, 
        trigger: FrictionTrigger, 
        level: FrictionLevel,
        result: Dict
    ):
        """Log friction event to file."""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "trigger": trigger.value,
            "level": level.value,
            "result": result
        }
        
        os.makedirs(os.path.dirname(self.friction_log_file), exist_ok=True)
        with open(self.friction_log_file, 'a') as f:
            f.write(json.dumps(log_entry) + '\n')
    
    def record_bypass(
        self, 
        trigger: FrictionTrigger,
        justification: Optional[str] = None
    ):
        """Record when user bypasses friction."""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "event": "friction_bypassed",
            "trigger": trigger.value,
            "justification": justification
        }
        
        with open(self.friction_log_file, 'a') as f:
            f.write(json.dumps(log_entry) + '\n')
    
    def get_friction_summary(self) -> Dict[str, Any]:
        """Get summary of recent friction events."""
        if not os.path.exists(self.friction_log_file):
            return {"total_events": 0, "by_level": {}}
        
        events = []
        with open(self.friction_log_file) as f:
            for line in f:
                events.append(json.loads(line))
        
        by_level = {}
        for event in events:
            level = event.get("level", "unknown")
            by_level[level] = by_level.get(level, 0) + 1
        
        return {
            "total_events": len(events),
            "by_level": by_level,
            "recent_events": events[-5:]  # Last 5
        }


# Pre-built friction checks for common scenarios

def check_stage2_access(project_path: str, documents_manually_coded: int) -> Optional[Dict]:
    """Check if user can access Stage 2 tools."""
    friction = FrictionSystem(project_path)
    return friction.check_friction(
        FrictionTrigger.PRE_STAGE2,
        {"requested_stage": "stage2", "documents_manually_coded": documents_manually_coded}
    )


def check_post_five_documents(project_path: str, docs_coded: int) -> Optional[Dict]:
    """Check if interpretive pause needed after 5 documents."""
    friction = FrictionSystem(project_path)
    return friction.check_friction(
        FrictionTrigger.POST_FIVE_DOCUMENTS,
        {"documents_coded": docs_coded}
    )


def check_session_end(project_path: str) -> Optional[Dict]:
    """Check if session-end reflexivity prompt needed."""
    friction = FrictionSystem(project_path)
    return friction.check_friction(FrictionTrigger.SESSION_END)


if __name__ == "__main__":
    import tempfile
    import shutil
    
    tmpdir = tempfile.mkdtemp()
    print(f"Demo project: {tmpdir}\n")
    
    try:
        friction = FrictionSystem(tmpdir)
        
        # Test 1: Stage 2 access without foundation
        print("=" * 60)
        print("TEST 1: Stage 2 access (only 5 docs coded)")
        print("=" * 60)
        
        result = friction.check_friction(
            FrictionTrigger.PRE_STAGE2,
            {"requested_stage": "stage2", "documents_manually_coded": 5}
        )
        if result:
            print(f"Level: {result['level']}")
            print(f"Message:\n{result['message']}")
        else:
            print("No friction triggered")
        
        # Test 2: Post 5 documents
        print("\n" + "=" * 60)
        print("TEST 2: After 10 documents coded")
        print("=" * 60)
        
        result = friction.check_friction(
            FrictionTrigger.POST_FIVE_DOCUMENTS,
            {"documents_coded": 10}
        )
        if result:
            print(f"Level: {result['level']}")
            print(f"Message:\n{result['message']}")
        
        # Test 3: Session end
        print("\n" + "=" * 60)
        print("TEST 3: Session end prompt")
        print("=" * 60)
        
        result = friction.check_friction(FrictionTrigger.SESSION_END)
        if result:
            print(f"Level: {result['level']}")
            print(f"Message:\n{result['message']}")
        
        # Test 4: Rapid coding
        print("\n" + "=" * 60)
        print("TEST 4: Rapid coding detected")
        print("=" * 60)
        
        result = friction.check_friction(
            FrictionTrigger.RAPID_CODING,
            {"count": 5, "minutes": 8}
        )
        if result:
            print(f"Level: {result['level']}")
            print(f"Message:\n{result['message']}")
        
        # Show summary
        print("\n" + "=" * 60)
        print("FRICTION SUMMARY")
        print("=" * 60)
        summary = friction.get_friction_summary()
        print(f"Total events: {summary['total_events']}")
        print(f"By level: {summary['by_level']}")
        
    finally:
        shutil.rmtree(tmpdir)
        print(f"\nCleaned up: {tmpdir}")
