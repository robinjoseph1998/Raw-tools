'use client';

import { useState, useEffect, useMemo } from 'react';

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

// Sparkle shapes for the anime burst
const SPARKLE_SHAPES = [
  // 4-point star
  'M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5Z',
  // Diamond
  'M6 0L12 6L6 12L0 6Z',
  // Small 4-point star
  'M5 0L6.2 3.8L10 5L6.2 6.2L5 10L3.8 6.2L0 5L3.8 3.8Z',
];

function SparkleEffect() {
  const sparkles = useMemo(() => {
    const items = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * 360;
      const distance = 30 + Math.random() * 60;
      const size = 6 + Math.random() * 10;
      const delay = Math.random() * 0.3;
      const dx = Math.cos((angle * Math.PI) / 180) * distance;
      const dy = Math.sin((angle * Math.PI) / 180) * distance;
      const shape = SPARKLE_SHAPES[i % 3];
      const colors = ['#34d399', '#60a5fa', '#a78bfa', '#fbbf24', '#f472b6', '#22d3ee'];
      items.push({ dx, dy, size, delay, shape, color: colors[i % colors.length], rotation: angle });
    }
    return items;
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Central flash */}
      <div className="sparkle-flash absolute left-1/4 bottom-2" />

      {/* Sparkle particles */}
      {sparkles.map((s, i) => (
        <svg
          key={i}
          className="sparkle-particle absolute"
          style={{
            left: '25%',
            bottom: 8,
            width: s.size,
            height: s.size,
            '--dx': `${s.dx}px`,
            '--dy': `${s.dy}px`,
            '--rot': `${s.rotation}deg`,
            animationDelay: `${s.delay}s`,
          } as React.CSSProperties}
          viewBox="0 0 16 16"
          fill={s.color}
        >
          <path d={s.shape} />
        </svg>
      ))}

      {/* Anime speed lines radiating from center */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * 360;
        return (
          <div
            key={`line-${i}`}
            className="sparkle-line absolute"
            style={{
              left: '25%',
              bottom: 8,
              width: 2,
              height: 20 + Math.random() * 15,
              transformOrigin: 'bottom center',
              transform: `rotate(${angle}deg)`,
              animationDelay: `${i * 0.04}s`,
            }}
          />
        );
      })}
    </div>
  );
}

export default function HeroCode() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showStatus, setShowStatus] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    if (visibleLines < CODE_LINES.length) {
      const timer = setTimeout(() => setVisibleLines((v) => v + 1), 120);
      return () => clearTimeout(timer);
    } else {
      const showTimer = setTimeout(() => {
        setShowStatus(true);
        setShowSparkles(true);
      }, 300);
      const hideSparklesTimer = setTimeout(() => setShowSparkles(false), 1800);
      const resetTimer = setTimeout(() => {
        setVisibleLines(0);
        setShowStatus(false);
      }, 6000);
      return () => { clearTimeout(showTimer); clearTimeout(hideSparklesTimer); clearTimeout(resetTimer); };
    }
  }, [visibleLines]);

  return (
    <div className="relative rounded-xl glass-panel overflow-hidden border border-white/[0.06]">
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
      <div className={`relative flex items-center justify-between px-3 py-1.5 border-t border-white/[0.06] bg-white/[0.01] transition-opacity duration-300 ${showStatus ? 'opacity-100' : 'opacity-0'}`}>
        <span className={`flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium ${showStatus ? 'sparkle-text-glow' : ''}`}>
          <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${showStatus ? 'sparkle-dot-pop' : ''}`} />
          Valid JSON
        </span>
        <span className="text-[10px] text-zinc-600">5 lines &middot; 89 bytes</span>
      </div>

      {/* Anime sparkle burst effect */}
      {showSparkles && <SparkleEffect />}
    </div>
  );
}
