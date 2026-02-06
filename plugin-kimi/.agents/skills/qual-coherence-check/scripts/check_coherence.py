#!/usr/bin/env python3
"""
check_coherence.py
Deep examination of philosophical coherence between declared stance and practice.

Usage:
    python3 check_coherence.py --project-path /path/to/project
    python3 check_coherence.py --project-path /path/to/project --text "analysis revealed that..."
    python3 check_coherence.py --project-path /path/to/project --recent-activity
    python3 check_coherence.py --project-path /path/to/project --full-report
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

# Import qual-shared infrastructure
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "qual-shared" / "scripts"))
try:
    from state_manager import StateManager
except ImportError:
    StateManager = None


# Language patterns for different stances
LANGUAGE_PATTERNS: Dict[str, Dict[str, List[str]]] = {
    "constructivist": {
        "preferred": [
            "construct", "interpret", "characterize", "build", "develop",
            "co-create", "meaning-making", "understanding", "sense-making",
            "perspective", "view", "conceptualize", "frame",
        ],
        "avoid": [
            "discover", "find", "uncover", "reveal", "extract",
            "identify objectively", "determine", "prove", "demonstrate objectively",
            "the truth", "the reality", "actually means",
        ],
    },
    "interpretivist": {
        "preferred": [
            "interpret", "understand", "make sense", "meaning",
            "perspective", "experience", "perception", "context",
        ],
        "avoid": [
            "discover", "prove", "objective truth", "demonstrate causally",
            "verify", "the facts",
        ],
    },
    "objectivist": {
        "preferred": [
            "discover", "find", "identify", "reveal", "uncover",
            "determine", "verify", "demonstrate", "prove",
        ],
        "avoid": [
            "construct", "co-create", "subjective", "multiple truths",
        ],
    },
    "critical_realist": {
        "preferred": [
            "uncover", "reveal", "understand mechanisms", "underlying",
            "real structures", "causal powers", "tendencies",
        ],
        "avoid": [
            "purely construct", "no reality", "all relative",
        ],
    },
}

# AI relationship patterns
AI_RELATIONSHIP_PATTERNS: Dict[str, Dict[str, List[str]]] = {
    "epistemic_partner": {
        "coherent": [
            "question", "dialogue", "challenge", "explore together",
            "what do you think", "help me think through", "discuss",
        ],
        "tension": [
            "just do", "give me the answer", "code this for me",
            "accept all", "don't question",
        ],
    },
    "interpretive_aid": {
        "coherent": [
            "organize", "structure", "help me see", "identify patterns",
            "my interpretation", "what I think",
        ],
        "tension": [
            "what does this mean", "interpret for me", "you decide",
        ],
    },
    "coding_tool": {
        "coherent": [
            "apply my codes", "use my framework", "follow my structure",
            "according to my categories",
        ],
        "tension": [
            "create codes", "suggest categories", "develop themes",
        ],
    },
}

# Technical exceptions - these don't indicate stance
TECHNICAL_EXCEPTIONS: List[str] = [
    "find file", "find the file", "find document",
    "identify error", "identify bug", "identify issue",
    "discover cause", "discover bug", "reveal error",
    "extract file", "extract from archive",
]


def read_config(project_path: Path) -> Optional[Dict[str, Any]]:
    """
    Read raw project config for philosophical stance data.

    Note: We read the raw config.json rather than using StateManager because
    coherence checking requires the nested philosophical_stance structure
    which StateManager's ProjectState dataclass does not expose.

    Args:
        project_path: Path to project directory

    Returns:
        dict: Raw config data, or None if not found
    """
    config_path = project_path / ".interpretive-orchestration" / "config.json"
    if not config_path.exists():
        return None
    try:
        with open(config_path, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return None


def read_recent_activity(project_path: Path, count: int = 20) -> List[Dict[str, Any]]:
    """
    Read recent conversation log entries.

    Args:
        project_path: Path to project directory
        count: Number of recent entries to return

    Returns:
        list: Recent activity log entries
    """
    log_path = project_path / ".interpretive-orchestration" / "conversation-log.jsonl"
    if not log_path.exists():
        return []

    logs: List[Dict[str, Any]] = []
    try:
        with open(log_path, "r") as f:
            lines = [line.strip() for line in f if line.strip()]

        for line in lines[-count:]:
            try:
                logs.append(json.loads(line))
            except json.JSONDecodeError:
                pass
    except IOError:
        pass

    return logs


def is_technical_context(text: str) -> bool:
    """
    Check if text is in a technical context where stance language is irrelevant.

    Args:
        text: Text to check

    Returns:
        bool: True if technical context detected
    """
    lower_text = text.lower()
    return any(exc in lower_text for exc in TECHNICAL_EXCEPTIONS)


def analyze_language_coherence(text: str, stance: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyze text for language coherence with declared philosophical stance.

    Args:
        text: Text to analyze
        stance: Philosophical stance configuration

    Returns:
        dict: Analysis results with coherent, tensions, and suggestions
    """
    results: Dict[str, Any] = {"coherent": [], "tensions": [], "suggestions": []}

    if not text or not stance:
        return results

    if is_technical_context(text):
        results["note"] = "Technical context detected - language check skipped"
        return results

    lower_text = text.lower()
    vocabulary_mode = stance.get("vocabulary_mode", "constructivist")
    ontology = stance.get("ontology", "interpretivist")

    patterns = LANGUAGE_PATTERNS.get(vocabulary_mode) or LANGUAGE_PATTERNS.get(ontology)
    if not patterns:
        patterns = LANGUAGE_PATTERNS["constructivist"]

    for word in patterns["preferred"]:
        if word.lower() in lower_text:
            results["coherent"].append({
                "word": word,
                "context": f"Aligns with {vocabulary_mode} stance",
            })

    for word in patterns["avoid"]:
        if word.lower() in lower_text:
            alternative = patterns["preferred"][0] if patterns["preferred"] else "consider rephrasing"
            results["tensions"].append({
                "word": word,
                "stance": vocabulary_mode,
                "suggestion": f'Consider using "{alternative}" instead of "{word}"',
            })

    if results["tensions"]:
        results["suggestions"].extend([
            f"Your {vocabulary_mode} stance suggests avoiding objectivist language",
            "This may be intentional (hybrid stance) or a slip to examine",
        ])

    return results


