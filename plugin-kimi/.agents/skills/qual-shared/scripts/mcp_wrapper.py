#!/usr/bin/env python3
"""
MCP Wrapper: Integration with Sequential Thinking and Lotus Wisdom MCP servers.

Implements fail-open strategy with graceful fallback to native reasoning.
"""

import asyncio
import json
import time
from typing import Optional, Dict, Any, Callable
from dataclasses import dataclass
from enum import Enum


class MCPStatus(Enum):
    AVAILABLE = "available"
    UNAVAILABLE = "unavailable"
    TIMEOUT = "timeout"
    ERROR = "error"


@dataclass
class MCPResult:
    success: bool
    data: Optional[Any]
    status: MCPStatus
    error: Optional[str] = None
    fallback_used: bool = False
    latency_ms: float = 0.0


class MCPWrapper:
    """
    Wrapper for MCP tool calls with graceful degradation.
    
    Strategy: Fail-open with fallback
    - Try MCP first
    - On failure, fall back to native reasoning
    - Log all attempts
    """
    
    def __init__(self, timeout_seconds: float = 10.0):
        self.timeout = timeout_seconds
        self._availability_cache: Dict[str, MCPStatus] = {}
        self._last_check: Dict[str, float] = {}
    
    async def is_available(self, tool_name: str) -> bool:
        """Check if MCP tool is available (with caching)."""
        now = time.time()
        
        # Cache availability check for 60 seconds
        if tool_name in self._last_check:
            if now - self._last_check[tool_name] < 60:
                return self._availability_cache.get(tool_name) == MCPStatus.AVAILABLE
        
        # Try to connect
        try:
            # In real implementation, this would test MCP connection
            # For now, simulate based on configuration
            available = await self._test_connection(tool_name)
            self._availability_cache[tool_name] = (
                MCPStatus.AVAILABLE if available else MCPStatus.UNAVAILABLE
            )
            self._last_check[tool_name] = now
            return available
        except Exception:
            self._availability_cache[tool_name] = MCPStatus.UNAVAILABLE
            self._last_check[tool_name] = now
            return False
    
    async def _test_connection(self, tool_name: str) -> bool:
        """Test MCP connection."""
        # In real implementation: attempt actual MCP call
        # For prototype: check if configured
        try:
            # Simulate check
            await asyncio.sleep(0.01)
            return True  # Assume available for demo
        except Exception:
            return False
    
    async def sequential_thinking(
        self, 
        problem: str,
        context: Optional[Dict] = None
    ) -> MCPResult:
        """
        Call Sequential Thinking MCP with fallback.
        
        Args:
            problem: The problem to think through
            context: Additional context
        """
        start_time = time.time()
        
        # Try MCP
        if await self.is_available("sequential-thinking"):
            try:
                result = await self._call_sequential_thinking_mcp(problem, context)
                latency = (time.time() - start_time) * 1000
                
                return MCPResult(
                    success=True,
                    data=result,
                    status=MCPStatus.AVAILABLE,
                    latency_ms=latency,
                    fallback_used=False
                )
            except Exception as e:
                # Fall through to fallback
                pass
        
        # Fallback to native
        result = await self._sequential_thinking_fallback(problem, context)
        latency = (time.time() - start_time) * 1000
        
        return MCPResult(
            success=True,
            data=result,
            status=MCPStatus.UNAVAILABLE,
            latency_ms=latency,
            fallback_used=True
        )
    
    async def _call_sequential_thinking_mcp(
        self, 
        problem: str, 
        context: Optional[Dict]
    ) -> Dict:
        """Actual MCP call (placeholder for real implementation)."""
        # In real implementation: call MCP server
        # For prototype: simulate structured response
        await asyncio.sleep(0.1)  # Simulate latency
        
        return {
            "thoughts": [
                {
                    "thought_number": 1,
                    "thought": f"Understanding the problem: {problem}",
                    "stage": "comprehension"
                },
                {
                    "thought_number": 2,
                    "thought": "Analyzing key dimensions and constraints...",
                    "stage": "analysis"
                },
                {
                    "thought_number": 3,
                    "thought": "Exploring alternative approaches...",
                    "stage": "exploration"
                },
                {
                    "thought_number": 4,
                    "thought": "Synthesizing into recommendation...",
                    "stage": "synthesis"
                }
            ],
            "conclusion": f"Based on systematic analysis: {problem[:50]}...",
            "confidence": 0.85
        }
    
    async def _sequential_thinking_fallback(
        self, 
        problem: str, 
        context: Optional[Dict]
    ) -> Dict:
        """Native fallback when MCP unavailable."""
        # Simulate structured reasoning without MCP
        # In real implementation: use Kimi's native chain-of-thought
        
        return {
            "thoughts": [
                {
                    "thought_number": 1,
                    "thought": f"[Native] Initial assessment: {problem}",
                    "stage": "comprehension"
                },
                {
                    "thought_number": 2,
                    "thought": "[Native] Key factors to consider...",
                    "stage": "analysis"
                },
                {
                    "thought_number": 3,
                    "thought": "[Native] Reasoning through options...",
                    "stage": "exploration"
                }
            ],
            "conclusion": f"[Native reasoning] For: {problem[:50]}...",
            "confidence": 0.75,
            "fallback": True,
            "note": "Used native reasoning (MCP unavailable)"
        }
    
    async def lotus_wisdom(
        self, 
        paradox: str,
        context: Optional[Dict] = None
    ) -> MCPResult:
        """
        Call Lotus Wisdom MCP with fallback.
        
        Args:
            paradox: The paradox or tension to navigate
            context: Additional context
        """
        start_time = time.time()
        
        # Try MCP
        if await self.is_available("lotus-wisdom"):
            try:
                result = await self._call_lotus_wisdom_mcp(paradox, context)
                latency = (time.time() - start_time) * 1000
                
                return MCPResult(
                    success=True,
                    data=result,
                    status=MCPStatus.AVAILABLE,
                    latency_ms=latency,
                    fallback_used=False
                )
            except Exception:
                pass
        
        # Fallback to native
        result = await self._lotus_wisdom_fallback(paradox, context)
        latency = (time.time() - start_time) * 1000
        
        return MCPResult(
            success=True,
            data=result,
            status=MCPStatus.UNAVAILABLE,
            latency_ms=latency,
            fallback_used=True
        )
    
    async def _call_lotus_wisdom_mcp(
        self, 
        paradox: str, 
        context: Optional[Dict]
    ) -> Dict:
        """Actual Lotus Wisdom MCP call (placeholder)."""
        await asyncio.sleep(0.1)
        
        return {
            "contemplation": [
                {
                    "tag": "begin",
                    "domain": "Entry",
                    "insight": f"Entering contemplation of: {paradox}"
                },
                {
                    "tag": "examine",
                    "domain": "Contradiction",
                    "insight": "Holding the tension without forcing resolution..."
                },
                {
                    "tag": "integrate",
                    "domain": "Non-Dual Recognition",
                    "insight": "Beyond either/or: these are complementary aspects..."
                },
                {
                    "tag": "embody",
                    "domain": "Embodied Understanding",
                    "insight": "The lived experience encompasses both poles..."
                },
                {
                    "tag": "apply",
                    "domain": "Skillful Means",
                    "insight": "Analytical implications for coding and theory..."
                }
            ],
            "wisdom_ready": True,
            "integration": f"Consider framing '{paradox[:30]}...' as dialectical rather than oppositional"
        }
    
    async def _lotus_wisdom_fallback(
        self, 
        paradox: str, 
        context: Optional[Dict]
    ) -> Dict:
        """Native fallback for Lotus Wisdom."""
        return {
            "contemplation": [
                {
                    "tag": "begin",
                    "domain": "Entry",
                    "insight": f"[Native] Considering: {paradox}"
                },
                {
                    "tag": "examine",
                    "domain": "Contradiction",
                    "insight": "[Native] Apparent tension between elements..."
                },
                {
                    "tag": "integrate",
                    "domain": "Non-Dual Recognition",
                    "insight": "[Native] These may be complementary rather than opposed..."
                }
            ],
            "wisdom_ready": True,
            "fallback": True,
            "note": "Used native dialectical reasoning (Lotus Wisdom MCP unavailable)"
        }
    
    async def reflect(
        self, 
        prompt: str, 
        mode: str = "auto"
    ) -> MCPResult:
        """
        Auto-detect mode and reflect.
        
        Args:
            prompt: The question or problem
            mode: "think" | "wisdom" | "auto"
        """
        if mode == "auto":
            # Detect if prompt contains paradox/tension language
            paradox_indicators = [
                "both", "and", "but also", "tension", "paradox",
                "contradiction", "however", "yet", "opposite"
            ]
            
            prompt_lower = prompt.lower()
            if any(indicator in prompt_lower for indicator in paradox_indicators):
                mode = "wisdom"
            else:
                mode = "think"
        
        if mode == "wisdom":
            return await self.lotus_wisdom(prompt)
        else:
            return await self.sequential_thinking(prompt)


