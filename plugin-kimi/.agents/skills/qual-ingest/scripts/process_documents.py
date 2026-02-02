#!/usr/bin/env python3
"""
process_documents.py
Batch process interview recordings and documents for qualitative analysis

Usage:
  python process_documents.py \
    --project-path /path/to/project \
    --input-dir /path/to/recordings \
    --output-dir stage1-foundation/manual-codes

Options:
  --project-path   Path to the qualitative project root
  --input-dir      Directory containing recordings/documents to process
  --output-dir     Output directory relative to project (default: stage1-foundation/manual-codes)
  --format         Filter by format: audio, pdf, docx, all (default: all)
  --list           Just list files to process, don't generate workflow

This script:
1. Detects available tier (MinerU vs Manual)
2. Scans input directory for supported formats
3. Returns workflow instructions for Kimi to execute
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional


# Supported file formats
SUPPORTED_FORMATS = {
    "audio": [".mp3", ".wav", ".m4a", ".ogg", ".flac", ".aac", ".wma"],
    "pdf": [".pdf"],
    "docx": [".docx", ".doc"],
    "xlsx": [".xlsx", ".xls"],
    "pptx": [".pptx", ".ppt"],
    "image": [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff"],
    "video": [".mp4", ".mov", ".avi", ".mkv"]
}


def detect_tier() -> Dict[str, Any]:
    """Detect available capability tier."""
    has_mineru = bool(os.environ.get("MINERU_API_KEY"))

    if has_mineru:
        return {
            "tier": 1,
            "name": "Best (MinerU for PDFs)",
            "mineru": True,
            "pdf_tool": "mineru",
            "audio_tool": "external"
        }
    else:
        return {
            "tier": 2,
            "name": "Manual (External tools)",
            "mineru": False,
            "pdf_tool": "manual",
            "audio_tool": "external"
        }


def get_file_format(file_path: Path) -> Optional[str]:
    """Determine file format from extension."""
    ext = file_path.suffix.lower()

    for fmt, extensions in SUPPORTED_FORMATS.items():
        if ext in extensions:
            return fmt

    return None


def scan_input_directory(input_dir: Path, format_filter: str) -> Dict[str, Any]:
    """Scan input directory for supported files."""
    files = []

    if not input_dir.exists():
        return {"error": f"Input directory not found: {input_dir}", "files": []}

    try:
        for entry in input_dir.iterdir():
            if entry.name.startswith("."):
                continue

            if entry.is_file():
                fmt = get_file_format(entry)

                if fmt and (format_filter == "all" or format_filter == fmt):
                    files.append({
                        "name": entry.name,
                        "path": str(entry),
                        "format": fmt,
                        "size": entry.stat().st_size,
                        "size_mb": round(entry.stat().st_size / 1024 / 1024, 2)
                    })
    except Exception as e:
        return {"error": f"Failed to scan directory: {e}", "files": []}

    return {"files": files}


def load_or_create_inventory(project_path: Path) -> Dict[str, Any]:
    """Load existing inventory or create new."""
    inventory_path = project_path / "stage1-foundation" / "data-inventory.json"

    if inventory_path.exists():
        try:
            with open(inventory_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            # Corrupted file, create new
            pass

    return {
        "documents": [],
        "last_updated": datetime.now().isoformat()
    }


def save_inventory(project_path: Path, inventory: Dict[str, Any]) -> Path:
    """Save inventory to file."""
    inventory_path = project_path / "stage1-foundation" / "data-inventory.json"
    inventory_path.parent.mkdir(parents=True, exist_ok=True)

    inventory["last_updated"] = datetime.now().isoformat()
    with open(inventory_path, "w", encoding="utf-8") as f:
        json.dump(inventory, f, indent=2)

    return inventory_path


def generate_document_id(existing: List[Dict[str, Any]], fmt: str) -> str:
    """Generate next document ID."""
    prefix = "P" if fmt == "audio" else "D"
    existing_ids = []

    for doc in existing:
        doc_id = doc.get("id", "")
        if doc_id.startswith(prefix):
            try:
                num = int(doc_id[1:])
                existing_ids.append(num)
            except ValueError:
                pass

    next_num = max(existing_ids) + 1 if existing_ids else 1
    return f"{prefix}{next_num:03d}"


def get_tool_instruction(fmt: str, tier: Dict[str, Any], file_path: str) -> Dict[str, Any]:
    """Get processing instructions for a file format."""
    instructions = {
        "audio": {
            "tool": "external",
            "action": "transcription",
            "command": f"Transcribe audio using external service: {file_path}",
            "notes": [
                "Recommended services: Otter.ai, Rev.com, or YouTube auto-captions",
                "For local processing: OpenAI Whisper",
                "Review transcript for accuracy",
                "Add speaker labels (Interviewer:, Participant:)",
                "Mark unclear passages with [unclear]",
                "Note timestamps for key passages"
            ]
        },
        "pdf": {
            "tool": "mineru" if tier.get("mineru") else "manual",
            "action": "parse" if tier.get("mineru") else "pdf-conversion",
            "command": (
                f"Use MinerU to parse PDF with VLM mode: {file_path}"
                if tier.get("mineru")
                else f"Manual PDF conversion needed: {file_path}"
            ),
            "fallback": (
                "If MinerU fails, use manual conversion (Adobe Acrobat or Google Docs)"
                if tier.get("mineru")
                else None
            ),
            "notes": (
                ["VLM mode best for tables and figures", "Check table accuracy after conversion", "Verify figure descriptions"]
                if tier.get("mineru")
                else [
                    "Options: Adobe Acrobat export, Google Docs OCR, or Tesseract",
                    "Review table formatting",
                    "Check for missing content",
                    "Figures may need manual description"
                ]
            )
        },
        "docx": {
            "tool": "manual",
            "action": "docx-conversion",
            "command": f"Convert DOCX to markdown: {file_path}",
            "notes": ["Use Pandoc or copy/paste content", "Review formatting preservation"]
        },
        "xlsx": {
            "tool": "manual",
            "action": "xlsx-conversion",
            "command": f"Export spreadsheet to text/CSV: {file_path}",
            "notes": ["Export as CSV, then format as markdown tables"]
        },
        "pptx": {
            "tool": "manual",
            "action": "pptx-conversion",
            "command": f"Extract text from presentation: {file_path}",
            "notes": ["Export to text or copy slide content manually"]
        },
        "image": {
            "tool": "manual",
            "action": "ocr",
            "command": f"OCR image to extract text: {file_path}",
            "notes": ["Use Tesseract, Google Lens, or similar OCR tool"]
        },
        "video": {
            "tool": "external",
            "action": "transcription",
            "command": f"Transcribe video: {file_path}",
            "notes": ["Upload to YouTube as unlisted for auto-captions", "Or use Whisper for local transcription"]
        }
    }

    return instructions.get(fmt, {
        "tool": "manual",
        "action": "manual conversion",
        "command": f"Unsupported format - manual conversion needed: {file_path}",
        "notes": ["Convert manually or use external tool"]
    })


def generate_workflow(
    files: List[Dict[str, Any]],
    tier: Dict[str, Any],
    project_path: Path,
    output_dir: str
) -> Dict[str, Any]:
    """Generate processing workflow."""
    inventory = load_or_create_inventory(project_path)
    output_path = project_path / output_dir
    output_path.mkdir(parents=True, exist_ok=True)

    workflow = {
        "tier": tier["tier"],
        "tier_name": tier["name"],
        "input_files": len(files),
        "output_directory": str(output_path),
        "steps": []
    }

    # Group files by format for efficient processing
    by_format: Dict[str, List[Dict[str, Any]]] = {}
    for file in files:
        fmt = file["format"]
        if fmt not in by_format:
            by_format[fmt] = []
        by_format[fmt].append(file)

    step_num = 1

    # Generate steps for each format group
    for fmt, fmt_files in by_format.items():
        tool_info = get_tool_instruction(fmt, tier, fmt_files[0]["path"])

        workflow["steps"].append({
            "step": step_num,
            "format": fmt,
            "file_count": len(fmt_files),
            "tool": tool_info["tool"],
            "action": tool_info["action"],
            "files": [
                {
                    "name": f["name"],
                    "path": f["path"],
                    "size_mb": f["size_mb"],
                    "suggested_id": generate_document_id(inventory["documents"], fmt),
                    "output_name": f"{generate_document_id(inventory['documents'], fmt)}-{Path(f['name']).stem}.md"
                }
                for f in fmt_files
            ],
            "instruction": tool_info["command"],
            "notes": tool_info["notes"],
            "fallback": tool_info.get("fallback")
        })
        step_num += 1

    # Add inventory update step
    workflow["steps"].append({
        "step": step_num,
        "action": "update_inventory",
        "description": "Update data inventory",
        "inventory_path": str(project_path / "stage1-foundation" / "data-inventory.json"),
        "instruction": "After processing each file, add entry to data-inventory.json with conversion details."
    })
    step_num += 1

    # Add quality check step
    workflow["steps"].append({
        "step": step_num,
        "action": "quality_check",
        "description": "Review converted files",
        "instruction": f"""Review all converted files in {output_path}:
