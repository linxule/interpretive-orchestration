#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "rich>=13.0.0",
# ]
# ///
"""
viz_dashboard.py
CLI visualization suite for methodological status

Provides visual dashboards for:
- Saturation tracking (sparkline charts, indicators)
- Rule status (active rules, strain levels)
- Workspace branches (tree view)
- Overall project status (combined view)

Usage:
    python3 viz_dashboard.py --project-path /path/to/project --view saturation
    python3 viz_dashboard.py --project-path /path/to/project --view rules
    python3 viz_dashboard.py --project-path /path/to/project --view branches
    python3 viz_dashboard.py --project-path /path/to/project --view all
    python3 viz_dashboard.py --project-path /path/to/project --mermaid lineage
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Dict, List, Optional, Any

try:
    from rich.console import Console
    from rich.panel import Panel
    from rich.table import Table
    from rich.tree import Tree
    from rich.layout import Layout
    from rich.text import Text
    from rich.progress import BarColumn, Progress
    from rich import box
except ImportError:
    print("""
Error: 'rich' library not installed.

Install with uv:
    cd plugin-kimi/.agents && uv pip install -r requirements.txt

Or with pip:
    pip3 install rich>=13.0.0

Or run with uv (auto-installs dependencies):
    uv run viz_dashboard.py --project-path /path/to/project
