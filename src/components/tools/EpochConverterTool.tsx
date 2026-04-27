'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { StatusState } from '@/types';

interface Props {
  onStatusChange: (s: StatusState) => void;
  onToast: (msg: string) => void;
}

function relativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const abs = Math.abs(diff);
  const isFuture = diff < 0;
  const seconds = Math.floor(abs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  let text: string;
  if (seconds < 5) text = 'just now';
  else if (seconds < 60) text = `${seconds} seconds`;
  else if (minutes < 60) text = `${minutes} minute${minutes > 1 ? 's' : ''}`;
  else if (hours < 24) text = `${hours} hour${hours > 1 ? 's' : ''}`;
  else if (days < 30) text = `${days} day${days > 1 ? 's' : ''}`;
  else if (months < 12) text = `${months} month${months > 1 ? 's' : ''}`;
  else text = `${years} year${years > 1 ? 's' : ''}`;

  if (text === 'just now') return text;
  return isFuture ? `in ${text}` : `${text} ago`;
}

function formatDate(d: Date) {
  return {
    'Unix (seconds)': String(Math.floor(d.getTime() / 1000)),
    'Unix (milliseconds)': String(d.getTime()),
    'ISO 8601': d.toISOString(),
    'RFC 2822': d.toUTCString(),
    Relative: relativeTime(d),
  };
}

export default function EpochConverterTool({ onStatusChange, onToast }: Props) {
  const [input, setInput] = useState('');
  const [now, setNow] = useState(() => new Date());
  const [dateInput, setDateInput] = useState('');
  const [timeInput, setTimeInput] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    intervalRef.current = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const copy = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text);
      onToast('Copied to clipboard');
    },
    [onToast],
  );

  const parsed = (() => {
    const trimmed = input.trim();
    if (!trimmed) return null;
    // Auto-detect seconds vs milliseconds
    if (/^\d{10}$/.test(trimmed)) return new Date(Number(trimmed) * 1000);
    if (/^\d{13}$/.test(trimmed)) return new Date(Number(trimmed));
    // Try as numeric (seconds if <= 10 digits, ms otherwise)
    if (/^\d+$/.test(trimmed)) {
      const n = Number(trimmed);
      return new Date(trimmed.length <= 10 ? n * 1000 : n);
    }
    // Try as date string
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? 'invalid' : d;
  })();

  useEffect(() => {
    if (!input.trim()) onStatusChange('idle');
    else if (parsed === 'invalid') onStatusChange('invalid');
    else if (parsed) onStatusChange('valid');
  }, [input, parsed, onStatusChange]);

  const fillInput = useCallback((val: string) => setInput(val), []);

  const quickTimestamps = [
    { label: 'Now', fn: () => String(Math.floor(Date.now() / 1000)) },
    { label: 'Start of today', fn: () => { const d = new Date(); d.setHours(0, 0, 0, 0); return String(Math.floor(d.getTime() / 1000)); } },
    { label: 'Start of week', fn: () => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); d.setHours(0, 0, 0, 0); return String(Math.floor(d.getTime() / 1000)); } },
    { label: 'Start of month', fn: () => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return String(Math.floor(d.getTime() / 1000)); } },
    { label: 'Start of year', fn: () => { const d = new Date(); d.setMonth(0, 1); d.setHours(0, 0, 0, 0); return String(Math.floor(d.getTime() / 1000)); } },
  ];

  const handleDatePicker = useCallback(() => {
    if (!dateInput) return;
    const str = timeInput ? `${dateInput}T${timeInput}` : `${dateInput}T00:00:00`;
    const d = new Date(str);
    if (!isNaN(d.getTime())) fillInput(String(Math.floor(d.getTime() / 1000)));
  }, [dateInput, timeInput, fillInput]);

  useEffect(() => { handleDatePicker(); }, [handleDatePicker]);

  const liveFormats = formatDate(now);
  const convertedFormats = parsed && parsed !== 'invalid' ? formatDate(parsed) : null;

  return (
    <div className="space-y-4">
      {/* Live clock */}
      <div className="glass-panel rounded-xl p-4">
        <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-3">Live Clock</p>
        <div className="space-y-2.5">
          {Object.entries(liveFormats).map(([label, val]) => (
            <div key={label} className="flex items-center justify-between group">
              <div>
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-0.5">{label}</p>
                <p className={`text-[13px] font-mono text-zinc-300 tabular-nums ${label === 'Relative' ? 'animate-pulse' : ''}`}>
                  {val}
                </p>
              </div>
              <button
                onClick={() => copy(val)}
                className="opacity-0 group-hover:opacity-100 transition-opacity btn-secondary text-[11px]"
              >
                Copy
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Converter input */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
            Epoch or Date String
          </span>
          <button onClick={() => fillInput(String(Math.floor(Date.now() / 1000)))} className="btn-ghost text-[11px]">
            Use Now
          </button>
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="1714060800 or 2025-04-25T12:00:00Z"
          className="w-full bg-transparent text-[14px] font-mono text-zinc-200 placeholder:text-zinc-700 px-4 py-3 outline-none"
          spellCheck={false}
        />
      </div>

      {/* Error */}
      {parsed === 'invalid' && (
        <div className="flex items-start gap-2 rounded-lg bg-red-500/[0.07] border border-red-500/20 px-3 py-2">
          <svg className="h-3.5 w-3.5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-[12px] text-red-400/80">Invalid timestamp or date string</p>
        </div>
      )}

      {/* Converted results */}
      {convertedFormats && (
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="px-4 py-2 border-b border-white/[0.06]">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Converted</span>
          </div>
          <div className="p-4 space-y-3">
            {Object.entries(convertedFormats).map(([label, val]) => (
              <div key={label} className="flex items-center justify-between group">
                <div>
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-0.5">{label}</p>
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
          </div>
        </div>
      )}

      {/* Quick timestamps */}
      <div className="flex flex-wrap gap-2">
        {quickTimestamps.map(({ label, fn }) => (
          <button key={label} onClick={() => fillInput(fn())} className="btn-secondary text-[11px]">
            {label}
          </button>
        ))}
      </div>

      {/* Date picker */}
      <div className="glass-panel rounded-xl p-4">
        <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-3">Date Picker</p>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] font-mono text-zinc-300 outline-none focus:border-purple-500/40"
          />
          <input
            type="time"
            step="1"
            value={timeInput}
            onChange={(e) => setTimeInput(e.target.value)}
            className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] font-mono text-zinc-300 outline-none focus:border-purple-500/40"
          />
        </div>
      </div>

      {/* Tips */}
      <div className="tips-section tips-section--purple">
        <div className="flex items-center gap-2 mb-3">
          <svg className="h-3.5 w-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Tips</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Epoch</span> — Unix epoch is the number of seconds since January 1, 1970 UTC</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Precision</span> — 10-digit timestamps are in seconds, 13-digit are in milliseconds</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Relative</span> — Relative time shows human-readable time differences</p>
        </div>
      </div>
    </div>
  );
}
