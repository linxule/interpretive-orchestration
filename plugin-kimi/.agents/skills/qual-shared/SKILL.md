---
name: qual-shared
description: Shared infrastructure for Interpretive Orchestration. Provides state management, configuration I/O, batched file operations, and enforcement utilities for qualitative research projects. Use when working with .interpretive-orchestration/config.json, checking stage completion, updating progress, or validating project setup.
---

# qual-shared: Shared Infrastructure

This skill provides shared utilities for the Interpretive Orchestration plugin system. All other qual-* skills depend on these components.

## Components

### StateManager

Single source of truth for project state with optimistic locking.

```python
from state_manager import StateManager, ProjectState

state_mgr = StateManager("/path/to/project")
state = state_mgr.load()
state.documents_coded += 1
state_mgr.save(state)
```

### ReasoningBuffer

Batched file writes for 4-stage reasoning logs.

```python
from reasoning_buffer import ReasoningBuffer

buf = ReasoningBuffer("/path/to/project")
buf.add("doc_001", reasoning_dict)
buf.flush()
```

### DefensiveSkillRouter

Enforces stage requirements on every skill entry.

```python
from defensive_router import DefensiveSkillRouter

router = DefensiveSkillRouter("/path/to/project")
result = router.route("qual-coding")
```

### ConversationLogger

Hybrid JSONL + Markdown logging.

```python
from conversation_logger import ConversationLogger

logger = ConversationLogger("/path/to/project")
logger.log(event_dict)
```

## Project Structure

```
project/
├── .interpretive-orchestration/
│   ├── config.json
│   ├── conversation-log.jsonl
│   ├── conversation-log.md
│   └── reflexivity-journal.md
├── .kimi/reasoning/
├── stage1-foundation/
├── stage2-collaboration/
└── stage3-synthesis/
```

## Scripts

- `state_manager.py` — State I/O
- `reasoning_buffer.py` — Batched logs
- `defensive_router.py` — Stage enforcement
- `conversation_logger.py` — Hybrid logging
- `create_structure.py` — Initialize project
