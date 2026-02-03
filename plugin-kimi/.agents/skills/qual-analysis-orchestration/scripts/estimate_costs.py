#!/usr/bin/env python3
"""
estimate_costs.py
Estimates Kimi API costs for qualitative document coding

Usage:
    python3 estimate_costs.py --documents 25 --avg-pages 5 --passes 2 --enable-caching
"""

import argparse
import json
import sys
from pathlib import Path
import yaml


def load_pricing_config():
    """Load pricing configuration from YAML"""
    config_path = Path(__file__).parent.parent / "config" / "pricing.yaml"

    if not config_path.exists():
        return None

    with open(config_path, 'r') as f:
        return yaml.safe_load(f)


def estimate_costs(
    documents: int,
    avg_pages: float,
    model: str = "kimi-k2.5",
    passes: int = 1,
    verbosity: str = "standard",
    enable_caching: bool = True
):
    """
    Estimate API costs for document coding

    Args:
        documents: Number of documents to process
        avg_pages: Average pages per document
        model: Model name (default: kimi-k2.5)
        passes: Number of coding passes (default: 1)
        verbosity: Output verbosity (brief|standard|detailed)
        enable_caching: Whether to model caching benefits

    Returns:
        dict: Cost estimates with breakdown
    """
    config = load_pricing_config()

    if not config:
        return {
            "success": False,
            "error": "Failed to load pricing configuration"
        }

    # Get model pricing
    if model not in config['models']:
        return {
            "success": False,
            "error": f"Unknown model: {model}. Valid options: {list(config['models'].keys())}"
        }

    pricing = config['models'][model]
    baselines = config['baselines']

    # Get output ratio
    output_ratio = baselines['output_ratios'].get(verbosity, baselines['output_ratios']['standard'])

    # Calculate tokens
    tokens_per_doc = avg_pages * baselines['tokens_per_page']
    total_input_tokens = documents * tokens_per_doc * passes
    total_output_tokens = total_input_tokens * output_ratio

    # Model caching: Assume 75% of input tokens are cached on repeated passes
    if enable_caching and passes > 1:
        # First pass: full price
        first_pass_tokens = documents * tokens_per_doc
        # Subsequent passes: 75% cached (conservative estimate)
        cached_tokens = (total_input_tokens - first_pass_tokens) * 0.75
        uncached_tokens = total_input_tokens - cached_tokens
    else:
        cached_tokens = 0
        uncached_tokens = total_input_tokens

    # Calculate costs
    input_cost_uncached = (uncached_tokens / 1_000_000) * pricing['input_price']
    input_cost_cached = (cached_tokens / 1_000_000) * pricing['cached_input_price']
    input_cost_total = input_cost_uncached + input_cost_cached

    output_cost = (total_output_tokens / 1_000_000) * pricing['output_price']
    total_cost = input_cost_total + output_cost

    # Without caching (for comparison)
    input_cost_no_cache = (total_input_tokens / 1_000_000) * pricing['input_price']
    total_cost_no_cache = input_cost_no_cache + output_cost

    # Add variance for estimates (±30%)
    low_estimate = total_cost * 0.7
    high_estimate = total_cost * 1.3

    # Calculate savings from caching
    caching_savings = total_cost_no_cache - total_cost if enable_caching and passes > 1 else 0

    result = {
        "success": True,
        "parameters": {
            "documents": documents,
            "avg_pages": avg_pages,
            "model": model,
            "passes": passes,
            "verbosity": verbosity,
            "caching_enabled": enable_caching
        },
        "tokens": {
            "per_document": int(tokens_per_doc),
            "total_input": int(total_input_tokens),
            "total_output": int(total_output_tokens),
            "cached_tokens": int(cached_tokens),
            "uncached_tokens": int(uncached_tokens),
            "total": int(total_input_tokens + total_output_tokens)
        },
        "costs": {
            "input_uncached": f"${input_cost_uncached:.2f}",
            "input_cached": f"${input_cost_cached:.2f}" if enable_caching else "$0.00",
            "input_total": f"${input_cost_total:.2f}",
            "output": f"${output_cost:.2f}",
            "total": f"${total_cost:.2f}",
            "total_without_caching": f"${total_cost_no_cache:.2f}" if enable_caching and passes > 1 else None,
            "caching_savings": f"${caching_savings:.2f}" if caching_savings > 0 else None,
            "range": f"${low_estimate:.2f} - ${high_estimate:.2f}"
        },
        "recommendations": generate_recommendations(
            documents,
            model,
            total_cost,
            passes,
            enable_caching,
            pricing
        )
    }

    return result


def generate_recommendations(documents, model, cost, passes, caching_enabled, pricing):
    """Generate smart recommendations based on parameters"""
    recs = []

    # Kimi is very affordable - focus on quality and strategy, not cost
    if documents > 100:
        recs.append({
            "type": "batch_strategy",
            "suggestion": "Process in batches of 20-30 with review breaks",
            "reason": "Allows quality checking and framework refinement"
        })

    if passes == 1 and documents > 20:
        recs.append({
            "type": "multi_pass_strategy",
            "suggestion": "Consider 2-pass workflow: categorization → deep coding",
            "benefit": f"With caching, 2nd pass costs only ${pricing['cached_input_price']}/M tokens (83% discount)"
        })

    if not caching_enabled and passes > 1:
        recs.append({
            "type": "caching",
            "suggestion": "Enable caching for multi-pass workflows",
            "benefit": "Save 83% on repeated input tokens"
        })

    if cost < 1.00:
        recs.append({
            "type": "affordability",
            "suggestion": "At this price point, prioritize quality over cost optimization",
            "note": f"Total estimated cost (${cost:.2f}) is minimal for qualitative research"
        })

    if documents < 10:
        recs.append({
            "type": "pilot",
            "suggestion": "Small corpus detected - process all with full dialogical coding",
            "reason": "Rich interpretive depth more valuable than efficiency at this scale"
        })

    return recs


def main():
    """CLI entry point"""
    parser = argparse.ArgumentParser(
        description="Estimate Kimi API costs for qualitative document coding"
    )
    parser.add_argument(
        '--documents',
        type=int,
        default=10,
        help='Number of documents to process (default: 10)'
    )
    parser.add_argument(
        '--avg-pages',
        type=float,
        default=5.0,
        help='Average pages per document (default: 5.0)'
    )
    parser.add_argument(
        '--model',
        type=str,
        default='kimi-k2.5',
        help='Model to use (default: kimi-k2.5)'
    )
    parser.add_argument(
        '--passes',
        type=int,
        default=1,
        help='Number of coding passes (default: 1)'
    )
    parser.add_argument(
        '--verbosity',
        type=str,
        choices=['brief', 'standard', 'detailed'],
        default='standard',
        help='Output verbosity level (default: standard)'
    )
    parser.add_argument(
        '--enable-caching',
        action='store_true',
        default=True,
        help='Model caching benefits (default: True)'
    )
    parser.add_argument(
        '--no-caching',
        action='store_true',
        help='Disable caching modeling'
    )

    args = parser.parse_args()

    # Handle caching flags
    enable_caching = args.enable_caching and not args.no_caching

    result = estimate_costs(
        documents=args.documents,
        avg_pages=args.avg_pages,
        model=args.model,
        passes=args.passes,
        verbosity=args.verbosity,
        enable_caching=enable_caching
    )

    print(json.dumps(result, indent=2))

    return 0 if result['success'] else 1


if __name__ == '__main__':
    sys.exit(main())
