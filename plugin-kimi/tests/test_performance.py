#!/usr/bin/env python3
"""
test_performance.py
Performance benchmarks for Interpretive Orchestration Kimi CLI plugin.

Validates performance claims and establishes baseline metrics.
Run with: python -m pytest test_performance.py -v --tb=short
Or: python test_performance.py (for direct output)
"""

import os
import sys
import time
import json
import tempfile
import shutil
import statistics
from pathlib import Path
from typing import List, Dict, Any

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent / ".agents" / "skills" / "qual-shared" / "scripts"))

from state_manager import StateManager, ProjectState
from conversation_logger import ConversationLogger
from reasoning_buffer import ReasoningBuffer
from friction_system import FrictionSystem


class PerformanceBenchmark:
    """Base class for performance benchmarks."""
    
    def __init__(self, iterations: int = 100):
        self.iterations = iterations
        self.results: List[float] = []
        
    def run(self) -> Dict[str, Any]:
        """Run benchmark and return results."""
        raise NotImplementedError
    
    def _measure(self, func, *args, **kwargs) -> float:
        """Measure execution time of a function."""
        start = time.perf_counter()
        func(*args, **kwargs)
        end = time.perf_counter()
        return (end - start) * 1000  # Convert to milliseconds
    
    def _stats(self) -> Dict[str, float]:
        """Calculate statistics from results."""
        if not self.results:
            return {}
        
        return {
            "mean_ms": statistics.mean(self.results),
            "median_ms": statistics.median(self.results),
            "min_ms": min(self.results),
            "max_ms": max(self.results),
            "stdev_ms": statistics.stdev(self.results) if len(self.results) > 1 else 0,
            "iterations": len(self.results)
        }


class StateManagerBenchmark(PerformanceBenchmark):
    """Benchmark StateManager operations."""
    
    def run(self) -> Dict[str, Any]:
        """Benchmark state manager load/save operations."""
        tmpdir = tempfile.mkdtemp()
        
        try:
            mgr = StateManager(tmpdir)
            
            # Benchmark 1: Cold start (first load)
            cold_times = []
            for _ in range(min(10, self.iterations)):
                # Remove cache by creating new manager
                mgr = StateManager(tmpdir)
                cold_times.append(self._measure(mgr.load))
            
            # Benchmark 2: Warm start (cached load)
            warm_times = []
            state = mgr.load()  # Ensure cached
            for _ in range(self.iterations):
                warm_times.append(self._measure(mgr.load))
            
            # Benchmark 3: Save operation
            save_times = []
            for i in range(self.iterations):
                state.documents_coded = i
                save_times.append(self._measure(mgr.save, state))
            
            # Benchmark 4: Transition operation
            transition_times = []
            for i in range(min(10, self.iterations)):
                # Create fresh state for transition test
                test_mgr = StateManager(tempfile.mkdtemp())
                test_state = test_mgr.load()
                test_state.documents_manually_coded = 12
                test_mgr.save(test_state)
                
                transition_times.append(
                    self._measure(test_mgr.transition_stage, "stage2")
                )
                shutil.rmtree(test_mgr.project_path)
            
            return {
                "test": "StateManager",
                "cold_load_ms": {
                    "mean": statistics.mean(cold_times),
                    "median": statistics.median(cold_times),
                    "max": max(cold_times)
                },
                "warm_load_ms": {
                    "mean": statistics.mean(warm_times),
                    "median": statistics.median(warm_times),
                    "min": min(warm_times)
                },
                "save_ms": {
                    "mean": statistics.mean(save_times),
                    "median": statistics.median(save_times)
                },
                "transition_ms": {
                    "mean": statistics.mean(transition_times) if transition_times else 0,
                    "median": statistics.median(transition_times) if transition_times else 0
                }
            }
            
        finally:
            shutil.rmtree(tmpdir)


