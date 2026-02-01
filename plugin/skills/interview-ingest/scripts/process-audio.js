#!/usr/bin/env node
/**
 * process-audio.js
 * Batch process interview recordings and documents for qualitative analysis
 *
 * Usage:
 *   node process-audio.js \
 *     --project-path /path/to/project \
 *     --input-dir /path/to/recordings \
 *     --output-dir stage1-foundation/manual-codes
 *
 * Options:
 *   --project-path   Path to the qualitative project root
 *   --input-dir      Directory containing recordings/documents to process
 *   --output-dir     Output directory relative to project (default: stage1-foundation/manual-codes)
 *   --format         Filter by format: audio, pdf, docx, all (default: all)
 *   --list           Just list files to process, don't generate workflow
 *
 * This script:
 * 1. Detects available tier (MinerU vs Markdownify)
 * 2. Scans input directory for supported formats
 * 3. Returns workflow instructions for Claude to execute
 */

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].replace('--', '');
      const nextArg = args[i + 1];
      if (nextArg && !nextArg.startsWith('--')) {
        parsed[key] = nextArg;
        i++;
      } else {
        parsed[key] = true;
      }
    }
  }

  return parsed;
}

function detectTier() {
  const hasMineru = !!process.env.MINERU_API_KEY;

  if (hasMineru) {
    return {
      tier: 1,
      name: 'Best (MinerU + Markdownify)',
      mineru: true,
      markdownify: true,
      pdf_tool: 'mineru',
      audio_tool: 'markdownify'
    };
  } else {
    return {
      tier: 2,
      name: 'Good (Markdownify only)',
      mineru: false,
      markdownify: true,
      pdf_tool: 'markdownify',
      audio_tool: 'markdownify'
    };
  }
}

const SUPPORTED_FORMATS = {
  audio: ['.mp3', '.wav', '.m4a', '.ogg', '.flac', '.aac', '.wma'],
  pdf: ['.pdf'],
  docx: ['.docx', '.doc'],
  xlsx: ['.xlsx', '.xls'],
  pptx: ['.pptx', '.ppt'],
  image: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'],
  video: ['.mp4', '.mov', '.avi', '.mkv']
};

function getFileFormat(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  for (const [format, extensions] of Object.entries(SUPPORTED_FORMATS)) {
    if (extensions.includes(ext)) {
      return format;
    }
  }

  return null;
}

function scanInputDirectory(inputDir, formatFilter) {
  const files = [];

  if (!fs.existsSync(inputDir)) {
    return { error: `Input directory not found: ${inputDir}`, files: [] };
  }

  try {
    const entries = fs.readdirSync(inputDir);

    for (const entry of entries) {
      if (entry.startsWith('.')) continue;

      const fullPath = path.join(inputDir, entry);
      const stats = fs.statSync(fullPath);

      if (stats.isFile()) {
        const format = getFileFormat(entry);

        if (format && (formatFilter === 'all' || formatFilter === format)) {
          files.push({
            name: entry,
            path: fullPath,
            format: format,
            size: stats.size,
            size_mb: Math.round(stats.size / 1024 / 1024 * 100) / 100
          });
        }
      }
    }
  } catch (error) {
    return { error: `Failed to scan directory: ${error.message}`, files: [] };
  }

  return { files };
}

function loadOrCreateInventory(projectPath) {
  const inventoryPath = path.join(projectPath, 'stage1-foundation', 'data-inventory.json');

  if (fs.existsSync(inventoryPath)) {
    try {
      return JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
    } catch (error) {
      // Corrupted file, create new
    }
  }

  return {
    documents: [],
    last_updated: new Date().toISOString()
  };
}

