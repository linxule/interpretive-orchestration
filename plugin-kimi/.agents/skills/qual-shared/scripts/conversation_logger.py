#!/usr/bin/env python3
"""
ConversationLogger: Hybrid JSONL + Markdown logging.

Implements dual-format logging for mutual intelligibility:
- JSONL: Machine-readable, append-only
- Markdown: Human-readable, chronological narrative
"""

import os
import json
from datetime import datetime
from typing import Dict, Any, Optional

from file_lock import lock_file


class ConversationLogger:
    """
    Logs AI-to-AI and human-AI interactions in dual format.
    
    Based on validation: Both partners need to understand the log.
    JSON for processing, Markdown for reading.
    """
    
    def __init__(self, project_path: str):
        self.project_path = project_path
        self.config_dir = os.path.join(project_path, ".interpretive-orchestration")
        self.jsonl_file = os.path.join(self.config_dir, "conversation-log.jsonl")
        self.md_file = os.path.join(self.config_dir, "conversation-log.md")
    
    def log(self, event: Dict[str, Any]) -> None:
        """
        Log an event to both JSONL and Markdown.

        Args:
            event: Dict with keys:
                - event_type: str (e.g., "coded_document", "reflexivity_prompt")
                - agent: str (which agent was active)
                - content: Dict (event-specific data)
                - metadata: Optional[Dict]
        """
        # Ensure directory exists
        os.makedirs(self.config_dir, exist_ok=True)

        # Add timestamp
        event_with_ts = {
            **event,
            "timestamp": datetime.now().isoformat()
        }

        # Write to JSONL (append-only)
        self._append_jsonl(event_with_ts)

        # Write to Markdown (human-readable)
        self._append_md(event_with_ts)

    def log_event(self, event_type: str, content: Dict[str, Any], agent: str = "system") -> None:
        """
        Convenience method for logging events (alias for log with structured params).

        Args:
            event_type: Type of event (e.g., "methodology_preset_applied")
            content: Event-specific data
            agent: Agent name (default: "system")
        """
        self.log({
            "event_type": event_type,
            "agent": agent,
            "content": content
        })
    
    def _append_jsonl(self, event: Dict[str, Any]) -> None:
        """Append event as JSON line with file locking."""
        with open(self.jsonl_file, 'a') as f:
            with lock_file(f, exclusive=True):
                f.write(json.dumps(event, default=str) + '\n')
    
    def _append_md(self, event: Dict[str, Any]) -> None:
        """Append event as Markdown narrative."""
        ts = event.get("timestamp", datetime.now().isoformat())
        event_type = event.get("event_type", "unknown")
        agent = event.get("agent", "system")
        content = event.get("content", {})
        
        # Format based on event type
        if event_type == "coded_document":
            md_entry = self._format_coding_event(ts, agent, content)
        elif event_type == "reflexivity_prompt":
            md_entry = self._format_reflexivity_event(ts, agent, content)
        elif event_type == "stage_transition":
            md_entry = self._format_stage_transition(ts, agent, content)
        elif event_type == "mcp_call":
            md_entry = self._format_mcp_event(ts, agent, content)
        else:
            md_entry = self._format_generic_event(ts, event_type, agent, content)
        
        # Append to file with locking
        with open(self.md_file, 'a') as f:
            with lock_file(f, exclusive=True):
                f.write(md_entry + '\n\n')
    
    def _format_coding_event(self, ts: str, agent: str, content: Dict) -> str:
        """Format coding event for Markdown."""
        doc_id = content.get("doc_id", "unknown")
        codes = content.get("codes", [])
        
        return f"""## [{ts}] Coding: {doc_id}

**Agent:** {agent}

**Codes applied:**
{chr(10).join(f"- {code}" for code in codes)}

**Reasoning:** {content.get('reasoning_summary', 'See extended reasoning in .kimi/reasoning/')}
"""
    
    def _format_reflexivity_event(self, ts: str, agent: str, content: Dict) -> str:
        """Format reflexivity event for Markdown."""
        prompt = content.get("prompt", "")
        response = content.get("response", "")
        
        return f"""## [{ts}] Reflexivity Check

**Agent:** {agent}

**Prompt:** {prompt}

**Researcher Response:**
> {response}
"""
    
    def _format_stage_transition(self, ts: str, agent: str, content: Dict) -> str:
        """Format stage transition for Markdown."""
        from_stage = content.get("from", "unknown")
        to_stage = content.get("to", "unknown")
        
        return f"""## [{ts}] Stage Transition

**{from_stage} → {to_stage}**

Initiated by: {agent}
"""
    
    def _format_mcp_event(self, ts: str, agent: str, content: Dict) -> str:
        """Format MCP call for Markdown."""
        tool = content.get("tool", "unknown")
        success = content.get("success", False)
        fallback_used = content.get("fallback_used", False)
        
        status = "✅ Success" if success else "❌ Failed"
        if fallback_used:
            status += " (fallback used)"
        
        return f"""## [{ts}] MCP: {tool}

**Status:** {status}
**Agent:** {agent}
"""
    
    def _format_generic_event(self, ts: str, event_type: str, 
                              agent: str, content: Dict) -> str:
        """Format generic event for Markdown."""
        return f"""## [{ts}] {event_type}

**Agent:** {agent}

```json
{json.dumps(content, indent=2)}
```
"""
    
    def get_recent_events(self, n: int = 10) -> list:
        """Get n most recent events from JSONL."""
        if not os.path.exists(self.jsonl_file):
            return []
        
        events = []
        with open(self.jsonl_file) as f:
            for line in f:
                events.append(json.loads(line))
        
        return events[-n:]
    
    def get_events_by_type(self, event_type: str) -> list:
        """Get all events of specific type."""
        if not os.path.exists(self.jsonl_file):
            return []
        
        events = []
        with open(self.jsonl_file) as f:
            for line in f:
                event = json.loads(line)
                if event.get("event_type") == event_type:
                    events.append(event)
        
        return events


