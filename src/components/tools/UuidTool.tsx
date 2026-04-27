'use client';

import { useState, useCallback } from 'react';
import type { StatusState } from '@/types';
import { generateUUID, generateBulkUUIDs } from '@/lib/uuid';

interface Props {
  onStatusChange: (s: StatusState) => void;
  onToast: (msg: string) => void;
}

const BULK_COUNTS = [1, 5, 10, 25] as const;

export default function UuidTool({ onStatusChange, onToast }: Props) {
  const [uuids, setUuids] = useState<string[]>([generateUUID()]);
  const [bulkCount, setBulkCount] = useState<number>(1);
  const [uppercase, setUppercase] = useState(false);

  const handleGenerate = useCallback(() => {
    const newUuids = generateBulkUUIDs(bulkCount);
    setUuids(newUuids);
    onStatusChange('valid');
  }, [bulkCount, onStatusChange]);

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

  const handleCopyAll = useCallback(() => {
    const all = uuids.map((u) => uppercase ? u.toUpperCase() : u).join('\n');
    handleCopy(all);
  }, [uuids, uppercase, handleCopy]);

  const displayUuids = uuids.map((u) => uppercase ? u.toUpperCase() : u);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <button onClick={handleGenerate} className="btn-primary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Generate
        </button>

        <div className="pill-group">
          {BULK_COUNTS.map((count) => (
            <button
              key={count}
              onClick={() => setBulkCount(count)}
              className={`pill-group__item ${bulkCount === count ? 'pill-group__item--active' : ''}`}
            >
              {count === 1 ? '1' : `×${count}`}
            </button>
          ))}
        </div>

        <button
          onClick={() => setUppercase(!uppercase)}
          className={`btn-secondary ${uppercase ? '!border-cyan-500/25 !text-cyan-300' : ''}`}
        >
          {uppercase ? 'UPPER' : 'lower'}
        </button>

        {uuids.length > 1 && (
          <button onClick={handleCopyAll} className="btn-secondary">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            Copy All
          </button>
        )}
      </div>

      {/* UUID list */}
      <div className="rounded-lg glass-panel">
        <header className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05] bg-gradient-to-r from-white/[0.02] to-transparent">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-zinc-300">UUID v4</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-white/[0.03] px-2 py-0.5 rounded-md">
              {uuids.length} {uuids.length === 1 ? 'id' : 'ids'}
            </span>
          </div>
        </header>
        <div className="p-4 space-y-2">
          {displayUuids.map((uuid, i) => (
            <div key={i} className="flex items-center gap-3 group">
              <code className="text-[13px] font-mono text-cyan-300/80 break-all leading-relaxed flex-1 select-all">{uuid}</code>
              <button
                onClick={() => handleCopy(uuid)}
                className="btn-ghost opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="tips-section tips-section--teal">
        <div className="flex items-center gap-2 mb-3">
          <svg className="h-3.5 w-3.5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Tips</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">v4</span> — Random, 122-bit entropy</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Unique</span> — Collision nearly impossible</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Bulk</span> — Generate up to 25 at once</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Uses</span> — Database IDs, API keys, sessions</p>
        </div>
      </div>
    </div>
  );
}
