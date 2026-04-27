'use client';

import { useState, useEffect, useRef } from 'react';
import type { StatusState } from '@/types';
import { testRegex, type RegexMatch } from '@/lib/regex';

const FLAG_OPTIONS = [
  { flag: 'g', label: 'global' },
  { flag: 'i', label: 'case-insensitive' },
  { flag: 'm', label: 'multiline' },
];

export default function RegexTester({
  onStatusChange,
  onToast,
}: {
  onStatusChange: (s: StatusState) => void;
  onToast: (msg: string) => void;
}) {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [input, setInput] = useState('');
  const [matches, setMatches] = useState<RegexMatch[]>([]);
  const [error, setError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!pattern.trim()) {
      setMatches([]);
      setError('');
      onStatusChange('idle');
      return;
    }

    debounceRef.current = setTimeout(() => {
      const result = testRegex(pattern, flags, input);
      if (result.success) {
        setMatches(result.matches);
        setError('');
        onStatusChange(result.matches.length > 0 ? 'valid' : 'idle');
      } else {
        setMatches([]);
        setError(result.error);
        onStatusChange('invalid');
      }
    }, 150);

    return () => clearTimeout(debounceRef.current);
  }, [pattern, flags, input, onStatusChange]);

  const toggleFlag = (f: string) => {
    setFlags((prev) => (prev.includes(f) ? prev.replace(f, '') : prev + f));
  };

  // Build highlighted HTML for the test string
  const highlightedHtml = (() => {
    if (!matches.length || !input) return null;
    const parts: { text: string; isMatch: boolean }[] = [];
    let lastEnd = 0;
    for (const m of matches) {
      if (m.index > lastEnd) parts.push({ text: input.slice(lastEnd, m.index), isMatch: false });
      parts.push({ text: m.text, isMatch: true });
      lastEnd = m.index + m.text.length;
    }
    if (lastEnd < input.length) parts.push({ text: input.slice(lastEnd), isMatch: false });
    return parts;
  })();

  return (
    <div className="space-y-4">
      {/* Pattern input */}
      <div className="glass-panel rounded-xl p-4">
        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Pattern</label>
        <div className="flex items-center gap-2">
          <span className="text-zinc-600 text-[14px] font-mono">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="[A-Z]\w+"
            className="flex-1 bg-transparent text-[14px] font-mono text-zinc-200 placeholder:text-zinc-700 outline-none"
            spellCheck={false}
          />
          <span className="text-zinc-600 text-[14px] font-mono">/{flags}</span>
        </div>

        {/* Flags */}
        <div className="flex gap-2 mt-3">
          {FLAG_OPTIONS.map((opt) => (
            <button
              key={opt.flag}
              onClick={() => toggleFlag(opt.flag)}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all duration-200 ${
                flags.includes(opt.flag)
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                  : 'bg-white/[0.03] text-zinc-600 border border-white/[0.06] hover:text-zinc-400'
              }`}
            >
              {opt.flag} <span className="font-normal opacity-60">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      <div className={`error-container ${error ? 'is-visible' : ''}`}>
        <div className="flex items-start gap-2 rounded-lg bg-red-500/[0.07] border border-red-500/20 px-3 py-2">
          <svg className="h-3.5 w-3.5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-[12px] text-red-400/80 font-mono">{error}</p>
        </div>
      </div>

      {/* Test string */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Test String</span>
          {matches.length > 0 && (
            <span className="text-[11px] font-semibold text-emerald-400">
              {matches.length} match{matches.length !== 1 ? 'es' : ''}
            </span>
          )}
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to test against..."
          className="editor-textarea !min-h-[180px]"
          spellCheck={false}
        />
      </div>

      {/* Highlighted results */}
      {highlightedHtml && (
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="px-4 py-2 border-b border-white/[0.06]">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Matches Highlighted</span>
          </div>
          <div className="p-4 font-mono text-[13px] leading-relaxed text-zinc-400 whitespace-pre-wrap break-all">
            {highlightedHtml.map((part, i) =>
              part.isMatch ? (
                <mark key={i} className="bg-emerald-500/20 text-emerald-300 rounded px-0.5">{part.text}</mark>
              ) : (
                <span key={i}>{part.text}</span>
              ),
            )}
          </div>
        </div>
      )}

      {/* Match groups */}
      {matches.length > 0 && matches.some((m) => m.groups.length > 0) && (
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="px-4 py-2 border-b border-white/[0.06]">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Capture Groups</span>
          </div>
          <div className="p-4 space-y-2">
            {matches.map((m, i) => (
              m.groups.length > 0 && (
                <div key={i} className="flex items-start gap-2 text-[12px]">
                  <span className="text-zinc-600 font-mono min-w-[60px]">Match {i + 1}:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {m.groups.map((g, j) => (
                      <span key={j} className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
                        ${j + 1}: {g}
                      </span>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="tips-section tips-section--cyan">
        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Common Patterns</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {[
            ['Email', '[\\w.-]+@[\\w.-]+\\.\\w+'],
            ['URL', 'https?://[\\S]+'],
            ['IP Address', '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}'],
            ['Hex Color', '#[0-9a-fA-F]{3,6}'],
          ].map(([label, pat]) => (
            <button
              key={label}
              onClick={() => { setPattern(pat); onToast(`Pattern set: ${label}`); }}
              className="flex items-center gap-2 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors py-0.5"
            >
              <span className="font-mono text-cyan-400/60">{pat}</span>
              <span className="text-zinc-600">— {label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
