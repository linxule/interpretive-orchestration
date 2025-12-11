# Dependencies & MCP Ecosystem

This document describes the Model Context Protocol (MCP) servers used by Interpretive Orchestration and their availability tiers.

## Quick Reference

| MCP Server | Type | API Key Required | Primary Use |
|------------|------|------------------|-------------|
| Sequential Thinking | Bundled | No | Deep reasoning, step-by-step analysis |
| Lotus Wisdom | Bundled | No | Paradox navigation, integration |
| Markdownify | Bundled | No | Document/audio conversion |
| MinerU | Optional | Yes (MINERU_API_KEY) | High-accuracy PDF parsing |
| Jina AI | Optional | Yes (JINA_API_KEY) | Web content extraction |
| Exa | Optional | Yes (EXA_API_KEY) | Academic literature search |
| Zen | Optional | Yes (various) | Multi-model validation |
| Zotero | Optional | Yes (ZOTERO_API_KEY) | Bibliography management |

---

## Bundled MCPs (No API Keys Required)

These MCPs start automatically with the plugin and work out of the box.

### Sequential Thinking

**Package:** `@modelcontextprotocol/server-sequential-thinking`

**Purpose:** Dynamic, reflective problem-solving through structured thought sequences.

**Capabilities:**
- Step-by-step thinking for complex problems
- Thought sequences that can branch and revise
- Hypothesis generation and verification
- Explicit reasoning chains

**When to Use:**
- Planning analytical approaches
- Working through theoretical tensions
- Dimensional analysis for patterns
- Building final frameworks in Stage 3

**Invoked by:** `deep-reasoning` skill, `/qual-think-through` command

---

### Lotus Wisdom

**Package:** `lotus-wisdom-mcp`

**Purpose:** Multi-faceted problem-solving using contemplative reasoning.

**Capabilities:**
- Five wisdom domains (Skillful Means, Non-Dual, Meta-Cognitive, Process, Meditation)
- Integration of apparent contradictions
- Both direct and gradual approaches to truth
- Beautiful visualizations

**When to Use:**
- Patterns seem contradictory
- Stuck in either/or thinking
- Theoretical and empirical streams irreconcilable
- Moving from tension to integration

**Invoked by:** `paradox-navigation` skill, `/qual-wisdom-check` command

---

### Markdownify

**Package:** `markdownify-mcp`

**Purpose:** Convert documents and media to analyzable markdown format.

**Capabilities:**
- PDF to markdown conversion
- Audio transcription (interviews!)
- YouTube video extraction
- Web page conversion
- Office document conversion (DOCX, XLSX, PPTX)
- Image processing with OCR

**When to Use:**
- Transcribing interview recordings
- Converting PDF articles and documents
- Importing data from various formats
- Processing web-based resources

**Invoked by:** `interview-ingest` skill, `document-conversion` skill

---

## Optional MCPs (Require API Keys)

These MCPs provide enhanced capabilities but require API key configuration.

### MinerU

