#!/usr/bin/env python3
"""
Integration tests for Interpretive Orchestration plugin.

Tests end-to-end workflows:
1. Project initialization
2. Stage 1 workflow (manual coding)
3. Stage transition
4. Stage 2 workflow (AI-assisted coding)
5. MCP integration
6. Friction system
"""

import sys
import os
import tempfile
import shutil
import asyncio

# Add skills to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '.agents', 'skills', 'qual-shared', 'scripts'))

from state_manager import StateManager, ProjectState
from reasoning_buffer import ReasoningBuffer
from defensive_router import DefensiveSkillRouter
from conversation_logger import ConversationLogger
from create_structure import create_project_structure
from mcp_wrapper import MCPWrapper
from friction_system import FrictionSystem, FrictionTrigger, check_stage2_access
from reflexivity_system import ReflexivitySystem, ReflexivityCategory


class TestIntegration:
    """Integration test suite."""
    
    def setup_method(self):
        """Create temp project for each test."""
        self.project_path = tempfile.mkdtemp()
    
    def teardown_method(self):
        """Clean up temp project."""
        shutil.rmtree(self.project_path)
    
    def test_project_initialization(self):
        """Test project structure creation."""
        paths = create_project_structure(
            self.project_path,
            project_name="Test Project",
            research_question="How do people test software?"
        )
        
        # Check directories created
        assert os.path.exists(paths["config_dir"])
        assert os.path.exists(paths["stage1"])
        assert os.path.exists(paths["stage2"])
        assert os.path.exists(paths["stage3"])
        assert os.path.exists(paths["reasoning_dir"])
        
        # Check files created
        assert os.path.exists(os.path.join(paths["config_dir"], "config.json"))
        assert os.path.exists(os.path.join(paths["config_dir"], "epistemic-stance.md"))
        assert os.path.exists(os.path.join(paths["config_dir"], "reflexivity-journal.md"))
        assert os.path.exists(os.path.join(self.project_path, "README.md"))
        
        print("✅ Project initialization test passed")
    
    def test_state_management(self):
        """Test state manager CRUD operations."""
        try:
            mgr = StateManager(self.project_path)
        except Exception as e:
            print(f"StateManager init failed: {e}")
            raise
        
        # Initial state
        state = mgr.load()
        assert state.current_stage == "stage1"
        assert state.documents_manually_coded == 0
        
        # Update state
        state.documents_manually_coded = 5
        prev_version = state.version
        mgr.save(state)
        
        # Reload and verify
        state2 = mgr.load()
        assert state2.documents_manually_coded == 5
        assert state2.version == prev_version + 1  # Version incremented
        
        # Test stage transition
        state2.documents_manually_coded = 12
        state2.stage1_complete = True
        mgr.save(state2)
        mgr.transition_stage("stage2")
        
        state3 = mgr.load()
        assert state3.current_stage == "stage2"
        assert state3.stage1_complete == True
        
        print("✅ State management test passed")
    
    def test_defensive_routing(self):
        """Test stage enforcement routing."""
        router = DefensiveSkillRouter(self.project_path)
        
        # Test 1: New user tries Stage 2 skill
        result = router.route("qual-coding")
        assert result["action"] == "route_to_flow"
        assert "stage1" in result["current_stage"]
        
        # Test 2: Complete Stage 1
        state = router.state_manager.load()
        state.documents_manually_coded = 12
        state.stage1_complete = True
        router.state_manager.save(state)
        router.state_manager.transition_stage("stage2")
        
        # Test 3: Now Stage 2 skill should work
        result = router.route("qual-coding")
        assert result["action"] == "allow"
        assert result["skill"] == "qual-coding"
        
        # Test 4: Public skill always allowed
        result = router.route("qual-status")
        assert result["action"] == "allow"
        
        print("✅ Defensive routing test passed")
    
    def test_reasoning_buffer(self):
        """Test batched reasoning I/O."""
        buf = ReasoningBuffer(self.project_path, batch_size=3)
        
        # Add entries
        for i in range(5):
            buf.add(f"doc_{i}", {
                "stage1": f"Observation {i}",
                "stage2": f"Interpretation {i}"
            })
        
        # Manual flush
        buf.flush()
        
        # Check files created
        reasoning_dir = os.path.join(self.project_path, ".kimi", "reasoning")
        files = os.listdir(reasoning_dir)
        assert len(files) >= 1
        
        # Test retrieval
        reasoning = buf.get_reasoning_for_doc("doc_0")
        assert reasoning is not None
        assert "Observation 0" in reasoning["stage1"]
        
        print("✅ Reasoning buffer test passed")
    
    def test_conversation_logging(self):
        """Test dual-format logging."""
        logger = ConversationLogger(self.project_path)
        
        # Log events
        logger.log({
            "event_type": "coded_document",
            "agent": "test",
            "content": {"doc_id": "TEST_001", "codes": ["test_code"]}
        })
        
        # Check files created
        assert os.path.exists(logger.jsonl_file)
        assert os.path.exists(logger.md_file)
        
        # Test retrieval
        events = logger.get_recent_events(1)
        assert len(events) == 1
        assert events[0]["event_type"] == "coded_document"
        
        print("✅ Conversation logging test passed")
    
    def test_friction_system(self):
        """Test graduated friction."""
        friction = FrictionSystem(self.project_path)
        
        # Test 1: Stage 2 access without foundation (HARD_STOP)
        result = friction.check_friction(
            FrictionTrigger.PRE_STAGE2,
            {"requested_stage": "stage2", "documents_manually_coded": 5}
        )
        assert result is not None
        assert result["level"] == "hard_stop"
        assert result["bypassable"] == False
        
        # Test 2: Post 5 documents (CHALLENGE)
        result = friction.check_friction(
            FrictionTrigger.POST_FIVE_DOCUMENTS,
            {"documents_coded": 10}
        )
        assert result is not None
        assert result["level"] == "challenge"
        
        # Test 3: Session end (NUDGE)
        result = friction.check_friction(FrictionTrigger.SESSION_END)
        assert result is not None
        assert result["level"] == "nudge"
        
        # Test summary
        summary = friction.get_friction_summary()
        assert summary["total_events"] == 3
        
        print("✅ Friction system test passed")
    
    def test_reflexivity_system(self):
        """Test reflexivity prompts."""
        reflexivity = ReflexivitySystem()
        
        # Test category-specific prompts
        prompt = reflexivity.get_prompt(
            ReflexivityCategory.EPISTEMIC,
            "open_coding"
        )
        assert len(prompt) > 0
        assert "?" in prompt
        
        # Test session prompts
        prompt = reflexivity.get_prompts_for_session(3, "axial_coding")
        assert len(prompt) == 3
        
        # Test formatting
        formatted = reflexivity.format_prompt_for_display(
            "Test prompt",
            ReflexivityCategory.EPISTEMIC
        )
        assert "🧠" in formatted
        
        print("✅ Reflexivity system test passed")
    
    async def test_mcp_wrapper(self):
        """Test MCP integration with fallback."""
        wrapper = MCPWrapper()
        
        # Test sequential thinking
        result = await wrapper.sequential_thinking(
            "When should I transition from open to axial coding?"
        )
        assert result.success == True
        assert "thoughts" in result.data
        
        # Test lotus wisdom
        result = await wrapper.lotus_wisdom(
            "Empowerment AND alienation in remote work"
        )
        assert result.success == True
        assert "contemplation" in result.data
        
        # Test auto-detect
        result = await wrapper.reflect(
            "There's tension between structure and agency"
        )
        # Should detect paradox and use wisdom
        assert result.success == True
        
        print("✅ MCP wrapper test passed")
    
    def run_all_tests(self):
        """Run all tests."""
        print("=" * 60)
        print("INTERPRETIVE ORCHESTRATION INTEGRATION TESTS")
        print("=" * 60)
        
        tests = [
            self.test_project_initialization,
            self.test_state_management,
            self.test_defensive_routing,
            self.test_reasoning_buffer,
            self.test_conversation_logging,
            self.test_friction_system,
            self.test_reflexivity_system,
        ]
        
        passed = 0
        failed = 0
        
        for test in tests:
            self.setup_method()
            try:
                test()
                passed += 1
            except Exception as e:
                print(f"❌ {test.__name__} failed: {e}")
                failed += 1
            finally:
                self.teardown_method()
        
        # Async test
        self.setup_method()
        try:
            asyncio.run(self.test_mcp_wrapper())
            passed += 1
        except Exception as e:
            print(f"❌ test_mcp_wrapper failed: {e}")
            failed += 1
        finally:
            self.teardown_method()
        
        print("\n" + "=" * 60)
        print(f"RESULTS: {passed} passed, {failed} failed")
        print("=" * 60)
        
        return failed == 0


if __name__ == "__main__":
    test_suite = TestIntegration()
    success = test_suite.run_all_tests()
    sys.exit(0 if success else 1)
