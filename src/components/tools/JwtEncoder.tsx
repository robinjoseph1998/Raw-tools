'use client';

import { useState, useCallback } from 'react';
import type { StatusState } from '@/types';
import { encodeJwt } from '@/lib/jwt';

interface Props {
  onStatusChange: (s: StatusState) => void;
  onToast: (msg: string) => void;
}

const DEFAULT_HEADER = JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2);
const DEFAULT_PAYLOAD = JSON.stringify(
  {
    sub: '1234567890',
    name: 'John Doe',
    iat: Math.floor(Date.now() / 1000),
  },
  null,
  2,
);

export default function JwtEncoder({ onStatusChange, onToast }: Props) {
  const [header, setHeader] = useState(DEFAULT_HEADER);
  const [payload, setPayload] = useState(DEFAULT_PAYLOAD);
  const [secret, setSecret] = useState('your-256-bit-secret');
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    const result = await encodeJwt(header, payload, secret);
    if (result.success) {
      setToken(result.data);
      setError(null);
      onStatusChange('valid');
    } else {
      setToken('');
      setError(result.error);
      onStatusChange('invalid');
    }
  }, [header, payload, secret, onStatusChange]);

  const handleCopy = useCallback(
    async (text: string) => {
      if (!text) return;
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

  const handleClear = useCallback(() => {
    setHeader(DEFAULT_HEADER);
    setPayload(DEFAULT_PAYLOAD);
    setSecret('your-256-bit-secret');
    setToken('');
    setError(null);
    onStatusChange('idle');
  }, [onStatusChange]);

  // Color-code the token parts
  const tokenParts = token.split('.');
  const tokenHtml = token
    ? `<span class="text-cyan-400">${tokenParts[0]}</span>.<span class="text-purple-400">${tokenParts[1]}</span>.<span class="text-pink-400">${tokenParts[2] || ''}</span>`
    : '';

  return (
    <div>
      {/* Header + Payload editors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Header */}
        <div className="rounded-lg glass-panel">
          <header className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05] bg-gradient-to-r from-white/[0.02] to-transparent">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500/50" />
              <span className="text-[12px] font-semibold text-zinc-400 select-none uppercase tracking-wide">Header</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-white/[0.03] px-2 py-0.5 rounded-md">ALGORITHM</span>
          </header>
          <textarea
            className="editor-textarea !min-h-[120px]"
            value={header}
            onChange={(e) => setHeader(e.target.value)}
            placeholder='{"alg": "HS256", "typ": "JWT"}'
            spellCheck={false}
          />
        </div>

        {/* Payload */}
        <div className="rounded-lg glass-panel">
          <header className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05] bg-gradient-to-r from-white/[0.02] to-transparent">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500/50" />
              <span className="text-[12px] font-semibold text-zinc-400 select-none uppercase tracking-wide">Payload</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-white/[0.03] px-2 py-0.5 rounded-md">DATA</span>
          </header>
          <textarea
            className="editor-textarea !min-h-[120px]"
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            placeholder='{"sub": "1234567890", "name": "John Doe"}'
            spellCheck={false}
          />
        </div>
      </div>

      {/* Secret + Actions */}
      <div className="flex flex-wrap items-end gap-3 mb-5">
        <div className="flex-1 min-w-[200px]">
          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">Secret Key</label>
          <div className="rounded-lg glass-panel">
            <input
              type="text"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter signing secret..."
              className="w-full bg-transparent text-zinc-200 font-mono text-[13px] px-4 py-2.5 outline-none placeholder:text-zinc-700"
              spellCheck={false}
            />
          </div>
        </div>
        <button onClick={handleGenerate} className="btn-primary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Generate JWT
        </button>
        <button onClick={handleClear} className="btn-secondary">Clear</button>
      </div>

      {/* Error */}
      <div className={`error-container mb-5 ${error ? 'is-visible' : ''}`} aria-live="polite">
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

      {/* Token output */}
      {token ? (
        <div className="rounded-lg glass-panel">
          <header className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05] bg-gradient-to-r from-white/[0.02] to-transparent">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-zinc-300">Generated Token</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-white/[0.03] px-2 py-0.5 rounded-md">
                HS256
              </span>
            </div>
            <button
              onClick={() => handleCopy(token)}
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
            <code
              className="text-[13px] font-mono break-all leading-relaxed block select-all"
              dangerouslySetInnerHTML={{ __html: tokenHtml }}
            />
          </div>
          <div className="px-4 pb-3 flex items-center gap-4 text-[11px] text-zinc-600">
            <span><span className="inline-block w-2 h-2 rounded-full bg-cyan-400/60 mr-1" />Header</span>
            <span><span className="inline-block w-2 h-2 rounded-full bg-purple-400/60 mr-1" />Payload</span>
            <span><span className="inline-block w-2 h-2 rounded-full bg-pink-400/60 mr-1" />Signature</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[200px] rounded-lg glass-panel">
          <div className="text-center space-y-4 px-6">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center animate-float">
              <svg className="h-6 w-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-zinc-300 mb-1">Edit & generate</p>
              <p className="text-[13px] text-zinc-500 max-w-[300px] leading-relaxed">
                Set your header, payload, and secret, then hit Generate.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="tips-section tips-section--teal">
        <div className="flex items-center gap-2 mb-3">
          <svg className="h-3.5 w-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Tips</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">HS256</span> — HMAC with SHA-256 signing</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">iat</span> — Add issued-at timestamp</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">exp</span> — Add expiry as Unix timestamp</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Secret</span> — Leave empty for unsigned token</p>
        </div>
      </div>
    </div>
  );
}
