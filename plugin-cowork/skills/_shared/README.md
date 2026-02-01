# Shared State I/O Scripts

These scripts provide deterministic state management across all skills. They ensure Claude can reliably read and write project configuration without guessing.

## Scripts

### read-config.js
Reads the current project configuration.

```bash
node read-config.js --project-path /path/to/project
```

Returns full config.json content plus a summary with key fields.

### update-progress.js
Updates stage/document/memo counts with atomic write protection.

```bash
# Set document count
node update-progress.js --project-path /path/to/project --documents-coded 12

# Increment counts
node update-progress.js --project-path /path/to/project --increment-documents --increment-memos

# Mark Stage 1 complete
node update-progress.js --project-path /path/to/project --stage1-complete

# Update Stage 2 phase
node update-progress.js --project-path /path/to/project --phase phase1_parallel_streams=complete
```

### append-log.js
Writes entries to conversation-log.jsonl for AI-to-AI transparency.

```bash
node append-log.js --project-path /path/to/project \
  --agent dialogical-coder \
  --action coding \
  --content "Applied code 'Selective tracking' to quote on lines 45-48" \
  --document-id P003 \
  --concept-id AD1_T1_C1
```

### query-status.js
Returns comprehensive project status for dashboards.

```bash
node query-status.js --project-path /path/to/project
```

Returns progress percentages, readiness indicators, and recommendations.

## Design Principles

### Atomic Writes
All write operations use temp file + rename pattern to prevent corruption:
```javascript
fs.writeFileSync(tempPath, content);
fs.renameSync(tempPath, filePath);
```

### Path Guards
Scripts only touch files within `.interpretive-orchestration/` directory.

### Normalized Output
All scripts return consistent JSON with:
- `success`: boolean
- `error`: string (if failure)
- Additional fields specific to each script

### Exit Codes
- `0` = success
- `1` = failure

## Usage from Skills

Skills can call these scripts directly or reference them in instructions:

```markdown
## Before Coding

Run the state check:
\`\`\`bash
node skills/_shared/scripts/read-config.js --project-path .
\`\`\`

Verify `stage1_complete: true` before proceeding.
```

## Integration

These scripts are designed to be called by:
- Other skill scripts
- Claude directly via Bash tool
- Hooks for validation
