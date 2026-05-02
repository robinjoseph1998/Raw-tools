'use client';

import { useState, useEffect } from 'react';

const CODE_LINES = [
  { text: '{', cls: 'text-zinc-600' },
  { text: '  "name": "RAW"', parts: [
    { t: '  ', c: '' }, { t: '"name"', c: 'text-blue-300' }, { t: ': ', c: 'text-zinc-600' }, { t: '"RAW"', c: 'text-purple-300' },
  ]},
  { text: '  "tools": 15', parts: [
    { t: '  ', c: '' }, { t: '"tools"', c: 'text-blue-300' }, { t: ': ', c: 'text-zinc-600' }, { t: '15', c: 'text-amber-400' },
  ]},
  { text: '  "private": true', parts: [
    { t: '  ', c: '' }, { t: '"private"', c: 'text-blue-300' }, { t: ': ', c: 'text-zinc-600' }, { t: 'true', c: 'text-pink-300' },
  ]},
  { text: '  "server": null', parts: [
    { t: '  ', c: '' }, { t: '"server"', c: 'text-blue-300' }, { t: ': ', c: 'text-zinc-600' }, { t: 'null', c: 'text-zinc-500 italic' },
  ]},
  { text: '}', cls: 'text-zinc-600' },
];

export default function HeroCode() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    if (visibleLines < CODE_LINES.length) {
      const timer = setTimeout(() => setVisibleLines((v) => v + 1), 120);
      return () => clearTimeout(timer);
    } else {
      const showTimer = setTimeout(() => setShowStatus(true), 300);
      // Reset after 5 seconds to replay
      const resetTimer = setTimeout(() => {
        setVisibleLines(0);
        setShowStatus(false);
      }, 5000);
      return () => { clearTimeout(showTimer); clearTimeout(resetTimer); };
    }
  }, [visibleLines]);

  return (
    <div className="rounded-xl glass-panel overflow-hidden border border-white/[0.06]">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.06]">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
        </div>
        <span className="text-[10px] text-zinc-600 ml-1">input.json</span>
      </div>

      {/* Code with typing animation */}
      <pre className="p-4 text-[12px] font-mono leading-[1.8] overflow-hidden min-h-[160px]">
        <code>
          {CODE_LINES.slice(0, visibleLines).map((line, i) => (
            <div key={i} className="animate-fade-in" style={{ animationDuration: '0.15s' }}>
              {'parts' in line && line.parts ? (
                <>
                  {line.parts.map((p, j) => (
                    <span key={j} className={p.c}>{p.t}</span>
                  ))}
                  {i < CODE_LINES.length - 2 && <span className="text-zinc-600">,</span>}
                </>
              ) : (
                <span className={line.cls}>{line.text}</span>
              )}
            </div>
          ))}
          {visibleLines < CODE_LINES.length && (
            <span className="inline-block w-[7px] h-[15px] bg-blue-400/70 animate-pulse ml-0.5" />
          )}
        </code>
      </pre>

      {/* Status bar */}
      <div className={`flex items-center justify-between px-3 py-1.5 border-t border-white/[0.06] bg-white/[0.01] transition-opacity duration-300 ${showStatus ? 'opacity-100' : 'opacity-0'}`}>
        <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Valid JSON
        </span>
        <span className="text-[10px] text-zinc-600">5 lines &middot; 89 bytes</span>
      </div>
    </div>
  );
}
