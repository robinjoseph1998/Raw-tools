'use client';

import { useRef, useCallback } from 'react';
import Link from 'next/link';
import type { ToolId } from '@/types';
import { TOOL_SLUGS } from '@/lib/tools';

/*
  Color system — 4 semantic categories:
  ┌─ cyan   → Data Transform (6): Format, Convert, URL Encode, Diff, SQL Formatter, JSON→TS
  ├─ blue   → Security (5):       JWT Decoder, JWT Encoder, Hash, Password, Screen Recorder
  ├─ purple → Dev Utilities (6):  UUID, Regex, Timestamp, Markdown Preview, Epoch Converter, Cron Builder
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
    glowClass: 'glass-card--cyan',
    iconHover: 'group-hover:text-cyan-400 group-hover:border-cyan-500/25',
    shadowHover: 'hover:shadow-glow-cyan',
    accentColor: 'bg-cyan-400',
    badge: 'Popular',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
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
    glowClass: 'glass-card--cyan',
    iconHover: 'group-hover:text-cyan-400 group-hover:border-cyan-500/25',
    shadowHover: 'hover:shadow-glow-cyan',
    accentColor: 'bg-cyan-400',
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
    glowClass: 'glass-card--cyan',
    iconHover: 'group-hover:text-cyan-400 group-hover:border-cyan-500/25',
    shadowHover: 'hover:shadow-glow-cyan',
    accentColor: 'bg-cyan-400',
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
    glowClass: 'glass-card--cyan',
    iconHover: 'group-hover:text-cyan-400 group-hover:border-cyan-500/25',
    shadowHover: 'hover:shadow-glow-cyan',
    accentColor: 'bg-cyan-400',
    badge: 'New',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
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
    glowClass: 'glass-card--cyan',
    iconHover: 'group-hover:text-cyan-400 group-hover:border-cyan-500/25',
    shadowHover: 'hover:shadow-glow-cyan',
    accentColor: 'bg-cyan-400',
    badge: 'New',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
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
    glowClass: 'glass-card--cyan',
    iconHover: 'group-hover:text-cyan-400 group-hover:border-cyan-500/25',
    shadowHover: 'hover:shadow-glow-cyan',
    accentColor: 'bg-cyan-400',
    badge: 'New',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
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
    glowClass: 'glass-card--blue',
    iconHover: 'group-hover:text-blue-400 group-hover:border-blue-500/25',
    shadowHover: 'hover:shadow-glow-blue',
    accentColor: 'bg-blue-400',
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
    glowClass: 'glass-card--blue',
    iconHover: 'group-hover:text-blue-400 group-hover:border-blue-500/25',
    shadowHover: 'hover:shadow-glow-blue',
    accentColor: 'bg-blue-400',
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
    glowClass: 'glass-card--blue',
    iconHover: 'group-hover:text-blue-400 group-hover:border-blue-500/25',
    shadowHover: 'hover:shadow-glow-blue',
    accentColor: 'bg-blue-400',
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
    glowClass: 'glass-card--blue',
    iconHover: 'group-hover:text-blue-400 group-hover:border-blue-500/25',
    shadowHover: 'hover:shadow-glow-blue',
    accentColor: 'bg-blue-400',
    badge: 'New',
    badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
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
    glowClass: 'glass-card--blue',
    iconHover: 'group-hover:text-blue-400 group-hover:border-blue-500/25',
    shadowHover: 'hover:shadow-glow-blue',
    accentColor: 'bg-blue-400',
    badge: 'Popular',
    badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
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
    glowClass: 'glass-card--purple',
    iconHover: 'group-hover:text-purple-400 group-hover:border-purple-500/25',
    shadowHover: 'hover:shadow-glow-purple',
    accentColor: 'bg-purple-400',
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
    glowClass: 'glass-card--purple',
    iconHover: 'group-hover:text-purple-400 group-hover:border-purple-500/25',
    shadowHover: 'hover:shadow-glow-purple',
    accentColor: 'bg-purple-400',
    badge: 'New',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
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
    glowClass: 'glass-card--purple',
    iconHover: 'group-hover:text-purple-400 group-hover:border-purple-500/25',
    shadowHover: 'hover:shadow-glow-purple',
    accentColor: 'bg-purple-400',
    badge: 'New',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
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
    glowClass: 'glass-card--purple',
    iconHover: 'group-hover:text-purple-400 group-hover:border-purple-500/25',
    shadowHover: 'hover:shadow-glow-purple',
    accentColor: 'bg-purple-400',
    badge: 'New',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
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
    glowClass: 'glass-card--purple',
    iconHover: 'group-hover:text-purple-400 group-hover:border-purple-500/25',
    shadowHover: 'hover:shadow-glow-purple',
    accentColor: 'bg-purple-400',
    badge: 'New',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
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
    glowClass: 'glass-card--purple',
    iconHover: 'group-hover:text-purple-400 group-hover:border-purple-500/25',
    shadowHover: 'hover:shadow-glow-purple',
    accentColor: 'bg-purple-400',
    badge: 'New',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path d="M4 4l2 2m14-2l-2 2" />
      </svg>
    ),
  },

  // ── Row 4: Encode / Generate (pink) ──
  {
    id: 'base64',
    title: 'Base64',
    desc: 'Encode & decode text with full Unicode support',
    glowClass: 'glass-card--pink',
    iconHover: 'group-hover:text-pink-400 group-hover:border-pink-500/25',
    shadowHover: 'hover:shadow-glow-pink',
    accentColor: 'bg-pink-400',
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
    glowClass: 'glass-card--pink',
    iconHover: 'group-hover:text-pink-400 group-hover:border-pink-500/25',
    shadowHover: 'hover:shadow-glow-pink',
    accentColor: 'bg-pink-400',
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
    glowClass: 'glass-card--pink',
    iconHover: 'group-hover:text-pink-400 group-hover:border-pink-500/25',
    shadowHover: 'hover:shadow-glow-pink',
    accentColor: 'bg-pink-400',
    badge: 'New',
    badgeColor: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
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
    glowClass: 'glass-card--pink',
    iconHover: 'group-hover:text-pink-400 group-hover:border-pink-500/25',
    shadowHover: 'hover:shadow-glow-pink',
    accentColor: 'bg-pink-400',
    badge: 'New',
    badgeColor: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
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
    glowClass: 'glass-card--pink',
    iconHover: 'group-hover:text-pink-400 group-hover:border-pink-500/25',
    shadowHover: 'hover:shadow-glow-pink',
    accentColor: 'bg-pink-400',
    badge: 'New',
    badgeColor: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
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
    glowClass: 'glass-card--pink',
    iconHover: 'group-hover:text-pink-400 group-hover:border-pink-500/25',
    shadowHover: 'hover:shadow-glow-pink',
    accentColor: 'bg-pink-400',
    badge: 'New',
    badgeColor: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
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
    glowClass: 'glass-card--pink',
    iconHover: 'group-hover:text-pink-400 group-hover:border-pink-500/25',
    shadowHover: 'hover:shadow-glow-pink',
    accentColor: 'bg-pink-400',
    badge: 'New',
    badgeColor: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
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
    glowClass: 'glass-card--pink',
    iconHover: 'group-hover:text-pink-400 group-hover:border-pink-500/25',
    shadowHover: 'hover:shadow-glow-pink',
    accentColor: 'bg-pink-400',
    badge: 'New',
    badgeColor: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
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
    glowClass: 'glass-card--pink',
    iconHover: 'group-hover:text-pink-400 group-hover:border-pink-500/25',
    shadowHover: 'hover:shadow-glow-pink',
    accentColor: 'bg-pink-400',
    badge: 'New',
    badgeColor: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
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
    glowClass: 'glass-card--pink',
    iconHover: 'group-hover:text-pink-400 group-hover:border-pink-500/25',
    shadowHover: 'hover:shadow-glow-pink',
    accentColor: 'bg-pink-400',
    badge: 'New',
    badgeColor: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
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
    glowClass: 'glass-card--pink',
    iconHover: 'group-hover:text-pink-400 group-hover:border-pink-500/25',
    shadowHover: 'hover:shadow-glow-pink',
    accentColor: 'bg-pink-400',
    badge: 'New',
    badgeColor: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        <path d="M5 3h14" />
      </svg>
    ),
  },
];

const CATEGORIES = [
  { label: 'Data Transform', accent: 'text-cyan-400/70', start: 0, count: 6, cols: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6' },
  { label: 'Security', accent: 'text-blue-400/70', start: 6, count: 5, cols: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-5' },
  { label: 'Dev Utilities', accent: 'text-purple-400/70', start: 11, count: 6, cols: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6' },
  { label: 'Generate', accent: 'text-pink-400/70', start: 17, count: 11, cols: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6' },
];

export default function ToolCards({ showShortcuts, featured }: { showShortcuts?: boolean; featured?: ToolId[] }) {
  const gridRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const grid = gridRef.current;
    if (!grid) return;
    const cards = grid.querySelectorAll<HTMLElement>('[data-card]');
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--spotlight-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--spotlight-y', `${e.clientY - rect.top}px`);
    });
  }, []);

  // Featured mode: flat grid with only selected tools
  if (featured) {
    const featuredCards = featured.map((id) => CARDS.find((c) => c.id === id)).filter(Boolean) as typeof CARDS;
    return (
      <div ref={gridRef} onMouseMove={handleMouseMove}>
        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3`}>
          {featuredCards.map((card, i) => (
            <Link
              key={card.id}
              href={`/tools/${TOOL_SLUGS[card.id]}`}
              data-card
              className={`group text-left rounded-xl glass-card ${card.glowClass} p-3.5 pb-4 sm:p-4 sm:pb-5 hover:-translate-y-1.5 ${card.shadowHover} transition-all duration-300 cursor-pointer relative stagger-in`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div
                className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'radial-gradient(200px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(255,255,255,0.06), transparent 60%)' }}
              />
              <div className="flex items-center gap-2.5 mb-2.5 sm:mb-3 relative">
                <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-zinc-400 ${card.iconHover} transition-all duration-300 group-hover:scale-110`}>
                  {card.icon}
                </div>
                <div className={`w-2 h-2 rounded-full ${card.accentColor} opacity-50 group-hover:opacity-100 transition-opacity duration-300`} />
              </div>
              <h3 className="text-[13px] sm:text-[14px] font-semibold text-zinc-100 mb-1 sm:mb-1.5 relative">{card.title}</h3>
              <p className="text-[11px] sm:text-[12px] text-zinc-400 leading-relaxed relative">{card.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={gridRef} onMouseMove={handleMouseMove} className="space-y-4">
      {CATEGORIES.map((cat) => (
        <div key={cat.label}>
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${cat.accent}`}>{cat.label}</p>
          <div className={`grid ${cat.cols} gap-2.5 sm:gap-3`}>
            {CARDS.slice(cat.start, cat.start + cat.count).map((card, i) => {
              const index = cat.start + i;
              return (
                <Link
                  key={card.id}
                  href={`/tools/${TOOL_SLUGS[card.id]}`}
                  data-card
                  className={`group text-left rounded-xl glass-card ${card.glowClass} p-3.5 pb-4 sm:p-4 sm:pb-5 hover:-translate-y-1.5 ${card.shadowHover} transition-all duration-300 cursor-pointer relative stagger-in`}
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
                      const LETTER_KEYS: Record<string, string> = { uuid: 'U', regex: 'R', timestamp: 'T', markdown: 'M', epoch: 'D', cron: 'X', 'screen-recorder': 'W', base64: 'E', color: 'C', lorem: 'L', 'base64-image': 'B', 'image-base64': 'I', 'image-convert': 'F', qr: 'Q', gradient: 'G', placeholder: 'P', 'bg-remover': 'A', 'image-compress': 'K' };
                      const label = index < 10 ? (index === 9 ? '0' : String(index + 1)) : LETTER_KEYS[card.id] || null;
                      return label ? (
                        <kbd className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-zinc-500 group-hover:text-zinc-200 bg-white/[0.05] border border-white/[0.1] group-hover:border-white/[0.2] group-hover:bg-white/[0.08] rounded transition-all duration-300">
                          {label}
                        </kbd>
                      ) : null;
                    })()}
                  </div>

                  {/* Spotlight overlay */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'radial-gradient(200px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(255,255,255,0.06), transparent 60%)',
                    }}
                  />

                  <div className="flex items-center gap-2.5 mb-2.5 sm:mb-3 relative">
                    <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-zinc-400 ${card.iconHover} transition-all duration-300 group-hover:scale-110`}>
                      {card.icon}
                    </div>
                    <div className={`w-2 h-2 rounded-full ${card.accentColor} opacity-50 group-hover:opacity-100 transition-opacity duration-300`} />
                  </div>
                  <h3 className="text-[13px] sm:text-[14px] font-semibold text-zinc-100 mb-1 sm:mb-1.5 relative">{card.title}</h3>
                  <p className="text-[11px] sm:text-[12px] text-zinc-400 leading-relaxed relative">{card.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
