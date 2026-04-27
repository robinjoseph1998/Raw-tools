'use client';

import { useState, useCallback } from 'react';
import type { StatusState } from '@/types';

type GradientType = 'linear' | 'radial' | 'conic';

interface ColorStop {
  color: string;
  position: number;
}

const PRESETS: Record<string, ColorStop[]> = {
  Sunset:  [{ color: '#f97316', position: 0 }, { color: '#ec4899', position: 50 }, { color: '#8b5cf6', position: 100 }],
  Ocean:   [{ color: '#06b6d4', position: 0 }, { color: '#3b82f6', position: 50 }, { color: '#1e3a5f', position: 100 }],
  Neon:    [{ color: '#22d3ee', position: 0 }, { color: '#a855f7', position: 100 }],
  Forest:  [{ color: '#065f46', position: 0 }, { color: '#34d399', position: 50 }, { color: '#fbbf24', position: 100 }],
  Berry:   [{ color: '#be185d', position: 0 }, { color: '#7c3aed', position: 100 }],
  Fire:    [{ color: '#fbbf24', position: 0 }, { color: '#ef4444', position: 50 }, { color: '#7f1d1d', position: 100 }],
};

function buildCss(type: GradientType, angle: number, stops: ColorStop[]): string {
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  const stopsStr = sorted.map((s) => `${s.color} ${s.position}%`).join(', ');
  if (type === 'linear') return `linear-gradient(${angle}deg, ${stopsStr})`;
  if (type === 'radial') return `radial-gradient(circle, ${stopsStr})`;
  return `conic-gradient(from ${angle}deg, ${stopsStr})`;
}

interface Props {
  onStatusChange: (s: StatusState) => void;
  onToast: (msg: string) => void;
}

export default function CssGradientTool({ onStatusChange, onToast }: Props) {
  const [type, setType] = useState<GradientType>('linear');
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState<ColorStop[]>([
    { color: '#06b6d4', position: 0 },
    { color: '#a855f7', position: 100 },
  ]);

  const gradientCss = buildCss(type, angle, stops);
  const cssCode = `background: ${gradientCss};`;

  const updateStop = useCallback((index: number, field: keyof ColorStop, value: string | number) => {
    setStops((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
    onStatusChange('valid');
  }, [onStatusChange]);

  const addStop = useCallback(() => {
    if (stops.length >= 6) return;
    setStops((prev) => [...prev, { color: '#facc15', position: 50 }]);
    onStatusChange('valid');
  }, [stops.length, onStatusChange]);

  const removeStop = useCallback((index: number) => {
    if (stops.length <= 2) return;
    setStops((prev) => prev.filter((_, i) => i !== index));
    onStatusChange('valid');
  }, [stops.length, onStatusChange]);

  const applyPreset = useCallback((name: string) => {
    setStops(PRESETS[name]);
    onStatusChange('valid');
    onToast(`Applied ${name} preset`);
  }, [onStatusChange, onToast]);

  const copyCss = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(cssCode);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = cssCode;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    onToast('Copied CSS to clipboard');
  }, [cssCode, onToast]);

  return (
    <div className="space-y-4">
      {/* Type selector */}
      <div className="flex items-center gap-2.5">
        <div className="pill-group">
          {(['linear', 'radial', 'conic'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`pill-group__item ${type === t ? 'pill-group__item--active' : ''}`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Controls panel */}
        <div className="space-y-4">
          {/* Angle slider */}
          {(type === 'linear' || type === 'conic') && (
            <div className="glass-panel rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Angle</span>
                <span className="text-[13px] font-mono text-zinc-300">{angle}&deg;</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                className="w-full h-1 accent-blue-400 bg-white/[0.08] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-400 [&::-webkit-slider-thumb]:shadow-md"
              />
            </div>
          )}

          {/* Color stops */}
          <div className="glass-panel rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Color Stops</span>
              <button
                onClick={addStop}
                disabled={stops.length >= 6}
                className="btn-secondary text-[11px] disabled:opacity-30 disabled:pointer-events-none"
              >
                + Add Stop
              </button>
            </div>
            {stops.map((stop, i) => (
              <div key={i} className="flex items-center gap-3">
                <input
                  type="color"
                  value={stop.color}
                  onChange={(e) => updateStop(i, 'color', e.target.value)}
                  className="w-8 h-8 rounded-lg border border-white/[0.1] bg-transparent cursor-pointer flex-shrink-0 [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
                />
                <code className="text-[12px] font-mono text-zinc-400 w-[62px] flex-shrink-0">{stop.color}</code>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={stop.position}
                  onChange={(e) => updateStop(i, 'position', Number(e.target.value))}
                  className="flex-1 h-1 accent-blue-400 bg-white/[0.08] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-400 [&::-webkit-slider-thumb]:shadow-md"
                />
                <span className="text-[11px] font-mono text-zinc-500 w-8 text-right flex-shrink-0">{stop.position}%</span>
                <button
                  onClick={() => removeStop(i)}
                  disabled={stops.length <= 2}
                  className="text-zinc-600 hover:text-red-400 transition-colors disabled:opacity-20 disabled:pointer-events-none flex-shrink-0"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Presets */}
          <div className="glass-panel rounded-xl p-4">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-3">Presets</span>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(PRESETS).map(([name, presetStops]) => (
                <button
                  key={name}
                  onClick={() => applyPreset(name)}
                  className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.18] hover:bg-white/[0.06] transition-all"
                >
                  <div
                    className="w-5 h-5 rounded-full flex-shrink-0 border border-white/[0.1]"
                    style={{ background: buildCss('linear', 135, presetStops) }}
                  />
                  <span className="text-[12px] text-zinc-400 group-hover:text-zinc-200 transition-colors">{name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview + CSS output */}
        <div className="space-y-4">
          {/* Live preview */}
          <div className="rounded-xl glass-panel overflow-hidden">
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.08] bg-white/[0.03]">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400/70" />
              <span className="text-[12px] font-bold text-zinc-300 uppercase tracking-wider">Preview</span>
            </div>
            <div className="p-4">
              <div
                className="w-full h-[200px] rounded-xl border border-white/[0.1] transition-all duration-200"
                style={{ background: gradientCss }}
              />
            </div>
          </div>

          {/* CSS output */}
          <div className="rounded-xl glass-panel overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-white/[0.03]">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-400/70" />
                <span className="text-[12px] font-bold text-zinc-300 uppercase tracking-wider">CSS</span>
              </div>
              <button onClick={copyCss} className="btn-primary text-[11px]">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy CSS
              </button>
            </div>
            <div className="p-4">
              <code className="text-[13px] font-mono text-zinc-200 leading-relaxed break-all select-all">{cssCode}</code>
            </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Linear</span> — Use linear-gradient for directional color transitions</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Radial</span> — Radial gradients create circular or elliptical color spreads</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Multi-stop</span> — Add more color stops for complex multi-color effects</p>
        </div>
      </div>
    </div>
  );
}
