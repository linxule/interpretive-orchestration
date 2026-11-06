# Troubleshooting Guide

Common issues and solutions for the Interpretive Orchestration plugin.

---

## Installation Issues

### "Command not found: /qual-init"

**Cause:** The plugin may not be installed correctly.

**Solutions:**
1. Check if the plugin is installed. In a terminal, run:
   ```
   claude plugin list
   ```
2. If not listed, reinstall from inside Claude Code:
   ```
   /plugin marketplace add linxule/interpretive-orchestration
   /plugin install interpretive-orchestration@interpretive-orchestration
   ```
3. Restart Claude Code and try again

---

### "Plugin marketplace not found"

**Cause:** The marketplace URL may be incorrect or unreachable.

**Solutions:**
1. Check your internet connection
2. Verify the marketplace URL is correct
3. Try adding the marketplace again:
   ```
   /plugin marketplace add linxule/interpretive-orchestration
   ```

---

## MCP Server Issues

### "Sequential Thinking" server missing

**Cause:** Version 0.3.0 removed the Sequential Thinking MCP server. Nothing is wrong.

`/qual-think-through` and the deep-reasoning skill now ask the model to think deeply and step by step before responding. They need no server.

---

### Lotus Wisdom not available

**Cause:** The server may not have started correctly.

**Solutions:**
1. Restart Claude Code
2. Check if Node.js is installed: `node --version` (need v18+)
3. Check npm installation: `npm -v`
4. Clear npm cache: `npm cache clean --force`
5. Try: `npx -y lotus-wisdom-mcp@latest`
6. If Node.js is not an option, use the hosted Lotus Wisdom server instead. See [DEPENDENCIES.md](DEPENDENCIES.md#lotus-wisdom).

---

### PDF conversion issues

**Cause:** No automated PDF conversion available (Markdownify has been removed due to SDK compatibility issues).

**Solutions:**
1. **With MinerU API key:** Use MinerU for 90%+ accuracy PDF parsing
2. **Without API key - manual options:**
   - Adobe Acrobat: Export PDF to Word or text
   - Google Docs: Upload PDF, it will OCR automatically
   - Online converters: pdf2txt.com, smallpdf.com
3. **For scanned PDFs:** Use Google Docs OCR or Adobe Scan

### Audio transcription

**Cause:** No bundled audio transcription available.

**Solutions:**
1. **Otter.ai** - Upload recordings for automatic transcription
2. **Rev.com** - Professional transcription service
3. **YouTube** - Upload as unlisted video, download auto-captions
4. **OpenAI Whisper** - Free local transcription (requires Python setup)

---

## Hook Issues

### "Stage 1 not complete" prompt when using @dialogical-coder or a Stage 2 command

**Cause:** This is intentional! The plugin enforces the "sandwich methodology" - Stage 1 manual coding comes before AI-assisted coding. When Stage 1 is not complete, Claude Code shows what the check found and asks you to confirm before @dialogical-coder, `/qual-parallel-streams`, `/qual-synthesize`, `/qual-code-deductive` or `/qual-characterize-patterns` runs.

**Solutions:**
1. Complete manual coding of 10-15 documents
2. Run `/qual-complete-stage1` to validate your foundation and mark Stage 1 complete
3. Run `/qual-status` to check your progress
4. If you have a reason to go ahead now, confirm the prompt and tell Claude why

---

### Hooks not triggering

**Cause:** Hooks may not be properly configured, or the call is not one the hook was written for.

Each hook fires only for specific agents and commands. For example, the interpretive pause follows @dialogical-coder, not other agents. Before version 0.3.0, the hooks did not fire at all in current Claude Code.

**Solutions:**
1. Check you have version 0.3.0 or later. In a terminal, run `claude plugin list`
2. Check Node.js is installed: `node --version` (the hooks run on Node.js)
3. Run `/hooks` in Claude Code to see the registered hooks
4. Check you are in your project folder, the one with `.interpretive-orchestration/`
5. Restart Claude Code to reload hooks

---

## Project Configuration Issues

### "Config file not found"

**Cause:** You haven't initialized a project yet.

**Solutions:**
1. Run `/qual-init` to create a new project
2. Check that you're in the correct directory

---

### Project state seems corrupted

**Cause:** Config file may have been manually edited incorrectly.

**Solutions:**
1. Check `.interpretive-orchestration/config.json` for JSON syntax errors
2. Use a JSON validator to check the file
3. Restore from backup if available
4. As last resort, reinitialize: `/qual-init`

---

## Philosophical Coherence Issues

### "Epistemic incoherence detected" warning

**Cause:** Your analytical language doesn't match your declared philosophical stance.

**This is a feature, not a bug!** The plugin helps you maintain philosophical consistency.

**Solutions:**
1. Review the warning message for specific suggestions
2. Adjust your language to match your stance:
   - Constructivist: "construct", "characterize", "interpret"
   - Objectivist: "discover", "find", "identify"
3. Run `/qual-examine-assumptions` to reflect on your approach

---

## Performance Issues

### Claude Code running slowly

**Cause:** Multiple MCP servers or large files.

**Solutions:**
1. Disable optional MCP servers you're not using
2. Work with smaller document batches
3. Close other resource-intensive applications
4. Restart Claude Code periodically

---

## Getting More Help

If your issue isn't listed here:

1. **Check the documentation:**
   - `README.md` - Overview and philosophy
   - `ARCHITECTURE.md` - Technical details
   - `QUICK-START.md` - Getting started guide

2. **Run diagnostics:**
   ```
   /qual-check-setup
   ```

3. **Report issues:**
   - GitHub: [plugin repository issues page](https://github.com/linxule/interpretive-orchestration/issues)
   - Include: error messages, steps to reproduce, your OS and Claude Code version

---

*This troubleshooting guide is part of Interpretive Orchestration: Epistemic Partnership System*
