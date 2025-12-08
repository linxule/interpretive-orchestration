# Troubleshooting Guide

Common issues and solutions for the Interpretive Orchestration plugin.

---

## Installation Issues

### "Command not found: /qual-init"

**Cause:** The plugin may not be installed correctly.

**Solutions:**
1. Check if the plugin is installed:
   ```
   /plugin list
   ```
2. If not listed, reinstall:
   ```
   /plugin marketplace add linxule/interpretive-orchestration
   /plugin install interpretive-orchestration
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

### Sequential Thinking not responding

**Cause:** The MCP server may have failed to start.

**Solutions:**
1. Restart Claude Code
2. Check if Node.js is installed: `node --version` (need v18+)
3. Try manually starting: `npx -y @modelcontextprotocol/server-sequential-thinking`

---

### Lotus Wisdom not available

**Cause:** The server may not have started correctly.

**Solutions:**
1. Restart Claude Code
2. Check npm installation: `npm -v`
3. Clear npm cache: `npm cache clean --force`
4. Try: `npx -y lotus-wisdom-mcp-server`

---

### Markdownify fails on PDF conversion

**Cause:** PDF may be corrupted, scanned (image-based), or too large.

**Solutions:**
1. Ensure the PDF contains actual text (not scanned images)
2. Try a smaller PDF first to test
3. For scanned PDFs, use OCR software first

---

## Hook Issues

### "Stage 1 not complete" error when trying to use @dialogical-coder

**Cause:** This is intentional! The plugin enforces the "sandwich methodology" - you must complete Stage 1 manual coding before AI-assisted coding.

**Solutions:**
1. Complete manual coding of 10-15 documents
2. Update your project config to mark Stage 1 as complete
3. Run `/qual-status` to check your progress

---

### Hooks not triggering

**Cause:** Hooks may not be properly configured or the event isn't matching.

**Solutions:**
1. Check that hooks are enabled in your project
2. Verify the hooks.json file exists in the plugin
3. Restart Claude Code to reload hooks

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
   - GitHub: [plugin repository issues page]
   - Include: error messages, steps to reproduce, your OS and Claude Code version

---

*This troubleshooting guide is part of Interpretive Orchestration: Epistemic Partnership System*