**Package:** `mineru-mcp`
**API Key:** `MINERU_API_KEY`
**Get key at:** [mineru.net](https://mineru.net)

**Purpose:** VLM-powered document parsing with 90%+ accuracy.

**Capabilities:**
- High-accuracy PDF parsing using vision-language models
- Excellent table extraction (merged cells, complex layouts)
- Figure and chart handling
- Formula recognition
- Multi-column document support
- Page range selection
- Batch processing (up to 200 documents)

**When to Use (vs Markdownify):**
| Use MinerU | Use Markdownify |
|------------|-----------------|
| Complex tables | Simple documents |
| Multi-column PDFs | Audio files |
| Figures/charts | No API key available |
| Academic papers | Cost is a concern |
| Accuracy critical | Basic conversion sufficient |

**Invoked by:** `document-conversion` skill, `interview-ingest` skill (Tier 1)

**Configuration:**
```bash
claude mcp add mineru-mcp -e MINERU_API_KEY=your-key -- npx mineru-mcp
```

---

### Jina AI

**Package:** `jina-ai-mcp-server`
**API Key:** `JINA_API_KEY`
**Get key at:** [jina.ai](https://jina.ai)

**Purpose:** Web content extraction and fetching.

**Capabilities:**
- Fetch full web page content
- Extract article text from URLs
- Handle complex web layouts
- Convert to clean markdown

**When to Use:**
- Fetching online academic articles
- Importing web-based resources
- Literature gathering for Stream A

**Invoked by:** `literature-sweep` skill (Tier 1, 2)

---

### Exa

**Package:** `@modelcontextprotocol/server-exa`
**API Key:** `EXA_API_KEY`
**Get key at:** [exa.ai](https://exa.ai)

**Purpose:** Semantic search across academic literature.

**Capabilities:**
- Semantic search (not just keyword matching)
- Academic paper search
- Code context search
- Relevance ranking

**When to Use:**
- Literature search for theoretical foundations
- Finding relevant papers for Stream A
- Discovering related theoretical frameworks

**Invoked by:** `literature-sweep` skill (Tier 1 only)

---

### Zen

**Package:** `zen-mcp-server`
**API Keys:** `GOOGLE_API_KEY` and/or `OPENAI_API_KEY`

**Purpose:** Multi-model validation and triangulation.

**Capabilities:**
- Query multiple AI models (Claude, GPT-4, Gemini)
- Compare interpretations across models
- Validate coding decisions
- Triangulate theoretical claims

**When to Use:**
- Validating major analytical decisions
- Checking for single-model bias
- Alternative perspectives on ambiguous coding
- Final theory validation

**Invoked by:** `/qual-get-perspectives` command

---

### Zotero

**Package:** `zotero-mcp-server`
**API Keys:** `ZOTERO_API_KEY`, `ZOTERO_LIBRARY_ID`
**Get key at:** [zotero.org](https://www.zotero.org/settings/keys)

**Purpose:** Bibliography management and citation tracking.

**Capabilities:**
- Access Zotero library
- Manage citations
- Track references
- Organize literature

**When to Use:**
- Managing literature for Stream A
- Tracking citations for manuscript
- Organizing foundational articles

**Invoked by:** Stage 3 manuscript preparation

---

## Skill Compatibility Matrix

This shows which skills require which MCPs:

| Skill | Required MCPs | Optional MCPs | Fallback |
|-------|---------------|---------------|----------|
| `project-setup` | None | None | N/A |
| `gioia-methodology` | None | None | N/A |
| `deep-reasoning` | Sequential Thinking (bundled) | None | N/A |
| `paradox-navigation` | Lotus Wisdom (bundled) | None | N/A |
| `coherence-check` | None | None | N/A |
| `interview-ingest` | Markdownify (bundled) | MinerU | Markdownify |
| `document-conversion` | Markdownify (bundled) | MinerU | Markdownify |
| `literature-sweep` | None | Exa + Jina | WebFetch |
| `analysis-orchestration` | None | None | N/A |
| `coding-workflow` | None | None | N/A |
| `project-dashboard` | None | None | N/A |

---

## Graceful Degradation Tiers

Skills that use optional MCPs implement tiered functionality:

### literature-sweep
- **Tier 1 (Full):** Exa search + Jina fetch + organize
- **Tier 2 (Manual):** User URLs + Jina fetch + organize
- **Tier 3 (Basic):** User URLs + WebFetch + organize

### interview-ingest
- **Tier 1 (Best):** MinerU for PDFs (90%+ accuracy)
- **Tier 2 (Good):** Markdownify for all formats
- **Tier 3 (Basic):** Manual handling guidance

### document-conversion
- **Tier 1 (Best):** MinerU (VLM mode) for complex PDFs
- **Tier 2 (Good):** Markdownify for simple documents
- **Tier 3 (Basic):** Manual conversion guidance

---

## Environment Variable Summary

For full functionality, configure these environment variables:

```bash
# Required for optional MCPs
export MINERU_API_KEY="your-mineru-key"
export JINA_API_KEY="your-jina-key"
export EXA_API_KEY="your-exa-key"
export GOOGLE_API_KEY="your-google-key"
export OPENAI_API_KEY="your-openai-key"
export ZOTERO_API_KEY="your-zotero-key"
export ZOTERO_LIBRARY_ID="your-library-id"
```

Or add to Claude Code:
```bash
claude mcp add mineru-mcp -e MINERU_API_KEY=your-key -- npx mineru-mcp
claude mcp add jina-ai-mcp-server -e JINA_API_KEY=your-key -- npx jina-ai-mcp-server
```

---

## Checking MCP Availability

At runtime, skills check for MCP availability:

```javascript
// Check environment variable
const hasMinerU = process.env.MINERU_API_KEY;
const hasJina = process.env.JINA_API_KEY;
const hasExa = process.env.EXA_API_KEY;

// Determine tier
if (hasExa && hasJina) tier = 1;
else if (hasJina) tier = 2;
else tier = 3;
```

---

## Cost Considerations

### Free (Bundled)
- Sequential Thinking
- Lotus Wisdom
- Markdownify

### Pay-as-you-go
- MinerU: ~$0.01-0.05 per page
- Jina: Free tier available, then usage-based
- Exa: Free tier available, then usage-based
- OpenAI/Google: Standard API pricing
- Zotero: Free

### Recommendations

1. **Start with bundled MCPs** - They cover most needs
2. **Add MinerU** if you have complex PDF documents with tables
3. **Add Exa + Jina** if you need automated literature search
4. **Add Zen** if you want multi-model validation
5. **Add Zotero** if you use Zotero for bibliography

---

## Troubleshooting

### MCP Not Responding
1. Check if API key is set correctly
2. Verify the MCP is added to Claude Code: `claude mcp list`
3. Try removing and re-adding: `claude mcp remove <name> && claude mcp add ...`

### Tool Call Fails
1. Check API key validity (may have expired)
2. Check rate limits on the service
3. Fall back to next tier (e.g., Markdownify instead of MinerU)

### No MCPs Available
The plugin works without any optional MCPs. Bundled MCPs start automatically.
