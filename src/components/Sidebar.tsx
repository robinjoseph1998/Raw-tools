'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ToolId } from '@/types';
import { TOOL_SLUGS, SLUG_TO_TOOL } from '@/lib/tools';
import Logo from './Logo';

const CATEGORIES: {
  label: string;
  accent: string;
  activeBg: string;
  dotColor: string;
  iconColor: string;
  tools: { id: ToolId; title: string }[];
}[] = [
  {
    label: 'Data Transform',
    accent: 'text-cyan-400/70',
    activeBg: 'bg-cyan-500/[0.12] border-cyan-500/20 text-cyan-300',
    dotColor: 'bg-cyan-400',
    iconColor: 'text-cyan-400',
    tools: [
      { id: 'format', title: 'Format & Validate' },
      { id: 'convert', title: 'Data Converter' },
      { id: 'url', title: 'URL Encode' },
      { id: 'diff', title: 'Diff / Compare' },
      { id: 'sql', title: 'SQL Formatter' },
      { id: 'json-ts', title: 'JSON → TypeScript' },
    ],
  },
  {
    label: 'Security',
    accent: 'text-blue-400/70',
    activeBg: 'bg-blue-500/[0.12] border-blue-500/20 text-blue-300',
    dotColor: 'bg-blue-400',
    iconColor: 'text-blue-400',
    tools: [
      { id: 'jwt', title: 'JWT Decoder' },
      { id: 'jwt-encode', title: 'JWT Encoder' },
      { id: 'hash', title: 'Hash Generator' },
      { id: 'password', title: 'Password Gen' },
    ],
  },
  {
    label: 'Dev Utilities',
    accent: 'text-purple-400/70',
    activeBg: 'bg-purple-500/[0.12] border-purple-500/20 text-purple-300',
    dotColor: 'bg-purple-400',
    iconColor: 'text-purple-400',
    tools: [
      { id: 'uuid', title: 'UUID Generator' },
      { id: 'regex', title: 'Regex Tester' },
      { id: 'timestamp', title: 'Timestamp' },
      { id: 'markdown', title: 'Markdown Preview' },
      { id: 'epoch', title: 'Epoch Converter' },
      { id: 'cron', title: 'Cron Builder' },
      { id: 'screen-recorder', title: 'Screen Recorder' },
    ],
  },
  {
    label: 'Generate',
    accent: 'text-pink-400/70',
    activeBg: 'bg-pink-500/[0.12] border-pink-500/20 text-pink-300',
    dotColor: 'bg-pink-400',
    iconColor: 'text-pink-400',
    tools: [
      { id: 'base64', title: 'Base64' },
      { id: 'color', title: 'Color Picker' },
      { id: 'lorem', title: 'Lorem Ipsum' },
      { id: 'base64-image', title: 'Base64 → Image' },
      { id: 'image-base64', title: 'Image → Base64' },
      { id: 'image-convert', title: 'Image Converter' },
      { id: 'qr', title: 'QR Code' },
      { id: 'gradient', title: 'CSS Gradient' },
      { id: 'placeholder', title: 'Placeholder Image' },
      { id: 'bg-remover', title: 'BG Remover' },
      { id: 'image-compress', title: 'Image Compress' },
    ],
  },
];

export default function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Derive active tool from URL
  const activeTool: ToolId | null = pathname.startsWith('/tools/')
    ? SLUG_TO_TOOL[pathname.split('/')[2]] ?? null
    : null;

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  const toggleCategory = (label: string) => {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const sidebarContent = (
    <nav className="flex flex-col h-full">
      {/* Home button */}
      <Link
        href="/"
        onClick={onClose}
        className={`flex items-center gap-3 mx-3 mt-3 mb-1 px-3 py-2.5 rounded-lg transition-all duration-200 ${
          activeTool === null
            ? 'bg-white/[0.08] text-zinc-100 border border-white/[0.1]'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent'
        }`}
      >
        <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span className="text-[13px] font-medium">Home</span>
      </Link>

      {/* Divider */}
      <div className="mx-4 my-2 h-px bg-white/[0.06]" />

      {/* Category sections */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 sidebar-scroll">
        {CATEGORIES.map((cat) => {
          const isCollapsed = collapsed[cat.label] ?? false;
          const hasActiveTool = cat.tools.some((t) => t.id === activeTool);

          return (
            <div key={cat.label} className="mb-1">
              {/* Category header */}
              <button
                onClick={() => toggleCategory(cat.label)}
                className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-left transition-colors duration-150 hover:bg-white/[0.03] group ${cat.accent}`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${cat.dotColor} ${hasActiveTool ? 'opacity-100' : 'opacity-40'} transition-opacity`} />
                  <span className="text-[11px] font-bold uppercase tracking-widest">{cat.label}</span>
                </div>
                <svg
                  className={`h-3 w-3 text-zinc-600 group-hover:text-zinc-400 transition-all duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Tool items */}
              {!isCollapsed && (
                <div className="mt-0.5 space-y-0.5">
                  {cat.tools.map((tool) => {
                    const isActive = activeTool === tool.id;
                    return (
                      <Link
                        key={tool.id}
                        href={`/tools/${TOOL_SLUGS[tool.id]}`}
                        onClick={onClose}
                        className={`flex items-center gap-2.5 w-full pl-7 pr-3 py-[7px] rounded-lg text-left transition-all duration-150 border ${
                          isActive
                            ? `${cat.activeBg} sidebar-active-glow`
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border-transparent'
                        }`}
                      >
                        <div className={`w-1 h-1 rounded-full flex-shrink-0 ${isActive ? cat.dotColor : 'bg-zinc-600'}`} />
                        <span className="text-[12px] font-medium truncate">{tool.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pro Tip at bottom */}
      <div className="mx-3 mb-3 p-3 rounded-lg bg-gradient-to-br from-cyan-500/[0.06] to-purple-500/[0.06] border border-white/[0.06]">
        <div className="flex items-center gap-2 mb-1.5">
          <svg className="h-3.5 w-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Pro Tip</span>
        </div>
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          Press <kbd className="inline-flex items-center px-1 py-0.5 text-[9px] font-medium bg-white/[0.04] border border-white/[0.06] rounded mx-0.5">⌘K</kbd> to
          quickly search and jump to any tool.
        </p>
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-[250px] flex-shrink-0 glass-sidebar sticky top-12 h-[calc(100vh-48px)] z-30">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Slide-out panel */}
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-[280px] sidebar-slide-in flex flex-col overflow-hidden" style={{ background: '#070b14', height: '100dvh' }}>
            {/* Mobile header */}
            <div className="flex items-center justify-between px-4 h-12 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Logo size={26} />
                <span className="font-semibold text-[14px] text-zinc-100 tracking-tight">RAW</span>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors">
                <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
