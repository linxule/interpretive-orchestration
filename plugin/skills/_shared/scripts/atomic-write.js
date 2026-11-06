const fs = require('fs');

function atomicWrite(filePath, content) {
  const tempPath = filePath + '.tmp.' + process.pid;
  try {
    fs.writeFileSync(tempPath, content);
    if (fs.existsSync(filePath)) fs.chmodSync(tempPath, fs.statSync(filePath).mode & 0o777);
    fs.renameSync(tempPath, filePath);
  } catch (error) {
    try { fs.unlinkSync(tempPath); } catch (cleanupError) {}
    throw error;
  }
}

module.exports = { atomicWrite };