class ConversationLoggerBenchmark(PerformanceBenchmark):
    """Benchmark ConversationLogger operations."""
    
    def run(self) -> Dict[str, Any]:
        """Benchmark logging operations."""
        tmpdir = tempfile.mkdtemp()
        
        try:
            logger = ConversationLogger(tmpdir)
            
            # Sample events
            events = [
                {
                    "event_type": "coded_document",
                    "agent": "dialogical-coder",
                    "content": {
                        "doc_id": f"DOC_{i:03d}",
                        "codes": ["identity", "adaptation", "resistance"],
                        "reasoning_summary": "Participant describes workplace tension..."
                    }
                }
                for i in range(self.iterations)
            ]
            
            # Benchmark: Single event log
            single_times = []
            for event in events[:self.iterations]:
                single_times.append(self._measure(logger.log, event))
            
            # Benchmark: Batch log (multiple events)
            batch_times = []
            batch_sizes = [5, 10, 25]
            for batch_size in batch_sizes:
                # Create fresh logger for each batch test
                batch_tmpdir = tempfile.mkdtemp()
                batch_logger = ConversationLogger(batch_tmpdir)
                
                batch_events = events[:batch_size]
                start = time.perf_counter()
                for event in batch_events:
                    batch_logger.log(event)
                end = time.perf_counter()
                
                batch_times.append({
                    "batch_size": batch_size,
                    "total_ms": (end - start) * 1000,
                    "per_event_ms": ((end - start) * 1000) / batch_size
                })
                
                shutil.rmtree(batch_tmpdir)
            
            # Benchmark: Query operations
            query_times = []
            for _ in range(min(50, self.iterations)):
                query_times.append(self._measure(logger.get_recent_events, 10))
            
            return {
                "test": "ConversationLogger",
                "single_log_ms": {
                    "mean": statistics.mean(single_times),
                    "median": statistics.median(single_times)
                },
                "batch_log": batch_times,
                "query_recent_ms": {
                    "mean": statistics.mean(query_times),
                    "median": statistics.median(query_times)
                }
            }
            
        finally:
            shutil.rmtree(tmpdir)


class ReasoningBufferBenchmark(PerformanceBenchmark):
    """Benchmark ReasoningBuffer operations."""
    
    def run(self) -> Dict[str, Any]:
        """Benchmark reasoning buffer batched writes."""
        tmpdir = tempfile.mkdtemp()
        reasoning_dir = Path(tmpdir) / ".kimi" / "reasoning"
        
        try:
            # Benchmark different batch sizes
            results = []
            batch_sizes = [1, 5, 10, 25]
            
            for batch_size in batch_sizes:
                batch_tmpdir = tempfile.mkdtemp()
                batch_reasoning_dir = Path(batch_tmpdir) / ".kimi" / "reasoning"
                
                buffer = ReasoningBuffer(
                    str(batch_reasoning_dir),
                    batch_size=batch_size
                )
                
                # Add events (some will trigger flush)
                num_events = batch_size * 3  # Should trigger 3 flushes
                
                start = time.perf_counter()
                for i in range(num_events):
                    buffer.add(
                        doc_id=f"DOC_{i:03d}",
                        reasoning={
                            "stage1": "Initial mapping...",
                            "stage2": "Self-challenge...",
                            "stage3": "Structured output...",
                            "stage4": "Reflective audit..."
                        }
                    )
                # Final flush
                buffer.flush()
                end = time.perf_counter()
                
                total_time = (end - start) * 1000
                per_event = total_time / num_events
                
                results.append({
                    "batch_size": batch_size,
                    "num_events": num_events,
                    "total_ms": total_time,
                    "per_event_ms": per_event
                })
                
                shutil.rmtree(batch_tmpdir)
            
            return {
                "test": "ReasoningBuffer",
                "batch_performance": results
            }
            
        finally:
            shutil.rmtree(tmpdir)


