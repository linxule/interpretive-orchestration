/**
 * Reads and appends to a project's conversation log
 * (.interpretive-orchestration/conversation-log.jsonl), one JSON object per line.
 */

const fs = require('fs');

// Lines that are not JSON objects are skipped: one bad line must not stop a reader.
function readEntries(logPath) {
  if (!fs.existsSync(logPath)) return [];
  return fs.readFileSync(logPath, 'utf8').split('\n').flatMap(line => {
    if (!line.trim()) return [];
    try {
      const entry = JSON.parse(line);
      return entry && typeof entry === 'object' ? [entry] : [];
    } catch (error) {
      return [];
    }
  });
}

// Starts a new line first if the log does not end with one.
function appendLine(logPath, text) {
  const size = fs.existsSync(logPath) ? fs.statSync(logPath).size : 0;
  let separator = '';
  if (size > 0) {
    const fd = fs.openSync(logPath, 'r');
    const last = Buffer.alloc(1);
    fs.readSync(fd, last, 0, 1, size - 1);
    fs.closeSync(fd);
    if (last.toString() !== '\n') separator = '\n';
  }
  fs.appendFileSync(logPath, separator + text + '\n');
}

module.exports = { readEntries, appendLine };
