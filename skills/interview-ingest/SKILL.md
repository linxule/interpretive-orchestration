# interview-ingest

Audio transcription and document conversion for qualitative data import. Converts interview recordings, PDFs, and other formats into analyzable markdown.

## When to Use

Use this skill when:
- User has audio interview recordings to transcribe
- User needs to convert PDF documents
- User mentions "import data", "transcribe", "convert"
- Starting data preparation for Stage 1 or Stage 2

## MCP Dependencies

This skill operates at three capability tiers:

### Tier 1: Best (Requires MinerU API key)
- **PDFs:** MinerU VLM-powered parsing (90%+ accuracy)
- **Tables/Images:** Excellent extraction
- **Audio:** Falls back to Markdownify
- **Best for:** Complex academic papers, documents with tables/figures

### Tier 2: Good (Bundled - no API key)
- **PDFs:** Markdownify conversion
- **Audio:** Markdownify transcription
- **Tables/Images:** Basic extraction
- **Best for:** Simple documents, interview recordings

### Tier 3: Basic (Fallback)
- **PDFs:** Manual copy/paste or OCR
- **Audio:** External transcription service
- **Guidance provided for manual workflow**

## Checking Tier Availability

```bash
# Check for MinerU
[ -n "$MINERU_API_KEY" ] && echo "MinerU available (Tier 1)"

# Markdownify is always available (bundled)
echo "Markdownify available (Tier 2)"
```

## Workflow by Format

### Audio Interviews

**Tier 1/2 (Markdownify):**
```bash
# Transcribe audio file
markdownify audio-to-markdown /path/to/interview.mp3

# Output: interview.md with transcript
```

**Best practices:**
- Use high-quality recordings when possible
- Review transcripts for accuracy
- Add speaker labels if not auto-detected
- Note timestamps for key passages

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

**Tier 2 (Markdownify):**
```bash
# Convert PDF to markdown
markdownify pdf-to-markdown /path/to/paper.pdf
```

### Other Formats

| Format | Tool | Notes |
|--------|------|-------|
| DOCX | Markdownify | Good conversion |
| PPTX | Markdownify | Extracts text + images |
| XLSX | Markdownify | Tables preserved |
| Images | Markdownify | OCR + metadata |
| YouTube | Markdownify | Captions/transcript |
| Web pages | Markdownify or Jina | Full content |

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
      "conversion_tool": "markdownify",
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

- **MCPs:** MinerU (optional), Markdownify (bundled)
- **Skills:** document-conversion for detailed PDF handling
- **Commands:** Data import commands
