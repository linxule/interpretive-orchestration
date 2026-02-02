#!/usr/bin/env python3
"""
validate_structure.py
Validates a Gioia data structure JSON file against the schema

Usage:
  python validate_structure.py --structure-path /path/to/data-structure.json
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Dict, List, Any, Set


def validate_structure(structure: Dict[str, Any]) -> Dict[str, Any]:
    """Validate a Gioia data structure."""
    results = {
        "valid": True,
        "errors": [],
        "warnings": [],
        "stats": {
            "dimensions": 0,
            "themes": 0,
            "concepts": 0,
            "quotes": 0
        }
    }

    # Check for aggregate_dimensions array
    if not structure.get("aggregate_dimensions") or not isinstance(structure["aggregate_dimensions"], list):
        results["errors"].append("Missing or invalid aggregate_dimensions array")
        results["valid"] = False
        return results

    seen_ids: Set[str] = set()

    # Validate each dimension
    for dimension in structure["aggregate_dimensions"]:
        results["stats"]["dimensions"] += 1

        # Check dimension fields
        dim_id = dimension.get("id")
        if not dim_id:
            results["errors"].append(f"Dimension missing id: {str(dimension)[:50]}...")
            results["valid"] = False
        else:
            if dim_id in seen_ids:
                results["errors"].append(f"Duplicate id: {dim_id}")
                results["valid"] = False
            seen_ids.add(dim_id)

            # Check ID format (should start with AD)
            if not dim_id.startswith("AD"):
                results["warnings"].append(f'Dimension id "{dim_id}" should start with "AD" (e.g., AD1)')

        dim_name = dimension.get("name", "")
        if not dim_name or "{" in dim_name:
            results["errors"].append(f"Dimension {dim_id or 'unknown'}: missing or placeholder name")
            results["valid"] = False

        if not dimension.get("definition"):
            results["warnings"].append(f"Dimension {dim_id}: missing definition")

        # Validate themes
        themes = dimension.get("second_order_themes")
        if not themes or not isinstance(themes, list):
            results["errors"].append(f"Dimension {dim_id}: missing second_order_themes array")
            results["valid"] = False
            continue

        if len(themes) == 0:
            results["warnings"].append(f"Dimension {dim_id}: has no themes")

        for theme in themes:
            results["stats"]["themes"] += 1

            # Check theme fields
            theme_id = theme.get("id")
            if not theme_id:
                results["errors"].append(f"Theme missing id in dimension {dim_id}")
                results["valid"] = False
            else:
                if theme_id in seen_ids:
                    results["errors"].append(f"Duplicate id: {theme_id}")
                    results["valid"] = False
                seen_ids.add(theme_id)

                # Check ID format (should include parent dimension)
                if "_T" not in theme_id:
                    results["warnings"].append(f'Theme id "{theme_id}" should follow format "AD1_T1"')

            theme_name = theme.get("name", "")
            if not theme_name or "{" in theme_name:
                results["errors"].append(f"Theme {theme_id or 'unknown'}: missing or placeholder name")
                results["valid"] = False

            if not theme.get("researcher_interpretation"):
                results["warnings"].append(
                    f"Theme {theme_id}: missing researcher_interpretation (important for audit trail)"
                )

            # Validate concepts
            concepts = theme.get("first_order_concepts")
            if not concepts or not isinstance(concepts, list):
                results["errors"].append(f"Theme {theme_id}: missing first_order_concepts array")
                results["valid"] = False
                continue

            if len(concepts) == 0:
                results["warnings"].append(f"Theme {theme_id}: has no concepts")

            for concept in concepts:
                results["stats"]["concepts"] += 1

                # Check concept fields
                concept_id = concept.get("id")
                if not concept_id:
                    results["errors"].append(f"Concept missing id in theme {theme_id}")
                    results["valid"] = False
                else:
                    if concept_id in seen_ids:
                        results["errors"].append(f"Duplicate id: {concept_id}")
                        results["valid"] = False
                    seen_ids.add(concept_id)

                    # Check ID format
                    if "_C" not in concept_id:
                        results["warnings"].append(
                            f'Concept id "{concept_id}" should follow format "AD1_T1_C1"'
                        )

                concept_name = concept.get("name", "")
                if not concept_name or "{" in concept_name:
                    results["errors"].append(f"Concept {concept_id or 'unknown'}: missing or placeholder name")
                    results["valid"] = False

                if not concept.get("informant_terms"):
                    results["warnings"].append(
                        f"Concept {concept_id}: missing informant_terms (important for 1st-order grounding)"
                    )

                # Count quotes
                quotes = concept.get("example_quotes", [])
                if quotes and isinstance(quotes, list):
                    for quote in quotes:
                        results["stats"]["quotes"] += 1

                        if not quote.get("document_id"):
                            results["warnings"].append(f"Quote in {concept_id}: missing document_id")
                        if not quote.get("lines"):
                            results["warnings"].append(f"Quote in {concept_id}: missing line numbers")
                        if not quote.get("quote"):
                            results["errors"].append(f"Quote in {concept_id}: missing quote text")
                            results["valid"] = False
                else:
                    results["warnings"].append(
                        f"Concept {concept_id}: no example_quotes (should have at least 2-3)"
                    )

    return results


def main():
    parser = argparse.ArgumentParser(description="Validate Gioia data structure")
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

    results = validate_structure(structure)
    output = {"success": results["valid"], **results}
    print(json.dumps(output, indent=2))

    sys.exit(0 if results["valid"] else 1)


if __name__ == "__main__":
    main()
