#!/usr/bin/env python3
"""
End-to-End Test: Full researcher workflow simulation.

Tests the complete journey:
1. Project initialization
2. Stage 1 manual coding
3. Stage transition
4. Stage 2 AI-assisted coding
5. Friction triggers
6. Reflexivity prompts
"""

import sys
import os
import tempfile
import shutil
import asyncio

# Add skills to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '.agents', 'skills', 'qual-shared', 'scripts'))

from state_manager import StateManager
from reasoning_buffer import ReasoningBuffer
from defensive_router import DefensiveSkillRouter
from conversation_logger import ConversationLogger
from create_structure import create_project_structure
from mcp_wrapper import MCPWrapper
from friction_system import FrictionSystem, FrictionTrigger
from reflexivity_system import ReflexivitySystem, ReflexivityCategory, get_session_end_prompt


class TestEndToEnd:
    """Simulate a complete researcher workflow."""
    
    def setup_method(self):
        """Create fresh project for each test."""
        self.project_path = tempfile.mkdtemp()
        print(f"\n📁 Test project: {self.project_path}")
    
    def teardown_method(self):
        """Clean up."""
        shutil.rmtree(self.project_path)
        print(f"🗑️  Cleaned up: {self.project_path}")
    
    def test_complete_workflow(self):
        """
        Simulate complete researcher journey:
        - Initialize project
        - Try to access Stage 2 (should be blocked)
        - Complete Stage 1 (10 docs)
        - Transition to Stage 2
        - Code with AI assistance
        - Check friction system
        """
        print("\n" + "=" * 70)
        print("🎭 END-TO-END WORKFLOW TEST")
        print("=" * 70)
        
        # === STEP 1: Initialize Project ===
        print("\n📍 STEP 1: Project Initialization")
        print("-" * 70)
        
        paths = create_project_structure(
            self.project_path,
            project_name="Workplace Identity Study",
            research_question="How do remote workers construct professional identity?"
        )
        
        # Verify structure
        assert os.path.exists(paths["config_dir"]), "Config dir not created"
        assert os.path.exists(paths["stage1"]), "Stage 1 dir not created"
        assert os.path.exists(paths["stage2"]), "Stage 2 dir not created"
        
        # Check initial state
        state_mgr = StateManager(self.project_path)
        state = state_mgr.load()
        assert state.current_stage == "stage1", f"Expected stage1, got {state.current_stage}"
        assert state.documents_manually_coded == 0
        
        print("✅ Project initialized")
        print(f"   Stage: {state.current_stage}")
        print(f"   Config: {paths['config_dir']}")
        
        # === STEP 2: Try to Access Stage 2 (Should Block) ===
        print("\n📍 STEP 2: Attempt Stage 2 Access (Should Be Blocked)")
        print("-" * 70)
        
        router = DefensiveSkillRouter(self.project_path)
        result = router.route("qual-coding")
        
        assert result["action"] == "route_to_flow", "Should route to flow"
        assert "stage1" in result["current_stage"], "Should be in stage1"
        assert "🚪" in result["message"], "Should show atelier message"
        
        print("✅ Stage 2 correctly blocked")
        print(f"   Action: {result['action']}")
        print(f"   Message preview: {result['message'][:100]}...")
        
        # === STEP 3: Complete Stage 1 ===
        print("\n📍 STEP 3: Complete Stage 1 Foundation")
        print("-" * 70)
        
        # Simulate coding 10 documents manually
        for i in range(10):
            state_mgr.increment_document_count(manual=True)
            
            # Add memo every few docs
            if i % 3 == 0:
                state_mgr.add_memo()
        
        # Mark Stage 1 complete
        state = state_mgr.load()
        state.stage1_complete = True
        state_mgr.save(state)
        
        print(f"✅ Coded {state.documents_manually_coded} documents manually")
        print(f"✅ Wrote {state.memos_written} memos")
        print(f"✅ Stage 1 marked complete")
        
        # === STEP 4: Transition to Stage 2 ===
        print("\n📍 STEP 4: Transition to Stage 2")
        print("-" * 70)
        
        state_mgr.transition_stage("stage2")
        state = state_mgr.load()
        
        assert state.current_stage == "stage2", f"Expected stage2, got {state.current_stage}"
        assert state.stage1_complete == True
        
        print("✅ Transitioned to Stage 2")
        print(f"   Current stage: {state.current_stage}")
        
        # === STEP 5: Now Stage 2 Access Works ===
        print("\n📍 STEP 5: Stage 2 Access (Now Allowed)")
        print("-" * 70)
        
        result = router.route("qual-coding")
        
        assert result["action"] == "allow", f"Should allow, got {result['action']}"
        assert result["skill"] == "qual-coding"
        
        print("✅ Stage 2 access granted")
        print(f"   Skill: {result['skill']}")
        print(f"   State: {result['state']}")
        
        # === STEP 6: AI-Assisted Coding ===
        print("\n📍 STEP 6: AI-Assisted Coding with Reasoning Buffer")
        print("-" * 70)
        
        buffer = ReasoningBuffer(self.project_path, batch_size=5)
        
        # Simulate coding 3 documents with AI
        for i in range(3):
            doc_id = f"doc_{i+11}"  # Continuing from manual docs
            
            # 4-stage reasoning
            reasoning = {
                "stage1_tentative": f"Initial reading of {doc_id}",
                "stage2_challenge": "Alternative interpretations considered...",
                "stage3_output": "Final codes: identity_performance, boundary_work",
                "stage4_audit": "May have missed contextual factors..."
            }
            
            buffer.add(doc_id, reasoning, {"confidence": "high"})
        
        buffer.flush()
        
        # Update state
        state = state_mgr.load()
        state.documents_coded = 13  # 10 manual + 3 AI
        state.codes_created = 12
        state_mgr.save(state)
        
        print("✅ Coded 3 documents with AI")
        print("✅ 4-stage reasoning logged")
        
        # === STEP 7: Conversation Logging ===
        print("\n📍 STEP 7: Conversation Logging")
        print("-" * 70)
        
        logger = ConversationLogger(self.project_path)
        
        logger.log({
            "event_type": "coded_document",
            "agent": "dialogical-coder",
            "content": {
                "doc_id": "doc_013",
                "codes": ["identity_performance", "boundary_work"],
                "reasoning_summary": "Participant describes performing identity..."
            }
        })
        
        # Verify logs
        recent = logger.get_recent_events(1)
        assert len(recent) == 1
        assert recent[0]["event_type"] == "coded_document"
        
        print("✅ Events logged to JSONL and Markdown")
        
        # === STEP 8: Friction System ===
        print("\n📍 STEP 8: Methodological Friction")
        print("-" * 70)
        
        friction = FrictionSystem(self.project_path)
        
        # Test session end prompt
        result = friction.check_friction(FrictionTrigger.SESSION_END)
        assert result is not None
        assert result["level"] == "nudge"
        # Just check that we got a result (message content may vary)
        assert result["message"] is not None
        
        print("✅ Friction system active")
        print(f"   Trigger: {result['trigger']}")
        print(f"   Level: {result['level']}")
        
        # === STEP 9: Reflexivity Prompts ===
        print("\n📍 STEP 9: Reflexivity Prompts")
        print("-" * 70)
        
        reflexivity = ReflexivitySystem()
        
        prompt = reflexivity.get_prompt(
            category=ReflexivityCategory.EPISTEMIC,
            context="axial_coding"
        )
        
        assert "?" in prompt
        assert len(prompt) > 20
        
        print("✅ Reflexivity prompt generated")
        print(f"   Prompt: {prompt}")
        
        # === STEP 10: Status Check ===
        print("\n📍 STEP 10: Final Status")
        print("-" * 70)
        
        state = state_mgr.load()
        status = state_mgr.get_status()
        
        print(f"✅ Current Stage: {status['stage_name']}")
        print(f"✅ Documents: {status['documents_manually_coded']} manual, {status['documents_coded_total']} total")
        print(f"✅ Memos: {status['memos_written']}")
        print(f"✅ Progress: {status['progress_percent']:.0f}%")
        
        # === VERIFICATION ===
        print("\n" + "=" * 70)
        print("✅ ALL CHECKS PASSED")
        print("=" * 70)
        print(f"""
Workflow Summary:
  • Project initialized with proper structure
  • Stage 1 enforced (couldn't bypass)
  • Manual coding completed (10 docs, 4 memos)
  • Stage transition validated
  • Stage 2 AI coding enabled
  • 4-stage reasoning logged
  • Conversations audited
  • Friction system engaged
  • Reflexivity prompted
  
Project State:
  • Current: {state.current_stage}
  • Documents: {state.documents_manually_coded} manual, {state.documents_coded} total
  • Memos: {state.memos_written}
  • Codes: {state.codes_created}
  • Stage 1 Complete: {state.stage1_complete}
""")
        
        return True
    
    async def test_mcp_fallback(self):
        """Test MCP integration with fallback."""
        print("\n" + "=" * 70)
        print("🔌 MCP FALLBACK TEST")
        print("=" * 70)
        
        wrapper = MCPWrapper()
        
        # Test sequential thinking
        print("\n📍 Testing Sequential Thinking...")
        result = await wrapper.sequential_thinking(
            "When should I move from open to axial coding?"
        )
        
        assert result.success
        assert "thoughts" in result.data
        print(f"✅ Sequential Thinking: {len(result.data['thoughts'])} thoughts")
        print(f"   Latency: {result.latency_ms:.1f}ms")
        print(f"   Fallback: {result.fallback_used}")
        
        # Test lotus wisdom
        print("\n📍 Testing Lotus Wisdom...")
        result = await wrapper.lotus_wisdom(
            "Empowerment AND alienation in remote work"
        )
        
        assert result.success
        assert "contemplation" in result.data
        print(f"✅ Lotus Wisdom: {len(result.data['contemplation'])} domains")
        print(f"   Latency: {result.latency_ms:.1f}ms")
        print(f"   Fallback: {result.fallback_used}")
        
        # Test auto-detect
        print("\n📍 Testing Auto-Detect...")
        result = await wrapper.reflect(
            "There's tension between structure and agency"
        )
        
        assert result.success
        print("✅ Auto-detect worked")
        
        print("\n✅ ALL MCP TESTS PASSED")
        return True
    
    def run_all(self):
        """Run all tests."""
        print("\n" + "🧪" * 35)
        print("INTERPRETIVE ORCHESTRATION - END-TO-END TESTS")
        print("🧪" * 35)
        
        passed = 0
        failed = 0
        
        # Test 1: Complete workflow
        self.setup_method()
        try:
            if self.test_complete_workflow():
                passed += 1
        except Exception as e:
            print(f"\n❌ Workflow test failed: {e}")
            import traceback
            traceback.print_exc()
            failed += 1
        finally:
            self.teardown_method()
        
        # Test 2: MCP fallback (async)
        self.setup_method()
        try:
            asyncio.run(self.test_mcp_fallback())
            passed += 1
        except Exception as e:
            print(f"\n❌ MCP test failed: {e}")
            import traceback
            traceback.print_exc()
            failed += 1
        finally:
            self.teardown_method()
        
        # Summary
        print("\n" + "=" * 70)
        print(f"RESULTS: {passed} passed, {failed} failed")
        print("=" * 70)
        
        if failed == 0:
            print("\n🎉 ALL TESTS PASSED! System is ready.")
        else:
            print(f"\n⚠️  {failed} test(s) failed. Review output above.")
        
        return failed == 0


if __name__ == "__main__":
    test = TestEndToEnd()
    success = test.run_all()
    sys.exit(0 if success else 1)
