---
name: qual-reflection
description: Deep reasoning and paradox navigation via MCP tools. Integrates Sequential Thinking for systematic analysis and Lotus Wisdom for navigating contradictions. Use when planning complex analysis, working through theoretical tensions, or making methodological decisions.
---

# qual-reflection: Deep Reasoning & Paradox Navigation

Integrates MCP tools for epistemic scaffolding:
- **Sequential Thinking** — Step-by-step systematic reasoning
- **Lotus Wisdom** — Navigate paradoxes and contradictions

## When to Use

### Sequential Thinking
- Planning complex analytical strategy
- Working through methodological decisions
- Breaking down theoretical problems
- Systematic framework building

### Lotus Wisdom
- Encountering contradictory patterns in data
- Navigating "both/and" tensions
- Integrating opposites in theory
- Resolving methodological paradoxes

## Usage

```bash
# Sequential Thinking for systematic analysis
/skill:qual-reflection --mode think "Plan my sampling strategy"

# Lotus Wisdom for paradox navigation
/skill:qual-reflection --mode wisdom "Participants describe empowerment AND alienation"

# Auto-detect based on prompt
/skill:qual-reflection "I see tension between individual agency and structural constraint"
```

## Sequential Thinking Mode

### Example: Planning Theoretical Sampling

```
User: /skill:qual-reflection --mode think 
      "When should I stop coding and move to theoretical sampling?"

AI: Let me think through this systematically...

[Sequential Thinking via MCP]

Thought 1: Understanding the criteria for theoretical saturation
- Categories are well-developed
- New data doesn't yield new insights
- Relationships between categories are clear

Thought 2: Assessing current state
- Currently have 15 interviews coded
- Seeing repetition in recent codes
- Core categories emerging clearly

Thought 3: Considering negative cases
- Haven't actively sought disconfirming evidence
- May need 2-3 more strategic interviews
- Focus on boundary conditions

Thought 4: Decision recommendation
- Continue with 2-3 theoretical samples
- Target extreme/disconfirming cases
- Then assess for saturation again

[Synthesis]
You're approaching saturation but should conduct 
targeted theoretical sampling first. Focus on:
1. Cases that might challenge emerging theory
2. Boundary conditions
3. Maximum variation on core dimensions
```

## Lotus Wisdom Mode

### Example: Navigating Empowerment/Alienation Paradox

```
User: /skill:qual-reflection --mode wisdom
      "My participants describe remote work as both liberating AND isolating"

AI: [Lotus Wisdom via MCP]

Domain: Entry
Entering contemplation of: liberation AND isolation in remote work

Domain: Contradiction
The tension: Freedom from office constraints vs. loss of social connection
Apparent paradox: Can something be both freeing and confining?

Domain: Non-Dual Recognition
Integration insight: These aren't opposites but complementary aspects
of the same phenomenon — autonomy has both costs and benefits

Domain: Embodied Understanding
The lived experience: Participants navigate between these poles daily,
creating their own rhythms of connection and solitude

Domain: Skillful Means
Analytical implication: Don't code as separate themes
Instead: "Negotiating autonomy" as core category with
liberation/isolation as dialectical moments

[Wisdom Ready]
Consider framing as "negotiating autonomy" rather than 
treating liberation and isolation as separate. The tension 
itself is the phenomenon.
```

## MCP Integration

### Configuration

```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking@latest"]
    },
    "lotus-wisdom": {
      "command": "npx",
      "args": ["-y", "@lotus-wisdom/mcp-server@latest"]
    }
  }
}
```

### Fallback Strategy

If MCP unavailable:

1. **Sequential Thinking fallback:**
   - Native chain-of-thought prompting
   - Explicit step numbering
   - ~85% quality for simple tasks

2. **Lotus Wisdom fallback:**
   - Native dialectical reasoning
   - Explicit domain progression
   - ~70% quality for complex paradoxes

```python
async def reflect_with_fallback(prompt, mode="auto"):
    """Use MCP if available, fallback to native reasoning."""
    
    # Try MCP first
    if await mcp_available():
        try:
            if mode == "think":
                return await mcp_sequential_thinking(prompt)
            elif mode == "wisdom":
                return await mcp_lotus_wisdom(prompt)
        except MCPError:
            pass  # Fall through to native
    
    # Native fallback
    return await native_reasoning(prompt, mode)
```

## Integration with Other Skills

### Called by qual-coding
When complex coding decisions needed:
```
@dialogical-coder detects complexity → 
Calls qual-reflection for systematic analysis →
Incorporates reasoning into 4-stage output
```

### Called by scholarly-companion
When theoretical tensions arise:
```
@scholarly-companion identifies paradox →
Calls qual-reflection for wisdom navigation →
Returns insight to researcher
```

## Logging

All reflections logged:
- **Tool used:** Sequential Thinking vs Lotus Wisdom
- **Prompt:** Researcher's question
- **Reasoning:** Full MCP output
- **Synthesis:** Condensed insight
- **Fallback:** Whether native fallback used

---

*Part of Interpretive Orchestration for Kimi CLI*
