#!/usr/bin/env python3
"""
search_and_fetch.py
Orchestrates literature gathering with graceful degradation

Usage:
  python search_and_fetch.py \
    --project-path /path/to/project \
    --query "sensemaking organizational change" \
    --max-results 15

Or for Tier 2/3 (manual URL input):
  python search_and_fetch.py \
    --project-path /path/to/project \
    --urls "https://example.com/paper1.pdf,https://example.com/paper2.pdf"

This script:
1. Detects available tier based on API keys
2. Creates output directory structure
3. Returns workflow instructions for Kimi to execute
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional


def detect_tier() -> Dict[str, Any]:
    """Detect available capability tier based on API keys."""
    has_exa = bool(os.environ.get("EXA_API_KEY"))
    has_jina = bool(os.environ.get("JINA_API_KEY"))

    if has_exa and has_jina:
        return {"tier": 1, "name": "Full", "exa": True, "jina": True}
    elif has_jina:
        return {"tier": 2, "name": "Manual Search + Jina Fetch", "exa": False, "jina": True}
    else:
        return {"tier": 3, "name": "Basic (WebFetch + Manual)", "exa": False, "jina": False}


def ensure_directory_structure(project_path: Path) -> List[Path]:
    """Create output directory structure."""
    dirs = [
        project_path / "stage2-collaboration" / "stream-a-theoretical" / "papers",
    ]

    for dir_path in dirs:
        dir_path.mkdir(parents=True, exist_ok=True)

    return dirs


def load_or_create_inventory(project_path: Path) -> Dict[str, Any]:
    """Load existing inventory or create new."""
    inventory_path = (
        project_path / "stage2-collaboration" / "stream-a-theoretical" / "literature-inventory.json"
    )

    if inventory_path.exists():
        try:
            with open(inventory_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            # Corrupted file, create new
            pass

    return {
        "sources": [],
        "search_queries": [],
        "last_updated": datetime.now().isoformat()
    }


def save_inventory(project_path: Path, inventory: Dict[str, Any]) -> Path:
    """Save inventory to file."""
    inventory_path = (
        project_path / "stage2-collaboration" / "stream-a-theoretical" / "literature-inventory.json"
    )

    inventory["last_updated"] = datetime.now().isoformat()
    with open(inventory_path, "w", encoding="utf-8") as f:
        json.dump(inventory, f, indent=2)

    return inventory_path


def generate_tier1_workflow(query: str, max_results: int, project_path: Path) -> Dict[str, Any]:
    """Generate workflow for Tier 1 (Full)."""
    papers_dir = project_path / "stage2-collaboration" / "stream-a-theoretical" / "papers"
    inventory_file = project_path / "stage2-collaboration" / "stream-a-theoretical" / "literature-inventory.json"

    return {
        "tier": 1,
        "tier_name": "Full Literature Sweep",
        "steps": [
            {
                "step": 1,
                "action": "search",
                "description": "Search for academic papers using Exa",
                "mcp_tool": "exa",
                "parameters": {
                    "query": query,
                    "type": "research_paper",
                    "numResults": max_results
                },
                "instruction": f'Use Exa MCP to search: "{query}" (limit: {max_results} results)'
            },
            {
                "step": 2,
                "action": "select",
                "description": "Review search results and select relevant papers",
                "instruction": "Present top results to user. Let them select which papers to fetch."
            },
            {
                "step": 3,
                "action": "fetch",
                "description": "Fetch full content using Jina",
                "mcp_tool": "jina",
                "instruction": "For each selected URL, use Jina to fetch the full content as markdown."
            },
            {
                "step": 4,
                "action": "save",
                "description": "Save papers to project directory",
                "output_dir": str(papers_dir),
                "instruction": "Save each paper as markdown in the papers/ directory with format: author-year-keyword.md"
            },
            {
                "step": 5,
                "action": "inventory",
                "description": "Update literature inventory",
                "instruction": "Add entries to literature-inventory.json for each fetched paper."
            }
        ],
        "output_structure": {
            "papers_dir": str(papers_dir),
            "inventory_file": str(inventory_file)
        }
    }


def generate_tier2_workflow(urls: Optional[str], project_path: Path) -> Dict[str, Any]:
    """Generate workflow for Tier 2 (Manual + Jina)."""
    url_list = [u.strip() for u in urls.split(",")] if urls else []
    papers_dir = project_path / "stage2-collaboration" / "stream-a-theoretical" / "papers"
    inventory_file = project_path / "stage2-collaboration" / "stream-a-theoretical" / "literature-inventory.json"

    return {
        "tier": 2,
        "tier_name": "Manual Search + Jina Fetch",
        "note": "Exa API key not available. User must provide URLs manually.",
        "steps": [
            {
                "step": 1,
                "action": "manual_search",
                "description": "Search for papers manually",
                "instruction": """Search these sources for relevant papers:
- Google Scholar: scholar.google.com
- Semantic Scholar: semanticscholar.org
- JSTOR: jstor.org
- Your institutional library