if __name__ == "__main__":
    # Demo
    import tempfile
    import shutil
    
    tmpdir = tempfile.mkdtemp()
    print(f"Demo project: {tmpdir}\n")
    
    try:
        logger = ConversationLogger(tmpdir)
        
        # Log various events
        print("Logging events...")
        
        logger.log({
            "event_type": "coded_document",
            "agent": "dialogical-coder",
            "content": {
                "doc_id": "INT_001",
                "codes": ["identity_struggle", "workplace_adaptation"],
                "reasoning_summary": "Participant describes tension between..."
            }
        })
        
        logger.log({
            "event_type": "reflexivity_prompt",
            "agent": "stage1-listener",
            "content": {
                "prompt": "What assumptions are you bringing to this interpretation?",
                "response": "I realize I'm assuming that workplace identity is primarily..."
            }
        })
        
        logger.log({
            "event_type": "stage_transition",
            "agent": "system",
            "content": {
                "from": "stage1",
                "to": "stage2"
            }
        })
        
        logger.log({
            "event_type": "mcp_call",
            "agent": "dialogical-coder",
            "content": {
                "tool": "sequential-thinking",
                "success": True,
                "fallback_used": False
            }
        })
        
        # Show files
        print("\nFiles created:")
        for filename in ["conversation-log.jsonl", "conversation-log.md"]:
            filepath = os.path.join(logger.config_dir, filename)
            if os.path.exists(filepath):
                size = os.path.getsize(filepath)
                print(f"\n{filename} ({size} bytes):")
                with open(filepath) as f:
                    print(f.read())
        
        # Query recent events
        print("\n" + "=" * 60)
        print("Recent events (JSON):")
        print("=" * 60)
        for event in logger.get_recent_events(2):
            print(json.dumps(event, indent=2))
            
    finally:
        shutil.rmtree(tmpdir)
        print(f"\nCleaned up: {tmpdir}")
