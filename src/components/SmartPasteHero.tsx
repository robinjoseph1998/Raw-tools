'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ToolId } from '@/types';
import { TOOL_SLUGS, detectContent } from '@/lib/tools';

interface Detection {
  tool: ToolId;
  label: string;
}

const TOOL_NAMES: Partial<Record<ToolId, string>> = {
  format: 'JSON Formatter',
  convert: 'Data Converter',
  url: 'URL Encoder',
  jwt: 'JWT Decoder',
  base64: 'Base64',
  'base64-image': 'Base64 to Image',
  uuid: 'UUID Generator',
  color: 'Color Picker',
  timestamp: 'Timestamp Converter',
  'image-convert': 'Image Converter',
  diff: 'Diff / Compare',
  password: 'Password Generator',
  qr: 'QR Code',
  markdown: 'Markdown Preview',
  sql: 'SQL Formatter',
  gradient: 'CSS Gradient',
  'json-ts': 'JSON to TypeScript',
  epoch: 'Epoch Converter',
  placeholder: 'Placeholder Image',
  cron: 'Cron Builder',
  'bg-remover': 'BG Remover',
  'image-compress': 'Image Compress',
  'screen-recorder': 'Screen Recorder',
};

export default function SmartPasteHero() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [detection, setDetection] = useState<Detection | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const detectTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const runDetection = useCallback((text: string) => {
    clearTimeout(detectTimeoutRef.current);
    if (!text.trim()) {
      setDetection(null);
      return;
    }
    detectTimeoutRef.current = setTimeout(() => {
      const result = detectContent(text);
      setDetection(result);
    }, 150);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setValue(text);
    runDetection(text);
  }, [runDetection]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text');
    if (text) {
      setTimeout(() => {
        const result = detectContent(text);
        if (result) setDetection(result);
      }, 50);
    }
  }, []);

  const handleDetectionClick = useCallback(() => {
    if (detection) {
      router.push(`/tools/${TOOL_SLUGS[detection.tool]}`);
    }
  }, [detection, router]);

  // Cleanup timeout
  useEffect(() => {
    return () => clearTimeout(detectTimeoutRef.current);
  }, []);

  return (
    <div className="mt-1 mb-1">
      <div className={`relative rounded-xl border transition-all duration-300 ${
        detection
          ? 'border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.08)]'
          : isFocused
            ? 'border-white/[0.12] shadow-[0_0_20px_rgba(255,255,255,0.02)]'
            : 'border-white/[0.06]'
      } bg-white/[0.02] overflow-hidden`}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Paste JSON, JWT tokens, Base64, URLs, or any data..."
          rows={2}
          spellCheck={false}
          className="w-full bg-transparent text-[13px] text-zinc-300 placeholder:text-zinc-600 px-4 py-3 outline-none resize-none font-mono leading-relaxed"
        />

        {/* Detection result */}
        {detection && (
          <button
            onClick={handleDetectionClick}
            className="w-full flex items-center gap-3 px-4 py-2.5 border-t border-cyan-500/15 bg-cyan-500/[0.04] hover:bg-cyan-500/[0.08] transition-colors duration-200 group animate-fade-in"
          >
            <div className="h-6 w-6 rounded-md bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="h-3 w-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1 text-left min-w-0">
              <span className="text-[12px] font-semibold text-cyan-400">{detection.label}</span>
              <span className="text-[11px] text-zinc-500 ml-2">
                Open {TOOL_NAMES[detection.tool] || detection.label.replace(' detected', '')}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[11px] font-medium text-cyan-400/70 group-hover:text-cyan-400 transition-colors">Go</span>
              <svg className="h-3.5 w-3.5 text-cyan-400/50 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </button>
        )}
      </div>

      {/* Supported formats hint */}
      <p className="text-[11px] text-zinc-600 mt-2.5 leading-relaxed">
        Auto-detects JSON, JWT, Base64, URLs, UUIDs, timestamps, YAML, XML, hex colors & more
      </p>
    </div>
  );
}
