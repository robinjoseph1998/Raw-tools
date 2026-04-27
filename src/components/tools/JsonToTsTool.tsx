'use client';

import { useState, useCallback } from 'react';
import type { StatusState } from '@/types';

interface Props {
  onStatusChange: (s: StatusState) => void;
  onToast: (msg: string) => void;
}

type DeclarationKind = 'interface' | 'type';

const SAMPLE_JSON = JSON.stringify({
  id: 1,
  name: "Jane Doe",
  email: "jane@example.com",
  active: true,
  address: {
    street: "123 Main St",
    city: "Springfield",
    zip: "62701",
    coordinates: { lat: 39.7817, lng: -89.6501 },
  },
  roles: ["admin", "editor"],
  orders: [
    { orderId: 1001, total: 59.99, items: ["Widget", "Gadget"] },
    { orderId: 1002, total: 24.5, items: ["Doohickey"] },
  ],
  metadata: null,
}, null, 2);

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function inferInterfaces(
  obj: unknown,
  rootName: string,
  kind: DeclarationKind,
  optional: boolean,
): string[] {
  const results: string[] = [];

  function infer(value: unknown, name: string): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) {
      if (value.length === 0) return 'unknown[]';
      const first = value[0];
      if (first !== null && typeof first === 'object' && !Array.isArray(first)) {
        const itemName = capitalize(name.replace(/s$/, ''));
        infer(first, itemName);
        return `${itemName}[]`;
      }
      const elemType = infer(first, name);
      return `${elemType}[]`;
    }
    if (typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>);
      const fields = entries.map(([key, val]) => {
        const fieldType = infer(val, capitalize(key));
        const opt = optional ? '?' : '';
        return `  ${key}${opt}: ${fieldType};`;
      });
      if (kind === 'interface') {
        results.push(`export interface ${name} {\n${fields.join('\n')}\n}`);
      } else {
        results.push(`export type ${name} = {\n${fields.join('\n')}\n};`);
      }
      return name;
    }
    return typeof value; // string | number | boolean
  }

  infer(obj, rootName);
  return results.reverse();
}

function highlightTs(code: string): string {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(
      /\b(export|interface|type)\b/g,
      '<span class="text-purple-400">$1</span>',
    )
    .replace(
      /\b(string|number|boolean|null|unknown)\b/g,
      '<span class="text-pink-400">$1</span>',
    )
    .replace(
      /(?<=(?:interface|type)\s+)([A-Z]\w*)/g,
      '<span class="text-cyan-400">$1</span>',
    )
    .replace(
      /([{};\[\]:])/g,
      '<span class="text-zinc-400">$1</span>',
    );
}

