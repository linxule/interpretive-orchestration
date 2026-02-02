#!/usr/bin/env python3
"""
DefensiveSkillRouter: Enforces stage requirements on every skill entry.

Implements the "A + B Hybrid" approach from validation:
- A: Defensive design (each skill checks state)
- B: Atelier routing (routes to flow gatekeeper with metaphor)
"""

import os
from typing import Dict, Any, Optional
from state_manager import StateManager


class DefensiveSkillRouter:
    """
    Routes users to appropriate entry point based on project state.
    
    Every skill uses this router on entry to enforce stage requirements.
    If user is in wrong stage, they get routed to the atelier (flow skill).
    """
    
    # Define which stages each skill requires
    SKILL_REQUIREMENTS = {
        # Public skills (always allowed)
        "qual-init": None,
        "qual-status": None,
        "qual-design": None,
        
        # Stage 1 skills
        "stage1-listener": ["stage1"],
        
        # Stage 2 skills
        "qual-coding": ["stage2", "stage3"],
        "qual-analysis": ["stage2", "stage3"],
        "dialogical-coder": ["stage2"],
        "research-configurator": ["stage2"],
        
        # Stage 3 skills
        "qual-synthesis": ["stage3"],
        "scholarly-companion": ["stage3"],
    }
    
    STAGE_NAMES = {
        "stage1": "Foundation (Stage 1)",
        "stage2": "Collaboration (Stage 2)",
        "stage3": "Synthesis (Stage 3)"
    }
    
    def __init__(self, project_path: str):
        self.project_path = project_path
        self.state_manager = StateManager(project_path)
    
    def route(self, requested_skill: str, 
              user_intent: Optional[str] = None) -> Dict[str, Any]:
        """
        Check if user can access requested skill, route appropriately.
        
        Returns dict with:
        - action: "allow" | "route_to_flow" | "prompt_upgrade"
        - skill: skill name (if allowed)
        - flow: flow name (if routing)
        - message: user-facing message
        - reason: technical reason
        """
        state = self.state_manager.load()
        current_stage = state.current_stage
        
        # Get requirements for requested skill
        required_stages = self.SKILL_REQUIREMENTS.get(requested_skill)
        
        # Public skill (no requirements)
        if required_stages is None:
            return {
                "action": "allow",
                "skill": requested_skill,
                "state": current_stage,
                "message": None
            }
        
        # Check if current stage is allowed
        if current_stage in required_stages:
            return {
                "action": "allow",
                "skill": requested_skill,
                "state": current_stage,
                "message": None
            }
        
        # Stage mismatch - route to atelier
        return self._route_to_atelier(
            requested_skill, 
            current_stage, 
            required_stages,
            user_intent
        )
    
    def _route_to_atelier(self, requested_skill: str,
                          current_stage: str,
                          required_stages: list,
                          user_intent: Optional[str] = None) -> Dict[str, Any]:
        """Generate routing response with atelier metaphor."""
        
        current_name = self.STAGE_NAMES.get(current_stage, current_stage)
        required_names = [self.STAGE_NAMES.get(r, r) for r in required_stages]
        
        # Determine appropriate flow based on current stage
        flow_mapping = {
            "stage1": "qual-init",
            "stage2": "qual-status",
            "stage3": "qual-status"
        }
        
        message = f"""🚪 Welcome to the Interpretive Orchestration atelier.

You're currently in: {current_name}
This workspace requires: {', '.join(required_names)}

Let me guide you to the right place...

💭 Why this matters:
{self._explain_why(current_stage, required_stages[0])}

What would you like to do?
→ Continue working in {current_name}
→ Learn about the three stages
→ Check your progress
"""
        
        return {
            "action": "route_to_flow",
            "flow": flow_mapping.get(current_stage, "qual-init"),
            "reason": f"stage_mismatch: {current_stage} not in {required_stages}",
            "current_stage": current_stage,
            "required_stage": required_stages[0],
            "requested_skill": requested_skill,
            "message": message,
            "suggestions": self._get_suggestions(current_stage, required_stages[0])
        }
    
    def _explain_why(self, current: str, required: str) -> str:
        """Explain why stage requirement matters (teaching moment)."""
        explanations = {
            ("stage1", "stage2"): """
Stage 2 tools use AI to assist with coding, but this only works well 
if you've first developed your own theoretical sensitivity. Manual 
coding of 10-15 documents builds the interpretive foundation that 
lets you critically evaluate AI suggestions.

Without this foundation, you risk the "calculator mindset" — accepting 
AI-generated codes without understanding why.""",
            
            ("stage2", "stage3"): """
Stage 3 is about theoretical synthesis — articulating what your 
findings contribute. This requires having completed the collaborative 
coding work of Stage 2.

Premature synthesis leads to thin theorizing that doesn't do justice 
to the empirical grounding you've built."""
        }
        
        return explanations.get((current, required), """
Each stage of the atelier builds on the previous. Moving too quickly
can undermine the methodological rigor that makes qualitative research
meaningful.""")
    
    def _get_suggestions(self, current: str, required: str) -> list:
        """Get suggested next actions."""
        suggestions = []
        
        if current == "stage1" and required == "stage2":
            state = self.state_manager.load()
            coded = state.documents_manually_coded
            remaining = max(0, 10 - coded)
            
            suggestions.append(f"Continue manual coding ({remaining} docs remaining)")
            suggestions.append("Write analytical memos about patterns you're seeing")
            suggestions.append("Review your initial framework")
            
        elif current == "stage2" and required == "stage3":
            suggestions.append("Complete pattern characterization")
            suggestions.append("Review evidence tables")
            suggestions.append("Draft theoretical integration")
        
        return suggestions
    
    def can_access_stage2_tools(self) -> bool:
        """Quick check for Stage 2 tool access."""
        result = self.route("qual-coding")
        return result["action"] == "allow"
    
    def get_atelier_status(self) -> str:
        """Get visual atelier status (door metaphor)."""
        state = self.state_manager.load()
        
        stages = ["stage1", "stage2", "stage3"]
        current_idx = stages.index(state.current_stage)
        
        lines = []
        for i, stage in enumerate(stages):
            icon = "🔓" if i <= current_idx else "🔒"
            name = self.STAGE_NAMES[stage]
            
            if i == current_idx:
                lines.append(f"{icon} {name} ← You are here")
            else:
                lines.append(f"{icon} {name}")
        
        return "\n".join(lines)