function saveInventory(projectPath, inventory) {
  const inventoryPath = path.join(projectPath, 'stage1-foundation', 'data-inventory.json');

  // Ensure directory exists
  const dir = path.dirname(inventoryPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  inventory.last_updated = new Date().toISOString();
  fs.writeFileSync(inventoryPath, JSON.stringify(inventory, null, 2));

  return inventoryPath;
}

function generateDocumentId(existing, format) {
  const prefix = format === 'audio' ? 'P' : 'D';
  const existingIds = existing
    .filter(d => d.id.startsWith(prefix))
    .map(d => parseInt(d.id.substring(1), 10))
    .filter(n => !isNaN(n));

  const nextNum = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
  return `${prefix}${String(nextNum).padStart(3, '0')}`;
}

function getToolInstruction(format, tier, filePath) {
  switch (format) {
    case 'audio':
      return {
        tool: 'markdownify',
        action: 'audio-to-markdown',
        command: `Use Markdownify audio-to-markdown on: ${filePath}`,
        notes: [
          'Review transcript for accuracy',
          'Add speaker labels (Interviewer:, Participant:)',
          'Mark unclear passages with [unclear]',
          'Note timestamps for key passages'
        ]
      };

    case 'pdf':
      if (tier.mineru) {
        return {
          tool: 'mineru',
          action: 'parse',
          command: `Use MinerU to parse PDF with VLM mode: ${filePath}`,
          fallback: `If MinerU fails, use Markdownify pdf-to-markdown: ${filePath}`,
          notes: [
            'VLM mode best for tables and figures',
            'Check table accuracy after conversion',
            'Verify figure descriptions'
          ]
        };
      } else {
        return {
          tool: 'markdownify',
          action: 'pdf-to-markdown',
          command: `Use Markdownify pdf-to-markdown on: ${filePath}`,
          notes: [
            'Review table formatting',
            'Check for missing content',
            'Figures may need manual description'
          ]
        };
      }

    case 'docx':
      return {
        tool: 'markdownify',
        action: 'docx-to-markdown',
        command: `Use Markdownify docx-to-markdown on: ${filePath}`,
        notes: ['Review formatting preservation']
      };

    case 'xlsx':
      return {
        tool: 'markdownify',
        action: 'xlsx-to-markdown',
        command: `Use Markdownify xlsx-to-markdown on: ${filePath}`,
        notes: ['Tables converted to markdown tables']
      };

    case 'pptx':
      return {
        tool: 'markdownify',
        action: 'pptx-to-markdown',
        command: `Use Markdownify pptx-to-markdown on: ${filePath}`,
        notes: ['Extracts text and image descriptions']
      };

    case 'image':
      return {
        tool: 'markdownify',
        action: 'image-to-markdown',
        command: `Use Markdownify image-to-markdown on: ${filePath}`,
        notes: ['OCR extracts text', 'Metadata preserved']
      };

    case 'video':
      return {
        tool: 'markdownify',
        action: 'youtube-to-markdown',
        command: `Use Markdownify for video: ${filePath}`,
        notes: ['May need to upload to YouTube first for transcription']
      };

    default:
      return {
        tool: 'manual',
        action: 'manual conversion',
        command: `Unsupported format - manual conversion needed: ${filePath}`,
        notes: ['Convert manually or use external tool']
      };
  }
}

function generateWorkflow(files, tier, projectPath, outputDir) {
  const inventory = loadOrCreateInventory(projectPath);
  const outputPath = path.join(projectPath, outputDir);

  // Ensure output directory exists
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  const workflow = {
    tier: tier.tier,
    tier_name: tier.name,
    input_files: files.length,
    output_directory: outputPath,
    steps: []
  };

  // Group files by format for efficient processing
  const byFormat = {};
  for (const file of files) {
    if (!byFormat[file.format]) {
      byFormat[file.format] = [];
    }
    byFormat[file.format].push(file);
  }

  let stepNum = 1;

  // Generate steps for each format group
  for (const [format, formatFiles] of Object.entries(byFormat)) {
    const toolInfo = getToolInstruction(format, tier, formatFiles[0].path);

    workflow.steps.push({
      step: stepNum++,
      format: format,
      file_count: formatFiles.length,
      tool: toolInfo.tool,
      action: toolInfo.action,
      files: formatFiles.map(f => ({
        name: f.name,
        path: f.path,
        size_mb: f.size_mb,
        suggested_id: generateDocumentId(inventory.documents, format),
        output_name: `${generateDocumentId(inventory.documents, format)}-${path.parse(f.name).name}.md`
      })),
      instruction: toolInfo.command,
      notes: toolInfo.notes,
      fallback: toolInfo.fallback
    });
  }

  // Add inventory update step
  workflow.steps.push({
    step: stepNum++,
    action: 'update_inventory',
    description: 'Update data inventory',
    inventory_path: path.join(projectPath, 'stage1-foundation', 'data-inventory.json'),
    instruction: 'After processing each file, add entry to data-inventory.json with conversion details.'
  });

  // Add quality check step
  workflow.steps.push({
    step: stepNum++,
    action: 'quality_check',
    description: 'Review converted files',
    instruction: `Review all converted files in ${outputPath}:
      - Check transcription accuracy (audio)
      - Verify table formatting (PDFs)
      - Add speaker labels where needed
      - Mark unclear passages`
  });

  return workflow;
}

function main() {
  const args = parseArgs();

  if (!args['project-path']) {
    console.error(JSON.stringify({
      success: false,
      error: 'Missing required argument: --project-path'
    }));
    process.exit(1);
  }

  // Path traversal protection
  const resolvedPath = path.resolve(args['project-path']);
  const configTarget = path.join(resolvedPath, '.interpretive-orchestration', 'config.json');
  if (!configTarget.startsWith(resolvedPath + path.sep) && configTarget !== resolvedPath) {
    console.error(JSON.stringify({
      success: false,
      error: 'Path traversal detected - invalid project path'
    }));
    process.exit(1);
  }

  const inputDir = args['input-dir'];
  const outputDir = args['output-dir'] || 'stage1-foundation/manual-codes';
  const formatFilter = args.format || 'all';

  // Path traversal protection for output-dir
  // Output directory MUST be within project path
  const resolvedOutput = path.resolve(resolvedPath, outputDir);
  if (!resolvedOutput.startsWith(resolvedPath + path.sep) && resolvedOutput !== resolvedPath) {
    console.error(JSON.stringify({
      success: false,
      error: 'Path traversal detected - output directory must be within project path',
      output_dir: outputDir,
      suggestion: 'Use a relative path like "stage1-foundation/manual-codes"'
    }));
    process.exit(1);
  }

  if (!inputDir) {
    // Return guidance on using the script
    console.log(JSON.stringify({
      success: true,
      mode: 'guidance',
      message: 'No input directory specified. Here is how to use this script:',
      usage: {
        basic: 'node process-audio.js --project-path /path/to/project --input-dir /path/to/files',
        with_filter: 'node process-audio.js --project-path /path/to/project --input-dir /path/to/files --format audio',
        list_only: 'node process-audio.js --project-path /path/to/project --input-dir /path/to/files --list'
      },
      supported_formats: SUPPORTED_FORMATS,
      detected_tier: detectTier()
    }, null, 2));
    process.exit(0);
  }

  // Scan input directory
  const scanResult = scanInputDirectory(inputDir, formatFilter);

  if (scanResult.error) {
    console.error(JSON.stringify({
      success: false,
      error: scanResult.error
    }));
    process.exit(1);
  }

  if (scanResult.files.length === 0) {
    console.log(JSON.stringify({
      success: true,
      message: 'No supported files found in input directory',
      input_dir: inputDir,
      format_filter: formatFilter,
      supported_formats: SUPPORTED_FORMATS
    }, null, 2));
    process.exit(0);
  }

  // List mode - just show files
  if (args.list) {
    console.log(JSON.stringify({
      success: true,
      mode: 'list',
      input_dir: inputDir,
      files: scanResult.files,
      summary: {
        total: scanResult.files.length,
        by_format: scanResult.files.reduce((acc, f) => {
          acc[f.format] = (acc[f.format] || 0) + 1;
          return acc;
        }, {})
      }
    }, null, 2));
    process.exit(0);
  }

  // Generate workflow
  const tier = detectTier();
  const workflow = generateWorkflow(scanResult.files, tier, resolvedPath, outputDir);

  console.log(JSON.stringify({
    success: true,
    mode: 'workflow',
    detected_tier: tier,
    workflow: workflow,
    summary: {
      total_files: scanResult.files.length,
      by_format: scanResult.files.reduce((acc, f) => {
        acc[f.format] = (acc[f.format] || 0) + 1;
        return acc;
      }, {}),
      total_size_mb: Math.round(scanResult.files.reduce((acc, f) => acc + f.size_mb, 0) * 100) / 100
    },
    next_action: workflow.steps[0]?.instruction || 'No files to process'
  }, null, 2));
}

main();
