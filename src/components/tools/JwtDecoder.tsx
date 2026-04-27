'use client';

import { useState, useEffect, useCallback } from 'react';
import type { StatusState, DecodedJwt } from '@/types';
import { decodeJwt, formatExpiry } from '@/lib/jwt';
import { highlightJSON } from '@/lib/json';

interface Props {
  onStatusChange: (s: StatusState) => void;
  onToast: (msg: string) => void;
}

export default function JwtDecoder({ onStatusChange, onToast }: Props) {
  const [input, setInput] = useState('');
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!input.trim()) {
        setDecoded(null);
        setError(null);
        onStatusChange('idle');
        return;
      }
      const result = decodeJwt(input);
      if (result.success) {
        setDecoded(result.data);
        setError(null);
        onStatusChange('valid');
      } else {
        setDecoded(null);
        setError(result.error);
        onStatusChange('invalid');
      }
    }, 150);
    return () => clearTimeout(timer);
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

  const headerJson = decoded ? JSON.stringify(decoded.header, null, 2) : '';
  const payloadJson = decoded ? JSON.stringify(decoded.payload, null, 2) : '';

  return (
    <div>
      {/* Input */}
      <div className="mb-5">
        <div className="rounded-lg glass-panel">
          <header className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05] bg-gradient-to-r from-white/[0.02] to-transparent">
            <span className="flex items-center gap-2 text-[13px] font-semibold text-zinc-300 select-none">
              <svg className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              JWT Token
            </span>
            <button
              onClick={() => { setInput(''); setDecoded(null); setError(null); onStatusChange('idle'); }}
              className="btn-ghost"
            >
              Clear
            </button>
          </header>
          <textarea
            className="editor-textarea !min-h-[100px]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste a JWT token here (e.g. eyJhbGciOiJIUzI1NiIs...)"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Error */}
      <div className={`error-container mb-5 ${error ? 'is-visible' : ''}`} aria-live="polite">
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl border border-red-500/20 bg-red-500/[0.06]">
          <div className="h-6 w-6 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="h-3.5 w-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M6 18L18 6M6 6l12 12" /></svg>
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-red-400">Invalid Token</p>
            <p className="text-[12px] text-zinc-400 font-mono mt-1 break-words leading-relaxed">{error}</p>
          </div>
        </div>
      </div>

      {/* Decoded sections */}
      {decoded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DecodedSection
            title="Header"
            label="ALGORITHM & TOKEN TYPE"
            json={headerJson}
            onCopy={() => handleCopy(headerJson)}
          />
          <DecodedSection
            title="Payload"
            label="DATA"
            json={payloadJson}
            onCopy={() => handleCopy(payloadJson)}
            badge={
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                  decoded.isExpired
                    ? 'text-red-400 bg-red-500/10 border-red-500/20'
                    : decoded.expiresAt
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    decoded.isExpired ? 'bg-red-400' : decoded.expiresAt ? 'bg-emerald-400' : 'bg-zinc-500'
                  }`}
                />
                {formatExpiry(decoded.expiresAt, decoded.isExpired)}
              </span>
            }
          />

          {/* Signature (full width) */}
          <div className="lg:col-span-2 rounded-lg glass-panel">
            <header className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05] bg-gradient-to-r from-white/[0.02] to-transparent">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-zinc-300">Signature</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-white/[0.03] px-2 py-0.5 rounded-md">VERIFY SIGNATURE</span>
              </div>
              <button
                onClick={() => handleCopy(decoded.signature)}
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
              <code className="text-[12px] font-mono text-zinc-400 break-all leading-relaxed">{decoded.signature}</code>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!decoded && !error && (
        <div className="flex items-center justify-center min-h-[300px] rounded-lg glass-panel">
          <div className="text-center space-y-4 px-6">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
              <svg className="h-6 w-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-zinc-300 mb-1">Paste a JWT to decode</p>
              <p className="text-[13px] text-zinc-500 max-w-[300px] leading-relaxed">
                The token will be split into header, payload, and signature with expiry status.
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
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Private</span> — Decoded in your browser only</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">exp / iat</span> — Timestamps auto-detected</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Status</span> — Green = active, Red = expired</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Claims</span> — sub, iss, aud, and more</p>
        </div>
      </div>
    </div>
  );
}

function DecodedSection({
  title,
  label,
  json,
  onCopy,
  badge,
}: {
  title: string;
  label: string;
  json: string;
  onCopy: () => void;
  badge?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg glass-panel flex flex-col">
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05] bg-gradient-to-r from-white/[0.02] to-transparent">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span className="text-[13px] font-semibold text-zinc-300">{title}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-white/[0.03] px-2 py-0.5 rounded-md">{label}</span>
          {badge}
        </div>
        <button
          onClick={onCopy}
          className="btn-ghost inline-flex items-center gap-1.5 flex-shrink-0"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          Copy
        </button>
      </header>
      <pre
        className="editor-output !relative !min-h-0 !p-4"
        dangerouslySetInnerHTML={{ __html: highlightJSON(json) }}
      />
    </div>
  );
}
