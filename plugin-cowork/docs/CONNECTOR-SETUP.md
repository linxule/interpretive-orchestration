# Setting Up Connectors (MCP Servers) for Enhanced Features

This guide helps you install optional connectors that enhance the plugin's capabilities. **The plugin works without these** - they're optional enhancements for deeper analytical features.

---

## What Are Connectors?

Connectors (technically called "MCP servers" - Model Context Protocol servers) are small helper programs that run on your computer and give Claude additional capabilities. Think of them as specialized assistants that Claude can call on when needed:

| Connector | What It Does | Used By |
|-----------|--------------|---------|
| **Sequential Thinking** | Structured step-by-step reasoning | @dialogical-coder |
| **Lotus Wisdom** | Navigate paradoxes and tensions | @scholarly-companion |
| **Markdownify** | Convert documents to markdown | Document import skills |

---

## Do I Need These?

**No!** The plugin works great without connectors. Consider adding them if:

- You want deeper analytical reasoning in coding sessions
- You work with paradoxical or contradictory patterns
- You need to convert various document formats

---

## Installation Methods

### Method 1: Through Claude Desktop Settings (If Available)

1. Open **Claude Desktop** (the app, not the web version)
2. Go to **Settings** → **Developer** → **Edit Config**
3. If you see a "Connectors" or "MCP Servers" option, you can add connectors through the interface

> **Note:** The Claude Desktop interface changes over time. If you don't see these options, use Method 2 below. Method 2 works reliably across all versions.

> **Note:** Connectors require Node.js to be installed on your computer. See "Installing Node.js" below if you don't have it.

---

### Method 2: Manual Configuration

If you're comfortable with configuration files:

1. Find your Claude configuration directory:
   - **Mac:** `~/Library/Application Support/Claude/`
   - **Windows:** `%APPDATA%\Claude\`

2. Create or edit `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mcp-sequentialthinking-tools": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    },
    "lotus-wisdom": {
      "command": "npx",
      "args": ["-y", "lotus-wisdom-mcp"]
    },
    "markdownify": {
      "command": "npx",
      "args": ["-y", "@iflow-mcp/markdownify-mcp"]
    }
  }
}
```

3. Restart Claude Desktop

---

## Installing Node.js (Required for Most Connectors)

Most connectors need Node.js to run. Here's how to install it:

### Mac

**Option A: Download Installer (Easiest)**
1. Go to [nodejs.org](https://nodejs.org)
2. Download the "LTS" version (recommended)
3. Open the downloaded file and follow the installer

**Option B: Using Homebrew**
```bash
brew install node
```

### Windows

1. Go to [nodejs.org](https://nodejs.org)
2. Download the "LTS" version for Windows
3. Run the installer
4. Follow the prompts (accept defaults)
5. Restart your computer

### Verify Installation

**Mac:** Open Terminal (press Cmd+Space, type "Terminal", press Enter)
**Windows:** Open Command Prompt (press Windows key, type "cmd", press Enter)

Type this command and press Enter:
```bash
node --version
```

You should see a version number like `v20.x.x`. If you see "command not found", restart your computer and try again.

---

## Connector Details

### Sequential Thinking

**Purpose:** Helps the dialogical-coder agent think through coding decisions step by step.

**Installation:**
```bash
npx -y @modelcontextprotocol/server-sequential-thinking
```

**What it provides:**
- Structured reasoning chains
- Visible thought process
- Ability to revise and backtrack thinking

**Used by:** `@dialogical-coder` agent during Stage 2 coding

---

### Lotus Wisdom

**Purpose:** Helps navigate paradoxes, contradictions, and "both/and" tensions in your data.

**Installation:**
```bash
npx -y lotus-wisdom-mcp
```

**What it provides:**
- Contemplative reasoning for complex problems
- Integration of opposing perspectives
- Non-dual thinking support

**Used by:** `@scholarly-companion` agent during Stage 3 theorization

**Source:** [linxule/lotus-wisdom-mcp](https://github.com/linxule/lotus-wisdom-mcp)

---

### Markdownify

**Purpose:** Converts various document formats to markdown for easier analysis.

**Installation:**
```bash
npx -y @iflow-mcp/markdownify-mcp
```

**What it provides:**
- PDF to markdown conversion
- Word document conversion
- Web page capture

**Used by:** Document import and interview ingest skills

**Source:** Based on [zcaceres/markdownify-mcp](https://github.com/zcaceres/markdownify-mcp)

---

## Troubleshooting

### "npx: command not found"

Node.js isn't installed or not in your PATH. See "Installing Node.js" above.

### "Permission denied" errors

**Mac:** You may need to install globally:
```bash
sudo npm install -g @modelcontextprotocol/server-sequential-thinking
```

**Windows:** Run Command Prompt as Administrator.

### Connector doesn't appear in Claude

1. Make sure you restarted Claude Desktop after configuration
2. Check the configuration file for JSON syntax errors
3. Try the Terminal/Command Prompt to test the connector:
   ```bash
   npx -y @modelcontextprotocol/server-sequential-thinking
   ```
   (Press Ctrl+C to stop)

### "EACCES: permission denied" on npm

**Mac:**
```bash
sudo chown -R $(whoami) ~/.npm
```

### Still stuck?

Ask Claude in a new conversation:
> "Help me install the Sequential Thinking MCP server. I'm on [Mac/Windows]."

Claude can walk you through the steps interactively!

---

## What If I Can't Install Connectors?

**That's completely fine!** The plugin provides:

- All slash commands work without connectors
- All skills work without connectors
- All agents work without connectors (just without enhanced reasoning)

The agents will simply use Claude's built-in reasoning instead of the specialized MCP tools. You'll still get:
- Four-stage dialogical coding
- Socratic theoretical dialogue
- Reflexivity prompts
- All methodological hooks

The connectors are enhancements, not requirements.

---

## For Technical Users

If you're comfortable with the command line, you can test that the connectors work before adding them to Claude's config:

```bash
# Test each connector (Ctrl+C to stop after verifying it starts)
npx -y @modelcontextprotocol/server-sequential-thinking
npx -y lotus-wisdom-mcp
npx -y @iflow-mcp/markdownify-mcp
```

Once verified, add them to your `claude_desktop_config.json` using Method 2 above. The connectors will then start automatically when Claude Desktop launches.

---

## Getting Help

- **Plugin issues:** Open an issue on [GitHub](https://github.com/linxule/interpretive-orchestration/issues)
- **General Claude questions:** [Claude Support](https://support.anthropic.com)
- **Node.js help:** [nodejs.org documentation](https://nodejs.org/en/docs)

---

*The plugin enhances qualitative research with or without these connectors. Install what's useful for your workflow!*
