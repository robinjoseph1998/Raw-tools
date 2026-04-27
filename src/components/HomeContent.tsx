'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ToolId } from '@/types';
import { TOOL_META, TOOL_SLUGS, SLUG_TO_TOOL, POPULAR_TOOLS, FEATURES, WHY_ITEMS } from '@/lib/tools';
import { useRecentTools } from '@/hooks/useRecentTools';
import ToolCards from './ToolCards';
import SmartPasteHero from './SmartPasteHero';
import HeroCode from './HeroCode';

const FEATURE_ICONS = [
  <svg key="0" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  <svg key="1" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  <svg key="2" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
];

const WHY_ICONS = [
  <svg key="0" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  <svg key="1" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  <svg key="2" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  <svg key="3" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
];

export default function HomeContent() {
  const router = useRouter();
  const { recent } = useRecentTools();
  const [showAllTools, setShowAllTools] = useState(false);
  const whyRef = useRef<HTMLDivElement>(null);
  const [whyVisible, setWhyVisible] = useState(false);

  // Redirect old hash URLs to new routes
  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as ToolId;
    if (hash && hash in TOOL_META) {
      router.replace(`/tools/${TOOL_SLUGS[hash]}`);
    }
  }, [router]);

  // Scroll-reveal for WHY section
  useEffect(() => {
    const el = whyRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setWhyVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero: left text + right code preview */}
      <div className="mb-8 flex flex-col xl:flex-row xl:items-start xl:gap-10">
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/[0.08] mb-5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-status-pulse" />
            <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">28 Tools &middot; 100% Client-Side</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent leading-tight hero-shimmer">
            The Developer Toolkit<br className="hidden sm:block" /> That Just Works
          </h1>
          <p className="text-[15px] text-zinc-300/80 max-w-xl leading-[1.8] tracking-wide mb-5" style={{ fontWeight: 400 }}>
            Stop juggling between dozens of browser tabs and random online tools.
            RAW brings everything you need into one clean, unified interface &mdash; format JSON,
            convert data, decode tokens, and more.
          </p>

          <SmartPasteHero />

          <div className="flex items-center gap-3 mt-3">
            <span className="text-[12px] text-zinc-600">
              or press <kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-white/[0.04] border border-white/[0.06] rounded mx-0.5">⌘K</kbd> to search
            </span>
            <span className="text-zinc-800">&middot;</span>
            <button onClick={() => document.getElementById('tools-section')?.scrollIntoView({ behavior: 'smooth' })} className="text-[12px] text-zinc-500 hover:text-cyan-400 transition-colors">
              Browse all tools &darr;
            </button>
          </div>
        </div>

        <div className="flex-shrink-0 w-full xl:w-[420px] mt-8 xl:mt-0 animate-float">
          <HeroCode />
        </div>
      </div>

      {/* Trust strip */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {FEATURES.map((f, i) => (
          <div
            key={f.label}
            className="flex items-center gap-3 rounded-xl glass-panel px-4 py-3.5 hover:bg-white/[0.04] transition-colors duration-300 stagger-in"
            style={{ animationDelay: `${200 + i * 100}ms` }}
          >
            <div className={`h-9 w-9 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center ${f.accent} flex-shrink-0`}>
              {FEATURE_ICONS[i]}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-zinc-200">{f.label}</p>
              <p className="text-[11px] text-zinc-400">{f.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent tools */}
      {recent.filter((id) => id in TOOL_META).length > 0 && (
        <div className="mb-6">
          <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2.5">
            <svg className="h-3 w-3 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recent
          </h2>
          <div className="flex flex-wrap gap-2">
            {recent.filter((id) => id in TOOL_META).map((toolId) => (
              <Link
                key={toolId}
                href={`/tools/${TOOL_SLUGS[toolId]}`}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-200 group"
              >
                <div className={`w-1.5 h-1.5 rounded-full ${TOOL_META[toolId].accent} opacity-60 group-hover:opacity-100 transition-opacity`} />
                <span className="text-[12px] font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
                  {TOOL_META[toolId].title}
                </span>
                <svg className="h-3 w-3 text-zinc-700 group-hover:text-zinc-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Popular Tools */}
      <div id="tools-section" className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2.5">
            <svg className="h-3 w-3 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Popular Tools
          </h2>
        </div>
        <ToolCards featured={POPULAR_TOOLS} />
      </div>

      {/* View All Tools button */}
      {!showAllTools && (
        <div className="flex justify-center mb-6">
          <button
            onClick={() => {
              setShowAllTools(true);
              setTimeout(() => document.getElementById('all-tools-section')?.scrollIntoView({ behavior: 'smooth' }), 50);
            }}
            className="btn-flow"
          >
            <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            View All 28 Tools
            <svg className="h-3.5 w-3.5 bounce-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}

      {/* All Tools (expanded) */}
      {showAllTools && (
        <div id="all-tools-section" className="mb-3 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2.5">
              <div className="w-4 h-[1px] bg-gradient-to-r from-cyan-500/50 to-transparent" />
              All Tools
            </h2>
            <span className="text-[11px] text-zinc-600">
              Press <kbd className="inline-flex items-center px-1 py-0.5 text-[9px] font-medium bg-white/[0.04] border border-white/[0.06] rounded mx-0.5">0-9</kbd> for quick access
            </span>
          </div>
          <ToolCards showShortcuts />
        </div>
      )}

      {/* Divider */}
      <div className="gradient-line my-10" />

      {/* Why developers choose RAW */}
      <div ref={whyRef}>
        <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2.5">
          <div className="w-4 h-[1px] bg-gradient-to-r from-purple-500/50 to-transparent" />
          Why developers choose RAW
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {WHY_ITEMS.map((item, i) => (
            <div key={item.title} className={`flex gap-3.5 rounded-xl glass-panel p-4 hover:bg-white/[0.06] transition-colors duration-300 ${whyVisible ? 'reveal-up' : 'opacity-0'}`} style={whyVisible ? { animationDelay: `${i * 120}ms` } : undefined}>
              <div className={`h-9 w-9 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5 ${item.accent}`}>
                {WHY_ICONS[i]}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] text-zinc-100 font-semibold mb-1">{item.title}</p>
                <p className="text-[12px] text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