def analyze_ai_relationship(activity: List[Dict[str, Any]], declared_relationship: str) -> Dict[str, Any]:
    """
    Analyze AI interaction patterns against declared relationship.

    Args:
        activity: Recent conversation activity entries
        declared_relationship: Declared AI relationship type

    Returns:
        dict: Analysis results with coherent and tension patterns
    """
    results: Dict[str, Any] = {"coherent": [], "tensions": [], "suggestions": []}

    if not activity or not declared_relationship:
        return results

    patterns = AI_RELATIONSHIP_PATTERNS.get(declared_relationship)
    if not patterns:
        return results

    activity_text = json.dumps(activity).lower()

    for pattern in patterns["coherent"]:
        if pattern.lower() in activity_text:
            results["coherent"].append({
                "pattern": pattern,
                "context": f'Aligns with "{declared_relationship}" relationship',
            })

    for pattern in patterns["tension"]:
        if pattern.lower() in activity_text:
            results["tensions"].append({
                "pattern": pattern,
                "relationship": declared_relationship,
                "suggestion": f'This may not align with your "{declared_relationship}" stance',
            })

    return results


def generate_full_report(
    config: Dict[str, Any],
    recent_activity: Optional[List[Dict[str, Any]]],
    text_to_analyze: Optional[str],
) -> Dict[str, Any]:
    """
    Generate comprehensive coherence report.

    Args:
        config: Project configuration
        recent_activity: Recent conversation log entries
        text_to_analyze: Optional text for language analysis

    Returns:
        dict: Full coherence report
    """
    phil_stance = config.get("philosophical_stance", {})

    report: Dict[str, Any] = {
        "stance_declared": {
            "ontology": phil_stance.get("ontology", "not specified"),
            "epistemology": phil_stance.get("epistemology", "not specified"),
            "tradition": phil_stance.get("tradition", "not specified"),
            "ai_relationship": phil_stance.get("ai_relationship", "not specified"),
            "vocabulary_mode": phil_stance.get("vocabulary_mode", "constructivist"),
        },
        "coherent_aspects": [],
        "tensions_detected": [],
        "recommendations": [],
        "reflexive_prompts": [],
    }

    if text_to_analyze:
        lang_results = analyze_language_coherence(text_to_analyze, phil_stance)

        report["coherent_aspects"].extend([
            {"type": "language", "detail": f'Used "{c["word"]}" - {c["context"]}'}
            for c in lang_results["coherent"]
        ])
        report["tensions_detected"].extend([
            {"type": "language", "detail": f'Used "{t["word"]}" which conflicts with {t["stance"]} stance', "suggestion": t["suggestion"]}
            for t in lang_results["tensions"]
        ])
        if lang_results.get("note"):
            report["notes"] = [lang_results["note"]]

    if recent_activity:
        combined_text = " ".join(a.get("message", a.get("content", "")) for a in recent_activity)
        activity_lang = analyze_language_coherence(combined_text, phil_stance)

        if activity_lang["tensions"]:
            report["tensions_detected"].append({
                "type": "recent_activity_language",
                "detail": f'{len(activity_lang["tensions"])} language inconsistencies in recent activity',
                "examples": activity_lang["tensions"][:3],
            })

        ai_results = analyze_ai_relationship(recent_activity, phil_stance.get("ai_relationship"))

        report["coherent_aspects"].extend([
            {"type": "ai_relationship", "detail": c["context"]}
            for c in ai_results["coherent"]
        ])
        report["tensions_detected"].extend([
            {"type": "ai_relationship", "detail": t["suggestion"]}
            for t in ai_results["tensions"]
        ])

    tradition = phil_stance.get("tradition")
    stage1_complete = config.get("sandwich_status", {}).get("stage1_complete")

    if tradition in ("gioia_corley", "gioia_hybrid") and stage1_complete:
        report["coherent_aspects"].append({
            "type": "method",
            "detail": "Stage 1 foundation complete - aligns with Gioia emphasis on human groundwork",
        })

    if report["tensions_detected"]:
        report["recommendations"] = [
            "Review your philosophical stance declaration in config.json",
            "Consider whether language shifts reflect evolving understanding",
            "Document any intentional stance changes in your reflexivity journal",
        ]
    else:
        report["recommendations"] = [
            "Continue maintaining philosophical coherence",
            "Periodically revisit this check as analysis deepens",
        ]

    report["reflexive_prompts"] = [
        "How has your understanding of your stance evolved since starting?",
        "Are there aspects of your approach that feel inconsistent?",
        "What would you lose if you shifted to a different stance?",
        "How is your position as researcher shaping your interpretations?",
    ]

    report["summary"] = {
        "coherent_count": len(report["coherent_aspects"]),
        "tension_count": len(report["tensions_detected"]),
        "overall": (
            "Philosophical coherence maintained" if not report["tensions_detected"]
            else "Minor tensions detected - worth examining" if len(report["tensions_detected"]) <= 2
            else "Multiple tensions detected - consider reflection"
        ),
    }

    return report


