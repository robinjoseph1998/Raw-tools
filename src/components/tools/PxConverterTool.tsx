'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { StatusState } from '@/types';

interface Props {
  onStatusChange: (s: StatusState) => void;
  onToast: (msg: string) => void;
}

function CopyBtn({ text, label, onCopy }: { text: string; label?: string; onCopy: (t: string) => Promise<void> }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const handleClick = async () => {
    await onCopy(text);
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handleClick} className="btn-ghost inline-flex items-center gap-1.5 text-[11px]">
      {copied ? (
        <>
          <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-emerald-400">Copied!</span>
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          {label && <span>{label}</span>}
        </>
      )}
    </button>
  );
}

// Tailwind default spacing scale: class → px
const TW_SCALE: [string, number][] = [
  ['0', 0], ['px', 1], ['0.5', 2], ['1', 4], ['1.5', 6], ['2', 8], ['2.5', 10],
  ['3', 12], ['3.5', 14], ['4', 16], ['5', 20], ['6', 24], ['7', 28], ['8', 32],
  ['9', 36], ['10', 40], ['11', 44], ['12', 48], ['14', 56], ['16', 64],
  ['20', 80], ['24', 96], ['28', 112], ['32', 128], ['36', 144], ['40', 160],
  ['44', 176], ['48', 192], ['52', 208], ['56', 224], ['60', 240], ['64', 256],
  ['72', 288], ['80', 320], ['96', 384],
];

// Reverse: px → class name (for exact matches)
const PX_TO_TW = new Map(TW_SCALE.map(([cls, px]) => [px, cls]));

function findTailwind(px: number): { exact: string | null; closest: string; closestPx: number; arbitrary: string } {
  const exact = PX_TO_TW.get(px) ?? null;
  let closest = TW_SCALE[0];
  let minDiff = Infinity;
  for (const entry of TW_SCALE) {
    const diff = Math.abs(entry[1] - px);
    if (diff < minDiff) { minDiff = diff; closest = entry; }
  }
  return {
    exact,
    closest: closest[0],
    closestPx: closest[1],
    arbitrary: `[${px}px]`,
  };
}

