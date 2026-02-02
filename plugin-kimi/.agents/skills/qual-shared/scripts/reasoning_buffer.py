#!/usr/bin/env python3
"""
ReasoningBuffer: Batched file writes for 4-stage reasoning logs.

Optimizes file I/O by batching writes and flushing periodically.
Based on validation: ~50-100ms per document with batching.
"""

import os
import json
import asyncio
from datetime import datetime
from typing import Dict, Any, List, Optional


class ReasoningBuffer:
    """
    Buffers 4-stage reasoning entries and flushes to disk in batches.
    
    Key optimizations from validation phase:
    - Batched writes (flush every 5 docs by default)
    - Async flush for non-critical paths
    - JSONL format for append-only efficiency
    """
    
    DEFAULT_BATCH_SIZE = 5
    
    def __init__(self, project_path: str, batch_size: int = DEFAULT_BATCH_SIZE):
        self.project_path = project_path
        self.reasoning_dir = os.path.join(project_path, ".kimi", "reasoning")
        self.batch_size = batch_size
        self.buffer: List[Dict[str, Any]] = []
        self.total_flushed = 0
    
    def add(self, doc_id: str, reasoning: Dict[str, Any], 
            metadata: Optional[Dict[str, Any]] = None) -> None:
        """
        Add a reasoning entry to the buffer.
        
        Args:
            doc_id: Document identifier
            reasoning: Dict with keys: stage1, stage2, stage3, stage4
            metadata: Optional additional metadata
        """
        entry = {
            "doc_id": doc_id,
            "timestamp": datetime.now().isoformat(),
            "reasoning": reasoning
        }
        
        if metadata:
            entry["metadata"] = metadata
        
        self.buffer.append(entry)
        
        # Auto-flush if batch is full
        if len(self.buffer) >= self.batch_size:
            self.flush()
    
    def flush(self) -> Optional[str]:
        """
        Flush buffered entries to disk.
        
        Returns:
            Path to written file, or None if buffer was empty
        """
        if not self.buffer:
            return None
        
        # Ensure directory exists
        os.makedirs(self.reasoning_dir, exist_ok=True)
        
        # Generate batch filename with timestamp
        batch_file = os.path.join(
            self.reasoning_dir,
            f"batch_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{self.total_flushed}.jsonl"
        )
        
        # Atomic write
        temp_file = f"{batch_file}.tmp"
        with open(temp_file, 'w') as f:
            for entry in self.buffer:
                f.write(json.dumps(entry) + '\n')
        
        os.rename(temp_file, batch_file)
        
        count = len(self.buffer)
        self.total_flushed += count
        self.buffer = []
        
        return batch_file
    
    async def flush_async(self) -> Optional[str]:
        """Async version of flush for non-critical paths."""
        return await asyncio.to_thread(self.flush)
    
    def get_reasoning_for_doc(self, doc_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve reasoning for a specific document.
        
        Searches through buffered and flushed entries.
        """
        # Check buffer first
        for entry in self.buffer:
            if entry["doc_id"] == doc_id:
                return entry["reasoning"]
        
        # Search flushed files
        if os.path.exists(self.reasoning_dir):
            for filename in sorted(os.listdir(self.reasoning_dir)):
                if filename.endswith('.jsonl'):
                    filepath = os.path.join(self.reasoning_dir, filename)
                    with open(filepath) as f:
                        for line in f:
                            entry = json.loads(line)
                            if entry["doc_id"] == doc_id:
                                return entry["reasoning"]
        
        return None
    
    def get_all_reasoning(self) -> List[Dict[str, Any]]:
        """Get all reasoning entries (buffered + flushed)."""
        entries = list(self.buffer)
        
        if os.path.exists(self.reasoning_dir):
            for filename in sorted(os.listdir(self.reasoning_dir)):
                if filename.endswith('.jsonl'):
                    filepath = os.path.join(self.reasoning_dir, filename)
                    with open(filepath) as f:
                        for line in f:
                            entries.append(json.loads(line))
        
        return entries
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Ensure buffer is flushed on exit."""
        self.flush()


if __name__ == "__main__":
    # Demo
    import tempfile
    import shutil
    import time
    
    tmpdir = tempfile.mkdtemp()
    print(f"Demo project: {tmpdir}\n")
    
    try:
        buf = ReasoningBuffer(tmpdir, batch_size=3)
        
        # Add reasoning entries
        print("Adding 10 reasoning entries...")
        start = time.time()
        
        for i in range(10):
            buf.add(f"doc_{i:03d}", {
                "stage1_tentative": f"Initial observation for doc {i}",
                "stage2_challenge": f"Alternative interpretation for doc {i}",
                "stage3_output": f"Final codes for doc {i}",
                "stage4_audit": f"Limitations acknowledged for doc {i}"
            })
        
        # Final flush
        buf.flush()
        
        elapsed = time.time() - start
        print(f"Total time: {elapsed*1000:.1f}ms")
        print(f"Per document: {elapsed*100:.1f}ms\n")
        
        # Show files created
        print("Reasoning files created:")
        for f in sorted(os.listdir(buf.reasoning_dir)):
            filepath = os.path.join(buf.reasoning_dir, f)
            size = os.path.getsize(filepath)
            print(f"  {f} ({size} bytes)")
        
        # Retrieve reasoning
        print(f"\nRetrieving reasoning for doc_005:")
        reasoning = buf.get_reasoning_for_doc("doc_005")
        print(json.dumps(reasoning, indent=2))
        
    finally:
        shutil.rmtree(tmpdir)
        print(f"\nCleaned up: {tmpdir}")
