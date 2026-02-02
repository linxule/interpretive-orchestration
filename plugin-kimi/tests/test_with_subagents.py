#!/usr/bin/env python3
"""
test_with_subagents.py
Safe subagent testing with proper sequencing (not parallel).

NOTE: Parallel Task calls can cause event loop issues in Kimi CLI.
This script uses SEQUENTIAL subagent calls with proper cleanup.
"""

import sys
import tempfile
import shutil
from pathlib import Path

# Add scripts to path
sys.path.insert(0, str(Path(__file__).parent.parent / ".agents" / "skills" / "qual-shared" / "scripts"))

def test_sequential():
    """Test components sequentially (safe)."""
    print("="*60)
    print("SEQUENTIAL COMPONENT TEST (Subagent-safe)")
    print("="*60)
    
    # Test 1: State Manager
    print("\n1. Testing StateManager...")
    from state_manager import StateManager
    tmpdir = tempfile.mkdtemp()
    try:
        mgr = StateManager(tmpdir)
        state = mgr.load()
        assert state.current_stage == "stage1"
        print("   ✅ StateManager working")
    finally:
        shutil.rmtree(tmpdir)
    
    # Test 2: Defensive Router
    print("\n2. Testing DefensiveRouter...")
    from defensive_router import DefensiveSkillRouter
    tmpdir = tempfile.mkdtemp()
    try:
        router = DefensiveSkillRouter(tmpdir)
        result = router.route("qual-coding")
        assert result["action"] == "route_to_flow"  # Blocked without Stage 1
        print("   ✅ DefensiveRouter working")
    finally:
        shutil.rmtree(tmpdir)
    
    # Test 3: Friction System
    print("\n3. Testing FrictionSystem...")
    from friction_system import FrictionSystem, FrictionTrigger
    tmpdir = tempfile.mkdtemp()
    try:
        friction = FrictionSystem(tmpdir)
        result = friction.check_friction(FrictionTrigger.SESSION_END)
        print("   ✅ FrictionSystem working")
    finally:
        shutil.rmtree(tmpdir)
    
    # Test 4: Conversation Logger
    print("\n4. Testing ConversationLogger...")
    from conversation_logger import ConversationLogger
    tmpdir = tempfile.mkdtemp()
    try:
        logger = ConversationLogger(tmpdir)
        logger.log({
            "event_type": "test",
            "agent": "test",
            "content": {"test": True}
        })
        events = logger.get_recent_events(1)
        assert len(events) == 1
        print("   ✅ ConversationLogger working")
    finally:
        shutil.rmtree(tmpdir)
    
    # Test 5: Gioia Scripts
    print("\n5. Testing Gioia scripts...")
    import subprocess
    result = subprocess.run(
        ["python3", ".agents/skills/qual-gioia/scripts/check_hierarchy.py",
         "--structure-path", ".agents/skills/qual-gioia/templates/gioia-data-structure-template.json"],
        capture_output=True,
        text=True,
        cwd=Path(__file__).parent.parent
    )
    assert result.returncode == 0
    assert "overall_health" in result.stdout
    print("   ✅ Gioia scripts working")
    
    print("\n" + "="*60)
    print("ALL SEQUENTIAL TESTS PASSED ✅")
    print("="*60)
    print("\nNo subagents needed - all tests passed in main context.")


if __name__ == "__main__":
    test_sequential()
