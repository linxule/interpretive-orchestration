# Saturation Tracker: JavaScript to Python Port

## Overview

Complete port of `saturation-tracker.js` (549 lines) to Python as `saturation_tracker.py` (633 lines).

## Key Features Ported

### 1. Four-Dimensional Saturation Tracking

| Dimension | Weight | Purpose |
|-----------|--------|---------|
| **Code Generation** | 30% | Tracks new codes per document; declining rate signals stabilization |
| **Code Coverage** | 25% | Measures how widely codes apply across corpus; >70% adequate |
| **Refinement Activity** | 25% | Monitors definition changes, splits, merges; fewer recent changes = stability |
| **Conceptual Redundancy** | 20% | Human/AI-assessed repetition score 0-1; >0.85 indicates saturation |

### 2. Core Functions

| Function | Purpose | CLI Flag |
|----------|---------|----------|
| `record_document()` | Track coded document with new code count | `--record-document` |
| `record_refinement()` | Log code changes (split, merge, redefinition) | `--record-refinement` |
| `update_coverage()` | Update coverage statistics from JSON data | `--update-coverage` |
| `update_redundancy()` | Set redundancy score with notes | `--update-redundancy` |
| `assess_saturation()` | Calculate overall saturation level (0-100) | `--assess` |
| `get_status()` | Show current tracking status | `--status` (default) |

### 3. Saturation Levels

| Level | Score Range | Recommendation |
|-------|-------------|----------------|
| **low** | 0-24 | Focus on open coding and memo writing |
| **emerging** | 25-49 | Stay open to new patterns |
| **approaching** | 50-69 | Watch for diminishing returns; write variation memos |
| **high** | 70-89 | Seek negative cases via theoretical sampling |
| **saturated** | 90-100 | Ready for theoretical integration if variation understood |

### 4. Reflexivity Journal Integration

All significant events logged to `.interpretive-orchestration/reflexivity-journal.md`:
- Code generation stabilization
- Code splits (indicating theoretical elaboration)
- High redundancy detection
- Full saturation assessments

## Implementation Differences

### JavaScript Version
- Node.js with CommonJS modules
- Manual argument parsing via `process.argv`
- Synchronous file I/O with `fs`
- ISO date formatting with `Date.toISOString()`

### Python Version
- Python 3.8+ with type hints
- `argparse` for robust CLI parsing
- `pathlib.Path` for cross-platform paths
- `datetime` for ISO timestamps
- Type annotations for clarity

## Usage Examples

### 1. Check Status
```bash
python saturation_tracker.py --project-path /path/to/project --status
```

**Output:**
```json
{
  "success": true,
  "initialized": true,
  "code_generation": {
    "total_codes": 24,
    "documents_tracked": 12,
    "generation_rate": 0.8,
    "stabilized": false
  },
  "refinement": {
    "total_changes": 5,
    "recent_activity": 2,
    "splits_merges": 1
  },
  "redundancy": {
    "score": 0.72,
    "last_assessed": "2025-01-15T14:30:00"
  },
  "saturation": {
    "overall_level": "approaching",
    "last_assessment": "2025-01-15T14:30:00",
    "recommendation": "Emerging saturation patterns..."
  }
}
```

### 2. Record Coded Document
```bash
python saturation_tracker.py --project-path /path/to/project \
  --record-document \
  --doc-id "INT_005" \
  --doc-name "Interview 5" \
  --new-codes 3
```

**Output:**
```json
{
  "success": true,
  "document": "INT_005",
  "new_codes": 3,
  "total_codes": 27,
  "generation_rate": 0.6,
  "stabilized": false,
  "stabilized_at": null
}
```

### 3. Record Code Refinement
```bash
python saturation_tracker.py --project-path /path/to/project \
  --record-refinement \
  --code-id "coping_strategies" \
  --change-type "split" \
  --rationale "Distinct active vs. passive coping mechanisms emerged"
```

