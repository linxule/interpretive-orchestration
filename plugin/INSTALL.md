# Installation Guide for Qualitative Researchers

This guide walks you through setup from scratch - no prior experience with command-line tools required.

---

## Quick Start Alternative

**Want a pre-configured environment?** Use the [Starter Project](https://github.com/linxule/interpretive-orchestration-starter):

1. Clone or download the starter repo
2. Double-click `starter.code-workspace` to open in VS Code/Cursor
3. Install recommended extensions when prompted
4. Continue from Step 1 below

The starter project gives you a clean, research-focused VS Code environment with beginner-friendly settings.

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

### macOS / Linux

Open Terminal and run:
```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Then restart your terminal or run `source ~/.zshrc` (Mac) / `source ~/.bashrc` (Linux).

### Windows

Open PowerShell and run:
```powershell
irm https://claude.ai/install.ps1 | iex
```

Then restart your terminal.

### Verify installation
```bash
claude --version
```

See [official docs](https://code.claude.com/docs/en/setup) for alternative installation methods.

---

## Step 2: Install Node.js (required for plugin features)

Node.js powers the plugin's methodology enforcement hooks and analysis scripts. Claude Code itself doesn't require Node.js, but this plugin does.

### Check if you already have it:
```bash
node --version
# Should show v18.0.0 or higher
```

### If you need to install Node.js:

**All platforms:** Download from [nodejs.org](https://nodejs.org/)
1. Click the big green **LTS** button
2. Run the downloaded installer
3. Follow the prompts (click "Next" through)
4. **Restart your terminal** after installing
5. Verify with `node --version`

**Or ask Claude Code:** Run `claude` and ask *"Help me install Node.js 18 or higher"*

---

## Step 3: Install the Plugin

Navigate to your project folder and launch Claude Code:
```bash
cd ~/my-qualitative-research
claude
```

Then type:
```
/plugin install linxule/interpretive-orchestration
```

Claude Code will:
- Download the plugin
- Install bundled MCP servers (Sequential Thinking, Lotus Wisdom)
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

**Full MCP documentation:** See [DEPENDENCIES.md](DEPENDENCIES.md) for complete capabilities and setup instructions.

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
| **MinerU** | High-accuracy PDF parsing (90%+) | MINERU_API_KEY |
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

*Built by Xule Lin and Kevin Corley (Imperial College London), with Claude Opus 4.5 (Anthropic) as co-apprentice, reviewed by Codex (OpenAI) and Gemini (Google)*
