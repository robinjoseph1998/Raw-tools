# RAW

A modern, production-quality developer tool for JSON formatting, conversion, and JWT decoding. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Format & Validate** — Pretty-print, minify, real-time validation with syntax highlighting
- **Convert** — JSON to YAML, CSV, XML with one click
- **JWT Decoder** — Decode JWT tokens, inspect header/payload/signature, check expiry
- **Keyboard Shortcuts** — `Ctrl+Enter` / `⌘↵` to format
- **Copy to Clipboard** — One-click copy on all outputs
- **Dark Mode** — Default dark theme with SaaS-grade design
- **Responsive** — Desktop two-panel, mobile stacked

## Tech Stack

- **Next.js 15** (App Router, static export)
- **React 19** + TypeScript
- **Tailwind CSS v3**
- **js-yaml** (YAML conversion)
- Custom CSV, XML, and JWT implementations (zero extra dependencies)

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout, fonts, metadata
│   ├── page.tsx            # Main page with tool tab routing
│   └── globals.css         # Tailwind + custom styles
├── components/
│   ├── Navbar.tsx           # Brand, status badge
│   ├── ToolTabs.tsx         # Tab navigation
│   ├── EditorPanel.tsx      # Reusable input/output panel
│   ├── Toast.tsx            # Notification
│   └── tools/
│       ├── JsonFormatter.tsx
│       ├── JsonConverter.tsx
│       └── JwtDecoder.tsx
├── lib/
│   ├── json.ts             # Parse, transform, highlight, stats
│   ├── converter.ts        # YAML, CSV, XML converters
│   └── jwt.ts              # JWT decode, expiry check
├── hooks/
│   └── useToast.ts         # Toast state management
└── types/
    └── index.ts            # Shared TypeScript types
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build    # Static export to out/
```

## License

MIT
