# Installation Guide for Qualitative Researchers

This guide walks you through setup from scratch - no prior experience with command-line tools required.

---

## Step 0: Create Your Project Folder

Before installing anything, create a dedicated folder for your research:

### macOS / Linux
Open Terminal and run:
```bash
mkdir ~/my-qualitative-research
cd ~/my-qualitative-research
```

### Windows
Open PowerShell and run:
```powershell
mkdir ~\my-qualitative-research
cd ~\my-qualitative-research
```

**Why?** Your qualitative research project will live here - data, memos, analysis, everything organized in one place.

---

## Step 1: Install Claude Code

### macOS

Open Terminal and run:
```bash
# Install via Homebrew (recommended)
brew install anthropic/tap/claude-code

# Or install via npm if you prefer
npm install -g @anthropic-ai/claude-code
```

### Windows

Open PowerShell as Administrator and run:
```powershell
# Install via npm (requires Node.js - see Step 2 if you don't have it)
npm install -g @anthropic-ai/claude-code

# Or download the installer from:
# https://claude.com/download
```

### Linux

```bash
# Install via npm
npm install -g @anthropic-ai/claude-code

# Or via curl
curl -fsSL https://claude.com/install.sh | bash
```

**Verify installation:**
```bash
claude --version
```

---

## Step 2: Install Node.js (if needed)

Node.js powers the plugin's methodology enforcement hooks.

### Check if you already have it:
```bash
node --version
# Should show v18.0.0 or higher
```

### If you need to install Node.js:

**Option A: Let Claude Code help you!**
```bash
cd ~/my-qualitative-research
claude
```
Then ask: *"Help me install Node.js 18 or higher on my system"*

Claude Code will guide you through the installation step by step.

**Option B: Manual installation**

#### macOS
```bash
brew install node@20
```

#### Windows
Download from: https://nodejs.org/en/download/
Choose the "LTS" (Long Term Support) version.

#### Linux (Ubuntu/Debian)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## Step 3: Install the Plugin

Navigate to your project folder and launch Claude Code:
```bash
cd ~/my-qualitative-research
claude
```

Then type:
```
/plugin install interpretive-orchestration
```

Claude Code will:
- Download the plugin
- Install bundled MCP servers (Sequential Thinking, Lotus Wisdom, Markdownify)
- Set up methodology enforcement hooks

---

## Step 4: Verify Installation

In Claude Code, type:
```
/qual-check-setup
```

You should see confirmation that:
- Plugin is installed
- Bundled MCPs are configured
- Hooks are registered
- Templates are available

---

## Step 5: Initialize Your Research Project

Still in Claude Code:
```
/qual-init
```

This starts the Socratic onboarding dialogue that establishes:
- Your research question
- Your philosophical stance (ontology, epistemology)
- Your methodological tradition (Gioia, Charmaz, etc.)

**Take your time with this.** The philosophy isn't overhead - it's the foundation that makes everything else work.

---

## What Gets Installed Automatically

These tools are **bundled and work immediately** - no API keys needed:

| Tool | What It Does |
|------|--------------|
| **Sequential Thinking** | Dynamic reasoning through structured thought sequences |
| **Lotus Wisdom** | Navigate paradoxes with contemplative problem-solving |
| **Markdownify** | Convert PDFs, transcribe audio, extract from videos/web |

**Markdownify** is especially valuable - it can transcribe your interview recordings directly!

---

## Optional: Enhanced MCP Servers

The plugin works great with just the bundled MCPs. For advanced features:

### Let Claude Code Help You

The easiest way to set up optional MCPs:

```bash
cd ~/my-qualitative-research
claude
```

Then ask: *"Help me set up the Zen MCP server for multi-model validation"*

Claude Code will guide you through:
1. Getting the necessary API keys
2. Setting up environment variables
3. Testing the connection

### Available Optional MCPs

| MCP | What It Does | API Key Needed |
|-----|--------------|----------------|
| **Zen** | Multi-model validation (Gemini, GPT-4) | GOOGLE_API_KEY or OPENAI_API_KEY |
| **Exa** | Literature search | EXA_API_KEY |
| **Jina** | Web article fetching | JINA_API_KEY |
| **Zotero** | Bibliography management | ZOTERO_API_KEY + ZOTERO_LIBRARY_ID |

### Manual Setup (if preferred)

1. Get your API keys from the respective services
2. Add to your shell profile (`~/.zshrc` on macOS, `~/.bashrc` on Linux):
```bash
export GOOGLE_API_KEY="your-key-here"
export EXA_API_KEY="your-key-here"
```
3. Restart Claude Code
4. Verify with `/qual-check-setup`

---

## Troubleshooting

If you encounter issues:

1. **Check your installation:** Run `/qual-check-setup`
2. **Read the troubleshooting guide:** See `TROUBLESHOOTING.md`
3. **Ask Claude Code:** It can help debug most setup issues!
4. **Restart Claude Code:** Sometimes changes need a restart to take effect

---

## You're Ready!

Your setup is complete. Next steps:

1. **Read the philosophy** - `README.md` explains why this tool works differently
2. **Start Stage 1** - Begin manual coding of 10-15 documents
3. **Use @stage1-listener** - A thinking partner to help articulate your insights
4. **Write memos** - Capture your emerging theoretical sensitivity

Remember: The friction is intentional. Slow down to think deeply.

---

**Welcome to the atelier.**

*Built by Xule Lin (Imperial College London), Kevin Corley (Arizona State University), and Claude 4.5 (Anthropic)*