def main() -> int:
    """CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Check philosophical coherence"
    )
    parser.add_argument(
        "--project-path",
        type=str,
        required=True,
        help="Path to qualitative project root",
    )
    parser.add_argument(
        "--text",
        type=str,
        help="Text to analyze for language coherence",
    )
    parser.add_argument(
        "--recent-activity",
        action="store_true",
        help="Analyze recent conversation log",
    )
    parser.add_argument(
        "--full-report",
        action="store_true",
        help="Generate comprehensive report",
    )

    args = parser.parse_args()

    # Path traversal protection
    resolved_path = Path(args.project_path).resolve()
    config_target = resolved_path / ".interpretive-orchestration" / "config.json"
    try:
        config_target.resolve().relative_to(resolved_path)
    except ValueError:
        print(json.dumps({
            "success": False,
            "error": "Path traversal detected - invalid project path",
        }), file=sys.stderr)
        return 1

    config = read_config(resolved_path)

    if not config:
        print(json.dumps({
            "success": False,
            "error": "Project not initialized",
            "suggestion": "Run qual-init to initialize your project",
        }), file=sys.stderr)
        return 1

    recent_activity = None
    if args.recent_activity or args.full_report:
        recent_activity = read_recent_activity(resolved_path)

    report = generate_full_report(config, recent_activity, args.text)

    print(json.dumps({"success": True, **report}, indent=2))

    return 1 if len(report["tensions_detected"]) > 3 else 0


if __name__ == "__main__":
    sys.exit(main())