Collect URLs for papers you want to analyze."""
            },
            {
                "step": 2,
                "action": "provide_urls",
                "description": "Provide paper URLs",
                "urls_provided": url_list,
                "instruction": (
                    f"URLs to process: {', '.join(url_list)}"
                    if url_list else "Ask user to provide URLs for papers they found."
                )
            },
            {
                "step": 3,
                "action": "fetch",
                "description": "Fetch content using Jina",
                "mcp_tool": "jina",
                "instruction": "For each URL, use Jina to fetch the full content as markdown."
            },
            {
                "step": 4,
                "action": "save",
                "description": "Save papers to project directory",
                "output_dir": str(papers_dir),
                "instruction": "Save each paper as markdown in the papers/ directory."
            },
            {
                "step": 5,
                "action": "inventory",
                "description": "Update literature inventory",
                "instruction": "Add entries to literature-inventory.json for each fetched paper."
            }
        ],
        "output_structure": {
            "papers_dir": str(papers_dir),
            "inventory_file": str(inventory_file)
        }
    }


def generate_tier3_workflow(urls: Optional[str], project_path: Path) -> Dict[str, Any]:
    """Generate workflow for Tier 3 (Basic)."""
    url_list = [u.strip() for u in urls.split(",")] if urls else []
    papers_dir = project_path / "stage2-collaboration" / "stream-a-theoretical" / "papers"
    inventory_file = project_path / "stage2-collaboration" / "stream-a-theoretical" / "literature-inventory.json"

    return {
        "tier": 3,
        "tier_name": "Basic (No API Keys)",
        "note": "Neither Exa nor Jina API keys available. Using built-in tools and manual conversion.",
        "steps": [
            {
                "step": 1,
                "action": "manual_search",
                "description": "Search for papers manually",
                "instruction": """Search these sources for relevant papers:
- Google Scholar: scholar.google.com
- Semantic Scholar: semanticscholar.org
- Unpaywall browser extension for free versions
- Check author websites for preprints

Download PDFs when possible."""
            },
            {
                "step": 2,
                "action": "provide_content",
                "description": "Provide paper content",
                "urls_provided": url_list,
                "instruction": """Options for getting paper content:
1. If URL accessible: Use WebFetch tool
2. If PDF downloaded: Manual conversion needed
3. If paywalled: Check for open access version or preprint"""
            },
            {
                "step": 3,
                "action": "convert",
                "description": "Convert PDFs to markdown",
                "tool": "manual",
                "instruction": """For PDF files, use manual conversion:
- Adobe Acrobat: Export to Word/text
- Google Docs: Open PDF for auto-OCR
- Tesseract: Command-line OCR for batch processing
- MinerU: If API key becomes available later"""
            },
            {
                "step": 4,
                "action": "save",
                "description": "Save papers to project directory",
                "output_dir": str(papers_dir),
                "instruction": "Save each paper as markdown in the papers/ directory."
            },
            {
                "step": 5,
                "action": "inventory",
                "description": "Update literature inventory",
                "instruction": "Add entries to literature-inventory.json for each paper."
            }
        ],
        "api_upgrade_suggestion": {
            "for_better_experience": [
                "Set EXA_API_KEY for automatic academic search",
                "Set JINA_API_KEY for reliable content extraction",
                "Set MINERU_API_KEY for high-accuracy PDF conversion"
            ]
        },
        "output_structure": {
            "papers_dir": str(papers_dir),
            "inventory_file": str(inventory_file)
        }
    }


def main():
    parser = argparse.ArgumentParser(description="Literature search and fetch")
    parser.add_argument("--project-path", required=True, help="Path to project root")
    parser.add_argument("--query", help="Search query for Tier 1")
    parser.add_argument("--urls", help="Comma-separated URLs for Tier 2/3")
    parser.add_argument("--max-results", type=int, default=15, help="Maximum results to fetch")
    args = parser.parse_args()

    # Path traversal protection
    resolved_path = Path(args.project_path).resolve()
    config_target = resolved_path / ".interpretive-orchestration" / "config.json"

    # Ensure the resolved config path is within the project path
    try:
        config_target.relative_to(resolved_path)
    except ValueError:
        print(json.dumps({
            "success": False,
            "error": "Path traversal detected - invalid project path"
        }))
        sys.exit(1)

    # Ensure directory structure exists
    ensure_directory_structure(resolved_path)

    # Load existing inventory
    inventory = load_or_create_inventory(resolved_path)

    # Detect available tier
    tier = detect_tier()

    # Generate appropriate workflow
    workflow = None
    query = args.query
    urls = args.urls
    max_results = args.max_results

    if tier["tier"] == 1 and query:
        workflow = generate_tier1_workflow(query, max_results, resolved_path)
        inventory["search_queries"].append(query)
    elif tier["tier"] == 2 or (tier["tier"] == 1 and not query):
        workflow = generate_tier2_workflow(urls, resolved_path)
    else:
        workflow = generate_tier3_workflow(urls, resolved_path)

    # Save updated inventory (with new search query if applicable)
    inventory_path = save_inventory(resolved_path, inventory)

    print(json.dumps({
        "success": True,
        "detected_tier": tier,
        "workflow": workflow,
        "inventory_path": str(inventory_path),
        "existing_sources": len(inventory["sources"]),
        "next_action": workflow["steps"][0]["instruction"] if workflow["steps"] else "No steps defined"
    }, indent=2))


if __name__ == "__main__":
    main()
