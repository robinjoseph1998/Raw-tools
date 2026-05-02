'use client';

import { useCallback, useRef } from 'react';
import type { TextStats } from '@/types';

interface EditorPanelProps {
  title: string;
  mode: 'input' | 'output';
  value: string;
  onChange?: (value: string) => void;
  outputHtml?: string;
  stats?: TextStats | null;
  placeholder?: string;
  actions?: React.ReactNode;
  emptyMessage?: string;
}

export default function EditorPanel({
  title,
  mode,
  value,
  onChange,
  outputHtml,
  stats,
  placeholder,
  actions,
  emptyMessage = 'Output appears here',
}: EditorPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const ta = e.currentTarget;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const newVal = value.substring(0, start) + '  ' + value.substring(end);
        onChange?.(newVal);
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
          }
        });
      }
    },
    [value, onChange],
  );

  return (
    <section className="flex flex-col min-h-[420px] lg:min-h-[460px] rounded-xl glass-panel overflow-hidden transition-all duration-300 focus-within:border-[#3a3a3a]">
      {/* Header */}
      <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/[0.08] bg-white/[0.03]">
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${mode === 'input' ? 'bg-zinc-400' : 'bg-zinc-500'}`} />
          <span className="text-[12px] font-bold text-zinc-300 select-none uppercase tracking-wider">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {stats && stats.lines > 0 && (
            <span className="font-mono text-[11px] text-zinc-400 bg-white/[0.05] border border-white/[0.06] px-2 py-0.5 rounded-md">
              {stats.lines} ln · {stats.size}
            </span>
          )}
          {actions}
        </div>
      </header>

      {/* Body */}
      {mode === 'input' ? (
        <textarea
          ref={textareaRef}
          className="editor-textarea"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      ) : (
        <div className="relative flex-1 min-h-[380px] lg:min-h-[400px] overflow-hidden">
          {outputHtml ? (
            <div className="animate-fade-in">
              <pre
                className="editor-output"
                dangerouslySetInnerHTML={{ __html: outputHtml }}
              />
            </div>
          ) : value ? (
            <div className="animate-fade-in">
              <pre className="editor-output">{value}</pre>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 select-none">
              <div className="h-12 w-12 rounded-xl bg-white/[0.04] border border-dashed border-white/[0.1] flex items-center justify-center animate-float">
                <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
              <p className="text-[13px] text-zinc-500 font-medium">{emptyMessage}</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