**Output:**
```json
{
  "success": true,
  "code_id": "coping_strategies",
  "change_type": "split",
  "total_refinements": 6,
  "split_merge_count": 2,
  "recent_activity": 3
}
```

### 4. Update Redundancy Score
```bash
python saturation_tracker.py --project-path /path/to/project \
  --update-redundancy \
  --score 0.85 \
  --notes "High conceptual repetition; few new insights in last 3 documents"
```

**Output:**
```json
{
  "success": true,
  "redundancy_score": 0.85,
  "threshold": 0.85,
  "above_threshold": true
}
```

### 5. Full Saturation Assessment
```bash
python saturation_tracker.py --project-path /path/to/project --assess
```

**Output:**
```json
{
  "success": true,
  "saturation_level": "high",
  "saturation_score": 75,
  "recommendation": "Approaching saturation. Theoretical sampling: seek cases most different...",
  "evidence": {
    "code_generation_signal": "SLOWING: 0.6 new codes/doc",
    "coverage_signal": "ADEQUATE: 78% of codes have >20% coverage",
    "refinement_signal": "STABLE: 2 changes recently (threshold: 2)",
    "redundancy_signal": "HIGH: 85% redundancy"
  },
  "metrics": {
    "code_generation_rate": 0.6,
    "total_codes": 27,
    "documents_coded": 15,
    "stabilized_at": null,
    "recent_refinements": 2,
    "redundancy_score": 0.85,
    "rare_codes": 2,
    "universal_codes": 5
  }
}
```

### 6. Update Coverage (JSON Input)
```bash
python saturation_tracker.py --project-path /path/to/project \
  --update-coverage \
  --coverage-json '{"coping": {"document_count": 12}, "resilience": {"document_count": 10, "case_count": 8}}'
```

**Output:**
```json
{
  "success": true,
  "total_codes_tracked": 2,
  "rare_codes": 0,
  "universal_codes": 0
}
```

## Scoring Algorithm

### Overall Saturation Score (0-100)

```python
saturation_score = 0

# 1. Code Generation (max 30 points)
if generation_rate < 0.5:           # Stable threshold
    saturation_score += 30
elif generation_rate < 1.0:         # Slowing
    saturation_score += 15
else:                               # Active
    saturation_score += 0

# 2. Coverage (max 25 points)
coverage_ratio = codes_with_adequate_coverage / total_codes
if coverage_ratio >= 0.7:           # Adequate threshold
    saturation_score += 25
else:
    saturation_score += round(coverage_ratio * 15)

# 3. Refinement (max 25 points)
if recent_changes <= 2:             # Stable threshold
    saturation_score += 25
else:
    saturation_score += 5

# 4. Redundancy (max 20 points)
if redundancy_score >= 0.85:        # High threshold
    saturation_score += 20
elif redundancy_score >= 0.595:     # Emerging (0.85 * 0.7)
    saturation_score += 12
else:
    saturation_score += 0
```

## Configuration Storage

All data stored in `.interpretive-orchestration/config.json` under `saturation_tracking`:

```json
{
  "saturation_tracking": {
    "code_generation": {
      "total_codes": 27,
      "codes_by_document": [
        {
          "document_id": "INT_001",
          "document_name": "Interview 1",
          "new_codes_created": 8,
          "timestamp": "2025-01-10T10:00:00"
        }
      ],
      "generation_rate": 0.6,
      "stabilized_at_document": null
    },
    "code_coverage": {
      "coverage_by_code": {
        "coping": {
          "document_count": 12,
          "case_count": 0,
          "coverage_percent": 80.0
        }
      },
      "rare_codes": ["edge_case"],
      "universal_codes": ["resilience", "adaptation"]
    },
    "refinement": {
      "definition_changes": [
        {
          "code_id": "coping_strategies",
          "change_type": "split",
          "old_state": "",
          "new_state": "",
          "rationale": "Distinct mechanisms",
          "timestamp": "2025-01-12T14:00:00"
        }
      ],
      "changes_last_5_documents": 2,
      "split_merge_count": 2
    },
    "redundancy": {
      "redundancy_score": 0.85,
      "last_assessment": "2025-01-15T14:30:00",
      "assessment_notes": "High repetition observed",
      "threshold": 0.85
    },
    "saturation_signals": {
      "overall_level": "high",
      "last_assessment": "2025-01-15T14:30:00",
      "recommendation": "Approaching saturation...",
      "evidence": {
        "code_generation_signal": "SLOWING: 0.6 new codes/doc",
        "coverage_signal": "ADEQUATE: 78%...",
        "refinement_signal": "STABLE: 2 changes...",
        "redundancy_signal": "HIGH: 85% redundancy"
      }
    },
    "thresholds": {
      "code_generation_stable": 0.5,
      "refinement_stable": 2,
      "redundancy_high": 0.85,
      "coverage_adequate": 0.7
    }
  }
}
```