export default function PxConverterTool({ onStatusChange, onToast }: Props) {
  const [pxInput, setPxInput] = useState('16');
  const [baseFontSize, setBaseFontSize] = useState('16');
  const [mode, setMode] = useState<'px-to-rem' | 'rem-to-px'>('px-to-rem');

  const base = parseFloat(baseFontSize) || 16;
  const inputVal = parseFloat(pxInput);
  const isValid = !isNaN(inputVal) && inputVal >= 0;

  const result = useMemo(() => {
    if (!isValid) return null;
    if (mode === 'px-to-rem') {
      const rem = inputVal / base;
      const px = inputVal;
      const tw = findTailwind(px);
      return { px, rem, tw };
    } else {
      const px = inputVal * base;
      const rem = inputVal;
      const tw = findTailwind(px);
      return { px, rem, tw };
    }
  }, [inputVal, base, mode, isValid]);

  // Update status based on validity
  useEffect(() => {
    if (pxInput === '') onStatusChange('idle');
    else if (isValid) onStatusChange('valid');
    else onStatusChange('invalid');
  }, [pxInput, isValid, onStatusChange]);

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

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="pill-group">
          <button
            onClick={() => setMode('px-to-rem')}
            className={`pill-group__item ${mode === 'px-to-rem' ? 'pill-group__item--active' : ''}`}
          >
            PX → REM
          </button>
          <button
            onClick={() => setMode('rem-to-px')}
            className={`pill-group__item ${mode === 'rem-to-px' ? 'pill-group__item--active' : ''}`}
          >
            REM → PX
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Base</label>
          <input
            type="number"
            value={baseFontSize}
            onChange={(e) => setBaseFontSize(e.target.value)}
            min={1}
            max={100}
            className="no-spinner w-16 px-2 py-1.5 text-[13px] font-mono text-zinc-200 bg-white/[0.04] border border-white/[0.08] rounded-lg focus:border-purple-500/40 focus:outline-none transition-colors text-center"
          />
          <span className="text-[11px] text-zinc-600">px</span>
        </div>
      </div>

      {/* Input + Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {/* Input */}
        <div className="rounded-lg glass-panel">
          <header className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05] bg-gradient-to-r from-white/[0.02] to-transparent">
            <span className="text-[13px] font-semibold text-zinc-300">
              {mode === 'px-to-rem' ? 'Pixels (px)' : 'REM'}
            </span>
          </header>
          <div className="p-4">
            <input
              type="number"
              value={pxInput}
              onChange={(e) => setPxInput(e.target.value)}
              placeholder={mode === 'px-to-rem' ? 'Enter px value...' : 'Enter rem value...'}
              min={0}
              step="any"
              className="w-full px-4 py-3 text-2xl font-mono text-zinc-100 bg-white/[0.02] border border-white/[0.06] rounded-lg focus:border-purple-500/40 focus:outline-none transition-colors placeholder:text-zinc-700"
              autoFocus
            />
          </div>
        </div>

        {/* Output */}
        <div className="rounded-lg glass-panel">
          <header className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05] bg-gradient-to-r from-white/[0.02] to-transparent">
            <span className="text-[13px] font-semibold text-zinc-300">Result</span>
          </header>
          <div className="p-4 space-y-3">
            {result ? (
              <>
                {/* REM / PX value */}
                <div>
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
                    {mode === 'px-to-rem' ? 'REM' : 'Pixels'}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xl font-mono text-purple-300 select-all">
                      {mode === 'px-to-rem'
                        ? `${parseFloat(result.rem.toFixed(6))}rem`
                        : `${parseFloat(result.px.toFixed(2))}px`}
                    </code>
                    <CopyBtn
                      text={mode === 'px-to-rem'
                        ? `${parseFloat(result.rem.toFixed(6))}rem`
                        : `${parseFloat(result.px.toFixed(2))}px`}
                      label="Copy"
                      onCopy={handleCopy}
                    />
                  </div>
                </div>

                {/* Tailwind class */}
                <div>
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Tailwind</span>
                  {result.tw.exact ? (
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xl font-mono text-cyan-300 select-all">{result.tw.exact}</code>
                      <CopyBtn text={result.tw.exact!} label="Copy" onCopy={handleCopy} />
                    </div>
                  ) : (
                    <div className="mt-1">
                      <p className="text-lg font-mono text-zinc-300">
                        {parseFloat((result.px / 4).toFixed(4))} <span className="text-[11px] text-zinc-600">(not a standard class)</span>
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <code className="text-[12px] font-mono text-cyan-300/60 select-all">
                          {result.tw.arbitrary}
                        </code>
                        <CopyBtn text={result.tw.arbitrary} label="Copy" onCopy={handleCopy} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Both values for easy reference */}
                <div className="pt-2 border-t border-white/[0.04]">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
                    {mode === 'px-to-rem' ? 'Pixels' : 'REM'}
                  </span>
                  <p className="text-sm font-mono text-zinc-400 mt-1">
                    {mode === 'px-to-rem'
                      ? `${result.px}px`
                      : `${parseFloat(result.rem.toFixed(6))}rem`}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-[13px] text-zinc-600 py-4 text-center">
                Enter a valid number to convert
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tailwind spacing info */}
      <div className="rounded-lg border border-purple-500/10 bg-purple-500/[0.04] px-4 py-3 mb-5 flex items-start gap-3">
        <svg className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="text-[12px] text-zinc-400 leading-relaxed">
          <span className="text-zinc-300 font-medium">Tailwind spacing scale</span> — standard classes only use increments of{' '}
          <span className="font-mono text-purple-300">0.25</span>,{' '}
          <span className="font-mono text-purple-300">0.5</span>,{' '}
          <span className="font-mono text-purple-300">0.75</span>, and{' '}
          <span className="font-mono text-purple-300">1</span>{' '}
          (where 1 unit = 4px). Values outside this scale require arbitrary syntax like{' '}
          <span className="font-mono text-cyan-300/70">[18px]</span>.
        </div>
      </div>

      {/* Reference table */}
      <div className="rounded-lg glass-panel">
        <header className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05] bg-gradient-to-r from-white/[0.02] to-transparent">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-zinc-300">Reference Table</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-white/[0.03] px-2 py-0.5 rounded-md">
              base {base}px
            </span>
          </div>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] sm:text-[13px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-4 py-2.5 text-left font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">PX</th>
                <th className="px-4 py-2.5 text-left font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">REM</th>
                <th className="px-4 py-2.5 text-left font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">Tailwind</th>
              </tr>
            </thead>
            <tbody>
              {TW_SCALE.filter(([cls]) => cls !== 'px').map(([cls, px]) => {
                const rem = px / base;
                const isHighlighted = result && Math.abs(result.px - px) < 0.01;
                return (
                  <tr
                    key={cls}
                    className={`border-b border-white/[0.03] transition-colors ${
                      isHighlighted
                        ? 'bg-purple-500/[0.08] border-purple-500/20'
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <td className="px-4 py-2 font-mono text-zinc-300">{px}px</td>
                    <td className="px-4 py-2 font-mono text-purple-300/80">{parseFloat(rem.toFixed(4))}rem</td>
                    <td className="px-4 py-2 font-mono text-cyan-300/80">{cls}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">1rem</span> — equals base font size (default 16px)</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Tailwind</span> — 1 unit = 0.25rem = 4px</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Arbitrary</span> — use [18px] for non-standard values</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Accessible</span> — rem scales with user font settings</p>
        </div>
      </div>
    </div>
  );
}
