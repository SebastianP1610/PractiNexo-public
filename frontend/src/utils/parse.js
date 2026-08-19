function parseStringList(value) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (value == null) return [];
  const str = String(value);
  if (!str.trim()) return [];
  return str
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseJsonSafe(text, fallback = null) {
  if (!text) return fallback;
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

export { parseStringList, parseJsonSafe };