# Convenience functions for use in other skills

_mcp_wrapper: Optional[MCPWrapper] = None


def get_mcp_wrapper() -> MCPWrapper:
    """Get or create singleton MCP wrapper."""
    global _mcp_wrapper
    if _mcp_wrapper is None:
        _mcp_wrapper = MCPWrapper()
    return _mcp_wrapper


async def reflect(prompt: str, mode: str = "auto") -> MCPResult:
    """Convenience function for reflection."""
    wrapper = get_mcp_wrapper()
    return await wrapper.reflect(prompt, mode)


if __name__ == "__main__":
    # Demo
    async def demo():
        wrapper = MCPWrapper()
        
        print("Testing Sequential Thinking...")
        result = await wrapper.sequential_thinking(
            "When should I transition from open coding to axial coding?"
        )
        print(f"Success: {result.success}")
        print(f"Fallback used: {result.fallback_used}")
        print(f"Latency: {result.latency_ms:.1f}ms")
        print(f"Data: {json.dumps(result.data, indent=2)[:500]}...")
        
        print("\nTesting Lotus Wisdom...")
        result = await wrapper.lotus_wisdom(
            "Participants describe empowerment AND alienation in remote work"
        )
        print(f"Success: {result.success}")
        print(f"Fallback used: {result.fallback_used}")
        print(f"Latency: {result.latency_ms:.1f}ms")
        
        print("\nTesting auto-detect (should pick wisdom)...")
        result = await wrapper.reflect(
            "There's tension between individual agency and structural constraint"
        )
        print(f"Mode detected: {'wisdom' if 'contemplation' in str(result.data) else 'think'}")
    
    asyncio.run(demo())