""", file=sys.stderr)
    sys.exit(1)

# Import check_phase for phase detection
from check_phase import get_current_phase


def load_config(project_path: Path) -> Optional[Dict[str, Any]]:
    """Load project configuration from .interpretive-orchestration/config.json"""
    config_path = project_path / '.interpretive-orchestration' / 'config.json'
    if not config_path.exists():
        return None

    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        console = Console(stderr=True)
        console.print(f"[red]Failed to load config: {str(e)}[/red]")
        return None


def create_sparkline(data: List[int], max_val: int = None, width: int = 10) -> str:
    """
    Create ASCII sparkline chart

    Args:
        data: List of integer values
        max_val: Maximum value for scaling (auto-detected if None)
        width: Number of characters wide

    Returns:
        ASCII sparkline string
    """
    if not data:
        return ' ' * width

    # Take last N values
    recent = data[-width:] if len(data) > width else data
    if not recent:
        return ' ' * width

    max_val = max_val or max(recent) or 1
    bars = '▁▂▃▄▅▆▇█'

    result = []
    for val in recent:
        if val == 0:
            result.append(' ')
        else:
            index = int((val / max_val) * (len(bars) - 1))
            result.append(bars[min(index, len(bars) - 1)])

    # Pad if needed
    while len(result) < width:
        result.insert(0, ' ')

    return ''.join(result)


def create_progress_bar(value: float, max_val: float, width: int = 20) -> str:
    """
    Create text-based progress bar

    Args:
        value: Current value
        max_val: Maximum value
        width: Width in characters

    Returns:
        Progress bar string
    """
    filled = int((value / max_val) * width)
    empty = width - filled
    return '█' * filled + '░' * empty


def viz_saturation(config: Dict[str, Any], console: Console) -> Panel:
    """
    Visualize saturation tracking

    Args:
        config: Project configuration
        console: Rich console instance

    Returns:
        Rich Panel with saturation visualization
    """
    tracking = config.get('saturation_tracking')

    if not tracking:
        return Panel(
            "Not initialized. Record your first document to begin tracking.",
            title="[bold cyan]SATURATION TRACKING[/bold cyan]",
            border_style="cyan"
        )

    # Build content
    lines = []

    # Header
    level = tracking.get('saturation_signals', {}).get('overall_level', 'unknown')
    level_indicators = {
        'low': '○○○○○',
        'emerging': '●○○○○',
        'approaching': '●●○○○',
        'high': '●●●○○',
        'saturated': '●●●●●'
    }
    level_emoji = level_indicators.get(level, '?????')

    lines.append(f"[bold]Saturation Level:[/bold] {level.upper()} {level_emoji}")
    lines.append("")

    # Code Generation Rate Chart
    lines.append("[bold yellow]CODE GENERATION[/bold yellow] (new codes per document)")
    codes_by_doc = tracking.get('code_generation', {}).get('codes_by_document', [])

    if codes_by_doc:
        recent = codes_by_doc[-10:]
        new_codes = [d['new_codes_created'] for d in recent]
        max_codes = max(new_codes) if new_codes else 1

        # Draw bar chart (4 rows)
        chart_height = 4
        for row in range(chart_height, 0, -1):
            threshold = (row / chart_height) * max_codes
            chart_line = '  '
            for code_count in new_codes:
                chart_line += '█ ' if code_count >= threshold else '  '

            if row == chart_height:
                chart_line += f' {max_codes}'
            lines.append(chart_line)

        # Baseline
        lines.append('  ' + '──' * len(recent) + ' 0')
        lines.append('  ' + ''.join(f'{i+1:2d}' for i in range(len(recent))))

        gen_rate = tracking['code_generation'].get('generation_rate', 0)
        total_codes = tracking['code_generation'].get('total_codes', 0)
        lines.append(f"  Rate: {gen_rate}/doc | Total: {total_codes}")

        if tracking['code_generation'].get('stabilized_at_document'):
            lines.append(f"  ✓ Stabilized at: {tracking['code_generation']['stabilized_at_document']}")
    else:
        lines.append("  No documents tracked yet")

    lines.append("")

    # Refinement Activity
    lines.append("[bold yellow]REFINEMENT ACTIVITY[/bold yellow]")
    refinement = tracking.get('refinement', {})
    lines.append(f"  Recent changes: {refinement.get('changes_last_5_documents', 0)}")
    lines.append(f"  Splits/merges: {refinement.get('split_merge_count', 0)}")

    lines.append("")

    # Redundancy Score
    lines.append("[bold yellow]REDUNDANCY[/bold yellow]")
    redundancy = tracking.get('redundancy', {})
    red_score = redundancy.get('redundancy_score', 0)
    progress_bar = create_progress_bar(red_score, 1, 15)
    lines.append(f"  Score: {progress_bar} {int(red_score * 100)}%")

    if redundancy.get('assessment_notes'):
        notes = redundancy['assessment_notes'][:40]
        if len(redundancy['assessment_notes']) > 40:
            notes += '...'
        lines.append(f"  Notes: {notes}")

    lines.append("")

    # Recommendation
    if tracking.get('saturation_signals', {}).get('recommendation'):
        lines.append("[bold yellow]RECOMMENDATION[/bold yellow]")
        rec = tracking['saturation_signals']['recommendation']

        # Word wrap
        words = rec.split(' ')
        line = '  '
        for word in words:
            if len(line) + len(word) > 55:
                lines.append(line)
                line = '  ' + word + ' '
            else:
                line += word + ' '
        if line.strip():
            lines.append(line)

    content = '\n'.join(lines)

    return Panel(
        content,
        title="[bold cyan]SATURATION TRACKING[/bold cyan]",
        border_style="cyan",
        expand=False
    )


def viz_rules(config: Dict[str, Any], console: Console) -> Panel:
    """
    Visualize methodological rules status

    Args:
        config: Project configuration
        console: Rich console instance

    Returns:
        Rich Panel with rules visualization
    """
    research = config.get('research_design', {})
    isolation = research.get('isolation_config', {})
    strain = research.get('strain_tracking', {})

    lines = []

    # Phase info
    phase = get_current_phase(config.get('sandwich_status'))
    lines.append(f"[bold]Current Phase:[/bold] {phase}")
    lines.append("")

    # Create table for rules
    table = Table(show_header=True, header_style="bold magenta", box=box.SIMPLE)
    table.add_column("Rule", style="cyan", width=16)
    table.add_column("Status", width=8)
    table.add_column("Friction", width=10)
    table.add_column("Relaxes At", width=15)

    rules = [
        {'id': 'case-isolation', 'name': 'Case Isolation', 'config': isolation.get('case_isolation')},
        {'id': 'wave-isolation', 'name': 'Wave Isolation', 'config': isolation.get('wave_isolation')},
        {'id': 'stream-separation', 'name': 'Stream Sep.', 'config': isolation.get('stream_separation')}
    ]

    has_overrides = False
    for rule in rules:
        cfg = rule['config'] or {}
        enabled = cfg.get('enabled', False) is not False
        friction = cfg.get('friction_level', 'nudge')
        relaxes_at = cfg.get('relaxes_at', 'manual')

        # Check if strained
        override_count = strain.get('override_counts', {}).get(rule['id'], {}).get('count', 0)
        is_strained = override_count >= strain.get('strain_threshold', 3)

        status_icon = '●' if enabled else '○'
        status_text = 'Active'
        status_style = 'green'

        if is_strained:
            status_icon = '⚠'
            status_text = 'STRAIN'
            status_style = 'yellow'
        elif not enabled:
            status_text = 'Off'
            status_style = 'dim'

        table.add_row(
            rule['name'],
            f"[{status_style}]{status_icon} {status_text}[/{status_style}]",
            friction,
            relaxes_at[:15]
        )

        if override_count > 0:
            has_overrides = True

    # Render table to string
    from io import StringIO
    table_console = Console(file=StringIO(), width=60)
    table_console.print(table)
    table_str = table_console.file.getvalue()

    lines.append("[bold yellow]ISOLATION RULES[/bold yellow]")
    lines.append(table_str)

    # Strain summary
    if strain.get('strained_rules'):
        lines.append("")
        lines.append("[bold yellow]⚠ STRAIN DETECTED[/bold yellow]")
        lines.append(f"Rules: {', '.join(strain['strained_rules'])}")
        lines.append("Run strain_check.py for review prompts")

    # Methodology preset
    if research.get('methodology_preset'):
        lines.append("")
        lines.append(f"[bold]Methodology:[/bold] {research['methodology_preset']}")

    content = '\n'.join(lines)

    return Panel(
        content,
        title="[bold magenta]METHODOLOGICAL RULES[/bold magenta]",
        border_style="magenta",
        expand=False
    )


def viz_branches(config: Dict[str, Any], console: Console) -> Panel:
    """
    Visualize workspace branches

    Args:
        config: Project configuration
        console: Rich console instance

    Returns:
        Rich Panel with branch tree
    """
    branches = config.get('workspace_branches')

    if not branches or len(branches.get('branches', [])) <= 1:
        return Panel(
            "Single branch (main). Use --fork to explore alternatives.",
            title="[bold green]WORKSPACE BRANCHES[/bold green]",
            border_style="green"
        )

    lines = []
    current = branches.get('current_branch', 'main')
    lines.append(f"[bold]Current:[/bold] {current}")
    lines.append("")
    lines.append("[bold yellow]BRANCH TREE[/bold yellow]")

    # Build tree structure
    by_parent = {}
    for branch in branches.get('branches', []):
        parent = branch.get('parent_branch') or 'root'
        if parent not in by_parent:
            by_parent[parent] = []
        by_parent[parent].append(branch)

    # Render tree
    def render_tree(branch_id: str, indent: str = '') -> List[str]:
        """Recursively render branch tree"""
        result = []
        children = by_parent.get(branch_id, [])

        for i, branch in enumerate(children):
            is_last = i == len(children) - 1
            prefix = '└──' if is_last else '├──'
            child_indent = indent + ('   ' if is_last else '│  ')

            status_icons = {
                'merged': '✓',
                'abandoned': '✗'
            }

            is_current = branch['id'] == current
            status_icon = '●' if is_current else '○'
            if branch.get('status') in status_icons:
                status_icon = status_icons[branch['status']]

            framing = ''
            if branch.get('methodological_framing'):
                framing = f" [{branch['methodological_framing']}]"

            result.append(f"{indent}{prefix} {status_icon} {branch['name']}{framing}")
            result.extend(render_tree(branch['id'], child_indent))

        return result

    # Find main branch
    main_branch = None
    for branch in branches.get('branches', []):
        if branch.get('id') == 'main':
            main_branch = branch
            break

    if main_branch:
        lines.append(f"● {main_branch['name']} (main)")
        lines.extend(render_tree('main', ''))

    lines.append("")

    # Stats
    all_branches = branches.get('branches', [])
    active = sum(1 for b in all_branches if b.get('status') == 'active')
    merged = sum(1 for b in all_branches if b.get('status') == 'merged')
    abandoned = sum(1 for b in all_branches if b.get('status') == 'abandoned')

    lines.append(f"Active: {active} | Merged: {merged} | Abandoned: {abandoned}")

    content = '\n'.join(lines)

    return Panel(
        content,
        title="[bold green]WORKSPACE BRANCHES[/bold green]",
        border_style="green",
        expand=False
    )


def viz_all(config: Dict[str, Any], console: Console) -> None:
    """
    Display combined dashboard with all views

    Args:
        config: Project configuration
        console: Rich console instance
    """
    # Header
    project_name = config.get('project_info', {}).get('name', 'Unnamed Project')

    # Create title panel
    title_text = Text()
    title_text.append(project_name, style="bold cyan")
    title_text.append("\n")
    title_text.append("Interpretive Orchestration Dashboard", style="dim")

    title_panel = Panel(
        title_text,
        box=box.DOUBLE,
        border_style="cyan",
        expand=False
    )

    console.print()
    console.print(title_panel)
    console.print()

    # Stage progress bar
    sandwich = config.get('sandwich_status', {})
    stage = sandwich.get('current_stage', 'unknown')

    if '1' in stage:
        stage_num = 1
        stage_name = 'Foundation'
    elif '3' in stage:
        stage_num = 3
        stage_name = 'Synthesis'
    else:
        stage_num = 2
        stage_name = 'Collaboration'

    progress_text = Text("Stage Progress: ")
    progress_text.append('●' if stage_num >= 1 else '○', style="cyan" if stage_num >= 1 else "dim")
    progress_text.append('─')
    progress_text.append('●' if stage_num >= 2 else '○', style="cyan" if stage_num >= 2 else "dim")
    progress_text.append('─')
    progress_text.append('●' if stage_num >= 3 else '○', style="cyan" if stage_num >= 3 else "dim")
    progress_text.append(f'  [{stage_name}]', style="dim")

    console.print(progress_text)
    console.print()

    # Three panels stacked
    console.print(viz_saturation(config, console))
    console.print()
    console.print(viz_rules(config, console))
    console.print()
    console.print(viz_branches(config, console))


def mermaid_code_lineage(config: Dict[str, Any]) -> str:
    """
    Generate Mermaid diagram for code lineage

    Args:
        config: Project configuration

    Returns:
        Mermaid diagram as string
    """
    tracking = config.get('saturation_tracking', {})
    data_structure = config.get('data_structure', {})

    lines = ['```mermaid', 'flowchart TD']
    lines.append('  subgraph "Data Structure"')

    # Aggregate dimensions
    if data_structure.get('aggregate_dimensions'):
        for dim in data_structure['aggregate_dimensions']:
            lines.append(f'    AD_{dim["id"]}["{dim["name"]}"]')

    # Second-order themes
    if data_structure.get('second_order_themes'):
        for theme in data_structure['second_order_themes']:
            lines.append(f'    SOT_{theme["id"]}["{theme["name"]}"]')
            if theme.get('parent_dimension'):
                lines.append(f'    SOT_{theme["id"]} --> AD_{theme["parent_dimension"]}')

    # First-order concepts
    if data_structure.get('first_order_concepts'):
        for concept in data_structure['first_order_concepts']:
            lines.append(f'    FOC_{concept["id"]}["{concept["name"]}"]')
            if concept.get('parent_theme'):
                lines.append(f'    FOC_{concept["id"]} --> SOT_{concept["parent_theme"]}')

    lines.append('  end')

    # Recent refinements
    refinements = tracking.get('refinement', {}).get('definition_changes', [])
    if refinements:
        lines.append('  subgraph "Recent Refinements"')
        recent = refinements[-5:]
        for i, change in enumerate(recent):
            icon = '↗' if change['change_type'] == 'split' else '↘' if change['change_type'] == 'merge' else '→'
            lines.append(f'    REF_{i}["{change["code_id"]}: {change["change_type"]}"]')
        lines.append('  end')

    lines.append('```')

    return '\n'.join(lines)


def mermaid_branch_tree(config: Dict[str, Any]) -> str:
    """
    Generate Mermaid diagram for branch tree

    Args:
        config: Project configuration

    Returns:
        Mermaid diagram as string
    """
    branches = config.get('workspace_branches')

    if not branches:
        return '```mermaid\ngraph TD\n  main["Main Analysis"]\n```'

    lines = ['```mermaid', 'graph TD']

    for branch in branches.get('branches', []):
        status = ''
        if branch.get('status') == 'merged':
            status = '✓'
        elif branch.get('status') == 'abandoned':
            status = '✗'

        lines.append(f'  {branch["id"]}["{branch["name"]} {status}"]')

        if branch.get('parent_branch'):
            lines.append(f'  {branch["parent_branch"]} --> {branch["id"]}')

    lines.append('```')
    return '\n'.join(lines)


def main() -> int:
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description='CLI visualization suite for methodological status',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --project-path /path/to/project --view saturation
  %(prog)s --project-path /path/to/project --view rules
  %(prog)s --project-path /path/to/project --view branches
  %(prog)s --project-path /path/to/project --view all
  %(prog)s --project-path /path/to/project --mermaid lineage
  %(prog)s --project-path /path/to/project --mermaid branches
        """
    )

    parser.add_argument(
        '--project-path',
        type=Path,
        required=True,
        help='Path to project directory'
    )

    parser.add_argument(
        '--view',
        choices=['saturation', 'rules', 'branches', 'all'],
        default='all',
        help='Which dashboard view to display (default: all)'
    )

    parser.add_argument(
        '--mermaid',
        choices=['lineage', 'branches'],
        help='Export Mermaid diagram instead of dashboard'
    )

    args = parser.parse_args()

    project_path = args.project_path.resolve()
    config = load_config(project_path)

    if not config:
        console = Console(stderr=True)
        console.print("[red]Config not found. Run /qual-init first.[/red]")
        return 1

    console = Console()

    # Handle mermaid export
    if args.mermaid:
        if args.mermaid == 'lineage':
            print(mermaid_code_lineage(config))
        elif args.mermaid == 'branches':
            print(mermaid_branch_tree(config))
        return 0

    # Handle dashboard views
    if args.view == 'saturation':
        console.print(viz_saturation(config, console))
    elif args.view == 'rules':
        console.print(viz_rules(config, console))
    elif args.view == 'branches':
        console.print(viz_branches(config, console))
    elif args.view == 'all':
        viz_all(config, console)

    return 0


if __name__ == '__main__':
    sys.exit(main())
