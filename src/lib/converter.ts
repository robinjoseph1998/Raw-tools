import yaml from 'js-yaml';
import type { ConvertFormat } from '@/types';

// ── Universal parse / serialize ──
// All conversions go: parse(source) → JS object → serialize(target)

export function parseFormat(input: string, format: ConvertFormat): unknown {
  switch (format) {
    case 'json': return JSON.parse(input);
    case 'yaml': return fromYaml(input);
    case 'csv':  return fromCsv(input);
    case 'xml':  return fromXml(input);
  }
}

export function serializeFormat(data: unknown, format: ConvertFormat): string {
  switch (format) {
    case 'json': return JSON.stringify(data, null, 2);
    case 'yaml': return toYaml(data);
    case 'csv':  return toCsv(data);
    case 'xml':  return toXml(data);
  }
}

export function detectFormat(input: string): ConvertFormat | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // JSON: starts with { or [
  if (/^[\[{]/.test(trimmed)) {
    try { JSON.parse(trimmed); return 'json'; } catch {}
  }

  // XML: starts with < (tag or declaration)
  if (/^<(\?xml|[a-zA-Z])/.test(trimmed)) return 'xml';

  // CSV: has commas and multiple lines with consistent column count
  const lines = trimmed.split('\n').filter((l) => l.trim());
  if (lines.length >= 2) {
    const firstCommas = (lines[0].match(/,/g) || []).length;
    if (firstCommas > 0) {
      const secondCommas = (lines[1].match(/,/g) || []).length;
      if (firstCommas === secondCommas) return 'csv';
    }
  }

  // YAML: key: value pattern
  if (/^[a-zA-Z_][\w]*:\s/m.test(trimmed)) return 'yaml';

  return null;
}

// ── YAML (via js-yaml) ──
export function toYaml(data: unknown): string {
  return yaml.dump(data, { indent: 2, lineWidth: 120, noRefs: true });
}

// ── CSV (custom) ──
export function toCsv(data: unknown): string {
  if (data === null || data === undefined) return '';
  if (typeof data !== 'object') return String(data);

  // Array of objects → tabular CSV
  if (Array.isArray(data)) {
    if (data.length === 0) return '';
    if (typeof data[0] !== 'object' || data[0] === null) {
      // Array of primitives → single column
      return 'value\n' + data.map((v) => escapeCsv(String(v))).join('\n');
    }
    const allKeys = collectKeys(data);
    const header = allKeys.map(escapeCsv).join(',');
    const rows = data.map((row) =>
      allKeys.map((key) => {
        const val = getNestedValue(row, key);
        return escapeCsv(val === undefined ? '' : typeof val === 'object' ? JSON.stringify(val) : String(val));
      }).join(','),
    );
    return [header, ...rows].join('\n');
  }

  // Single object → key,value pairs
  const flat = flattenObject(data as Record<string, unknown>);
  return 'key,value\n' + Object.entries(flat)
    .map(([k, v]) => `${escapeCsv(k)},${escapeCsv(typeof v === 'object' ? JSON.stringify(v) : String(v ?? ''))}`)
    .join('\n');
}

function collectKeys(arr: unknown[]): string[] {
  const keySet = new Set<string>();
  for (const item of arr) {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      for (const key of Object.keys(flattenObject(item as Record<string, unknown>))) {
        keySet.add(key);
      }
    }
  }
  return Array.from(keySet);
}

function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(result, flattenObject(val as Record<string, unknown>, fullKey));
    } else {
      result[fullKey] = val;
    }
  }
  return result;
}

function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((curr: unknown, key) => {
    if (curr && typeof curr === 'object' && !Array.isArray(curr)) {
      return (curr as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function escapeCsv(val: string): string {
  if (/[,"\n\r]/.test(val)) {
    return '"' + val.replace(/"/g, '""') + '"';
  }
  return val;
}

// ── Reverse: YAML → JSON ──
export function fromYaml(input: string): unknown {
  return yaml.load(input);
}

// ── Reverse: CSV → JSON ──
export function fromCsv(input: string): unknown {
  const rows = parseCsvRows(input);
  if (rows.length === 0) return [];
  const headers = rows[0];
  if (rows.length === 1) return [];
  return rows.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = row[i] ?? ''; });
    return obj;
  });
}

function parseCsvRows(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') { cell += '"'; i++; }
        else { inQuotes = false; }
      } else { cell += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { row.push(cell); cell = ''; }
      else if (ch === '\n' || (ch === '\r' && input[i + 1] === '\n')) {
        if (ch === '\r') i++;
        row.push(cell); cell = '';
        if (row.some((c) => c !== '')) rows.push(row);
        row = [];
      } else { cell += ch; }
    }
  }
  row.push(cell);
  if (row.some((c) => c !== '')) rows.push(row);
  return rows;
}

// ── Reverse: XML → JSON ──
export function fromXml(input: string): unknown {
  const parser = new DOMParser();
  const doc = parser.parseFromString(input, 'text/xml');
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) throw new Error('Invalid XML: ' + errorNode.textContent?.slice(0, 120));
  return xmlNodeToObj(doc.documentElement);
}

function xmlNodeToObj(node: Element): unknown {
  const children = Array.from(node.childNodes).filter(
    (n) => n.nodeType === Node.ELEMENT_NODE || (n.nodeType === Node.TEXT_NODE && n.textContent?.trim()),
  );
  if (children.length === 0) return node.textContent?.trim() ?? '';
  if (children.length === 1 && children[0].nodeType === Node.TEXT_NODE) {
    return coerceValue(children[0].textContent?.trim() ?? '');
  }
  const result: Record<string, unknown> = {};
  for (const child of children) {
    if (child.nodeType !== Node.ELEMENT_NODE) continue;
    const el = child as Element;
    const key = el.tagName;
    const val = xmlNodeToObj(el);
    if (key in result) {
      const existing = result[key];
      result[key] = Array.isArray(existing) ? [...existing, val] : [existing, val];
    } else {
      result[key] = val;
    }
  }
  return result;
}

function coerceValue(s: string): unknown {
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (s === 'null' || s === '') return null;
  const n = Number(s);
  if (!isNaN(n) && s !== '') return n;
  return s;
}

// ── XML (custom) ──
export function toXml(data: unknown, rootTag = 'root'): string {
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + toXmlNode(rootTag, data, 0);
}

function toXmlNode(tag: string, value: unknown, depth: number): string {
  const pad = '  '.repeat(depth);
  const safe = sanitizeTag(tag);

  if (value === null || value === undefined) return `${pad}<${safe} />`;
  if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
    return `${pad}<${safe}>${escapeXml(String(value))}</${safe}>`;
  }
  if (Array.isArray(value)) {
    return value.map((item) => toXmlNode(safe, item, depth)).join('\n');
  }
  const children = Object.entries(value as Record<string, unknown>)
    .map(([k, v]) => toXmlNode(k, v, depth + 1))
    .join('\n');
  return `${pad}<${safe}>\n${children}\n${pad}</${safe}>`;
}

function sanitizeTag(name: string): string {
  let safe = name.replace(/[^a-zA-Z0-9._-]/g, '_');
  if (/^[^a-zA-Z_]/.test(safe)) safe = '_' + safe;
  return safe || '_item';
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
