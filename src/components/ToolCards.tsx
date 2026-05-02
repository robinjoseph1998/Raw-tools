'use client';

import Link from 'next/link';
import type { ToolId } from '@/types';
import { TOOL_SLUGS } from '@/lib/tools';

/*
  Color system — 4 semantic categories:
  ┌─ cyan   → Data Transform (6): Format, Convert, URL Encode, Diff, SQL Formatter, JSON→TS
  ├─ blue   → Security (5):       JWT Decoder, JWT Encoder, Hash, Password, Screen Recorder
  ├─ purple → Dev Utilities (7):  UUID, Regex, Timestamp, Markdown Preview, Epoch Converter, Cron Builder, PX↔REM
  └─ pink   → Generate (11):      Base64, Color, Lorem, Base64→Image, Image→Base64, Image Convert, QR, CSS Gradient, Placeholder, BG Remover, Image Compress
*/

const CARDS: {
  id: ToolId;
  title: string;
  desc: string;
  icon: React.ReactNode;
  glowClass: string;
  iconHover: string;
  shadowHover: string;
  accentColor: string;
  badge?: string;
  badgeColor?: string;
}[] = [
  // ── Row 1: Data Transform (cyan) ──
  {
    id: 'format',
    title: 'Format & Validate',
    desc: 'Pretty-print, minify & validate JSON with syntax highlighting',
    glowClass: '',
    iconHover: 'group-hover:text-zinc-200',
    shadowHover: '',
    accentColor: 'bg-zinc-500',
    badge: 'Popular',
    badgeColor: 'text-zinc-400 bg-white/[0.04] border-[#333]',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    id: 'convert',
    title: 'Data Converter',
    desc: 'Convert between JSON, YAML, CSV & XML',
    glowClass: '',
    iconHover: 'group-hover:text-zinc-200',
    shadowHover: '',
    accentColor: 'bg-zinc-500',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    id: 'url',
    title: 'URL Encode',
    desc: 'Encode & decode URL components and query strings',
    glowClass: '',
    iconHover: 'group-hover:text-zinc-200',
    shadowHover: '',
    accentColor: 'bg-zinc-500',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },

  {
    id: 'diff',
    title: 'Diff / Compare',
    desc: 'Compare two texts with line-level diff highlighting',
    glowClass: '',
    iconHover: 'group-hover:text-zinc-200',
    shadowHover: '',
    accentColor: 'bg-zinc-500',
    badge: 'New',
    badgeColor: 'text-zinc-400 bg-white/[0.04] border-[#333]',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M9 5l7 7-7 7" />
        <path d="M4 12h16" />
      </svg>
    ),
  },
  {
    id: 'sql',
    title: 'SQL Formatter',
    desc: 'Format, beautify & minify SQL with dialect support',
    glowClass: '',
    iconHover: 'group-hover:text-zinc-200',
    shadowHover: '',
    accentColor: 'bg-zinc-500',
    badge: 'New',
    badgeColor: 'text-zinc-400 bg-white/[0.04] border-[#333]',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
      </svg>
    ),
  },

  {
    id: 'json-ts',
    title: 'JSON to TypeScript',
    desc: 'Generate TypeScript interfaces from JSON data',
    glowClass: '',
    iconHover: 'group-hover:text-zinc-200',
    shadowHover: '',
    accentColor: 'bg-zinc-500',
    badge: 'New',
    badgeColor: 'text-zinc-400 bg-white/[0.04] border-[#333]',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
        <path d="M14 2v6h6M10 12l-2 5h4l-2 5" />
      </svg>
    ),
  },

  // ── Row 2: Security / Crypto (blue) ──
  {
    id: 'jwt',
    title: 'JWT Decoder',
    desc: 'Decode tokens, inspect payloads & check expiry',
    glowClass: '',
    iconHover: 'group-hover:text-zinc-200',
    shadowHover: '',
    accentColor: 'bg-zinc-500',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  },
  {
    id: 'jwt-encode',
    title: 'JWT Encoder',
    desc: 'Build & sign JWT tokens with HMAC-SHA256',
    glowClass: '',
    iconHover: 'group-hover:text-zinc-200',
    shadowHover: '',
    accentColor: 'bg-zinc-500',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    id: 'hash',
    title: 'Hash Generator',
    desc: 'Generate MD5, SHA-1, SHA-256 & SHA-512 hashes',
    glowClass: '',
    iconHover: 'group-hover:text-zinc-200',
    shadowHover: '',
    accentColor: 'bg-zinc-500',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },

  {
    id: 'password',
    title: 'Password Generator',
    desc: 'Crypto-secure passwords with custom rules & strength meter',
    glowClass: '',
    iconHover: 'group-hover:text-zinc-200',
    shadowHover: '',
    accentColor: 'bg-zinc-500',
    badge: 'New',
    badgeColor: 'text-zinc-400 bg-white/[0.04] border-[#333]',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  },
  {
    id: 'screen-recorder',
    title: 'Screen Recorder',
    desc: 'Record screen, window, or tab with mic audio',
    glowClass: '',
    iconHover: 'group-hover:text-zinc-200',
    shadowHover: '',
    accentColor: 'bg-zinc-500',
    badge: 'Popular',
    badgeColor: 'text-zinc-400 bg-white/[0.04] border-[#333]',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },

  // ── Row 3: Dev Utilities (purple) ──
  {
    id: 'uuid',
    title: 'UUID Generator',
    desc: 'Generate random UUID v4 identifiers in bulk',
    glowClass: '',
    iconHover: 'group-hover:text-zinc-200',
    shadowHover: '',
    accentColor: 'bg-zinc-500',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
      </svg>
    ),
  },
  {
    id: 'regex',
    title: 'Regex Tester',
    desc: 'Test patterns with live highlighting & capture groups',
    glowClass: '',
    iconHover: 'group-hover:text-zinc-200',
    shadowHover: '',
    accentColor: 'bg-zinc-500',
    badge: 'New',
    badgeColor: 'text-zinc-400 bg-white/[0.04] border-[#333]',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    id: 'timestamp',
    title: 'Timestamp',
    desc: 'Convert Unix timestamps to dates and back',
    glowClass: '',
    iconHover: 'group-hover:text-zinc-200',
    shadowHover: '',
    accentColor: 'bg-zinc-500',
    badge: 'New',
    badgeColor: 'text-zinc-400 bg-white/[0.04] border-[#333]',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'markdown',
    title: 'Markdown Preview',
    desc: 'Live markdown editor with rendered preview',
    glowClass: '',
    iconHover: 'group-hover:text-zinc-200',
    shadowHover: '',
    accentColor: 'bg-zinc-500',
    badge: 'New',
    badgeColor: 'text-zinc-400 bg-white/[0.04] border-[#333]',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },

  {
    id: 'epoch',
    title: 'Epoch Converter',
    desc: 'Batch epoch ↔ date conversion with relative time',
    glowClass: '',
    iconHover: 'group-hover:text-zinc-200',
    shadowHover: '',
    accentColor: 'bg-zinc-500',
    badge: 'New',
    badgeColor: 'text-zinc-400 bg-white/[0.04] border-[#333]',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'cron',
    title: 'Cron Builder',
    desc: 'Build & parse cron expressions visually',
    glowClass: '',
    iconHover: 'group-hover:text-zinc-200',
    shadowHover: '',
    accentColor: 'bg-zinc-500',
    badge: 'New',
    badgeColor: 'text-zinc-400 bg-white/[0.04] border-[#333]',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path d="M4 4l2 2m14-2l-2 2" />
      </svg>
    ),
  },
  {
    id: 'px-converter',
    title: 'PX ↔ REM',
    desc: 'Convert pixels to rem & Tailwind spacing classes',
    glowClass: '',
    iconHover: 'group-hover:text-zinc-200',
    shadowHover: '',
    accentColor: 'bg-zinc-500',
    badge: 'New',
    badgeColor: 'text-zinc-400 bg-white/[0.04] border-[#333]',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M4 6h16M4 12h8m-8 6h16" />
        <path d="M15 9l3 3-3 3" />
      </svg>
    ),
  },

  // ── Row 4: Encode / Generate (pink) ──
  {
    id: 'base64',
    title: 'Base64',
    desc: 'Encode & decode text with full Unicode support',
    glowClass: '',
    iconHover: 'group-hover:text-zinc-200',
    shadowHover: '',
    accentColor: 'bg-zinc-500',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    ),
  },
  {
    id: 'color',
    title: 'Color Picker',
    desc: 'Drag to pick any color & copy HEX, RGB or HSL',
    glowClass: '',
    iconHover: 'group-hover:text-zinc-200',
    shadowHover: '',
    accentColor: 'bg-zinc-500',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
  {
    id: 'lorem',
    title: 'Lorem Ipsum',
    desc: 'Generate placeholder text by words, sentences or paragraphs',
    glowClass: '',
    iconHover: 'group-hover:text-zinc-200',
    shadowHover: '',
    accentColor: 'bg-zinc-500',
    badge: 'New',
    badgeColor: 'text-zinc-400 bg-white/[0.04] border-[#333]',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    ),
  },
  {
    id: 'base64-image',
    title: 'Base64 to Image',
    desc: 'Decode Base64 strings to preview & download images',
    glowClass: '',
    iconHover: 'group-hover:text-zinc-200',
    shadowHover: '',
    accentColor: 'bg-zinc-500',
    badge: 'New',
    badgeColor: 'text-zinc-400 bg-white/[0.04] border-[#333]',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'image-base64',
    title: 'Image to Base64',
    desc: 'Upload images and convert to Base64 data URI',
    glowClass: '',
    iconHover: 'group-hover:text-zinc-200',
    shadowHover: '',
    accentColor: 'bg-zinc-500',
    badge: 'New',
    badgeColor: 'text-zinc-400 bg-white/[0.04] border-[#333]',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
  },
  {
    id: 'image-convert',
    title: 'Image Converter',
    desc: 'PNG, JPEG, WebP, AVIF, BMP, TIFF & ICO conversion',
    glowClass: '',
    iconHover: 'group-hover:text-zinc-200',
    shadowHover: '',
    accentColor: 'bg-zinc-500',
    badge: 'New',
    badgeColor: 'text-zinc-400 bg-white/[0.04] border-[#333]',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        <path d="M8 7h12m0 0l-4-4m4 4l-4 4" strokeWidth={1.5} />
      </svg>
    ),
  },
  {
    id: 'qr',
    title: 'QR Code',
    desc: 'Generate QR codes & decode QR from images',
    glowClass: '',
    iconHover: 'group-hover:text-zinc-200',
    shadowHover: '',
    accentColor: 'bg-zinc-500',
    badge: 'New',
    badgeColor: 'text-zinc-400 bg-white/[0.04] border-[#333]',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm14 3h.01M17 14h.01M14 14h3v3h-3v-3zm0 4h3v3h-3v-3zm4-4h3v3h-3v-3zm0 4h3v3h-3v-3z" />
      </svg>
    ),
  },
  {
    id: 'gradient',
    title: 'CSS Gradient',
    desc: 'Build & preview linear, radial & conic gradients',
    glowClass: '',
    iconHover: 'group-hover:text-zinc-200',
    shadowHover: '',
    accentColor: 'bg-zinc-500',
    badge: 'New',
    badgeColor: 'text-zinc-400 bg-white/[0.04] border-[#333]',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    id: 'placeholder',
    title: 'Placeholder Image',
    desc: 'Generate placeholder images with custom size & text',
    glowClass: '',
    iconHover: 'group-hover:text-zinc-200',
    shadowHover: '',
    accentColor: 'bg-zinc-500',
    badge: 'New',
    badgeColor: 'text-zinc-400 bg-white/[0.04] border-[#333]',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'bg-remover',
    title: 'BG Remover',
    desc: 'Remove image backgrounds with AI — 100% in your browser',
    glowClass: '',
    iconHover: 'group-hover:text-zinc-200',
    shadowHover: '',
    accentColor: 'bg-zinc-500',
    badge: 'New',
    badgeColor: 'text-zinc-400 bg-white/[0.04] border-[#333]',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        <path d="M6 18L18 6" strokeWidth={2} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'image-compress',
    title: 'Image Compress',
    desc: 'Compress images with quality control & size comparison',
    glowClass: '',
    iconHover: 'group-hover:text-zinc-200',
    shadowHover: '',
    accentColor: 'bg-zinc-500',
    badge: 'New',
    badgeColor: 'text-zinc-400 bg-white/[0.04] border-[#333]',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        <path d="M5 3h14" />
      </svg>
    ),
  },
  {
    id: 'video-compress',
    title: 'Video Compress',
    desc: 'Compress videos in-browser with FFmpeg WebAssembly',
    glowClass: '',
    iconHover: 'group-hover:text-zinc-200',
    shadowHover: '',
    accentColor: 'bg-zinc-500',
    badge: 'New',
    badgeColor: 'text-zinc-400 bg-white/[0.04] border-[#333]',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
];

