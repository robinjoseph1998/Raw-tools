'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { ToolId } from '@/types';
import { TOOL_SLUGS, TOOL_DOT_COLORS, TOOL_TEXT_COLORS } from '@/lib/tools';

const TOOLS: { id: ToolId; title: string; desc: string; shortcut: string; accent: string }[] = [
  { id: 'format', title: 'Format & Validate', desc: 'Pretty-print, minify & validate JSON', shortcut: '1', accent: 'text-zinc-400' },
  { id: 'convert', title: 'Data Converter', desc: 'Convert between JSON, YAML, CSV, XML', shortcut: '2', accent: 'text-zinc-400' },
  { id: 'url', title: 'URL Encode', desc: 'Encode & decode URL components', shortcut: '3', accent: 'text-zinc-400' },
  { id: 'diff', title: 'Diff / Compare', desc: 'Compare two texts with line-level diff', shortcut: '4', accent: 'text-zinc-400' },
  { id: 'sql', title: 'SQL Formatter', desc: 'Format, beautify & minify SQL queries', shortcut: '5', accent: 'text-zinc-400' },
  { id: 'json-ts', title: 'JSON to TypeScript', desc: 'Generate TypeScript interfaces from JSON', shortcut: '6', accent: 'text-zinc-400' },
  { id: 'screen-recorder', title: 'Screen Recorder', desc: 'Record screen, window, or tab with audio', shortcut: 'W', accent: 'text-zinc-400' },
  { id: 'jwt', title: 'JWT Decoder', desc: 'Decode tokens & inspect payloads', shortcut: '7', accent: 'text-zinc-400' },
  { id: 'jwt-encode', title: 'JWT Encoder', desc: 'Build & sign JWT tokens', shortcut: '8', accent: 'text-zinc-400' },
  { id: 'hash', title: 'Hash Generator', desc: 'MD5, SHA-1, SHA-256, SHA-512', shortcut: '9', accent: 'text-zinc-400' },
  { id: 'password', title: 'Password Generator', desc: 'Crypto-secure passwords with strength meter', shortcut: '0', accent: 'text-zinc-400' },
  { id: 'uuid', title: 'UUID Generator', desc: 'Generate random UUID v4 identifiers', shortcut: 'U', accent: 'text-zinc-400' },
  { id: 'regex', title: 'Regex Tester', desc: 'Test patterns with live highlighting', shortcut: 'R', accent: 'text-zinc-400' },
  { id: 'timestamp', title: 'Timestamp', desc: 'Unix timestamp ↔ date converter', shortcut: 'T', accent: 'text-zinc-400' },
  { id: 'markdown', title: 'Markdown Preview', desc: 'Live markdown editor with rendered preview', shortcut: 'M', accent: 'text-zinc-400' },
  { id: 'epoch', title: 'Epoch Converter', desc: 'Batch epoch ↔ date with relative time', shortcut: 'D', accent: 'text-zinc-400' },
  { id: 'base64', title: 'Base64', desc: 'Encode & decode with Unicode support', shortcut: 'E', accent: 'text-zinc-400' },
  { id: 'color', title: 'Color Picker', desc: 'Drag to pick & copy HEX, RGB, HSL', shortcut: 'C', accent: 'text-zinc-400' },
  { id: 'lorem', title: 'Lorem Ipsum', desc: 'Generate placeholder text', shortcut: 'L', accent: 'text-zinc-400' },
  { id: 'base64-image', title: 'Base64 to Image', desc: 'Decode Base64 to preview & download images', shortcut: 'B', accent: 'text-zinc-400' },
  { id: 'image-base64', title: 'Image to Base64', desc: 'Upload images & convert to Base64 data URI', shortcut: 'I', accent: 'text-zinc-400' },
  { id: 'image-convert', title: 'Image Converter', desc: 'PNG, JPEG, WebP, AVIF, BMP, TIFF & ICO conversion', shortcut: 'F', accent: 'text-zinc-400' },
  { id: 'qr', title: 'QR Code', desc: 'Generate & read QR codes', shortcut: 'Q', accent: 'text-zinc-400' },
  { id: 'gradient', title: 'CSS Gradient', desc: 'Build & preview CSS gradients with presets', shortcut: 'G', accent: 'text-zinc-400' },
  { id: 'placeholder', title: 'Placeholder Image', desc: 'Generate placeholder images with custom size & color', shortcut: 'P', accent: 'text-zinc-400' },
  { id: 'cron', title: 'Cron Builder', desc: 'Build & parse cron expressions visually', shortcut: 'X', accent: 'text-zinc-400' },
  { id: 'bg-remover', title: 'BG Remover', desc: 'Remove image backgrounds with AI in-browser', shortcut: 'A', accent: 'text-zinc-400' },
  { id: 'image-compress', title: 'Image Compress', desc: 'Compress images with quality control & size comparison', shortcut: 'K', accent: 'text-zinc-400' },
  { id: 'px-converter', title: 'PX ↔ REM', desc: 'Convert pixels to rem & Tailwind spacing', shortcut: 'V', accent: 'text-zinc-400' },
  { id: 'video-compress', title: 'Video Compress', desc: 'Compress videos with FFmpeg in browser', shortcut: 'Z', accent: 'text-zinc-400' },
];