## Testing

### Minimal Test Workflow

```bash
# Create test project structure
mkdir -p /tmp/test-saturation/.interpretive-orchestration

# Initialize minimal config
echo '{"coding_progress": {"documents_coded": 15}}' > /tmp/test-saturation/.interpretive-orchestration/config.json

# Run status (should show uninitialized)
python saturation_tracker.py --project-path /tmp/test-saturation --status

# Record some documents
for i in {1..5}; do
  python saturation_tracker.py --project-path /tmp/test-saturation \
    --record-document --doc-id "INT_00$i" --doc-name "Interview $i" --new-codes $((8 - i))
done

# Record refinement
python saturation_tracker.py --project-path /tmp/test-saturation \
  --record-refinement --code-id "coping" --change-type "split" --rationale "Test split"

# Update redundancy
python saturation_tracker.py --project-path /tmp/test-saturation \
  --update-redundancy --score 0.75 --notes "Moderate redundancy"

# Assess saturation
python saturation_tracker.py --project-path /tmp/test-saturation --assess

# Check final status
python saturation_tracker.py --project-path /tmp/test-saturation --status
```

## Python Requirements

- **Python Version:** 3.8+ (for `typing` support)
- **Standard Library Only:** No external dependencies
  - `argparse` - CLI parsing
  - `json` - Config read/write
  - `datetime` - Timestamps
  - `pathlib` - Cross-platform paths
  - `typing` - Type hints

## Integration Notes

### For qual-methodological-rules Skill

The Python version can be invoked identically to the JavaScript version:

```bash
# JavaScript (original)
node saturation-tracker.js --project-path /path --assess

# Python (port)
python saturation_tracker.py --project-path /path --assess
```

### For StateManager Integration

The script uses direct file I/O but can be wrapped with StateManager:

```python
# Future enhancement: Use StateManager for config operations
from qual_shared.state_manager import StateManager

state = StateManager(project_path)
config = state.get_config()
# ... operations ...
state.save_config(config)
```

Currently uses fallback direct I/O for simplicity and independence.

## Verification

Port verified to match JavaScript functionality:
- ✅ All 6 CLI modes implemented
- ✅ JSON output format identical
- ✅ Saturation scoring algorithm preserved
- ✅ Reflexivity journal logging
- ✅ Error handling for missing config
- ✅ Threshold-based level determination
- ✅ Rolling average calculations
- ✅ Type safety with annotations

## File Locations

- **JavaScript Original:** `/Users/xulelin/Documents/possibilities/qualitative-ai-plugin/plugin/skills/methodological-rules/scripts/saturation-tracker.js`
- **Python Port:** `/Users/xulelin/Documents/possibilities/qualitative-ai-plugin/plugin-kimi/.agents/skills/qual-methodological-rules/scripts/saturation_tracker.py`

---

**Port completed:** 2025-01-15
**Lines:** JS 549 → Python 633 (includes comprehensive docstrings and type hints)
**Dependencies:** Standard library only
**Compatibility:** Drop-in CLI replacement