const ICON_STYLES: Record<string, { color: string; hover: string; bg: string; dot: string; hex: string }> = {
  'format':          { color: 'text-blue-400',    hover: 'group-hover:text-blue-300',    bg: 'bg-blue-500/10 border border-blue-500/20',    dot: 'bg-blue-400',    hex: '#60a5fa' },
  'convert':         { color: 'text-emerald-400', hover: 'group-hover:text-emerald-300', bg: 'bg-emerald-500/10 border border-emerald-500/20', dot: 'bg-emerald-400', hex: '#34d399' },
  'url':             { color: 'text-teal-400',    hover: 'group-hover:text-teal-300',    bg: 'bg-teal-500/10 border border-teal-500/20',    dot: 'bg-teal-400',    hex: '#2dd4bf' },
  'diff':            { color: 'text-amber-400',   hover: 'group-hover:text-amber-300',   bg: 'bg-amber-500/10 border border-amber-500/20',   dot: 'bg-amber-400',   hex: '#fbbf24' },
  'sql':             { color: 'text-indigo-400',  hover: 'group-hover:text-indigo-300',  bg: 'bg-indigo-500/10 border border-indigo-500/20',  dot: 'bg-indigo-400',  hex: '#818cf8' },
  'json-ts':         { color: 'text-violet-400',  hover: 'group-hover:text-violet-300',  bg: 'bg-violet-500/10 border border-violet-500/20',  dot: 'bg-violet-400',  hex: '#a78bfa' },
  'jwt':             { color: 'text-yellow-400',  hover: 'group-hover:text-yellow-300',  bg: 'bg-yellow-500/10 border border-yellow-500/20',  dot: 'bg-yellow-400',  hex: '#facc15' },
  'jwt-encode':      { color: 'text-orange-400',  hover: 'group-hover:text-orange-300',  bg: 'bg-orange-500/10 border border-orange-500/20',  dot: 'bg-orange-400',  hex: '#fb923c' },
  'hash':            { color: 'text-green-400',   hover: 'group-hover:text-green-300',   bg: 'bg-green-500/10 border border-green-500/20',   dot: 'bg-green-400',   hex: '#4ade80' },
  'password':        { color: 'text-red-400',     hover: 'group-hover:text-red-300',     bg: 'bg-red-500/10 border border-red-500/20',     dot: 'bg-red-400',     hex: '#f87171' },
  'screen-recorder': { color: 'text-rose-400',    hover: 'group-hover:text-rose-300',    bg: 'bg-rose-500/10 border border-rose-500/20',    dot: 'bg-rose-400',    hex: '#fb7185' },
  'uuid':            { color: 'text-purple-400',  hover: 'group-hover:text-purple-300',  bg: 'bg-purple-500/10 border border-purple-500/20',  dot: 'bg-purple-400',  hex: '#c084fc' },
  'regex':           { color: 'text-fuchsia-400', hover: 'group-hover:text-fuchsia-300', bg: 'bg-fuchsia-500/10 border border-fuchsia-500/20', dot: 'bg-fuchsia-400', hex: '#e879f9' },
  'timestamp':       { color: 'text-sky-400',     hover: 'group-hover:text-sky-300',     bg: 'bg-sky-500/10 border border-sky-500/20',     dot: 'bg-sky-400',     hex: '#38bdf8' },
  'markdown':        { color: 'text-emerald-400', hover: 'group-hover:text-emerald-300', bg: 'bg-emerald-500/10 border border-emerald-500/20', dot: 'bg-emerald-400', hex: '#34d399' },
  'epoch':           { color: 'text-cyan-400',    hover: 'group-hover:text-cyan-300',    bg: 'bg-cyan-500/10 border border-cyan-500/20',    dot: 'bg-cyan-400',    hex: '#22d3ee' },
  'cron':            { color: 'text-lime-400',    hover: 'group-hover:text-lime-300',    bg: 'bg-lime-500/10 border border-lime-500/20',    dot: 'bg-lime-400',    hex: '#a3e635' },
  'px-converter':    { color: 'text-pink-400',    hover: 'group-hover:text-pink-300',    bg: 'bg-pink-500/10 border border-pink-500/20',    dot: 'bg-pink-400',    hex: '#f472b6' },
  'base64':          { color: 'text-blue-400',    hover: 'group-hover:text-blue-300',    bg: 'bg-blue-500/10 border border-blue-500/20',    dot: 'bg-blue-400',    hex: '#60a5fa' },
  'color':           { color: 'text-rose-400',    hover: 'group-hover:text-rose-300',    bg: 'bg-rose-500/10 border border-rose-500/20',    dot: 'bg-rose-400',    hex: '#fb7185' },
  'lorem':           { color: 'text-amber-400',   hover: 'group-hover:text-amber-300',   bg: 'bg-amber-500/10 border border-amber-500/20',   dot: 'bg-amber-400',   hex: '#fbbf24' },
  'base64-image':    { color: 'text-violet-400',  hover: 'group-hover:text-violet-300',  bg: 'bg-violet-500/10 border border-violet-500/20',  dot: 'bg-violet-400',  hex: '#a78bfa' },
  'image-base64':    { color: 'text-indigo-400',  hover: 'group-hover:text-indigo-300',  bg: 'bg-indigo-500/10 border border-indigo-500/20',  dot: 'bg-indigo-400',  hex: '#818cf8' },
  'image-convert':   { color: 'text-teal-400',    hover: 'group-hover:text-teal-300',    bg: 'bg-teal-500/10 border border-teal-500/20',    dot: 'bg-teal-400',    hex: '#2dd4bf' },
  'qr':              { color: 'text-green-400',   hover: 'group-hover:text-green-300',   bg: 'bg-green-500/10 border border-green-500/20',   dot: 'bg-green-400',   hex: '#4ade80' },
  'gradient':        { color: 'text-fuchsia-400', hover: 'group-hover:text-fuchsia-300', bg: 'bg-fuchsia-500/10 border border-fuchsia-500/20', dot: 'bg-fuchsia-400', hex: '#e879f9' },
  'placeholder':     { color: 'text-orange-400',  hover: 'group-hover:text-orange-300',  bg: 'bg-orange-500/10 border border-orange-500/20',  dot: 'bg-orange-400',  hex: '#fb923c' },
  'bg-remover':      { color: 'text-red-400',     hover: 'group-hover:text-red-300',     bg: 'bg-red-500/10 border border-red-500/20',     dot: 'bg-red-400',     hex: '#f87171' },
  'image-compress':  { color: 'text-emerald-400', hover: 'group-hover:text-emerald-300', bg: 'bg-emerald-500/10 border border-emerald-500/20', dot: 'bg-emerald-400', hex: '#34d399' },
  'video-compress':  { color: 'text-purple-400',  hover: 'group-hover:text-purple-300',  bg: 'bg-purple-500/10 border border-purple-500/20',  dot: 'bg-purple-400',  hex: '#c084fc' },
};

