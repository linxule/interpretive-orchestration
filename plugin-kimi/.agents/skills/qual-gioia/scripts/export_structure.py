#!/usr/bin/env python3
"""
export_structure.py
Exports data structure to publication-ready formats

Usage:
  python export_structure.py \
    --structure-path /path/to/data-structure.json \
    --format markdown|table|latex
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Dict, Any


def escape_latex(text: str) -> str:
    """Escape special LaTeX characters."""
    return (text
            .replace("&", r"\&")
            .replace("%", r"\%")
            .replace("_", r"\_")
            .replace("#", r"\#")
            .replace("$", r"\$")
            .replace("{", r"\{")
            .replace("}", r"\}"))


def export_to_markdown(structure: Dict[str, Any]) -> str:
    """Export structure to markdown format."""
    output = "# Data Structure\n\n"

    dimensions = structure.get("aggregate_dimensions", [])
    if not dimensions:
        return "# Data Structure\n\nNo aggregate dimensions found."

    for dimension in dimensions:
        output += f"## {dimension.get('name', 'Unnamed Dimension')}\n\n"
        if dimension.get("definition"):
            output += f"*{dimension['definition']}*\n\n"

        themes = dimension.get("second_order_themes", [])
        if not themes:
            continue

        for theme in themes:
            output += f"### {theme.get('name', 'Unnamed Theme')}\n\n"
            if theme.get("researcher_interpretation"):
                output += f"> {theme['researcher_interpretation']}\n\n"

            concepts = theme.get("first_order_concepts", [])
            if not concepts:
                continue

            for concept in concepts:
                output += f"- **{concept.get('name', 'Unnamed Concept')}**"
                informant_terms = concept.get("informant_terms", [])
                if informant_terms:
                    terms_str = ", ".join(f'"{t}"' for t in informant_terms[:2])
                    output += f" ({terms_str})"
                output += "\n"
            output += "\n"

    return output


def export_to_table(structure: Dict[str, Any]) -> str:
    """Export structure to tab-separated values (Gioia display table)."""
    output = "First-Order Concepts\tSecond-Order Themes\tAggregate Dimensions\n"

    dimensions = structure.get("aggregate_dimensions", [])
    if not dimensions:
        return output

    for dimension in dimensions:
        themes = dimension.get("second_order_themes", [])
        if not themes:
            continue

        is_first_theme = True

        for theme in themes:
            concepts = theme.get("first_order_concepts", [])
            if not concepts:
                continue

            is_first_concept = True

            for concept in concepts:
                concept_name = concept.get("name", "")
                theme_name = theme.get("name", "") if is_first_concept else ""
                dim_name = dimension.get("name", "") if (is_first_theme and is_first_concept) else ""

                output += f"{concept_name}\t{theme_name}\t{dim_name}\n"
                is_first_concept = False

            is_first_theme = False

    return output


def export_to_latex(structure: Dict[str, Any]) -> str:
    """Export structure to LaTeX tabular format."""
    output = r"""\begin{table}[htbp]
\centering
\caption{Data Structure}
\label{tab:data-structure}
\begin{tabular}{p{4cm}|p{4cm}|p{4cm}}
\hline
\textbf{First-Order Concepts} & \textbf{Second-Order Themes} & \textbf{Aggregate Dimensions} \\
\hline
"""

    dimensions = structure.get("aggregate_dimensions", [])
    if not dimensions:
        output += "\\multicolumn{3}{c}{No data} \\\\\n"
    else:
        for dimension in dimensions:
            themes = dimension.get("second_order_themes", [])
            if not themes:
                continue

            is_first_theme = True

            for theme in themes:
                concepts = theme.get("first_order_concepts", [])
                if not concepts:
                    continue

                concept_count = len(concepts)
                is_first_concept = True

                for i, concept in enumerate(concepts):
                    concept_name = escape_latex(concept.get("name", ""))

                    # Theme column: show on first concept
                    if is_first_concept and concept_count > 1:
                        theme_cell = f"\\multirow{{{concept_count}}}{{*}}{{{escape_latex(theme.get('name', ''))}}}"
                    elif is_first_concept:
                        theme_cell = escape_latex(theme.get("name", ""))
                    else:
                        theme_cell = ""

                    # Dimension column: show on first concept of first theme
                    if is_first_theme and is_first_concept:
                        total_concepts = sum(len(t.get("first_order_concepts", [])) for t in themes)
                        if total_concepts > 1:
                            dim_cell = f"\\multirow{{{total_concepts}}}{{*}}{{{escape_latex(dimension.get('name', ''))}}}"
                        else:
                            dim_cell = escape_latex(dimension.get("name", ""))
                    else:
                        dim_cell = ""

                    output += f"{concept_name} & {theme_cell} & {dim_cell} \\\\\n"
                    is_first_concept = False

                is_first_theme = False
            output += "\\hline\n"

    output += r"""\end{tabular}
\end{table}"""

    return output


def main():
    parser = argparse.ArgumentParser(description="Export Gioia data structure")
    parser.add_argument("--structure-path", required=True, help="Path to data structure JSON file")
    parser.add_argument("--format", default="markdown", help="Output format: markdown, table, or latex")
    args = parser.parse_args()

    structure_path = Path(args.structure_path).resolve()
    fmt = args.format.lower()

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

    if fmt in ("markdown", "md"):
        output = export_to_markdown(structure)
    elif fmt in ("table", "tsv"):
        output = export_to_table(structure)
    elif fmt in ("latex", "tex"):
        output = export_to_latex(structure)
    else:
        print(json.dumps({
            "success": False,
            "error": f"Unknown format: {fmt}. Use markdown, table, or latex."
        }))
        sys.exit(1)

    # Output the result
    print(output)


if __name__ == "__main__":
    main()