if __name__ == "__main__":
    # Demo
    import tempfile
    import shutil
    
    tmpdir = tempfile.mkdtemp()
    print(f"Demo project: {tmpdir}\n")
    
    try:
        router = DefensiveSkillRouter(tmpdir)
        
        # Scenario 1: New user tries Stage 2
        print("=" * 60)
        print("SCENARIO 1: New user tries /skill:qual-coding")
        print("=" * 60)
        
        result = router.route("qual-coding")
        print(f"Action: {result['action']}")
        print(f"Reason: {result['reason']}")
        print(f"\nUser sees:\n{result['message']}")
        
        # Scenario 2: Show atelier status
        print("\n" + "=" * 60)
        print("ATELIER STATUS")
        print("=" * 60)
        print(router.get_atelier_status())
        
        # Scenario 3: Complete Stage 1 and try again
        print("\n" + "=" * 60)
        print("SCENARIO 3: After completing Stage 1")
        print("=" * 60)
        
        state = router.state_manager.load()
        state.documents_manually_coded = 12
        state.stage1_complete = True
        router.state_manager.save(state)
        router.state_manager.transition_stage("stage2")
        
        result = router.route("qual-coding")
        print(f"Action: {result['action']}")
        print(f"Skill: {result.get('skill')}")
        
        # Updated atelier status
        print(f"\n{router.get_atelier_status()}")
        
    finally:
        shutil.rmtree(tmpdir)
        print(f"\nCleaned up: {tmpdir}")