export default function JsonToTsTool({ onStatusChange, onToast }: Props) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [outputHtml, setOutputHtml] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [rootName, setRootName] = useState('Root');
  const [kind, setKind] = useState<DeclarationKind>('interface');
  const [optional, setOptional] = useState(false);

  const convert = useCallback(
    (json?: string) => {
      const src = json ?? input;
      if (!src.trim()) {
        setOutput('');
        setOutputHtml('');
        setError(null);
        onStatusChange('idle');
        return;
      }
      try {
        const parsed = JSON.parse(src);
        if (parsed === null || typeof parsed !== 'object') {
          setError('JSON must be an object or array at the root');
          setOutput('');
          setOutputHtml('');
          onStatusChange('invalid');
          return;
        }
        const target = Array.isArray(parsed) ? parsed[0] ?? {} : parsed;
        const name = rootName.trim() || 'Root';
        const blocks = inferInterfaces(target, capitalize(name), kind, optional);
        const result = blocks.join('\n\n');
        setOutput(result);
        setOutputHtml(highlightTs(result));
        setError(null);
        onStatusChange('valid');
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Invalid JSON';
        setError(msg);
        setOutput('');
        setOutputHtml('');
        onStatusChange('invalid');
      }
    },
    [input, rootName, kind, optional, onStatusChange],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const text = e.clipboardData.getData('text');
      // Let the paste happen, then convert on next tick
      setTimeout(() => convert(text), 0);
    },
    [convert],
  );

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = output;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    onToast('Copied to clipboard');
  }, [output, onToast]);

  const loadSample = useCallback(() => {
    setInput(SAMPLE_JSON);
    setTimeout(() => convert(SAMPLE_JSON), 0);
    onToast('Sample JSON loaded');
  }, [convert, onToast]);

  return (
    <div>
      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2.5 mb-5">
        <button onClick={() => convert()} className="btn-primary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M9 5l7 7-7 7" />
          </svg>
          Convert
        </button>
        <button onClick={handleCopy} disabled={!output} className="btn-secondary disabled:opacity-30 disabled:pointer-events-none">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          Copy TypeScript
        </button>
        <button onClick={loadSample} className="btn-secondary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Sample JSON
        </button>
      </div>

      {/* Options row */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Root Name</label>
          <input
            type="text"
            value={rootName}
            onChange={(e) => setRootName(e.target.value)}
            className="w-28 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[13px] font-mono text-zinc-200 placeholder:text-zinc-700 outline-none focus:border-white/[0.16] transition-colors"
            placeholder="Root"
          />
        </div>

        <div className="pill-group">
          {(['interface', 'type'] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={`pill-group__item ${kind === k ? 'pill-group__item--active' : ''}`}
            >
              {k}
            </button>
          ))}
        </div>

        <button
          onClick={() => setOptional((prev) => !prev)}
          className={`px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-200 ${
            optional
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
              : 'bg-white/[0.03] text-zinc-600 border border-white/[0.06] hover:text-zinc-400'
          }`}
        >
          Optional <span className="font-mono">?</span>
        </button>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input panel */}
        <div className={`flex flex-col rounded-xl glass-panel overflow-hidden ${error ? 'border border-red-500/30' : ''}`}>
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.08] bg-white/[0.03]">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
            <span className="text-[12px] font-bold text-zinc-300 uppercase tracking-wider">JSON Input</span>
            <button
              onClick={() => { setInput(''); setOutput(''); setOutputHtml(''); setError(null); onStatusChange('idle'); }}
              className="btn-ghost ml-auto text-[11px]"
            >
              Clear
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(null); }}
            onPaste={handlePaste}
            placeholder="Paste or type JSON here..."
            spellCheck={false}
            className="editor-textarea flex-1 min-h-[200px] lg:min-h-[300px] p-4 resize-none"
          />
        </div>

        {/* Output panel */}
        <div className="flex flex-col rounded-xl glass-panel overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.08] bg-white/[0.03]">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400/70" />
            <span className="text-[12px] font-bold text-zinc-300 uppercase tracking-wider">TypeScript Output</span>
            {output && (
              <span className="text-[11px] text-zinc-500 ml-auto">
                {output.split('\n').length} lines
              </span>
            )}
          </div>
          {output ? (
            <pre
              className="flex-1 min-h-[200px] lg:min-h-[300px] p-4 font-mono text-[13px] leading-relaxed text-zinc-300 overflow-auto whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: outputHtml }}
            />
          ) : (
            <div className="flex-1 min-h-[200px] lg:min-h-[300px] flex items-center justify-center">
              <p className="text-[13px] text-zinc-600">TypeScript interfaces appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      <div className={`error-container mt-4 ${error ? 'is-visible' : ''}`} aria-live="polite">
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl border border-red-500/20 bg-red-500/[0.06]">
          <div className="h-6 w-6 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="h-3.5 w-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-red-400">Parse Error</p>
            <p className="text-[12px] text-zinc-400 font-mono mt-1 break-words leading-relaxed">{error}</p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="tips-section tips-section--cyan">
        <div className="flex items-center gap-2 mb-3">
          <svg className="h-3.5 w-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Tips</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Auto-convert</span> — Paste any JSON to generate TypeScript interfaces instantly</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Nested objects</span> — Extracted as separate named interfaces</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Arrays</span> — Typed based on their first element</p>
        </div>
      </div>
    </div>
  );
}