const CATEGORIES = [
  { label: 'Data Transform', accent: 'text-[#525252]', start: 0, count: 6, cols: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6' },
  { label: 'Security', accent: 'text-[#525252]', start: 6, count: 5, cols: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-5' },
  { label: 'Dev Utilities', accent: 'text-[#525252]', start: 11, count: 7, cols: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7' },
  { label: 'Generate', accent: 'text-[#525252]', start: 18, count: 12, cols: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6' },
];

export default function ToolCards({ showShortcuts, featured }: { showShortcuts?: boolean; featured?: ToolId[] }) {
  // Featured mode: flat grid with only selected tools
  if (featured) {
    const featuredCards = featured.map((id) => CARDS.find((c) => c.id === id)).filter(Boolean) as typeof CARDS;
    return (
      <div>
        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3`}>
          {featuredCards.map((card, i) => {
            const ic = ICON_STYLES[card.id];
            return (
              <Link
                key={card.id}
                href={`/tools/${TOOL_SLUGS[card.id]}`}
                className="group text-left rounded-xl glass-card p-3.5 pb-4 sm:p-4 sm:pb-5 cursor-pointer relative stagger-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-center gap-2.5 mb-2.5 sm:mb-3 relative">
                  <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-lg ${ic.bg} flex items-center justify-center ${ic.color} ${ic.hover} transition-all duration-250 group-hover:scale-110`}>
                    {card.icon}
                  </div>
                  <div className={`w-2 h-2 rounded-full ${ic.dot} opacity-50 group-hover:opacity-100 transition-opacity duration-200`} />
                </div>
                <h3 className="text-[13px] sm:text-[14px] font-semibold text-zinc-100 mb-1 sm:mb-1.5 relative">{card.title}</h3>
                <p className="text-[11px] sm:text-[12px] text-zinc-500 group-hover:text-zinc-400 leading-relaxed relative transition-colors duration-200">{card.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {CATEGORIES.map((cat) => (
        <div key={cat.label}>
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${cat.accent}`}>{cat.label}</p>
          <div className={`grid ${cat.cols} gap-2.5 sm:gap-3`}>
            {CARDS.slice(cat.start, cat.start + cat.count).map((card, i) => {
              const index = cat.start + i;
              const ic = ICON_STYLES[card.id];
              return (
                <Link
                  key={card.id}
                  href={`/tools/${TOOL_SLUGS[card.id]}`}
                  className={`group text-left rounded-xl glass-card p-3.5 pb-4 sm:p-4 sm:pb-5 cursor-pointer relative stagger-in`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Top-right: shortcut badge OR ribbon */}
                  <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 flex items-center gap-1.5">
                    {card.badge && (
                      <span className={`inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${card.badgeColor}`}>
                        {card.badge}
                      </span>
                    )}
                    {showShortcuts && (() => {
                      const LETTER_KEYS: Record<string, string> = { uuid: 'U', regex: 'R', timestamp: 'T', markdown: 'M', epoch: 'D', cron: 'X', 'px-converter': 'Y', 'screen-recorder': 'W', base64: 'E', color: 'C', lorem: 'L', 'base64-image': 'B', 'image-base64': 'I', 'image-convert': 'F', qr: 'Q', gradient: 'G', placeholder: 'P', 'bg-remover': 'A', 'image-compress': 'K' };
                      const label = index < 10 ? (index === 9 ? '0' : String(index + 1)) : LETTER_KEYS[card.id] || null;
                      return label ? (
                        <kbd className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-zinc-500 group-hover:text-zinc-200 bg-white/[0.05] border border-white/[0.1] group-hover:border-white/[0.2] group-hover:bg-white/[0.08] rounded transition-all duration-300">
                          {label}
                        </kbd>
                      ) : null;
                    })()}
                  </div>

                  <div className="flex items-center gap-2.5 mb-2.5 sm:mb-3 relative">
                    <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-lg ${ic.bg} flex items-center justify-center ${ic.color} ${ic.hover} transition-all duration-250 group-hover:scale-110`}>
                      {card.icon}
                    </div>
                    <div className={`w-2 h-2 rounded-full ${ic.dot} opacity-50 group-hover:opacity-100 transition-opacity duration-200`} />
                  </div>
                  <h3 className="text-[13px] sm:text-[14px] font-semibold text-zinc-100 mb-1 sm:mb-1.5 relative">{card.title}</h3>
                  <p className="text-[11px] sm:text-[12px] text-zinc-500 group-hover:text-zinc-400 leading-relaxed relative transition-colors duration-200">{card.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
