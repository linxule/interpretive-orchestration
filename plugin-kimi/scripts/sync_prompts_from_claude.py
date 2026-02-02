#!/usr/bin/env python3
"""
Sync Kimi agent prompts from Claude agent docs with strict word-for-word parity.

Copies the BODY ONLY (frontmatter stripped) from:
  plugin/agents/*.md
to:
  plugin-kimi/.agents/agents/prompts/*.md

Usage:
  python3 plugin-kimi/scripts/sync_prompts_from_claude.py
"""

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CLAUDE_AGENTS = ROOT.parent / "plugin" / "agents"
KIMI_PROMPTS = ROOT / ".agents" / "agents" / "prompts"

MAP = {
    "stage1-listener.md": "stage1-listener.md",
    "dialogical-coder.md": "dialogical-coder.md",
    "research-configurator.md": "research-configurator.md",
    "scholarly-companion.md": "scholarly-companion.md",
}


def strip_frontmatter(text: str) -> str:
    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) == 3:
            body = parts[2]
            if body.startswith("\n"):
                body = body[1:]
            return body
    return text


def main() -> int:
    missing = []
    updated = []

    for src_name, dst_name in MAP.items():
        src_path = CLAUDE_AGENTS / src_name
        dst_path = KIMI_PROMPTS / dst_name

        if not src_path.exists():
            missing.append(str(src_path))
            continue

        body = strip_frontmatter(src_path.read_text())
        dst_path.parent.mkdir(parents=True, exist_ok=True)
        dst_path.write_text(body)
        updated.append(str(dst_path))

    if missing:
        print("Missing source files:")
        for path in missing:
            print(f"- {path}")
        return 1

    print("Updated prompt files:")
    for path in updated:
        print(f"- {path}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
