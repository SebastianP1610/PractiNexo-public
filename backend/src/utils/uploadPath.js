const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

function resolveStoredUpload(relativePath, folder) {
  if (!relativePath || typeof relativePath !== 'string') return null;

  const folderDir = path.resolve(UPLOADS_DIR, folder);
  const filePath = path.resolve(UPLOADS_DIR, relativePath);
  const folderPrefix = `${folderDir}${path.sep}`;

  return filePath.startsWith(folderPrefix) ? filePath : null;
}

function safeDownloadName(name, fallback) {
  const baseName = path
    .basename(String(name || ''))
    .replace(/[^a-zA-Z0-9._ -]/g, '_')
    .slice(0, 120);
  if (!baseName) return fallback;
  return baseName.toLowerCase().endsWith('.pdf') ? baseName : `${baseName}.pdf`;
}

module.exports = { UPLOADS_DIR, resolveStoredUpload, safeDownloadName };
