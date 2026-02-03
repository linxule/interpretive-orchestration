#!/usr/bin/env python3
"""
Test script for saturation_tracker.py
Verifies core functionality without requiring full project structure
"""

import json
import tempfile
from pathlib import Path
import sys

# Import functions from saturation_tracker
sys.path.insert(0, str(Path(__file__).parent))
from saturation_tracker import (
    init_saturation_tracking,
    record_document,
    record_refinement,
    update_coverage,
    update_redundancy,
    assess_saturation,
    get_status
)


def test_initialization():
    """Test that saturation tracking initializes correctly"""
    print("Testing initialization...", end=" ")
    config = {}
    tracking = init_saturation_tracking(config)

    assert 'saturation_tracking' in config
    assert tracking['code_generation']['total_codes'] == 0
    assert tracking['code_generation']['generation_rate'] == 0
    assert tracking['thresholds']['code_generation_stable'] == 0.5
    print("✓")


def test_record_document():
    """Test recording coded documents"""
    print("Testing document recording...", end=" ")
    config = {}

    # Record 5 documents with declining new code counts
    for i in range(1, 6):
        result = record_document(config, f"INT_00{i}", f"Interview {i}", 8 - i)
        assert result['success']
        assert result['document'] == f"INT_00{i}"
        assert result['new_codes'] == 8 - i

    tracking = config['saturation_tracking']
    assert tracking['code_generation']['total_codes'] == 25  # 7+6+5+4+3 = 25
    assert len(tracking['code_generation']['codes_by_document']) == 5
    assert tracking['code_generation']['generation_rate'] == 5.0  # avg of last 5
    print("✓")


def test_stabilization_detection():
    """Test that code generation stabilization is detected"""
    print("Testing stabilization detection...", end=" ")
    config = {}

    # Record documents with declining codes - should stabilize at doc 7
    codes = [3, 2, 1, 0, 0, 0, 0, 0]  # avg drops below 0.5 at doc 7
    for i, new_codes in enumerate(codes, 1):
        result = record_document(config, f"INT_00{i}", f"Interview {i}", new_codes)

    tracking = config['saturation_tracking']
    # Should stabilize when recent 5-doc avg < 0.5
    assert tracking['code_generation']['stabilized_at_document'] == 'INT_007'
    print("✓")


def test_record_refinement():
    """Test recording code refinements"""
    print("Testing refinement recording...", end=" ")
    config = {}

    result1 = record_refinement(config, "coping", "split", rationale="Distinct mechanisms")
    assert result1['success']
    assert result1['change_type'] == 'split'
    assert result1['split_merge_count'] == 1

    result2 = record_refinement(config, "resilience", "merge", rationale="Overlap found")
    assert result2['success']
    assert result2['split_merge_count'] == 2
    assert result2['total_refinements'] == 2

    result3 = record_refinement(config, "adaptation", "redefinition")
    assert result3['split_merge_count'] == 2  # Only splits/merges counted

    print("✓")


def test_update_coverage():
    """Test updating code coverage"""
    print("Testing coverage updates...", end=" ")
    config = {'coding_progress': {'documents_coded': 20}}

    coverage_data = {
        'coping': {'document_count': 16, 'case_count': 10},
        'resilience': {'document_count': 18, 'case_count': 12},
        'rare_code': {'document_count': 1, 'case_count': 1},  # 5% < 10% = rare
        'universal_code': {'document_count': 19, 'case_count': 15}  # 95% > 80% = universal
    }

    result = update_coverage(config, coverage_data)
    assert result['success']
    assert result['total_codes_tracked'] == 4

    tracking = config['saturation_tracking']
    assert tracking['code_coverage']['coverage_by_code']['coping']['coverage_percent'] == 80.0
    assert 'rare_code' in tracking['code_coverage']['rare_codes']  # 5% coverage
    assert 'universal_code' in tracking['code_coverage']['universal_codes']  # 95% coverage
    print("✓")


def test_update_redundancy():
    """Test updating redundancy score"""
    print("Testing redundancy updates...", end=" ")
    config = {}

    # Below threshold
    result1 = update_redundancy(config, 0.5, "Still finding new themes")
    assert result1['success']
    assert result1['redundancy_score'] == 0.5
    assert not result1['above_threshold']

    # Above threshold
    result2 = update_redundancy(config, 0.9, "High repetition")
    assert result2['success']
    assert result2['redundancy_score'] == 0.9
    assert result2['above_threshold']

    # Clamped to 0-1 range
    result3 = update_redundancy(config, 1.5)
    assert result3['redundancy_score'] == 1.0

    result4 = update_redundancy(config, -0.2)
    assert result4['redundancy_score'] == 0.0

    print("✓")


