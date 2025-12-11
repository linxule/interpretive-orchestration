# gioia-methodology

Gioia method data structure building and validation. Helps researchers construct the three-level hierarchy (1st-order concepts, 2nd-order themes, aggregate dimensions) with validation and export capabilities.

## When to Use

Use this skill when:
- User is building or refining their data structure
- User mentions "Gioia", "data structure", "themes", "concepts", "dimensions"
- User needs to validate their analytical hierarchy
- User wants to export their framework for publication
- User asks about 1st-order vs 2nd-order concepts

## The Three-Level Hierarchy

```
AGGREGATE DIMENSIONS (Level 3 - Most Abstract)
    ↑ Researcher theorizes
    │
SECOND-ORDER THEMES (Level 2 - Intermediate)
    ↑ Researcher interprets and groups
    │
FIRST-ORDER CONCEPTS (Level 1 - Most Concrete)
    ↑ Grounded in participant language
```

## Key Principles

1. **1st-Order Concepts** stay close to participant language
   - Use informant terms when possible
   - Example: "I had to do something about it" → NOT "Moral conviction"

2. **2nd-Order Themes** are YOUR interpretive constructions
   - Group related 1st-order concepts
   - Represent YOUR analytical abstraction
   - Example: "Adaptive Routine Building"

3. **Aggregate Dimensions** are theoretical contributions
   - Organize themes into overarching constructs
   - Connect to literature
   - Example: "Managing Chronic Uncertainty"

## Scripts

### validate-structure.js
Validates a Gioia data structure JSON file against the schema.

**Usage:**
```bash
node skills/gioia-methodology/scripts/validate-structure.js \
  --structure-path /path/to/data-structure.json
```

**Checks:**
- Required fields present (id, name, definition)
- Three-level hierarchy maintained
- IDs follow naming convention (AD1_T1_C1)
- Example quotes include document_id and lines

**Returns:** JSON with validation status, errors, and suggestions.

### check-hierarchy.js
Analyzes hierarchy quality and methodological consistency.

**Usage:**
```bash
node skills/gioia-methodology/scripts/check-hierarchy.js \
  --structure-path /path/to/data-structure.json
```

**Analyzes:**
- Concept distribution across themes (warns if <2 or >10 per theme)
- Theme distribution across dimensions (warns if <2 or >5 per dimension)
- Quote coverage (flags concepts without example quotes)
- Abstraction levels (checks if 1st-order concepts are too abstract)

**Returns:** JSON with hierarchy analysis and recommendations.

### export-structure.js
Exports data structure to publication-ready formats.

**Usage:**
```bash
node skills/gioia-methodology/scripts/export-structure.js \
  --structure-path /path/to/data-structure.json \
  --format markdown|table|latex
```

**Formats:**
- `markdown` - Formatted markdown for documentation
- `table` - Tab-separated values for Gioia display table
- `latex` - LaTeX tabular format for academic papers

## Templates

This skill bundles:
- `templates/gioia-structure-guide.md` - Human-readable methodology guide
- `templates/gioia-data-structure-template.json` - Starter template with examples

## Typical Counts

| Stage | Dimensions | Themes | Concepts |
|-------|------------|--------|----------|
| Stage 1 | 2-3 (tentative) | 8-12 | 30-50 |
| Stage 2 | 3-5 | 10-15 | 30-80 |
| Stage 3 | 3-5 (parsimonious) | 10-15 | Consolidated |

## Common Questions

### Q: Can concepts appear under multiple themes?
**Depends on your ontology:**
- Interpretivist: Usually assign to most appropriate theme
- Constructivist: May document multiple interpretations
- Use `/qual-examine-assumptions` if unsure

### Q: How do I know if my structure is complete?
**Signs of saturation:**
- New documents add quotes but not new concepts
- Themes feel stable and coherent
- Theoretical story is clear

### Q: When are 1st-order concepts too abstract?
**Test:** Would a participant recognize this language?
- "I had to do something" ✓ (their words)
- "Moral conviction" ✗ (your interpretation - move to 2nd-order)

## Examples

### Healthcare Example
```
Aggregate Dimension: Managing Chronic Uncertainty
├── Theme: Adaptive Routine Building
│   ├── "Selective symptom tracking"
│   ├── "Personalizing medical advice"
│   └── "Flexible routine adjustment"
└── Theme: Navigating Healthcare Systems
    ├── "Finding doctors who listen"
    └── "Working around insurance barriers"
```

### Organizational Example
```
Aggregate Dimension: Navigating Leadership Paradoxes
├── Theme: Balancing Authenticity and Performance
│   ├── "Being yourself while playing the role"
│   ├── "Strategic vulnerability"
│   └── "Authentic but bounded"
└── Theme: Managing Competing Demands
    ├── "Satisficing across stakeholders"
    └── "Prioritizing without alienating"
```

## Integration Points

- **@dialogical-coder** applies the data structure during coding
- **project-dashboard** skill shows concept/theme/dimension counts
- **deep-reasoning** skill helps with hierarchy decisions

## Related

- **Commands:** Structure referenced by all coding commands
- **Agents:** @dialogical-coder uses structure for systematic coding
- **Templates:** Moved from templates/ directory
- **Other Skills:** project-setup creates initial structure file
