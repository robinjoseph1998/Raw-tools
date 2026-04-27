'use client';

import { useState, useCallback } from 'react';
import type { StatusState } from '@/types';

const CHARSETS: Record<string, string> = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  digits: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

function generate(length: number, opts: Record<string, boolean>): string {
  let chars = '';
  if (opts.uppercase) chars += CHARSETS.uppercase;
  if (opts.lowercase) chars += CHARSETS.lowercase;
  if (opts.digits) chars += CHARSETS.digits;
  if (opts.symbols) chars += CHARSETS.symbols;
  if (!chars) chars = CHARSETS.lowercase;

  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (v) => chars[v % chars.length]).join('');
}

function getStrength(pw: string): { label: string; color: string; bar: string; pct: number } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 16) score++;
  if (pw.length >= 24) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;

  if (score <= 2) return { label: 'Weak', color: 'text-red-400', bar: 'bg-red-500', pct: 25 };
  if (score <= 3) return { label: 'Fair', color: 'text-amber-400', bar: 'bg-amber-500', pct: 50 };
  if (score <= 4) return { label: 'Strong', color: 'text-cyan-400', bar: 'bg-cyan-500', pct: 75 };
  return { label: 'Very Strong', color: 'text-emerald-400', bar: 'bg-emerald-500', pct: 100 };
}

export default function PasswordTool({
  onStatusChange,
  onToast,
}: {
  onStatusChange: (s: StatusState) => void;
  onToast: (msg: string) => void;
}) {
  const [length, setLength] = useState(16);
  const [count, setCount] = useState(1);
  const [opts, setOpts] = useState({ uppercase: true, lowercase: true, digits: true, symbols: true });
  const [passwords, setPasswords] = useState<string[]>([]);

  const handleGenerate = useCallback(() => {
    const pws = Array.from({ length: count }, () => generate(length, opts));
    setPasswords(pws);
    onStatusChange('valid');
    onToast(`Generated ${count} password${count > 1 ? 's' : ''}`);
  }, [length, count, opts, onStatusChange, onToast]);

  const copy = useCallback(
    (pw: string) => {
      navigator.clipboard.writeText(pw);
      onToast('Copied to clipboard');
    },
    [onToast],
  );

  const copyAll = useCallback(() => {
    navigator.clipboard.writeText(passwords.join('\n'));
    onToast(`Copied ${passwords.length} passwords`);
  }, [passwords, onToast]);

  const clear = useCallback(() => {
    setPasswords([]);
    onStatusChange('idle');
  }, [onStatusChange]);

  const toggle = (key: string) => setOpts((o) => ({ ...o, [key]: !o[key as keyof typeof o] }));

  const strength = passwords[0] ? getStrength(passwords[0]) : null;

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button onClick={handleGenerate} className="btn-primary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          Generate
        </button>
        {passwords.length > 1 && (
          <button onClick={copyAll} className="btn-secondary">
            Copy All
          </button>
        )}
        <button onClick={clear} disabled={!passwords.length} className="btn-ghost disabled:opacity-30 disabled:pointer-events-none">
          Clear
        </button>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Length & Count */}
        <div className="glass-panel rounded-xl p-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Length</span>
              <span className="text-[13px] font-mono text-zinc-300">{length}</span>
            </div>
            <input
              type="range"
              min={4}
              max={128}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full h-1 accent-blue-400 bg-white/[0.08] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-400 [&::-webkit-slider-thumb]:shadow-md"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Count</span>
            <div className="pill-group">
              {[1, 5, 10, 25].map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`pill-group__item ${count === n ? 'pill-group__item--active' : ''}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Character types */}
        <div className="glass-panel rounded-xl p-4 space-y-3">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Characters</span>
          {Object.entries(CHARSETS).map(([key, chars]) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer group">
              <button
                onClick={() => toggle(key)}
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
                  opts[key as keyof typeof opts]
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-white/[0.15] bg-white/[0.04]'
                }`}
              >
                {opts[key as keyof typeof opts] && (
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span className="text-[13px] text-zinc-300 capitalize group-hover:text-white transition-colors">
                {key}
              </span>
              <span className="text-[10px] text-zinc-600 font-mono ml-auto truncate max-w-[120px]">{chars}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Strength meter */}
      {strength && (
        <div className="glass-panel rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Strength</span>
            <span className={`text-[12px] font-semibold ${strength.color}`}>{strength.label}</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${strength.bar}`}
              style={{ width: `${strength.pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Generated passwords */}
      {passwords.length > 0 && (
        <div className="rounded-xl glass-panel overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.08] bg-white/[0.03]">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400/70" />
              <span className="text-[12px] font-bold text-zinc-300 uppercase tracking-wider">
                Generated ({passwords.length})
              </span>
            </div>
          </div>
          <div className="divide-y divide-white/[0.04] max-h-[420px] overflow-y-auto">
            {passwords.map((pw, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.03] group">
                <span className="text-[10px] text-zinc-600 font-mono w-6 text-right flex-shrink-0">{i + 1}</span>
                <code className="flex-1 text-[13px] font-mono text-zinc-200 break-all select-all">{pw}</code>
                <button
                  onClick={() => copy(pw)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-zinc-200 flex-shrink-0"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="tips-section tips-section--cyan">
        <div className="flex items-center gap-2 mb-3">
          <svg className="h-3.5 w-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Tips</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">16+ chars</span> — Recommended minimum length</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Mix types</span> — Upper, lower, digits &amp; symbols</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Crypto-secure</span> — Uses Web Crypto API</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Never reuse</span> — Unique password per service</p>
        </div>
      </div>
    </div>
  );
}
