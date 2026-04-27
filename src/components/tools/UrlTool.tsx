'use client';

import { useState, useEffect, useCallback } from 'react';
import type { StatusState, UrlMode } from '@/types';
import { encodeUrl, decodeUrl } from '@/lib/url';
import { calcStats } from '@/lib/json';
import EditorPanel from '@/components/EditorPanel';

interface Props {
  onStatusChange: (s: StatusState) => void;
  onToast: (msg: string) => void;
}

export default function UrlTool({ onStatusChange, onToast }: Props) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<UrlMode>('encode');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!input.trim()) {
        setOutput('');
        setError(null);
        onStatusChange('idle');
        return;
      }
      const result = mode === 'encode' ? encodeUrl(input) : decodeUrl(input);
      if (result.success) {
        setOutput(result.data);
        setError(null);
        onStatusChange('valid');
      } else {
        setOutput('');
        setError(result.error);
        onStatusChange('invalid');
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [input, mode, onStatusChange]);

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

  const handleSwap = useCallback(() => {
    setInput(output);
    setMode(mode === 'encode' ? 'decode' : 'encode');
  }, [mode, output]);

  const inputStats = calcStats(input);
  const outputStats = calcStats(output);

  return (
    <div>
      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="pill-group">
          {(['encode', 'decode'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`pill-group__item ${mode === m ? 'pill-group__item--active' : ''}`}
            >
              {m === 'encode' ? 'Encode' : 'Decode'}
            </button>
          ))}
        </div>

        <button
          onClick={handleSwap}
          disabled={!output}
          className="btn-secondary disabled:opacity-30 disabled:pointer-events-none"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Swap
        </button>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EditorPanel
          title={mode === 'encode' ? 'Plain Text' : 'Encoded URL'}
          mode="input"
          value={input}
          onChange={setInput}
          stats={inputStats}
          placeholder={
            mode === 'encode'
              ? 'Type or paste text to URL-encode...'
              : 'Paste URL-encoded string to decode...'
          }
          actions={
            <button
              onClick={() => { setInput(''); setOutput(''); setError(null); onStatusChange('idle'); }}
              className="btn-ghost"
            >
              Clear
            </button>
          }
        />
        <EditorPanel
          title={mode === 'encode' ? 'Encoded Output' : 'Decoded Text'}
          mode="output"
          value={output}
          stats={outputStats}
          emptyMessage={mode === 'encode' ? 'Encoded URL appears here' : 'Decoded text appears here'}
          actions={
            <button
              onClick={handleCopy}
              disabled={!output}
              className="btn-ghost inline-flex items-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              Copy
            </button>
          }
        />
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
            <p className="text-[13px] font-semibold text-red-400">Error</p>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Spaces</span> — Encoded as %20</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Unicode</span> — Full UTF-8 support</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Query</span> — Great for URL parameters</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Swap</span> — Reverse encode ↔ decode</p>
        </div>
      </div>
    </div>
  );
}
