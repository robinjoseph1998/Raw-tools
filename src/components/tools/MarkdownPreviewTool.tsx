'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import type { StatusState } from '@/types';

const SAMPLE_MD = `# Hello World

This is a **bold** and *italic* example.

## Features

- Item one
- Item two
- Item three

### Code Block

\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

> Blockquote: This is a sample markdown preview.

| Column A | Column B | Column C |
|----------|----------|----------|
| Row 1    | Data     | Value    |
| Row 2    | Data     | Value    |

---

Visit [Example](https://example.com) for more info.

Inline \`code\` looks like this.

1. First ordered item
2. Second ordered item
3. Third ordered item
`;

export default function MarkdownPreviewTool({
  onStatusChange,
  onToast,
}: {
  onStatusChange: (s: StatusState) => void;
  onToast: (msg: string) => void;
}) {
  const [input, setInput] = useState('');
  const [html, setHtml] = useState('');
  const markedRef = useRef<typeof import('marked') | null>(null);

  const renderMarkdown = useCallback(async (text: string) => {
    if (!text.trim()) {
      setHtml('');
      onStatusChange('idle');
      return;
    }
    try {
      if (!markedRef.current) {
        markedRef.current = await import('marked');
      }
      const { marked } = markedRef.current;
      const result = await marked(text, { breaks: true, gfm: true });
      setHtml(result);
      onStatusChange('valid');
    } catch {
      onStatusChange('invalid');
      onToast('Failed to parse markdown');
    }
  }, [onStatusChange, onToast]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInput(text);
    renderMarkdown(text);
  }, [renderMarkdown]);

  const loadSample = useCallback(() => {
    setInput(SAMPLE_MD);
    renderMarkdown(SAMPLE_MD);
    onToast('Sample markdown loaded');
  }, [renderMarkdown, onToast]);

  const copyHtml = useCallback(async () => {
    if (!html) return;
    await navigator.clipboard.writeText(html);
    onToast('HTML copied to clipboard');
  }, [html, onToast]);

  const clear = useCallback(() => {
    setInput('');
    setHtml('');
    onStatusChange('idle');
  }, [onStatusChange]);

  const wordCount = useMemo(() => {
    const words = input.trim() ? input.trim().split(/\s+/).length : 0;
    const chars = input.length;
    return { words, chars };
  }, [input]);

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button onClick={loadSample} className="btn-primary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Sample
        </button>
        <button onClick={copyHtml} disabled={!html} className="btn-secondary disabled:opacity-30 disabled:pointer-events-none">
          Copy HTML
        </button>
        <button onClick={clear} disabled={!input} className="btn-ghost disabled:opacity-30 disabled:pointer-events-none">
          Clear
        </button>
        {input && (
          <span className="text-[11px] text-zinc-500 ml-auto">
            {wordCount.words} words &middot; {wordCount.chars} chars
          </span>
        )}
      </div>

      {/* Editor + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Editor */}
        <div className="flex flex-col rounded-xl glass-panel overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.08] bg-white/[0.03]">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-400/70" />
            <span className="text-[12px] font-bold text-zinc-300 uppercase tracking-wider">Markdown</span>
          </div>
          <textarea
            value={input}
            onChange={handleChange}
            placeholder="Type or paste markdown here..."
            spellCheck={false}
            className="editor-textarea flex-1 min-h-[350px] p-4 resize-none"
          />
        </div>

        {/* Preview */}
        <div className="flex flex-col rounded-xl glass-panel overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.08] bg-white/[0.03]">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
            <span className="text-[12px] font-bold text-zinc-300 uppercase tracking-wider">Preview</span>
          </div>
          <div className="flex-1 min-h-[350px] p-5 overflow-auto">
            {html ? (
              <div
                className="markdown-preview"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-[13px] text-zinc-500 font-medium">Preview appears here</p>
              </div>
            )}
          </div>
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
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">GFM</span> — GitHub Flavored Markdown supported</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Tables</span> — Pipe-based table syntax works</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Copy HTML</span> — Get rendered HTML for embedding</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Live</span> — Preview updates as you type</p>
        </div>
      </div>
    </div>
  );
}