def test_assess_saturation_low():
    """Test saturation assessment - low saturation"""
    print("Testing saturation assessment (low)...", end=" ")
    config = {}

    # Create scenario with low saturation
    for i in range(1, 6):
        record_document(config, f"INT_00{i}", f"Interview {i}", 5)

    # Add some recent refinements to lower the refinement score
    for j in range(5):
        record_refinement(config, f"code_{j}", "redefinition")

    update_redundancy(config, 0.3, "Many new themes")

    result = assess_saturation(config)
    assert result['success']
    assert result['saturation_level'] == 'low'
    assert result['saturation_score'] < 25
    assert 'ACTIVE' in result['evidence']['code_generation_signal']
    print("✓")


def test_assess_saturation_high():
    """Test saturation assessment - high saturation"""
    print("Testing saturation assessment (high)...", end=" ")
    config = {'coding_progress': {'documents_coded': 15}}

    # Create scenario with high saturation
    # 1. Stable code generation (rate < 0.5) - need 5 docs with avg < 0.5
    codes = [2, 1, 0, 0, 0, 0, 0]  # Last 5: [0,0,0,0,0] = 0.0
    for i, new_codes in enumerate(codes, 1):
        record_document(config, f"INT_00{i}", f"Interview {i}", new_codes)

    # 2. Adequate coverage (>70% codes with >20% coverage)
    coverage_data = {
        f'code_{i}': {'document_count': 12, 'case_count': 8}
        for i in range(10)  # 10 codes, all with 80% coverage
    }
    update_coverage(config, coverage_data)

    # 3. Stable refinement (≤2 recent changes)
    record_refinement(config, "code_1", "split")  # Only 1 recent refinement

    # 4. High redundancy (≥0.85)
    update_redundancy(config, 0.87, "High repetition")

    result = assess_saturation(config)
    assert result['success']
    assert result['saturation_level'] in ['high', 'saturated']
    assert result['saturation_score'] >= 70
    assert 'STABLE' in result['evidence']['code_generation_signal']
    assert 'ADEQUATE' in result['evidence']['coverage_signal']
    assert 'HIGH' in result['evidence']['redundancy_signal']
    print("✓")


def test_get_status():
    """Test status retrieval"""
    print("Testing status retrieval...", end=" ")

    # Test uninitialized
    config1 = {}
    status1 = get_status(config1)
    assert status1['success']
    assert not status1['initialized']

    # Test initialized
    config2 = {}
    record_document(config2, "INT_001", "Interview 1", 5)
    update_redundancy(config2, 0.6)

    status2 = get_status(config2)
    assert status2['success']
    assert status2['initialized']
    assert status2['code_generation']['total_codes'] == 5
    assert status2['redundancy']['score'] == 0.6

    print("✓")


def test_json_serialization():
    """Test that all outputs are JSON-serializable"""
    print("Testing JSON serialization...", end=" ")
    config = {'coding_progress': {'documents_coded': 10}}

    # Run all operations
    record_document(config, "INT_001", "Test", 5)
    record_refinement(config, "test_code", "split")
    update_coverage(config, {'test': {'document_count': 5}})
    update_redundancy(config, 0.7, "Test notes")
    result = assess_saturation(config)
    status = get_status(config)

    # Should all be JSON-serializable
    json.dumps(result)
    json.dumps(status)

    print("✓")


def run_all_tests():
    """Run all test functions"""
    print("\n" + "=" * 60)
    print("Running saturation_tracker.py tests")
    print("=" * 60 + "\n")

    tests = [
        test_initialization,
        test_record_document,
        test_stabilization_detection,
        test_record_refinement,
        test_update_coverage,
        test_update_redundancy,
        test_assess_saturation_low,
        test_assess_saturation_high,
        test_get_status,
        test_json_serialization
    ]

    passed = 0
    failed = 0

    for test in tests:
        try:
            test()
            passed += 1
        except AssertionError as e:
            print(f"✗ (Assertion failed: {e})")
            failed += 1
        except Exception as e:
            print(f"✗ (Error: {e})")
            failed += 1

    print("\n" + "=" * 60)
    print(f"Results: {passed} passed, {failed} failed")
    print("=" * 60 + "\n")

    return failed == 0


if __name__ == '__main__':
    success = run_all_tests()
    sys.exit(0 if success else 1)
