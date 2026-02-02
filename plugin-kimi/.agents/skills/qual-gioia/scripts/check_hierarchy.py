#!/usr/bin/env python3
"""
check_hierarchy.py
Analyzes hierarchy quality and methodological consistency

Usage:
  python check_hierarchy.py --structure-path /path/to/data-structure.json
"""

import argparse
import json
import math
import sys
from pathlib import Path
from typing import Dict, List, Any


# Words that suggest 1st-order concepts may be too abstract
ABSTRACT_INDICATORS = [
    "mechanism", "strategy", "construct", "dimension", "paradigm",
    "framework", "model", "theory", "dynamic", "process of",
    "enabling", "facilitating", "undermining", "leveraging"
]

# Words that suggest good 1st-order grounding
GROUNDED_INDICATORS = [
    "i ", "we ", "they ", "my ", "our ", "their ",
    "said", "told", "felt", "wanted", "tried", "had to"
]


def analyze_hierarchy(structure: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze hierarchy quality and methodological consistency."""
    analysis = {
        "overall_health": "good",
        "distribution": {
            "dimensions": [],
            "balance_score": 0.0
        },
        "abstraction_concerns": [],
        "quote_coverage": {
            "concepts_with_quotes": 0,
            "concepts_without_quotes": 0,
            "total_quotes": 0
        },
        "recommendations": []
    }

    if not structure.get("aggregate_dimensions"):
        analysis["overall_health"] = "error"
        analysis["recommendations"].append("No aggregate_dimensions found in structure")
        return analysis

    total_concepts = 0
    concepts_per_theme = []

    for dimension in structure["aggregate_dimensions"]:
        dim_analysis = {
            "id": dimension.get("id"),
            "name": dimension.get("name"),
            "theme_count": 0,
            "concept_count": 0
        }

        themes = dimension.get("second_order_themes")
        if not themes:
            dim_analysis["theme_count"] = 0
            analysis["distribution"]["dimensions"].append(dim_analysis)
            continue

        dim_analysis["theme_count"] = len(themes)

        # Check theme count per dimension
        if dim_analysis["theme_count"] < 2:
            analysis["recommendations"].append(
                f'Dimension "{dimension.get("name")}" has only {dim_analysis["theme_count"]} theme(s) - '
                f"consider if this is truly a dimension or should be a theme"
            )
        elif dim_analysis["theme_count"] > 5:
            analysis["recommendations"].append(
                f'Dimension "{dimension.get("name")}" has {dim_analysis["theme_count"]} themes - '
                f"consider splitting into multiple dimensions"
            )

        for theme in themes:
            concepts = theme.get("first_order_concepts", [])
            if not concepts:
                continue

            concept_count = len(concepts)
            dim_analysis["concept_count"] += concept_count
            total_concepts += concept_count
            concepts_per_theme.append(concept_count)

            # Check concept count per theme
            if concept_count < 2:
                analysis["recommendations"].append(
                    f'Theme "{theme.get("name")}" has only {concept_count} concept(s) - '
                    f"may need more empirical grounding or merge with another theme"
                )
            elif concept_count > 10:
                analysis["recommendations"].append(
                    f'Theme "{theme.get("name")}" has {concept_count} concepts - '
                    f"consider creating sub-themes or splitting"
                )

            # Analyze each concept
            for concept in concepts:
                # Check quote coverage
                quotes = concept.get("example_quotes", [])
                if quotes and len(quotes) > 0:
                    analysis["quote_coverage"]["concepts_with_quotes"] += 1
                    analysis["quote_coverage"]["total_quotes"] += len(quotes)
                else:
                    analysis["quote_coverage"]["concepts_without_quotes"] += 1

                # Check abstraction level of 1st-order concepts
                concept_name = (concept.get("name") or "").lower()
                concept_def = (concept.get("definition") or "").lower()
                combined_text = concept_name + " " + concept_def

                abstraction_score = sum(1 for indicator in ABSTRACT_INDICATORS if indicator in combined_text)

                grounded_score = 0
                informant_terms = concept.get("informant_terms", [])
                if informant_terms:
                    for term in informant_terms:
                        term_lower = term.lower()
                        grounded_score += sum(1 for indicator in GROUNDED_INDICATORS if indicator in term_lower)

                if abstraction_score > 1 and grounded_score == 0:
                    analysis["abstraction_concerns"].append({
                        "concept_id": concept.get("id"),
                        "concept_name": concept.get("name"),
                        "concern": "1st-order concept may be too abstract - should use participant language",
                        "suggestion": "Consider if this should be a 2nd-order theme, or rephrase using informant terms"
                    })

        analysis["distribution"]["dimensions"].append(dim_analysis)

    # Calculate balance score (lower is better, 0 = perfectly balanced)
    if concepts_per_theme:
        avg = sum(concepts_per_theme) / len(concepts_per_theme)
        variance = sum((val - avg) ** 2 for val in concepts_per_theme) / len(concepts_per_theme)
        analysis["distribution"]["balance_score"] = round(math.sqrt(variance), 2)

        if analysis["distribution"]["balance_score"] > 3:
            analysis["recommendations"].append(
                f"Uneven distribution of concepts across themes "
                f"(variance: {analysis['distribution']['balance_score']}) - "
                f"some themes may need consolidation or expansion"
            )

    # Overall health assessment
    total_with_quotes = analysis["quote_coverage"]["concepts_with_quotes"]
    total_without_quotes = analysis["quote_coverage"]["concepts_without_quotes"]
    total_concepts_quotes = total_with_quotes + total_without_quotes
    quote_coverage = total_with_quotes / total_concepts_quotes if total_concepts_quotes > 0 else 0

    if len(analysis["abstraction_concerns"]) > total_concepts * 0.2:
        analysis["overall_health"] = "needs_attention"
        analysis["recommendations"].append(
            "Many 1st-order concepts appear too abstract - review for participant grounding"
        )

    if quote_coverage < 0.5:
        analysis["overall_health"] = "needs_attention"
        analysis["recommendations"].append(
            f"Only {quote_coverage * 100:.0f}% of concepts have example quotes - add more empirical grounding"
        )

    if not analysis["recommendations"]:
        analysis["recommendations"].append("Structure looks methodologically sound!")

    return analysis


def main():
    parser = argparse.ArgumentParser(description="Check Gioia hierarchy quality")
    parser.add_argument("--structure-path", required=True, help="Path to data structure JSON file")
    args = parser.parse_args()

    structure_path = Path(args.structure_path).resolve()

    # Path traversal protection - check for null bytes
    if "\x00" in str(structure_path):
        print(json.dumps({"success": False, "error": "Invalid path - null bytes detected"}))
        sys.exit(1)

    if not structure_path.exists():
        print(json.dumps({"success": False, "error": f"File not found: {args.structure_path}"}))
        sys.exit(1)

    try:
        with open(structure_path, "r", encoding="utf-8") as f:
            structure = json.load(f)
    except json.JSONDecodeError as e:
        print(json.dumps({"success": False, "error": f"Failed to parse JSON: {e}"}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"success": False, "error": f"Failed to read file: {e}"}))
        sys.exit(1)

    analysis = analyze_hierarchy(structure)
    output = {"success": True, **analysis}
    print(json.dumps(output, indent=2))

    sys.exit(0 if analysis["overall_health"] != "error" else 1)


if __name__ == "__main__":
    main()
