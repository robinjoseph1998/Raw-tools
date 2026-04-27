'use client';

import { useState, useCallback, useRef } from 'react';
import type { StatusState } from '@/types';

type SqlDialect = 'sql' | 'mysql' | 'postgresql' | 'plsql' | 'transactsql' | 'sqlite';

const DIALECTS: { value: SqlDialect; label: string }[] = [
  { value: 'sql', label: 'SQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'plsql', label: 'PL/SQL' },
  { value: 'transactsql', label: 'T-SQL' },
  { value: 'sqlite', label: 'SQLite' },
];

const SAMPLE_SQL = `SELECT u.id, u.name, u.email, o.order_id, o.total FROM users u INNER JOIN orders o ON u.id = o.user_id WHERE u.active = true AND o.created_at >= '2024-01-01' GROUP BY u.id, u.name, u.email, o.order_id, o.total HAVING COUNT(o.order_id) > 5 ORDER BY o.total DESC LIMIT 100;`;

export default function SqlFormatterTool({
  onStatusChange,
  onToast,
}: {
  onStatusChange: (s: StatusState) => void;
  onToast: (msg: string) => void;
}) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [dialect, setDialect] = useState<SqlDialect>('sql');
  const [indent, setIndent] = useState(2);
  const [uppercase, setUppercase] = useState(true);
  const formatterRef = useRef<typeof import('sql-formatter') | null>(null);

  const loadFormatter = useCallback(async () => {
    if (!formatterRef.current) {
      formatterRef.current = await import('sql-formatter');
    }
    return formatterRef.current;
  }, []);

  const formatSql = useCallback(async () => {
    const text = input.trim();
    if (!text) {
      onStatusChange('invalid');
      onToast('Enter SQL to format');
      return;
    }
    try {
      const { format } = await loadFormatter();
      const result = format(text, {
        language: dialect,
        tabWidth: indent,
        keywordCase: uppercase ? 'upper' : 'preserve',
      });
      setOutput(result);
      onStatusChange('valid');
      onToast('SQL formatted');
    } catch {
      onStatusChange('invalid');
      onToast('Failed to format SQL — check syntax');
    }
  }, [input, dialect, indent, uppercase, loadFormatter, onStatusChange, onToast]);

  const minifySql = useCallback(async () => {
    const text = input.trim();
    if (!text) {
      onStatusChange('invalid');
      onToast('Enter SQL to minify');
      return;
    }
    try {
      const { format } = await loadFormatter();
      // Format first, then collapse whitespace
      const formatted = format(text, { language: dialect });
      const minified = formatted.replace(/\s+/g, ' ').replace(/\s*([,;()])\s*/g, '$1').trim();
      setOutput(minified);
      onStatusChange('valid');
      onToast('SQL minified');
    } catch {
      onStatusChange('invalid');
      onToast('Failed to minify SQL — check syntax');
    }
  }, [input, dialect, loadFormatter, onStatusChange, onToast]);

  const copyOutput = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    onToast('Copied to clipboard');
  }, [output, onToast]);

  const loadSample = useCallback(() => {
    setInput(SAMPLE_SQL);
    setOutput('');
    onToast('Sample SQL loaded');
  }, [onToast]);

  const clear = useCallback(() => {
    setInput('');
    setOutput('');
    onStatusChange('idle');
  }, [onStatusChange]);

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button onClick={formatSql} className="btn-primary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          Format
        </button>
        <button onClick={minifySql} className="btn-secondary">
          Minify
        </button>
        <button onClick={copyOutput} disabled={!output} className="btn-secondary disabled:opacity-30 disabled:pointer-events-none">
          Copy
        </button>
        <button onClick={loadSample} className="btn-ghost">
          Sample
        </button>
        <button onClick={clear} disabled={!input && !output} className="btn-ghost disabled:opacity-30 disabled:pointer-events-none">
          Clear
        </button>
      </div>

      {/* Settings row */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Dialect</span>
          <div className="pill-group">
            {DIALECTS.map((d) => (
              <button
                key={d.value}
                onClick={() => setDialect(d.value)}
                className={`pill-group__item ${dialect === d.value ? 'pill-group__item--active' : ''}`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Indent</span>
          <div className="pill-group">
            {[2, 4].map((n) => (
              <button
                key={n}
                onClick={() => setIndent(n)}
                className={`pill-group__item ${indent === n ? 'pill-group__item--active' : ''}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={uppercase}
            onChange={(e) => setUppercase(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-7 h-4 rounded-full bg-white/[0.08] border border-white/[0.1] peer-checked:bg-cyan-500/30 peer-checked:border-cyan-500/40 relative transition-colors">
            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-zinc-400 peer-checked:bg-cyan-400 transition-all ${uppercase ? 'left-3.5' : 'left-0.5'}`} />
          </div>
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Uppercase</span>
        </label>
      </div>

      {/* Input + Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col rounded-xl glass-panel overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.08] bg-white/[0.03]">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400/70" />
            <span className="text-[12px] font-bold text-zinc-300 uppercase tracking-wider">Input</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setOutput(''); }}
            placeholder="Paste SQL query here..."
            spellCheck={false}
            className="editor-textarea flex-1 min-h-[300px] p-4 resize-none"
          />
        </div>

        <div className="flex flex-col rounded-xl glass-panel overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.08] bg-white/[0.03]">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
            <span className="text-[12px] font-bold text-zinc-300 uppercase tracking-wider">Output</span>
          </div>
          <div className="flex-1 min-h-[300px] overflow-auto">
            {output ? (
              <pre className="p-4 text-[13px] font-mono text-zinc-200 whitespace-pre-wrap break-all leading-relaxed">{output}</pre>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-[13px] text-zinc-500 font-medium">Formatted SQL appears here</p>
              </div>
            )}
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Dialects</span> — MySQL, PostgreSQL, PL/SQL, T-SQL, SQLite</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Minify</span> — Collapse to single-line for scripts</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Uppercase</span> — Auto-uppercase keywords like SELECT</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Privacy</span> — All formatting runs in your browser</p>
        </div>
      </div>
    </div>
  );
}
