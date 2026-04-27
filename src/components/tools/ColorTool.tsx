'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { StatusState } from '@/types';
import { hsvToRgb, rgbToHsv, rgbToHex, hexToRgb, rgbToHsl } from '@/lib/color';

interface Props {
  onStatusChange: (s: StatusState) => void;
  onToast: (msg: string) => void;
}

export default function ColorTool({ onStatusChange, onToast }: Props) {
  const [hue, setHue] = useState(188);
  const [sat, setSat] = useState(0.86);
  const [val, setVal] = useState(0.93);
  const [hexInput, setHexInput] = useState('#22d3ee');

  const canvasRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const draggingCanvas = useRef(false);
  const draggingHue = useRef(false);

  const rgb = hsvToRgb(hue, sat, val);
  const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
  const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);

  // Sync hex input when HSV changes (unless user is typing)
  const syncHex = useRef(true);
  useEffect(() => {
    if (syncHex.current) {
      setHexInput(hex);
    }
  }, [hex]);

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
      onToast(`Copied ${text}`);
    },
    [onToast],
  );

  // Canvas (saturation x brightness) drag
  const updateCanvas = useCallback((clientX: number, clientY: number) => {
    const el = canvasRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    setSat(x);
    setVal(1 - y);
    syncHex.current = true;
    onStatusChange('valid');
  }, [onStatusChange]);

  // Hue slider drag
  const updateHue = useCallback((clientX: number) => {
    const el = hueRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setHue(Math.round(x * 360));
    syncHex.current = true;
    onStatusChange('valid');
  }, [onStatusChange]);

  // Mouse handlers
  const handleCanvasDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    draggingCanvas.current = true;
    const point = 'touches' in e ? e.touches[0] : e;
    updateCanvas(point.clientX, point.clientY);
  }, [updateCanvas]);

  const handleHueDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    draggingHue.current = true;
    const point = 'touches' in e ? e.touches[0] : e;
    updateHue(point.clientX);
  }, [updateHue]);

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      const point = 'touches' in e ? e.touches[0] : e;
      if (draggingCanvas.current) {
        e.preventDefault();
        updateCanvas(point.clientX, point.clientY);
      }
      if (draggingHue.current) {
        e.preventDefault();
        updateHue(point.clientX);
      }
    };
    const handleUp = () => {
      draggingCanvas.current = false;
      draggingHue.current = false;
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [updateCanvas, updateHue]);

  // Hex input handler
  const handleHexChange = useCallback(
    (value: string) => {
      setHexInput(value);
      syncHex.current = false;
      const rgb = hexToRgb(value);
      if (rgb) {
        const [h, s, v] = rgbToHsv(rgb[0], rgb[1], rgb[2]);
        setHue(h);
        setSat(s);
        setVal(v);
        onStatusChange('valid');
      }
    },
    [onStatusChange],
  );

  const handleHexBlur = useCallback(() => {
    syncHex.current = true;
    setHexInput(hex);
  }, [hex]);

  // Hue pure color for canvas background
  const hueRgb = hsvToRgb(hue, 1, 1);
  const hueColor = `rgb(${hueRgb[0]},${hueRgb[1]},${hueRgb[2]})`;

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 mb-5">
        {/* Saturation/Brightness Canvas */}
        <div className="rounded-lg glass-panel overflow-hidden">
          <header className="px-4 py-2.5 border-b border-white/[0.05] bg-gradient-to-r from-white/[0.02] to-transparent">
            <span className="text-[13px] font-semibold text-zinc-300 select-none">Pick a Color</span>
          </header>
          <div className="p-4 space-y-3">
            {/* SV Canvas */}
            <div
              ref={canvasRef}
              className="relative w-full h-[220px] rounded-lg cursor-crosshair select-none touch-none"
              style={{ backgroundColor: hueColor }}
              onMouseDown={handleCanvasDown}
              onTouchStart={handleCanvasDown}
            >
              {/* White gradient (left to right = saturation) */}
              <div className="absolute inset-0 rounded-lg" style={{ background: 'linear-gradient(to right, #fff, transparent)' }} />
              {/* Black gradient (top to bottom = brightness) */}
              <div className="absolute inset-0 rounded-lg" style={{ background: 'linear-gradient(to bottom, transparent, #000)' }} />
              {/* Thumb */}
              <div
                className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg shadow-black/40 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  left: `${sat * 100}%`,
                  top: `${(1 - val) * 100}%`,
                  backgroundColor: hex,
                }}
              />
            </div>

            {/* Hue Slider */}
            <div
              ref={hueRef}
              className="relative w-full h-4 rounded-full cursor-pointer select-none touch-none"
              style={{ background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' }}
              onMouseDown={handleHueDown}
              onTouchStart={handleHueDown}
            >
              <div
                className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg shadow-black/40 -translate-x-1/2 top-0 pointer-events-none"
                style={{
                  left: `${(hue / 360) * 100}%`,
                  backgroundColor: hueColor,
                }}
              />
            </div>
          </div>
        </div>

        {/* Right panel: preview + values */}
        <div className="space-y-4">
          {/* Preview swatch */}
          <div className="rounded-lg glass-panel overflow-hidden">
            <header className="px-4 py-2.5 border-b border-white/[0.05] bg-gradient-to-r from-white/[0.02] to-transparent">
              <span className="text-[13px] font-semibold text-zinc-300 select-none">Preview</span>
            </header>
            <div className="p-4">
              <div
                className="w-full h-24 rounded-xl border border-white/10 transition-colors duration-100"
                style={{ backgroundColor: hex }}
              />
            </div>
          </div>

          {/* Hex input */}
          <div className="rounded-lg glass-panel">
            <header className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05] bg-gradient-to-r from-white/[0.02] to-transparent">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">HEX</span>
              <button onClick={() => handleCopy(hex)} className="btn-ghost text-[11px]">Copy</button>
            </header>
            <div className="p-3">
              <input
                type="text"
                value={hexInput}
                onChange={(e) => handleHexChange(e.target.value)}
                onBlur={handleHexBlur}
                className="w-full bg-transparent text-zinc-200 font-mono text-[15px] outline-none placeholder:text-zinc-700"
                spellCheck={false}
                maxLength={7}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Color values */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="rounded-lg glass-panel p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">HEX</span>
            <button onClick={() => handleCopy(hex)} className="btn-ghost text-[11px]">Copy</button>
          </div>
          <code className="text-[13px] font-mono text-zinc-300 select-all">{hex}</code>
        </div>
        <div className="rounded-lg glass-panel p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">RGB</span>
            <button onClick={() => handleCopy(`rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`)} className="btn-ghost text-[11px]">Copy</button>
          </div>
          <code className="text-[13px] font-mono text-zinc-300 select-all">rgb({rgb[0]}, {rgb[1]}, {rgb[2]})</code>
        </div>
        <div className="rounded-lg glass-panel p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">HSL</span>
            <button onClick={() => handleCopy(`hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`)} className="btn-ghost text-[11px]">Copy</button>
          </div>
          <code className="text-[13px] font-mono text-zinc-300 select-all">hsl({hsl[0]}, {hsl[1]}%, {hsl[2]}%)</code>
        </div>
      </div>

      {/* Tips */}
      <div className="tips-section tips-section--pink">
        <div className="flex items-center gap-2 mb-3">
          <svg className="h-3.5 w-3.5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Tips</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Drag</span> — Move around the canvas to pick</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Hue</span> — Slide the bar to change base color</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Type</span> — Enter any hex code directly</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Copy</span> — Get HEX, RGB, or HSL values</p>
        </div>
      </div>
    </div>
  );
}
