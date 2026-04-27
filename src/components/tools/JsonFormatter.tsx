'use client';

import { useState, useEffect, useCallback } from 'react';
import type { StatusState } from '@/types';
import { parseJSON, transformJSON, highlightJSON, calcStats, SAMPLE_JSON } from '@/lib/json';
import EditorPanel from '@/components/EditorPanel';

interface Props {
  onStatusChange: (s: StatusState) => void;
  onToast: (msg: string) => void;
}

export default function JsonFormatter({ onStatusChange, onToast }: Props) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [outputHtml, setOutputHtml] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.includes('Mac'));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!input.trim()) {
        onStatusChange('idle');
        setError(null);
        return;
      }
      const result = parseJSON(input);
      onStatusChange(result.success ? 'valid' : 'invalid');
      setError(result.success ? null : result.error);
    }, 250);
    return () => clearTimeout(timer);
  }, [input, onStatusChange]);

  const runAction = useCallback(
    (operation: 'format' | 'minify') => {
      const result = transformJSON(input, operation);
      if (result.success) {
        setOutput(result.data);
        setOutputHtml(highlightJSON(result.data));
        onStatusChange('valid');
        setError(null);
      } else {
        setOutput('');
        setOutputHtml('');
        onStatusChange('invalid');
        setError(result.error);
      }
    },
    [input, onStatusChange],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key === 'Enter') {
        e.preventDefault();
        runAction('format');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isMac, runAction]);

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

  const inputStats = calcStats(input);
  const outputStats = calcStats(output);

  return (
    <div>
      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2.5 mb-5">
        <button onClick={() => runAction('format')} className="btn-primary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M4 6h16M4 12h10M4 18h14" /></svg>
          Format
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-white/40 bg-white/[0.08] border border-white/[0.08] rounded ml-0.5">
            {isMac ? '⌘↵' : 'Ctrl↵'}
          </kbd>
        </button>
        <button onClick={() => runAction('minify')} className="btn-secondary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M18 12H6" /></svg>
          Minify
        </button>
        <button onClick={() => runAction('format')} className="btn-secondary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M5 13l4 4L19 7" /></svg>
          Validate
        </button>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EditorPanel
          title="Input"
          mode="input"
          value={input}
          onChange={setInput}
          stats={inputStats}
          placeholder="Paste or type JSON here..."
          actions={
            <div className="flex items-center gap-1">
              <button onClick={() => { setInput(SAMPLE_JSON); }} className="btn-ghost">
                Sample
              </button>
              <span className="text-zinc-700 select-none">|</span>
              <button
                onClick={() => { setInput(''); setOutput(''); setOutputHtml(''); setError(null); onStatusChange('idle'); }}
                className="btn-ghost"
              >
                Clear
              </button>
            </div>
          }
        />
        <EditorPanel
          title="Output"
          mode="output"
          value={output}
          outputHtml={outputHtml}
          stats={outputStats}
          emptyMessage="Format, validate, or minify JSON"
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
            <svg className="h-3.5 w-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M6 18L18 6M6 6l12 12" /></svg>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">{isMac ? '⌘' : 'Ctrl'}+Enter</span> — Format instantly</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Tab key</span> — Inserts 2-space indent</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Real-time</span> — Validates as you type</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Syntax colors</span> — Output is highlighted</p>
        </div>
      </div>
    </div>
  );
}
