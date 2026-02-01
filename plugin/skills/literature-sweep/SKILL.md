---
name: literature-sweep
description: "This skill should be used when users need to gather foundational literature, mentions 'literature review', 'theoretical patterns', 'Stream A', wants to search for academic papers, or is starting Stage 2 Phase 1 theoretical stream."
---

# literature-sweep

Search, fetch, and organize academic literature for theoretical pattern extraction (Stage 2 Phase 1, Stream A). Implements graceful degradation based on available MCP servers.

## When to Use

Use this skill when:
- User needs to gather foundational literature
- User mentions "literature review", "theoretical patterns", "Stream A"
- User wants to search for academic papers
- Starting Stage 2 Phase 1 theoretical stream

## MCP Dependencies

This skill can operate at three capability tiers based on available MCPs:

### Tier 1: Full (Requires Exa + Jina API keys)
- **Search:** Exa semantic academic search
- **Fetch:** Jina web content extraction
- **Process:** Full literature workflow

### Tier 2: Manual Search (Requires Jina API key only)
- **Search:** User provides URLs manually
- **Fetch:** Jina extracts content
- **Process:** Fetch and organize workflow

### Tier 3: Basic (No API keys required)
- **Search:** User provides URLs manually
- **Fetch:** Built-in WebFetch tool or manual download
- **Process:** Basic content retrieval with manual conversion

## Checking Tier Availability

Before invoking, check environment:
```bash
# Check for Exa
[ -n "$EXA_API_KEY" ] && echo "Exa available"

# Check for Jina
[ -n "$JINA_API_KEY" ] && echo "Jina available"
```

Or attempt the tool call - if it fails, fall back to next tier.

## Workflow by Tier

### Tier 1: Full Literature Sweep

```
1. User provides research question/keywords
2. Exa searches academic sources (papers, journals)
3. Select top 10-15 relevant results
4. Jina fetches full content for each
5. Organize in stage2-collaboration/stream-a-theoretical/
6. Create literature-inventory.json tracking sources
```

### Tier 2: Manual Search + Fetch

```
1. User searches manually (Google Scholar, JSTOR, etc.)
2. User provides list of URLs to relevant papers
3. Jina fetches content for each URL
4. Organize in stage2-collaboration/stream-a-theoretical/
5. Track in literature-inventory.json
```

### Tier 3: Basic Fetch

```
1. User provides list of URLs
2. WebFetch retrieves content (may be limited by paywalls)
3. User may need to download PDFs directly
4. Manual PDF conversion (Adobe Acrobat, Google Docs, or OCR)
5. Organize manually
```

## Scripts

### search-and-fetch.js
Orchestrates the literature gathering process.

```bash
node skills/literature-sweep/scripts/search-and-fetch.js \
  --project-path /path/to/project \
  --query "sensemaking organizational change middle managers" \
  --max-results 15
```

**Automatic tier detection:** Script checks for API keys and operates at highest available tier.

## Output Structure

```
stage2-collaboration/stream-a-theoretical/
├── literature-inventory.json    # Tracks all sources
├── papers/
│   ├── weick-1995-sensemaking.md
│   ├── gioia-2013-seeking.md
│   └── ...
└── theoretical-patterns.md      # YOUR analysis notes
```

### literature-inventory.json
```json
{
  "sources": [
    {
      "id": "L001",
      "title": "Sensemaking in Organizations",
      "authors": ["Weick, K."],
      "year": 1995,
      "url": "https://...",
      "local_file": "papers/weick-1995-sensemaking.md",
      "fetch_tier": "tier1",
      "relevance_notes": "Core sensemaking framework"
    }
  ],
  "search_queries": ["sensemaking organizational change"],
  "last_updated": "2025-01-15"
}
```

## Integration with Stream A Analysis

After gathering literature:

1. **Extract Theoretical Patterns**
   - Use @scholarly-companion for Socratic dialogue
   - Identify core constructs and relationships
   - Note how phenomena are conceptualized

2. **Document in theoretical-patterns.md**
   - Key constructs from literature
   - How your phenomenon relates
   - Gaps or tensions in existing theory

3. **Prepare for Synthesis (Phase 2)**
   - Theoretical patterns ready for comparison with empirical patterns

## Fallback Guidance

If API keys unavailable:

1. **Manual Literature Search**
   - Google Scholar: scholar.google.com
   - Semantic Scholar: semanticscholar.org
   - JSTOR: jstor.org
   - PubMed: pubmed.ncbi.nlm.nih.gov

2. **Getting Full Text**
   - Check institutional access
   - Use Unpaywall browser extension
   - Contact authors directly
   - Check preprint servers (SSRN, arXiv)

3. **Converting to Markdown**
   - Use MinerU if API key available
   - Or manual conversion: Adobe Acrobat export, Google Docs OCR
   - For batch processing: Tesseract OCR command-line tool

## Related

- **MCPs:** Exa (optional), Jina (optional), MinerU (optional)
- **Agents:** @scholarly-companion for analysis
- **Skills:** document-conversion for PDF handling
