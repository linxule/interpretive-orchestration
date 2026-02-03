#!/usr/bin/env python3
"""
Test suite for estimate_costs.py
"""

import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

# Optional pytest import
try:
    import pytest
except ImportError:
    pytest = None

from estimate_costs import estimate_costs, generate_recommendations, load_pricing_config


def test_load_pricing_config():
    """Test that pricing config loads successfully"""
    config = load_pricing_config()
    assert config is not None, "Failed to load pricing config"
    assert 'models' in config
    assert 'kimi-k2.5' in config['models']
    assert config['models']['kimi-k2.5']['input_price'] == 0.60
    assert config['models']['kimi-k2.5']['cached_input_price'] == 0.10
    assert config['models']['kimi-k2.5']['output_price'] == 3.00


def test_basic_cost_estimation():
    """Test basic cost calculation without caching"""
    result = estimate_costs(
        documents=10,
        avg_pages=5,
        model="kimi-k2.5",
        passes=1,
        verbosity="standard",
        enable_caching=False
    )

    assert result['success'] == True
    assert result['parameters']['documents'] == 10
    assert result['tokens']['per_document'] == 2500  # 5 pages * 500 tokens/page

    # Verify cost calculation
    # 10 docs * 2500 tokens = 25,000 input tokens
    # 25,000 * 0.5 (standard ratio) = 12,500 output tokens
    # Input: 0.025M * $0.60 = $0.015
    # Output: 0.0125M * $3.00 = $0.0375
    # Total: $0.0525
    assert '$0.05' in result['costs']['total']  # Within rounding


def test_cost_estimation_with_caching():
    """Test cost calculation with caching enabled"""
    result = estimate_costs(
        documents=25,
        avg_pages=5,
        model="kimi-k2.5",
        passes=2,
        verbosity="standard",
        enable_caching=True
    )

    assert result['success'] == True
    assert result['parameters']['caching_enabled'] == True
    assert result['tokens']['cached_tokens'] > 0, "Should have cached tokens with 2 passes"

    # Verify caching savings
    assert result['costs']['caching_savings'] is not None
    assert result['costs']['total_without_caching'] is not None


def test_output_verbosity_ratios():
    """Test different verbosity levels"""
    base_params = {
        "documents": 10,
        "avg_pages": 5,
        "model": "kimi-k2.5",
        "passes": 1,
        "enable_caching": False
    }

    brief = estimate_costs(**base_params, verbosity="brief")
    standard = estimate_costs(**base_params, verbosity="standard")
    detailed = estimate_costs(**base_params, verbosity="detailed")

    # Brief should have fewer output tokens than standard
    assert brief['tokens']['total_output'] < standard['tokens']['total_output']
    # Detailed should have more output tokens than standard
    assert detailed['tokens']['total_output'] > standard['tokens']['total_output']


def test_kimi_affordability():
    """Test that Kimi costs are indeed very low"""
    # Large project: 100 interviews, 2 passes
    result = estimate_costs(
        documents=100,
        avg_pages=5,
        model="kimi-k2.5",
        passes=2,
        verbosity="standard",
        enable_caching=True
    )

    assert result['success'] == True

    # Extract numeric cost value
    total_cost_str = result['costs']['total']
    total_cost = float(total_cost_str.replace('$', ''))

    # Even 100 interviews with 2 passes should cost < $5
    assert total_cost < 5.00, f"Cost ${total_cost} exceeds $5 threshold for 100 docs"


def test_recommendations_batch_strategy():
    """Test that recommendations suggest batching for large corpora"""
    result = estimate_costs(
        documents=150,
        avg_pages=5,
        model="kimi-k2.5"
    )

    recs = result['recommendations']
    batch_rec = next((r for r in recs if r['type'] == 'batch_strategy'), None)

    assert batch_rec is not None, "Should recommend batching for 150 documents"
    assert 'batches' in batch_rec['suggestion'].lower()


def test_recommendations_multi_pass():
    """Test multi-pass recommendations"""
    result = estimate_costs(
        documents=50,
        avg_pages=5,
        model="kimi-k2.5",
        passes=1
    )

    recs = result['recommendations']
    multipass_rec = next((r for r in recs if r['type'] == 'multi_pass_strategy'), None)

    assert multipass_rec is not None, "Should recommend multi-pass for 50 docs with 1 pass"


def test_recommendations_affordability_note():
    """Test that affordability is noted for small costs"""
    result = estimate_costs(
        documents=20,
        avg_pages=5,
        model="kimi-k2.5"
    )

    recs = result['recommendations']
    afford_rec = next((r for r in recs if r['type'] == 'affordability'), None)

    # For small projects, should note minimal cost
    total_cost = float(result['costs']['total'].replace('$', ''))
    if total_cost < 1.00:
        assert afford_rec is not None, "Should note affordability for <$1 projects"


def test_caching_benefit_calculation():
    """Test that caching savings are calculated correctly"""
    result = estimate_costs(
        documents=30,
        avg_pages=5,
        model="kimi-k2.5",
        passes=3,
        enable_caching=True
    )

    savings_str = result['costs']['caching_savings']
    if savings_str:
        savings = float(savings_str.replace('$', ''))
        assert savings > 0, "Should show savings with 3 passes and caching"


def test_invalid_model():
    """Test error handling for invalid model"""
    result = estimate_costs(
        documents=10,
        avg_pages=5,
        model="invalid-model"
    )

    assert result['success'] == False
    assert 'error' in result
    assert 'Unknown model' in result['error']


def test_token_calculation_accuracy():
    """Test token calculation matches expected values"""
    result = estimate_costs(
        documents=1,
        avg_pages=10,
        model="kimi-k2.5",
        passes=1,
        verbosity="standard",
        enable_caching=False
    )

    # 1 doc * 10 pages * 500 tokens/page = 5,000 tokens
    assert result['tokens']['per_document'] == 5000
    assert result['tokens']['total_input'] == 5000

    # Standard verbosity: 0.5 ratio
    assert result['tokens']['total_output'] == 2500


if __name__ == '__main__':
    # Run tests
    print("Running cost estimation tests...\n")

    # Manual test execution (for environments without pytest)
    tests = [
        ("Load pricing config", test_load_pricing_config),
        ("Basic cost estimation", test_basic_cost_estimation),
        ("Cost with caching", test_cost_estimation_with_caching),
        ("Verbosity ratios", test_output_verbosity_ratios),
        ("Kimi affordability", test_kimi_affordability),
        ("Batch strategy recommendation", test_recommendations_batch_strategy),
        ("Multi-pass recommendation", test_recommendations_multi_pass),
        ("Affordability note", test_recommendations_affordability_note),
        ("Caching benefit calc", test_caching_benefit_calculation),
        ("Invalid model handling", test_invalid_model),
        ("Token calculation", test_token_calculation_accuracy),
    ]

    passed = 0
    failed = 0

    for name, test_func in tests:
        try:
            test_func()
            print(f"✓ {name}")
            passed += 1
        except AssertionError as e:
            print(f"✗ {name}: {e}")
            failed += 1
        except Exception as e:
            print(f"✗ {name}: Unexpected error: {e}")
            failed += 1

    print(f"\n{passed} passed, {failed} failed")
    sys.exit(0 if failed == 0 else 1)