function fuzzyMatch(text: string, query: string): boolean {
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  let qi = 0;
  for (let i = 0; i < lower.length && qi < q.length; i++) {
    if (lower[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

export default function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? TOOLS.filter((t) => fuzzyMatch(t.title + ' ' + t.desc, query))
    : TOOLS;

  // Reset on open/close
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Keep activeIndex in bounds
  useEffect(() => {
    if (activeIndex >= filtered.length) setActiveIndex(Math.max(0, filtered.length - 1));
  }, [filtered.length, activeIndex]);

  const selectTool = useCallback((toolId: ToolId) => {
    router.push(`/tools/${TOOL_SLUGS[toolId]}`);
    onClose();
  }, [router, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter' && filtered.length > 0) {
        e.preventDefault();
        selectTool(filtered[activeIndex].id);
      } else if (e.key === 'Escape') {
        onClose();
      }
    },
    [filtered, activeIndex, selectTool, onClose],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[8vh] sm:pt-[15vh]" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg mx-4 rounded-xl border border-[#262626] bg-[#141414] shadow-2xl shadow-black/50 animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
          <svg className="h-4 w-4 text-zinc-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search tools..."
            className="flex-1 bg-transparent text-[14px] text-zinc-200 placeholder:text-zinc-600 outline-none"
            spellCheck={false}
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 bg-white/[0.04] border border-white/[0.08] rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] sm:max-h-[320px] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-[13px] text-zinc-500">No tools found</p>
            </div>
          ) : (
            filtered.map((tool, i) => (
              <button
                key={tool.id}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100 ${
                  i === activeIndex ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
                }`}
                onClick={() => selectTool(tool.id)}
                onMouseEnter={() => setActiveIndex(i)}
              >
                <div className={`w-1 h-1 rounded-full flex-shrink-0 ${TOOL_DOT_COLORS[tool.id]} ${i === activeIndex ? 'opacity-100' : 'opacity-50'} transition-opacity`} />
                <div className="flex-1 min-w-0">
                  <span className={`text-[13px] font-semibold ${i === activeIndex ? 'text-zinc-100' : 'text-zinc-300'}`}>
                    {tool.title}
                  </span>
                  <span className={`hidden sm:inline text-[10px] ml-2 ${TOOL_TEXT_COLORS[tool.id]}`}>{tool.desc}</span>
                </div>
                {tool.shortcut && (
                  <kbd className="hidden sm:inline-flex flex-shrink-0 items-center justify-center w-5 h-5 text-[10px] font-bold text-zinc-600 bg-white/[0.04] border border-white/[0.08] rounded">
                    {tool.shortcut}
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer hints — hidden on mobile */}
        <div className="hidden sm:flex items-center gap-4 px-4 py-2 border-t border-white/[0.06] bg-white/[0.01]">
          <span className="flex items-center gap-1.5 text-[10px] text-zinc-600">
            <kbd className="inline-flex items-center px-1 py-0.5 text-[9px] font-medium bg-white/[0.04] border border-white/[0.06] rounded">↑↓</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-zinc-600">
            <kbd className="inline-flex items-center px-1 py-0.5 text-[9px] font-medium bg-white/[0.04] border border-white/[0.06] rounded">↵</kbd>
            Open
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-zinc-600">
            <kbd className="inline-flex items-center px-1 py-0.5 text-[9px] font-medium bg-white/[0.04] border border-white/[0.06] rounded">1-9</kbd>
            Jump
          </span>
        </div>
      </div>
    </div>
  );
}
