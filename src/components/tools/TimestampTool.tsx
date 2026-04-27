'use client';

import { useState, useEffect, useRef } from 'react';
import type { StatusState } from '@/types';
import { unixToDate, dateToUnix, nowUnix } from '@/lib/timestamp';

export default function TimestampTool({
  onStatusChange,
  onToast,
}: {
  onStatusChange: (s: StatusState) => void;
  onToast: (msg: string) => void;
}) {
  const [mode, setMode] = useState<'toDate' | 'toUnix'>('toDate');
  const [input, setInput] = useState('');
  const [liveNow, setLiveNow] = useState(nowUnix());
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // Live clock
  useEffect(() => {
    intervalRef.current = setInterval(() => setLiveNow(nowUnix()), 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    onToast('Copied');
  };

  const result = (() => {
    const trimmed = input.trim();
    if (!trimmed) return null;

    if (mode === 'toDate') {
      const num = Number(trimmed);
      if (isNaN(num)) return { error: 'Enter a valid Unix timestamp' };
      const data = unixToDate(num);
      return { data };
    } else {
      const data = dateToUnix(trimmed);
      if (!data) return { error: 'Enter a valid date string (e.g. 2024-01-15 or ISO 8601)' };
      return { data };
    }
  })();

  useEffect(() => {
    if (!input.trim()) onStatusChange('idle');
    else if (result && 'error' in result) onStatusChange('invalid');
    else if (result) onStatusChange('valid');
  }, [input, result, onStatusChange]);

  return (
    <div className="space-y-4">
      {/* Live clock */}
      <div className="glass-panel rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Current Unix Timestamp</p>
          <p className="text-[22px] font-bold font-mono text-zinc-200 tabular-nums">{liveNow.seconds}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => copy(String(liveNow.seconds))}
            className="btn-secondary text-[11px]"
          >
            Copy Seconds
          </button>
          <button
            onClick={() => copy(String(liveNow.milliseconds))}
            className="btn-secondary text-[11px]"
          >
            Copy Millis
          </button>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="pill-group">
        <button
          onClick={() => { setMode('toDate'); setInput(''); }}
          className={`pill-group__item ${mode === 'toDate' ? 'pill-group__item--active' : ''}`}
        >
          Timestamp → Date
        </button>
        <button
          onClick={() => { setMode('toUnix'); setInput(''); }}
          className={`pill-group__item ${mode === 'toUnix' ? 'pill-group__item--active' : ''}`}
        >
          Date → Timestamp
        </button>
      </div>

      {/* Input */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
            {mode === 'toDate' ? 'Unix Timestamp' : 'Date String'}
          </span>
          {mode === 'toDate' && (
            <button onClick={() => setInput(String(liveNow.seconds))} className="btn-ghost text-[11px]">
              Use Now
            </button>
          )}
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'toDate' ? '1700000000' : '2024-01-15T12:00:00Z'}
          className="w-full bg-transparent text-[14px] font-mono text-zinc-200 placeholder:text-zinc-700 px-4 py-3 outline-none"
          spellCheck={false}
        />
      </div>

      {/* Error */}
      {result && 'error' in result && (
        <div className="flex items-start gap-2 rounded-lg bg-red-500/[0.07] border border-red-500/20 px-3 py-2">
          <svg className="h-3.5 w-3.5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-[12px] text-red-400/80">{result.error}</p>
        </div>
      )}

      {/* Results */}
      {result && 'data' in result && (
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="px-4 py-2 border-b border-white/[0.06]">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Result</span>
          </div>
          <div className="p-4 space-y-3">
            {mode === 'toDate' ? (
              <>
                {Object.entries(result.data as ReturnType<typeof unixToDate>).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between group">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-0.5">{key}</p>
                      <p className="text-[13px] font-mono text-zinc-300">{val}</p>
                    </div>
                    <button
                      onClick={() => copy(val)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity btn-ghost text-[11px]"
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </>
            ) : (
              <>
                {Object.entries(result.data as ReturnType<typeof dateToUnix> & object).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between group">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-0.5">{key}</p>
                      <p className="text-[18px] font-mono font-bold text-zinc-200 tabular-nums">{val}</p>
                    </div>
                    <button
                      onClick={() => copy(String(val))}
                      className="opacity-0 group-hover:opacity-100 transition-opacity btn-ghost text-[11px]"
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="tips-section tips-section--purple">
        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Quick Reference</p>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-500">
          <div>
            <p className="text-zinc-400 font-semibold mb-0.5">Seconds vs Milliseconds</p>
            <p>Auto-detected. Values &gt; 1 trillion are treated as ms.</p>
          </div>
          <div>
            <p className="text-zinc-400 font-semibold mb-0.5">Supported Date Formats</p>
            <p>ISO 8601, RFC 2822, or any Date.parse() compatible string.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
