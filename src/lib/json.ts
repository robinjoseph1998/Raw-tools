import type { Result, JsonOperation, TextStats } from '@/types';

const ok = <T,>(data: T): Result<T> => ({ success: true, data });
const err = (error: string): Result<never> => ({ success: false, error });

const TOKEN_RE = /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\b(?:true|false)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?|\bnull\b|[{}\[\],])/g;
const HTML_ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };

export function parseJSON(raw: string): Result<unknown> {
  if (!raw?.trim()) return err('Input is empty.');
  try {
    return ok(JSON.parse(raw));
  } catch (e) {
    return err(friendlyError(e as Error));
  }
}

export function transformJSON(raw: string, operation: JsonOperation = 'format'): Result<string> {
  const parsed = parseJSON(raw);
  if (!parsed.success) return parsed;
  const output =
    operation === 'minify'
      ? JSON.stringify(parsed.data)
      : JSON.stringify(parsed.data, null, 2);
  return ok(output);
}

export function highlightJSON(json: string): string {
  const escaped = json.replace(/[&<>]/g, (ch) => HTML_ESC[ch] ?? ch);
  return escaped.replace(TOKEN_RE, (match) => {
    let cls = 'json-number';
    if (match[0] === '"') {
      cls = match[match.length - 1] === ':' || match.endsWith(' :') ? 'json-key' : 'json-string';
    } else if (match === 'true' || match === 'false') {
      cls = 'json-bool';
    } else if (match === 'null') {
      cls = 'json-null';
    } else if ('{[]},'.includes(match)) {
      cls = 'json-brace';
    }
    return `<span class="${cls}">${match}</span>`;
  });
}

export function calcStats(text: string): TextStats {
  if (!text) return { lines: 0, size: '0 B' };
  const lines = text.split('\n').length;
  const bytes = new Blob([text]).size;
  return { lines, size: formatBytes(bytes) };
}

function formatBytes(n: number): string {
  if (n < 1024) return n + ' B';
  if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
  return (n / 1048576).toFixed(1) + ' MB';
}

function friendlyError(e: Error): string {
  const msg = e.message || 'Unknown error';
  const lineMatch = msg.match(/line\s+(\d+)\s+column\s+(\d+)/i);
  if (lineMatch) return `${msg} (line ${lineMatch[1]}, col ${lineMatch[2]})`;
  const posMatch = msg.match(/position\s+(\d+)/i);
  if (posMatch) return `${msg} (char ${posMatch[1]})`;
  return msg;
}

export const SAMPLE_JSON = JSON.stringify(
  {
    name: 'RAW',
    version: '2.0.0',
    features: ['format', 'validate', 'minify', 'convert', 'jwt'],
    config: { darkMode: true, indentSize: 2, maxDepth: null },
    stats: { users: 12450, rating: 4.9, isOpenSource: true },
  },
  null,
  2,
);
