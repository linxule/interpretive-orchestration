# ADR: Project Rules Feature

**Status:** Decided - Not Implementing
**Date:** 2025-12-13
**Context:** Explored whether to add Claude Code's `.claude/rules/` path-specific configuration

---

## Decision

**Don't add project rules now.**

The current architecture (hooks + agents + skills + config) handles process-based stages effectively. Rules would add a 5th configuration mechanism with marginal benefit and increased complexity.

**Trigger to revisit:** Concrete incidents where path-specific guidance is needed that existing mechanisms can't provide.

---

## What Are Project Rules?

Claude Code's "project rules" are markdown files in `.claude/rules/` that apply conditionally based on file paths:

```markdown
# .claude/rules/example.md
---
paths: src/api/**/*.ts
---
Rules here apply only when working with matching files.
```

**Key characteristics:**
- Path-specific via glob patterns in YAML frontmatter
- Advisory (guidance), not enforcement (blocking)
- Automatically loaded when working with matching files

**How they differ from our existing mechanisms:**

| Mechanism | Scope | Type | Our Use |
|-----------|-------|------|---------|
| CLAUDE.md | Always loaded | Advisory | Core philosophy |
| Hooks | Event-triggered | Enforcement | Stage gates, pauses |
| Agents | On invocation | Dynamic adaptation | Persona-based behavior |
| Skills | Keyword-triggered | Capability modules | Task-specific workflows |
| **Rules** | Path-matched | Advisory | *Not using* |

---

## Why Not Now?

### 1. Five Mechanisms = Complexity Risk
Adding rules creates potential "collision hell" - conflicting guidance from multiple sources dilutes AI focus and increases maintenance burden.

### 2. Process vs Space Mismatch
Our zones are **stage-based** (temporal: Stage 1 → 2 → 3), not **folder-based** (spatial). A researcher in "Stage 1 mode" is in that mode regardless of which file they're editing. Hooks handle this; rules wouldn't.

### 3. Advisory Is Weak
External consultation (Gemini, Kimi) independently noted: "Rules saying 'don't edit' are useless if ignorable." For anything important, hooks provide actual enforcement.

### 4. Race Condition Risk
If hooks enforce X while rules advise Y on overlapping files, which wins? This creates conceptual ambiguity in our enforcement model.

---

## When Rules Would Add Value

Revisit this decision if these triggers occur:

| Trigger Event | Potential Rule Use |
|---------------|-------------------|
| Multiple studies with different methodologies in one repo | Methodological zone rules (GT vs phenomenology) |
| Adding a manuscript/writing phase | Publication pipeline rules (tone shift to academic prose) |
| Integrating quantitative analysis | Quant sandbox with statistical guidelines |
| Team expansion with domain-specific expertise | Domain-specific coding standards |

---

## Alternative Discovered: Context Window Hygiene

A more valuable concept emerged from this exploration:

**Core idea:** Control what AI can *see*, not just how it behaves.

**Use cases:**
- PII protection (AI never sees raw participant data)
- Analytical blinders (grounded theory "fresh eyes")
- Multi-case isolation (prevent cross-contamination)
- Longitudinal integrity (Wave 2 can't bias Wave 1 analysis)

**Key insight:** This would require **MCP-level gating** (tool enforcement), not prompt-level rules. A custom MCP server that intercepts file reads and applies policy.

**Concepts to explore if needed:**
- `.ai-context.yaml` with phase-aware scopes
- Tiered disclosure levels (metadata → structure → redacted → full)
- Shadow workspace pattern for PII sanitization

**When to revisit:** If we need PII protection, grounded theory "fresh eyes" enforcement, or multi-case isolation.

---

## Decision Framework

```
Need path-specific behavior?
│
├── Is it ENFORCEMENT (must block)?
│   └── Yes → Enhance hooks with spatial awareness
│
├── Is it ADAPTATION (context-aware behavior)?
│   └── Yes → Agents can read folder context from config
│
├── Is it about what AI can SEE?
│   └── Yes → Future: Context window hygiene (MCP gatekeeper)
│
└── Is it just advisory guidance?
    └── Consider: Is this worth adding a 5th mechanism?
        └── Probably not. Put it in CLAUDE.md or agent instructions.
```

---

## References

- **Claude Code Documentation:** [Memory Management](https://docs.anthropic.com/en/docs/claude-code/memory), [Settings](https://docs.anthropic.com/en/docs/claude-code/settings)
- **External Consultation:** Gemini 3 Pro, Kimi K2 (2025-12-13)
- **Related:** [ARCHITECTURE.md](./ARCHITECTURE.md) (current plugin architecture)

---

## Appendix: The Exploration Process

This decision was reached through:

1. **Codebase analysis:** Identified 5 existing zones (Stage 1-3 + substages), each with distinct epistemic requirements already handled by hooks and agents.

2. **Feature research:** Investigated Claude Code's rules feature - syntax, loading behavior, best practices.

3. **External consultation:** Asked Gemini and Kimi (models without Claude Code assumptions) to critique the architecture. Both independently recommended against adding rules now.

4. **Conceptual reframe:** Discovered that "spatial context" (rules) is orthogonal to "temporal process" (hooks), but our needs are primarily temporal. The spatial concept that *would* add value - context window hygiene - is a different feature entirely.

**Key quote from external review:**
> "Your architecture is already sophisticated. Don't dilute it solving problems you haven't met yet." — Kimi K2