- Check transcription accuracy (audio)
- Verify table formatting (PDFs)
- Add speaker labels where needed
- Mark unclear passages"""
    })

    return workflow


def main():
    parser = argparse.ArgumentParser(description="Process documents for qualitative analysis")
    parser.add_argument("--project-path", required=True, help="Path to project root")
    parser.add_argument("--input-dir", help="Directory containing files to process")
    parser.add_argument("--output-dir", default="stage1-foundation/manual-codes",
                        help="Output directory (relative to project)")
    parser.add_argument("--format", default="all",
                        help="Filter by format: audio, pdf, docx, all")
    parser.add_argument("--list", action="store_true",
                        help="Just list files, don't generate workflow")
    args = parser.parse_args()

    # Path traversal protection
    resolved_path = Path(args.project_path).resolve()
    config_target = resolved_path / ".interpretive-orchestration" / "config.json"

    try:
        config_target.relative_to(resolved_path)
    except ValueError:
        print(json.dumps({
            "success": False,
            "error": "Path traversal detected - invalid project path"
        }))
        sys.exit(1)

    # Path traversal protection for output-dir
    resolved_output = resolved_path / args.output_dir
    try:
        resolved_output.relative_to(resolved_path)
    except ValueError:
        print(json.dumps({
            "success": False,
            "error": "Path traversal detected - output directory must be within project path",
            "output_dir": args.output_dir,
            "suggestion": "Use a relative path like 'stage1-foundation/manual-codes'"
        }))
        sys.exit(1)

    if not args.input_dir:
        # Return guidance on using the script
        print(json.dumps({
            "success": True,
            "mode": "guidance",
            "message": "No input directory specified. Here is how to use this script:",
            "usage": {
                "basic": "python process_documents.py --project-path /path/to/project --input-dir /path/to/files",
                "with_filter": "python process_documents.py --project-path /path/to/project --input-dir /path/to/files --format audio",
                "list_only": "python process_documents.py --project-path /path/to/project --input-dir /path/to/files --list"
            },
            "supported_formats": SUPPORTED_FORMATS,
            "detected_tier": detect_tier()
        }, indent=2))
        sys.exit(0)

    # Scan input directory
    input_dir = Path(args.input_dir)
    scan_result = scan_input_directory(input_dir, args.format)

    if "error" in scan_result:
        print(json.dumps({
            "success": False,
            "error": scan_result["error"]
        }))
        sys.exit(1)

    if not scan_result["files"]:
        print(json.dumps({
            "success": True,
            "message": "No supported files found in input directory",
            "input_dir": str(input_dir),
            "format_filter": args.format,
            "supported_formats": SUPPORTED_FORMATS
        }, indent=2))
        sys.exit(0)

    # List mode - just show files
    if args.list:
        by_format = {}
        for f in scan_result["files"]:
            fmt = f["format"]
            by_format[fmt] = by_format.get(fmt, 0) + 1

        print(json.dumps({
            "success": True,
            "mode": "list",
            "input_dir": str(input_dir),
            "files": scan_result["files"],
            "summary": {
                "total": len(scan_result["files"]),
                "by_format": by_format
            }
        }, indent=2))
        sys.exit(0)

    # Generate workflow
    tier = detect_tier()
    workflow = generate_workflow(scan_result["files"], tier, resolved_path, args.output_dir)

    by_format = {}
    for f in scan_result["files"]:
        fmt = f["format"]
        by_format[fmt] = by_format.get(fmt, 0) + 1

    total_size = sum(f["size_mb"] for f in scan_result["files"])

    print(json.dumps({
        "success": True,
        "mode": "workflow",
        "detected_tier": tier,
        "workflow": workflow,
        "summary": {
            "total_files": len(scan_result["files"]),
            "by_format": by_format,
            "total_size_mb": round(total_size, 2)
        },
        "next_action": workflow["steps"][0].get("instruction", "No files to process") if workflow["steps"] else "No steps defined"
    }, indent=2))


if __name__ == "__main__":
    main()
