---
description: Verify plugin installation and MCP server status
---

# Interpretive Orchestration Setup Check

Run a diagnostic check to verify the plugin is installed correctly and all components are ready.

## What to Check

Please verify the following and report back to the researcher:

### 1. Plugin Status
- Confirm the Interpretive Orchestration plugin is installed
- Report the current version (should be 0.1.0)

### 2. Bundled MCP Servers (Should Auto-Start)
Check if these servers are available and responding:
- **Sequential Thinking** - For deep analytical reasoning
- **Lotus Wisdom** - For paradox navigation
- **Markdownify** - For PDF to markdown conversion

### 3. Available Commands
List the available /qual-* commands and confirm they are loaded:
- /qual-init
- /qual-status
- /qual-think-through
- /qual-wisdom-check
- /qual-examine-assumptions
- /qual-reflect

### 4. Available Agents
Confirm these agents are ready:
- @dialogical-coder
- @research-configurator
- @scholarly-companion

### 5. Hooks Configured
Verify hooks are set up:
- PreStage2 (enforces sandwich methodology)
- PostFiveDocuments (interpretive pause)
- SessionEnd (reflexivity prompt)
- EpistemicCoherence (philosophical consistency)
- PostSynthesis (audit trail)

## Output Format

Present the results in a clear, scannable format:

```
Interpretive Orchestration Setup Check
==================================
Plugin version: [version]

Bundled MCP Servers:
✓ Sequential Thinking - Ready
✓ Lotus Wisdom - Ready
✓ Markdownify - Ready

Commands: [X] available
Agents: [X] ready
Hooks: [X] configured

Status: [Ready for /qual-init | Issues detected - see below]

[If issues, list them here with solutions]
```

## Next Steps

If everything is ready, suggest:
1. Run `/qual-init` to begin Socratic onboarding
2. Read `QUICK-START.md` for a 5-minute orientation

If issues are detected:
1. Point to `TROUBLESHOOTING.md` for solutions
2. Suggest specific fixes based on what's missing