class ScaleBenchmark:
    """Benchmark operations at scale (100+ documents)."""
    
    def __init__(self, doc_counts: List[int] = None):
        self.doc_counts = doc_counts or [10, 50, 100, 200, 264]
    
    def run(self) -> Dict[str, Any]:
        """Benchmark scale performance."""
        results = []
        
        for doc_count in self.doc_counts:
            print(f"  Testing with {doc_count} documents...", file=sys.stderr)
            
            tmpdir = tempfile.mkdtemp()
            
            try:
                mgr = StateManager(tmpdir)
                logger = ConversationLogger(tmpdir)
                
                # Simulate coding N documents
                start = time.perf_counter()
                
                for i in range(doc_count):
                    # Increment document
                    state = mgr.increment_document_count(manual=True)
                    
                    # Log the coding
                    logger.log({
                        "event_type": "coded_document",
                        "agent": "dialogical-coder",
                        "content": {
                            "doc_id": f"DOC_{i:03d}",
                            "codes": [f"code_{j}" for j in range(3)],
                            "reasoning_summary": f"Analysis of document {i}..."
                        }
                    })
                
                end = time.perf_counter()
                total_time = (end - start) * 1000
                
                results.append({
                    "document_count": doc_count,
                    "total_ms": total_time,
                    "per_doc_ms": total_time / doc_count,
                    "state_version": state.version
                })
                
            finally:
                shutil.rmtree(tmpdir)
        
        return {
            "test": "Scale",
            "results": results
        }


def run_all_benchmarks():
    """Run all benchmarks and print results."""
    print("=" * 70)
    print("INTERPRETIVE ORCHESTRATION - PERFORMANCE BENCHMARKS")
    print("=" * 70)
    print()
    
    benchmarks = [
        ("StateManager", StateManagerBenchmark(iterations=100)),
        ("ConversationLogger", ConversationLoggerBenchmark(iterations=100)),
        ("ReasoningBuffer", ReasoningBufferBenchmark(iterations=50)),
    ]
    
    all_results = {}
    
    for name, benchmark in benchmarks:
        print(f"\n{name}...")
        try:
            results = benchmark.run()
            all_results[name] = results
            print(json.dumps(results, indent=2))
        except Exception as e:
            print(f"  ERROR: {e}")
            import traceback
            traceback.print_exc()
    
    # Scale benchmark
    print("\nScale Benchmark...")
    try:
        scale = ScaleBenchmark()
        scale_results = scale.run()
        all_results["Scale"] = scale_results
        print(json.dumps(scale_results, indent=2))
    except Exception as e:
        print(f"  ERROR: {e}")
        import traceback
        traceback.print_exc()
    
    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    
    # Key metrics
    if "StateManager" in all_results:
        sm = all_results["StateManager"]
        print(f"\nStateManager:")
        print(f"  Cold start: {sm.get('cold_load_ms', {}).get('mean', 0):.2f} ms")
        print(f"  Warm start: {sm.get('warm_load_ms', {}).get('mean', 0):.2f} ms")
        print(f"  Save: {sm.get('save_ms', {}).get('mean', 0):.2f} ms")
    
    if "ConversationLogger" in all_results:
        cl = all_results["ConversationLogger"]
        print(f"\nConversationLogger:")
        print(f"  Single log: {cl.get('single_log_ms', {}).get('mean', 0):.2f} ms")
        for batch in cl.get('batch_log', []):
            print(f"  Batch ({batch['batch_size']}): {batch['per_event_ms']:.2f} ms/event")
    
    if "ReasoningBuffer" in all_results:
        rb = all_results["ReasoningBuffer"]
        print(f"\nReasoningBuffer:")
        for result in rb.get('batch_performance', []):
            print(f"  Batch {result['batch_size']}: {result['per_event_ms']:.2f} ms/event")
    
    if "Scale" in all_results:
        scale = all_results["Scale"]
        print(f"\nScale Performance:")
        for result in scale.get('results', []):
            print(f"  {result['document_count']} docs: {result['per_doc_ms']:.2f} ms/doc "
                  f"({result['total_ms']:.0f} ms total)")
    
    print("\n" + "=" * 70)
    
    # Save results to file
    results_file = Path(__file__).parent / "benchmark_results.json"
    with open(results_file, 'w') as f:
        json.dump(all_results, f, indent=2)
    print(f"\nResults saved to: {results_file}")
    
    return all_results


if __name__ == "__main__":
    results = run_all_benchmarks()
    sys.exit(0)
