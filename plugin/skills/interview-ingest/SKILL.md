---
name: interview-ingest
description: "This skill should be used when users have audio interview recordings to transcribe, need to convert PDF documents, mentions 'import data', 'transcribe', 'convert', or is starting data preparation for Stage 1 or Stage 2."
---

# interview-ingest

Audio transcription and document conversion for qualitative data import. Converts interview recordings, PDFs, and other formats into analyzable markdown.

## When to Use

Use this skill when:
- User has audio interview recordings to transcribe
- User needs to convert PDF documents
- User mentions "import data", "transcribe", "convert"
- Starting data preparation for Stage 1 or Stage 2

## MCP Dependencies

This skill operates at two capability tiers:

### Tier 1: Best (Requires MinerU API key)
- **PDFs:** MinerU VLM-powered parsing (90%+ accuracy)
- **Tables/Images:** Excellent extraction
- **Audio:** External transcription services recommended
- **Best for:** Complex academic papers, documents with tables/figures

### Tier 2: Manual (No API key required)
- **PDFs:** Manual conversion (Adobe Acrobat, Google Docs OCR)
- **Audio:** External transcription services (Otter.ai, Rev.com, YouTube captions)
- **Tables/Images:** Manual cleanup after conversion
- **Best for:** Simple documents, researchers without API keys

## Checking Tier Availability

```bash
# Check for MinerU
[ -n "$MINERU_API_KEY" ] && echo "MinerU available (Tier 1)" || echo "Manual conversion (Tier 2)"
```

## Workflow by Format

### Audio Interviews

**Recommended transcription services:**
- **Otter.ai** - AI-powered transcription, good for interviews
- **Rev.com** - Professional human transcription
- **YouTube** - Upload as unlisted video for auto-captions
- **Whisper** - Open source, run locally

**Best practices:**
- Use high-quality recordings when possible
- Review transcripts for accuracy
- Add speaker labels: "Interviewer:" and "Participant:"
- Note timestamps for key passages
- Mark unclear passages with [unclear] or [inaudible]

### PDF Documents

**Tier 1 (MinerU - recommended for complex PDFs):**
```bash
# Parse PDF with VLM mode for tables/images
mineru_parse({
  url: "file:///path/to/paper.pdf",
  model: "vlm",
  formula: true,
  table: true
})
```

**Tier 2 (Manual conversion):**
- **Adobe Acrobat** - Export to Word/text
- **Google Docs** - Open PDF for auto-OCR
- **Tesseract OCR** - Command-line tool for batch processing

### Other Formats

| Format | Conversion Method | Notes |
|--------|-------------------|-------|
| DOCX | Copy/paste or Pandoc | Good formatting |
| PPTX | Export to text | Manual extraction |
| XLSX | Export to CSV/text | Tables preserved |
| Images | OCR tools | Tesseract, Google Lens |
| YouTube | Download captions | Auto-generated transcripts |
| Web pages | WebFetch or Jina | Full content extraction |

## Scripts

### process-audio.js
Batch process interview recordings.

```bash
node skills/interview-ingest/scripts/process-audio.js \
  --project-path /path/to/project \
  --input-dir /path/to/recordings \
  --output-dir stage1-foundation/manual-codes
```

## Output Organization

```
stage1-foundation/
├── manual-codes/
│   ├── P001-interview.md    # Transcribed interviews
│   ├── P002-interview.md
│   └── ...
├── raw-data/                 # Original files (optional)
│   ├── P001-recording.mp3
│   └── ...
└── data-inventory.json       # Tracks all data sources
```

### data-inventory.json
```json
{
  "documents": [
    {
      "id": "P001",
      "original_file": "P001-recording.mp3",
      "converted_file": "P001-interview.md",
      "format": "audio",
      "conversion_tool": "otter.ai",
      "conversion_date": "2025-01-15",
      "duration_minutes": 45,
      "notes": "Good audio quality"
    }
  ]
}
```

## Quality Considerations

### Audio Transcription
- **Review all transcripts** - AI transcription has errors
- **Add speaker labels** - "Interviewer:" and "Participant:"
- **Note unclear passages** - Mark with [unclear] or [inaudible]
- **Include timestamps** - For later reference to original

### PDF Conversion
- **Check table accuracy** - Complex tables may need manual fixes
- **Verify figures** - May need manual description
- **Review formatting** - Headers, lists, emphasis

## Integration with Stages

### Stage 1 Preparation
1. Transcribe/convert all data sources
2. Organize in stage1-foundation/
3. Create data-inventory.json
4. Begin manual coding on converted files

### Stage 2 Processing
1. @dialogical-coder works with markdown files
2. Quotes reference line numbers in converted files
3. Audit trail links back to original sources

## Fallback Guidance

If automated transcription unavailable:

**Audio Options:**
- Otter.ai - Good transcription service
- Rev.com - Professional transcription
- YouTube auto-captions - Upload as unlisted video
- Manual transcription - Time-intensive but accurate

**PDF Options:**
- Adobe Acrobat - Export to Word/text
- Google Docs - Open PDF, auto-OCR
- Manual copy/paste - For short documents

## Related

- **MCPs:** MinerU (optional), Jina (optional for web content)
- **Skills:** document-conversion for detailed PDF handling
- **Commands:** Data import commands
