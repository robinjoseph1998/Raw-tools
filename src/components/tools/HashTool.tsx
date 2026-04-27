'use client';

import { useState, useEffect, useCallback } from 'react';
import type { StatusState, HashAlgorithm } from '@/types';
import { generateHash } from '@/lib/hash';

interface Props {
  onStatusChange: (s: StatusState) => void;
  onToast: (msg: string) => void;
}

const ALGORITHMS: HashAlgorithm[] = ['MD5', 'SHA-1', 'SHA-256', 'SHA-512'];

export default function HashTool({ onStatusChange, onToast }: Props) {
  const [input, setInput] = useState('');
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('SHA-256');
  const [hashes, setHashes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!input.trim()) {
      setHashes({});
      onStatusChange('idle');
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      const results: Record<string, string> = {};
      for (const algo of ALGORITHMS) {
        const result = await generateHash(input, algo);
        if (result.success) results[algo] = result.data;
      }
      if (!cancelled) {
        setHashes(results);
        onStatusChange('valid');
      }
    }, 150);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [input, onStatusChange]);

  const handleCopy = useCallback(
    async (text: string) => {
      try { await navigator.clipboard.writeText(text); } catch {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      onToast('Copied to clipboard');
    },
    [onToast],
  );

  const currentHash = hashes[algorithm] || '';

  return (
    <div>
      {/* Input */}
      <div className="mb-5">
        <div className="rounded-lg glass-panel">
          <header className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05] bg-gradient-to-r from-white/[0.02] to-transparent">
            <span className="flex items-center gap-2 text-[13px] font-semibold text-zinc-300 select-none">
              <svg className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Input Text
            </span>
            <button
              onClick={() => { setInput(''); setHashes({}); onStatusChange('idle'); }}
              className="btn-ghost"
            >
              Clear
            </button>
          </header>
          <textarea
            className="editor-textarea !min-h-[120px]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste text to hash..."
            spellCheck={false}
          />
        </div>
      </div>

      {/* Algorithm selector */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="pill-group">
          {ALGORITHMS.map((algo) => (
            <button
              key={algo}
              onClick={() => setAlgorithm(algo)}
              className={`pill-group__item ${algorithm === algo ? 'pill-group__item--active' : ''}`}
            >
              {algo}
            </button>
          ))}
        </div>
      </div>

      {/* Hash output */}
      {currentHash ? (
        <div className="rounded-lg glass-panel">
          <header className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05] bg-gradient-to-r from-white/[0.02] to-transparent">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-zinc-300">{algorithm} Hash</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-white/[0.03] px-2 py-0.5 rounded-md">
                {currentHash.length} chars
              </span>
            </div>
            <button
              onClick={() => handleCopy(currentHash)}
              className="btn-ghost inline-flex items-center gap-1.5"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              Copy
            </button>
          </header>
          <div className="px-4 py-3.5">
            <code className="text-[13px] font-mono text-cyan-300/80 break-all leading-relaxed select-all">{currentHash}</code>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[200px] rounded-lg glass-panel">
          <div className="text-center space-y-4 px-6">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center animate-float">
              <svg className="h-6 w-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-zinc-300 mb-1">Enter text to hash</p>
              <p className="text-[13px] text-zinc-500 max-w-[300px] leading-relaxed">
                All four algorithms compute simultaneously.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* All hashes grid */}
      {Object.keys(hashes).length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {ALGORITHMS.map((algo) => (
            <div key={algo} className="rounded-lg glass-panel p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">{algo}</span>
                <button onClick={() => handleCopy(hashes[algo] || '')} className="btn-ghost text-[11px]">Copy</button>
              </div>
              <code className="text-[11px] font-mono text-zinc-400 break-all leading-relaxed block select-all">{hashes[algo] || ''}</code>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="tips-section tips-section--purple">
        <div className="flex items-center gap-2 mb-3">
          <svg className="h-3.5 w-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Tips</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">SHA-256</span> — Most commonly used</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">MD5</span> — Fast, not for security</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">One-way</span> — Hashes can't be reversed</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Integrity</span> — Verify file checksums</p>
        </div>
      </div>
    </div>
  );
}
