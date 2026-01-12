---
name: document-conversion
description: "This skill should be used when users need to convert PDFs (especially with tables or figures), mentions 'convert', 'PDF', 'document processing', has complex academic papers to import, or asks about MinerU vs Markdownify."
---

# document-conversion

Robust PDF and document conversion with intelligent tool selection. Chooses the best available conversion method based on document complexity and MCP availability.

## When to Use

Use this skill when:
- User needs to convert PDFs, especially with tables or figures
- User mentions "convert", "PDF", "document processing"
- User has complex academic papers to import
- User asks about MinerU vs Markdownify

## MCP Comparison

| Feature | MinerU (Optional) | Markdownify (Bundled) |
|---------|-------------------|----------------------|
| API Key Required | Yes (MINERU_API_KEY) | No |
| PDF Accuracy | 90%+ (VLM mode) | Good |
| Table Extraction | Excellent | Basic |
| Figure Handling | Extracts + describes | Basic |
| Formula Recognition | Yes | Limited |
| Multi-column | Excellent | Good |
| Audio Transcription | No | Yes |
| Cost | Pay per page | Free |

## When to Use Which

### Use MinerU When:
- PDF has complex tables with merged cells
- Document has multi-column layouts
- Figures/charts need extraction
- Mathematical formulas present
- Academic paper with structured formatting
- Accuracy is critical

### Use Markdownify When:
- Simple text-based documents
- Audio files need transcription
- No API key available
- Cost is a concern
- Document is straightforward

## Tool Selection Logic

```
Is the document a PDF with tables/figures?
├── Yes, complex tables
│   └── MinerU available?
│       ├── Yes → Use MinerU (vlm mode)
│       └── No → Markdownify + manual review
├── Yes, simple formatting
│   └── Markdownify (good enough)
└── No, other format
    └── Is it audio?
        ├── Yes → Markdownify
        └── No → Markdownify (supports many formats)
```

## Usage Examples

### MinerU (Complex PDF)
```
Use mineru_parse to convert this academic paper:
- URL: https://example.com/paper.pdf
- Model: vlm (for 90% accuracy)
- Enable: formula, table recognition
```

### Markdownify (Simple Document)
```
Use markdownify pdf-to-markdown for this interview guide
```

### Batch Processing
```
For multiple PDFs:
1. Check which have complex tables (use MinerU)
2. Process simple ones with Markdownify
3. Queue complex ones for MinerU batch
```

## MinerU Specific Features

### VLM vs Pipeline Mode
- **VLM Mode:** Uses vision-language model, 90%+ accuracy, slower
- **Pipeline Mode:** Traditional parsing, faster, lower accuracy

### Page Selection
```
Parse only specific pages:
mineru_parse({
  url: "https://...",
  pages: "1-10,15,20-25"
})
```

### Batch Processing
```
Process multiple documents:
mineru_batch({
  urls: ["url1", "url2", "url3"],
  model: "vlm"
})
```

## Output Quality Checklist

After conversion, verify:
- [ ] Text is accurately extracted
- [ ] Tables maintain structure
- [ ] Headers/sections are correct
- [ ] Figures have descriptions (if MinerU)
- [ ] Formulas are readable (if MinerU)
- [ ] No garbled text from OCR errors

## Integration with Research Workflow

### For Literature (Stream A)
1. Identify papers to convert
2. Complex papers → MinerU
3. Simple papers → Markdownify
4. Store in stream-a-theoretical/papers/

### For Data Documents (Stream B)
1. Interview transcripts → Markdownify (audio)
2. PDF field notes → Markdownify or MinerU
3. Store in appropriate stage folder

## Fallback Options

If both tools fail or unavailable:

1. **Adobe Acrobat** - Export to Word
2. **Google Docs** - Open PDF for auto-OCR
3. **Tesseract OCR** - Command-line tool
4. **Manual transcription** - Last resort

## Related

- **MCPs:** MinerU (optional), Markdownify (bundled)
- **Skills:** interview-ingest for audio, literature-sweep for papers
- **Configuration:** .mcp.json defines MCP availability
