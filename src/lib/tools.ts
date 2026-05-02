import type { ToolId } from '@/types';

// ── Site config ──
export const SITE_URL = 'https://www.rawtools.site';

// ── Tool metadata ──
export const TOOL_META: Record<ToolId, { title: string; desc: string; accent: string }> = {
  format: { title: 'Format & Validate', desc: 'Pretty-print, minify, and validate JSON with real-time error detection and syntax highlighting.', accent: 'bg-cyan-400' },
  convert: { title: 'Data Converter', desc: 'Convert between JSON, YAML, CSV, and XML formats in either direction.', accent: 'bg-cyan-400' },
  url: { title: 'URL Encoder/Decoder', desc: 'Encode and decode URL components, query strings, and special characters.', accent: 'bg-cyan-400' },
  jwt: { title: 'JWT Decoder', desc: 'Decode JWT tokens to inspect headers, payloads, and signatures. Expiry is auto-detected.', accent: 'bg-blue-400' },
  'jwt-encode': { title: 'JWT Encoder', desc: 'Build JWT tokens with custom header and payload, signed with HMAC-SHA256.', accent: 'bg-blue-400' },
  hash: { title: 'Hash Generator', desc: 'Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from any text input.', accent: 'bg-blue-400' },
  uuid: { title: 'UUID Generator', desc: 'Generate cryptographically random UUID v4 identifiers with bulk generation.', accent: 'bg-purple-400' },
  regex: { title: 'Regex Tester', desc: 'Test regular expressions with live match highlighting and capture group inspection.', accent: 'bg-purple-400' },
  timestamp: { title: 'Timestamp', desc: 'Convert Unix timestamps to human-readable dates and back. Live clock included.', accent: 'bg-purple-400' },
  base64: { title: 'Base64', desc: 'Encode text to Base64 or decode Base64 back to plain text with full Unicode support.', accent: 'bg-pink-400' },
  color: { title: 'Color Picker', desc: 'Drag to create your own unique color. Copy the hex, RGB, or HSL code instantly.', accent: 'bg-pink-400' },
  lorem: { title: 'Lorem Ipsum', desc: 'Generate placeholder text by paragraphs, sentences, or words with quick presets.', accent: 'bg-pink-400' },
  'base64-image': { title: 'Base64 to Image', desc: 'Decode Base64 image strings to preview, inspect metadata, and download as files.', accent: 'bg-pink-400' },
  'image-base64': { title: 'Image to Base64', desc: 'Upload any image and convert it to a Base64 data URI string for embedding.', accent: 'bg-pink-400' },
  'image-convert': { title: 'Image Converter', desc: 'Convert images between PNG, JPEG, WebP, AVIF, BMP, TIFF, and ICO formats.', accent: 'bg-pink-400' },
  diff: { title: 'Diff / Compare', desc: 'Compare two texts side by side with line-level diff highlighting.', accent: 'bg-cyan-400' },
  password: { title: 'Password Generator', desc: 'Generate cryptographically secure passwords with custom rules and strength meter.', accent: 'bg-blue-400' },
  qr: { title: 'QR Code', desc: 'Generate QR codes from text or URLs, and decode QR codes from images.', accent: 'bg-pink-400' },
  markdown: { title: 'Markdown Preview', desc: 'Write or paste markdown and see a live rendered preview with GFM support.', accent: 'bg-purple-400' },
  sql: { title: 'SQL Formatter', desc: 'Format, beautify, and minify SQL queries with dialect-aware formatting.', accent: 'bg-cyan-400' },
  gradient: { title: 'CSS Gradient', desc: 'Build and preview linear, radial, and conic CSS gradients with live code output.', accent: 'bg-pink-400' },
  'json-ts': { title: 'JSON to TypeScript', desc: 'Generate TypeScript interfaces from JSON data with nested object extraction.', accent: 'bg-cyan-400' },
  epoch: { title: 'Epoch Converter', desc: 'Convert between Unix timestamps and human-readable dates with relative time.', accent: 'bg-purple-400' },
  placeholder: { title: 'Placeholder Image', desc: 'Generate placeholder images with custom dimensions, colors, and text.', accent: 'bg-pink-400' },
  cron: { title: 'Cron Builder', desc: 'Build, parse, and validate cron expressions with a visual editor and next-run preview.', accent: 'bg-purple-400' },
  'bg-remover': { title: 'BG Remover', desc: 'Remove image backgrounds with AI — runs 100% in your browser using on-device ML.', accent: 'bg-pink-400' },
  'image-compress': { title: 'Image Compress', desc: 'Compress images with adjustable quality, format selection, and before/after size comparison.', accent: 'bg-pink-400' },
  'screen-recorder': { title: 'Screen Recorder', desc: 'Record your screen, window, or browser tab with optional mic audio. Download as WebM.', accent: 'bg-blue-400' },
  'px-converter': { title: 'PX ↔ REM / Tailwind', desc: 'Convert pixels to rem units and Tailwind CSS spacing classes. Configurable base font size.', accent: 'bg-purple-400' },
  'video-compress': { title: 'Video Compress', desc: 'Compress videos with adjustable quality and resolution. Runs 100% in your browser using FFmpeg WebAssembly.', accent: 'bg-violet-400' },
};

// ── SEO-friendly URL slugs ──
export const TOOL_SLUGS: Record<ToolId, string> = {
  format: 'json-formatter',
  convert: 'data-converter',
  url: 'url-encoder-decoder',
  diff: 'text-diff',
  sql: 'sql-formatter',
  'json-ts': 'json-to-typescript',
  jwt: 'jwt-decoder',
  'jwt-encode': 'jwt-encoder',
  hash: 'hash-generator',
  password: 'password-generator',
  uuid: 'uuid-generator',
  regex: 'regex-tester',
  timestamp: 'timestamp-converter',
  markdown: 'markdown-preview',
  epoch: 'epoch-converter',
  cron: 'cron-builder',
  'screen-recorder': 'screen-recorder',
  base64: 'base64-encoder-decoder',
  color: 'color-picker',
  lorem: 'lorem-ipsum-generator',
  'base64-image': 'base64-to-image',
  'image-base64': 'image-to-base64',
  'image-convert': 'image-converter',
  qr: 'qr-code-generator',
  gradient: 'css-gradient-generator',
  placeholder: 'placeholder-image',
  'bg-remover': 'background-remover',
  'image-compress': 'image-compressor',
  'px-converter': 'pixel-to-rem-tailwind-converter',
  'video-compress': 'video-compressor',
};

// Reverse mapping: slug → ToolId
export const SLUG_TO_TOOL: Record<string, ToolId> = Object.fromEntries(
  Object.entries(TOOL_SLUGS).map(([id, slug]) => [slug, id as ToolId])
) as Record<string, ToolId>;

// ── Per-tool SEO metadata ──
export const TOOL_SEO: Record<ToolId, { title: string; description: string }> = {
  format: { title: 'JSON Formatter & Validator Online', description: 'Format, validate, minify and pretty-print JSON online. Free browser-based JSON formatter with syntax highlighting and real-time error detection. No data sent to servers.' },
  convert: { title: 'JSON to YAML, CSV, XML Converter', description: 'Convert between JSON, YAML, CSV, and XML formats instantly. Free online data converter — works entirely in your browser.' },
  url: { title: 'URL Encoder & Decoder Online', description: 'Encode and decode URL components, query strings, and special characters. Free online URL encoding and decoding tool.' },
  diff: { title: 'Text Diff & Compare Tool Online', description: 'Compare two texts side by side with line-level diff highlighting. Free online diff tool for code, text, and documents.' },
  sql: { title: 'SQL Formatter & Beautifier Online', description: 'Format, beautify, and minify SQL queries online. Supports multiple SQL dialects with instant formatting.' },
  'json-ts': { title: 'JSON to TypeScript Converter', description: 'Generate TypeScript interfaces and types from JSON data automatically. Free online JSON to TypeScript converter with nested object support.' },
  jwt: { title: 'JWT Decoder — Decode & Inspect JWT Tokens', description: 'Decode JWT tokens online to inspect headers, payloads, and signatures. Auto-detects token expiry. Free, private, no data sent to servers.' },
  'jwt-encode': { title: 'JWT Encoder — Build & Sign JWT Tokens', description: 'Build and sign JWT tokens with custom headers and payloads using HMAC-SHA256. Free online JWT token generator.' },
  hash: { title: 'Hash Generator — MD5, SHA-1, SHA-256, SHA-512', description: 'Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from any text. Free online hash generator running in your browser.' },
  password: { title: 'Password Generator — Secure Random Passwords', description: 'Generate cryptographically secure random passwords with customizable length, characters, and strength meter. Free online password generator.' },
  uuid: { title: 'UUID Generator — Random UUID v4', description: 'Generate cryptographically random UUID v4 identifiers with bulk generation. Free online UUID generator.' },
  regex: { title: 'Regex Tester — Test Regular Expressions Online', description: 'Test regular expressions with live match highlighting and capture group inspection. Free online regex tester and debugger.' },
  timestamp: { title: 'Unix Timestamp Converter', description: 'Convert Unix timestamps to human-readable dates and back. Live clock with multiple timezone support. Free online timestamp converter.' },
  markdown: { title: 'Markdown Preview — Live Editor', description: 'Write or paste markdown and see a live rendered preview with GitHub Flavored Markdown support. Free online markdown editor.' },
  epoch: { title: 'Epoch Converter — Unix Timestamp to Date', description: 'Convert between Unix epoch timestamps and human-readable dates with relative time display. Free batch epoch converter.' },
  cron: { title: 'Cron Expression Builder & Parser', description: 'Build, parse, and validate cron expressions with a visual editor. Preview next scheduled runs. Free online cron builder.' },
  'screen-recorder': { title: 'Screen Recorder — Record Screen Online Free', description: 'Record your screen, application window, or browser tab with optional microphone audio. Download as WebM. 100% browser-based, nothing uploaded.' },
  base64: { title: 'Base64 Encoder & Decoder Online', description: 'Encode text to Base64 or decode Base64 back to plain text with full Unicode support. Free online Base64 tool.' },
  color: { title: 'Color Picker — HEX, RGB, HSL', description: 'Pick colors with an interactive color wheel. Copy hex, RGB, and HSL values instantly. Free online color picker tool.' },
  lorem: { title: 'Lorem Ipsum Generator', description: 'Generate lorem ipsum placeholder text by paragraphs, sentences, or words. Quick presets for common lengths. Free online text generator.' },
  'base64-image': { title: 'Base64 to Image Converter', description: 'Decode Base64 strings to preview images, inspect metadata, and download files. Free online Base64 to image decoder.' },
  'image-base64': { title: 'Image to Base64 Converter', description: 'Upload any image and convert it to a Base64 data URI string for embedding in HTML or CSS. Free online image encoder.' },
  'image-convert': { title: 'Image Converter — PNG, JPEG, WebP, AVIF', description: 'Convert images between PNG, JPEG, WebP, AVIF, BMP, TIFF, and ICO formats. Free online image format converter.' },
  qr: { title: 'QR Code Generator & Reader', description: 'Generate QR codes from text or URLs, and scan QR codes from images. Free online QR code tool.' },
  gradient: { title: 'CSS Gradient Generator', description: 'Build and preview linear, radial, and conic CSS gradients with live code output and preset gallery. Free online gradient builder.' },
  placeholder: { title: 'Placeholder Image Generator', description: 'Generate placeholder images with custom dimensions, colors, and overlay text. Free online placeholder image tool.' },
  'bg-remover': { title: 'Background Remover — Remove Image Background Free', description: 'Remove image backgrounds using AI — runs 100% in your browser with on-device machine learning. No uploads, completely private.' },
  'image-compress': { title: 'Image Compressor — Compress Images Online', description: 'Compress images with adjustable quality control and format selection. Compare before/after file sizes. Free online image compressor.' },
  'px-converter': { title: 'PX to REM & Tailwind Converter', description: 'Convert pixels to rem units and Tailwind CSS spacing classes instantly. Configurable base font size. Free online px to rem converter.' },
  'video-compress': { title: 'Video Compressor — Compress Videos Online', description: 'Compress videos with adjustable quality and resolution. Runs entirely in your browser using FFmpeg WebAssembly. No uploads, completely private.' },
};

// Card order matches the 4×3 grid layout (by category rows)
export const TOOL_ORDER: ToolId[] = [
  'format', 'convert', 'url', 'diff', 'sql', 'json-ts',           // cyan row (6)
  'jwt', 'jwt-encode', 'hash', 'password', 'screen-recorder',      // blue row (5)
  'uuid', 'regex', 'timestamp', 'markdown', 'epoch', 'cron', 'px-converter', // purple row (7)
  'base64', 'color', 'lorem', 'base64-image', 'image-base64', 'image-convert', 'qr', 'gradient', 'placeholder', 'bg-remover', 'image-compress', 'video-compress', // pink row (12)
];

export const POPULAR_TOOLS: ToolId[] = ['format', 'screen-recorder', 'jwt', 'base64', 'image-convert'];

export const RELATED_TOOLS: Record<ToolId, ToolId[]> = {
  format: ['convert', 'json-ts', 'screen-recorder'],
  convert: ['format', 'json-ts', 'base64'],
  url: ['base64', 'format', 'hash'],
  jwt: ['jwt-encode', 'base64', 'hash'],
  'jwt-encode': ['jwt', 'hash', 'base64'],
  hash: ['uuid', 'base64', 'jwt'],
  uuid: ['hash', 'timestamp', 'regex'],
  regex: ['format', 'hash', 'uuid'],
  timestamp: ['epoch', 'uuid', 'regex'],
  base64: ['base64-image', 'url', 'jwt'],
  color: ['gradient', 'lorem', 'placeholder'],
  lorem: ['placeholder', 'color', 'uuid'],
  'base64-image': ['image-base64', 'image-convert', 'base64'],
  'image-base64': ['base64-image', 'image-convert', 'base64'],
  'image-convert': ['image-base64', 'base64-image', 'placeholder'],
  diff: ['format', 'convert', 'screen-recorder'],
  password: ['hash', 'uuid', 'jwt-encode'],
  qr: ['base64', 'image-convert', 'url'],
  markdown: ['diff', 'convert', 'format'],
  sql: ['format', 'convert', 'diff'],
  gradient: ['color', 'placeholder', 'image-convert'],
  'json-ts': ['format', 'convert', 'diff'],
  epoch: ['timestamp', 'cron', 'hash'],
  placeholder: ['image-convert', 'gradient', 'color'],
  cron: ['timestamp', 'epoch', 'regex'],
  'bg-remover': ['image-compress', 'image-convert', 'image-base64'],
  'image-compress': ['bg-remover', 'image-convert', 'video-compress'],
  'video-compress': ['image-compress', 'screen-recorder', 'image-convert'],
  'screen-recorder': ['video-compress', 'image-convert', 'qr'],
  'px-converter': ['color', 'gradient', 'json-ts'],
};

export const TOOL_CATEGORY: Record<ToolId, string> = {
  format: 'Data Transform', convert: 'Data Transform', url: 'Data Transform', diff: 'Data Transform', sql: 'Data Transform', 'json-ts': 'Data Transform',
  jwt: 'Security', 'jwt-encode': 'Security', hash: 'Security', password: 'Security', 'screen-recorder': 'Security',
  uuid: 'Dev Utilities', regex: 'Dev Utilities', timestamp: 'Dev Utilities', markdown: 'Dev Utilities', epoch: 'Dev Utilities', cron: 'Dev Utilities', 'px-converter': 'Dev Utilities',
  base64: 'Generate', color: 'Generate', lorem: 'Generate', 'base64-image': 'Generate', 'image-base64': 'Generate', 'image-convert': 'Generate', qr: 'Generate', gradient: 'Generate', placeholder: 'Generate', 'bg-remover': 'Generate', 'image-compress': 'Generate', 'video-compress': 'Generate',
};

// ── Keyboard shortcuts ──
export const LETTER_SHORTCUTS: Record<string, ToolId> = {
  u: 'uuid', r: 'regex', t: 'timestamp', m: 'markdown', d: 'epoch', x: 'cron', y: 'px-converter',
  e: 'base64', c: 'color', l: 'lorem', b: 'base64-image', i: 'image-base64',
  f: 'image-convert', q: 'qr', g: 'gradient', p: 'placeholder',
  a: 'bg-remover', k: 'image-compress', w: 'screen-recorder', v: 'video-compress',
};

// ── Content detection for paste/drop ──
export function detectContent(text: string): { tool: ToolId; label: string } | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  if (/^eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*$/.test(trimmed))
    return { tool: 'jwt', label: 'JWT token detected' };

  if (/^[\[{]/.test(trimmed)) {
    try { JSON.parse(trimmed); return { tool: 'format', label: 'JSON detected' }; } catch {}
  }

  if (/%[0-9A-Fa-f]{2}/.test(trimmed) && !trimmed.includes(' '))
    return { tool: 'url', label: 'URL-encoded text detected' };

  if (/^data:image\/[a-z0-9+]+;base64,/i.test(trimmed))
    return { tool: 'base64-image', label: 'Base64 image detected' };

  if (/^[A-Za-z0-9+/=]{20,}$/.test(trimmed) && trimmed.length > 30)
    return { tool: 'base64', label: 'Base64 detected' };

  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed))
    return { tool: 'uuid', label: 'UUID detected' };

  if (/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed))
    return { tool: 'color', label: 'Hex color detected' };

  if (/^\d{10,13}$/.test(trimmed))
    return { tool: 'timestamp', label: 'Unix timestamp detected' };

  if (/^[a-zA-Z_]\w*:\s/m.test(trimmed) && !trimmed.startsWith('{') && !trimmed.startsWith('<'))
    return { tool: 'convert', label: 'YAML detected' };

  if (/^<\?xml|^<[a-zA-Z][\s\S]*>/.test(trimmed))
    return { tool: 'convert', label: 'XML detected' };

  return null;
}

// ── Home page data ──
export const FEATURES = [
  { label: '100% Private', detail: 'All processing happens in your browser', accent: 'text-emerald-400' },
  { label: 'Keyboard First', detail: '\u2318K to search, 0-9 to jump to tools', accent: 'text-cyan-400' },
  { label: 'Zero Friction', detail: 'No sign-up, no tracking, just tools', accent: 'text-purple-400' },
];

export const WHY_ITEMS = [
  { title: 'Paste anything, we figure it out', desc: 'RAW auto-detects what you paste \u2014 JSON, JWT, Base64, URLs, timestamps \u2014 and routes you to the right tool instantly. No menus, no guessing.', accent: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  { title: 'Your data never leaves your browser', desc: 'Everything runs client-side. Paste API keys, tokens, or sensitive data with confidence. Zero servers, zero tracking, zero risk.', accent: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { title: '29 tools, zero tab juggling', desc: 'JSON formatter, JWT decoder, regex tester, hash generator, and more. Stop bookmarking dozens of different websites.', accent: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { title: 'Built for keyboard-first developers', desc: '\u2318K to search, number keys to jump, ESC to go back. Full keyboard navigation means your hands never leave the keyboard.', accent: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
];

// ── SEO content for tool pages ──
export const TOOL_CONTENT: Record<ToolId, { about: string; steps: string[]; faq: { q: string; a: string }[] }> = {
  format: {
    about: 'RAW\'s JSON Formatter & Validator lets you pretty-print, minify, and validate JSON data instantly in your browser. Paste messy API responses, config files, or any JSON and get perfectly formatted output with syntax highlighting and real-time error detection. No data is sent to any server — everything runs locally.',
    steps: [
      'Paste or type your JSON into the input editor.',
      'Click "Format" to pretty-print or "Minify" to compress.',
      'Validation errors appear in real-time with line numbers.',
      'Copy the formatted result to your clipboard with one click.',
    ],
    faq: [
      { q: 'Is my JSON data safe?', a: 'Yes. All formatting and validation happens entirely in your browser. Your data never leaves your device — there are no server calls, no logging, and no tracking.' },
      { q: 'What size JSON can this handle?', a: 'RAW can handle JSON files up to several megabytes. Since processing runs in your browser, performance depends on your device, but most JSON payloads from APIs and config files are processed instantly.' },
      { q: 'Can I validate JSON without formatting it?', a: 'Yes. The validator runs automatically as you type and highlights syntax errors with line numbers and descriptive error messages, even before you click Format.' },
      { q: 'What\'s the difference between Format and Minify?', a: 'Format (pretty-print) adds indentation and line breaks to make JSON human-readable. Minify removes all whitespace to produce the smallest possible output, ideal for API requests and storage.' },
    ],
  },
  convert: {
    about: 'Convert data between JSON, YAML, CSV, and XML formats instantly. RAW\'s Data Converter handles bidirectional conversion — paste JSON and get YAML, or paste CSV and get JSON. Perfect for transforming API responses, configuration files, and data exports without installing any software.',
    steps: [
      'Paste your data (JSON, YAML, CSV, or XML) into the input panel.',
      'Select your target format from the output dropdown.',
      'The conversion happens automatically in real-time.',
      'Copy the converted output or switch formats to compare.',
    ],
    faq: [
      { q: 'Which data formats are supported?', a: 'RAW supports JSON, YAML, CSV, and XML. You can convert between any combination — JSON to YAML, CSV to JSON, XML to YAML, and all other directions.' },
      { q: 'Does it handle nested data in CSV?', a: 'CSV is a flat format, so nested JSON objects are flattened using dot notation for keys. For deeply nested data, YAML or XML are better target formats.' },
      { q: 'Can I convert large files?', a: 'Yes. Since conversion runs in your browser, there are no file size limits imposed by a server. Performance depends on your device, but typical data files convert instantly.' },
    ],
  },
  url: {
    about: 'Encode and decode URL components, query strings, and special characters online. RAW\'s URL Encoder/Decoder handles percent-encoding, query parameters, and full URL parsing. Essential for debugging API requests, building query strings, and handling special characters in URLs.',
    steps: [
      'Paste your URL or text into the input field.',
      'Choose "Encode" to percent-encode or "Decode" to convert back to plain text.',
      'The result updates instantly as you type.',
      'Copy the encoded/decoded result with one click.',
    ],
    faq: [
      { q: 'What is URL encoding?', a: 'URL encoding (percent-encoding) replaces unsafe characters with a % followed by two hex digits. For example, spaces become %20 and ampersands become %26. This ensures URLs are valid and transmitted correctly.' },
      { q: 'When should I URL encode?', a: 'URL encode when your data contains special characters (spaces, &, =, ?, #) and you need to include it in a URL query string or path segment. API parameters and form data often need encoding.' },
      { q: 'Does it handle Unicode characters?', a: 'Yes. RAW properly encodes and decodes Unicode characters including emoji, CJK characters, and accented letters using UTF-8 percent-encoding.' },
    ],
  },
  diff: {
    about: 'Compare two texts side by side with line-level diff highlighting. RAW\'s Diff tool shows additions, deletions, and unchanged lines with clear color coding. Perfect for comparing code versions, API responses, config files, and any text content.',
    steps: [
      'Paste the original text in the left panel.',
      'Paste the modified text in the right panel.',
      'Differences are highlighted automatically — green for additions, red for deletions.',
      'Scroll through the diff to review all changes.',
    ],
    faq: [
      { q: 'What type of diff algorithm is used?', a: 'RAW uses a line-level diff algorithm that identifies insertions, deletions, and modifications between two texts. Each line is compared to find the minimal set of changes.' },
      { q: 'Can I compare code files?', a: 'Yes. The diff tool works with any text content including source code, JSON, YAML, SQL, markdown, and plain text. The monospace font makes code comparison easy to read.' },
      { q: 'Is there a size limit?', a: 'There\'s no hard limit. Since the comparison runs in your browser, it can handle large files. Very large files (10,000+ lines) may take a moment to process.' },
    ],
  },
  sql: {
    about: 'Format, beautify, and minify SQL queries online with dialect-aware formatting. RAW\'s SQL Formatter supports standard SQL, MySQL, PostgreSQL, T-SQL, and more. Turn messy one-line queries into properly indented, readable SQL instantly.',
    steps: [
      'Paste your SQL query into the input editor.',
      'Select your SQL dialect (Standard, MySQL, PostgreSQL, etc.).',
      'Click "Format" to beautify or "Minify" to compress.',
      'Copy the formatted SQL to your clipboard.',
    ],
    faq: [
      { q: 'Which SQL dialects are supported?', a: 'RAW supports Standard SQL, MySQL, PostgreSQL, MariaDB, T-SQL (SQL Server), PL/SQL (Oracle), Amazon Redshift, Apache Spark, BigQuery, and more.' },
      { q: 'Does it modify my SQL logic?', a: 'No. The formatter only changes whitespace and indentation. Your SQL logic, table names, column names, and all other elements remain exactly the same.' },
      { q: 'Can it format stored procedures?', a: 'Yes. The formatter handles CREATE TABLE, INSERT, UPDATE, DELETE, SELECT with joins, subqueries, CTEs, and stored procedures with proper indentation.' },
    ],
  },
  'json-ts': {
    about: 'Generate TypeScript interfaces and types from JSON data automatically. Paste any JSON object or array and get clean, properly typed TypeScript interfaces with nested object support. Saves hours of manual type definition when working with APIs.',
    steps: [
      'Paste a JSON object or array into the input panel.',
      'TypeScript interfaces are generated automatically.',
      'Nested objects are extracted into separate named interfaces.',
      'Copy the TypeScript code and use it in your project.',
    ],
    faq: [
      { q: 'How does it handle nested objects?', a: 'Nested objects are automatically extracted into separate TypeScript interfaces with descriptive names based on the property path. This keeps the output clean and reusable.' },
      { q: 'Does it detect arrays correctly?', a: 'Yes. Arrays are typed based on their contents. If all elements are the same type, you get a clean array type. Mixed-type arrays use union types.' },
      { q: 'Can I customize the root interface name?', a: 'Yes. You can change the root interface name in the settings. Nested interfaces are named based on the root name and their property path.' },
    ],
  },
  jwt: {
    about: 'Decode and inspect JWT (JSON Web Tokens) online without any server-side processing. RAW\'s JWT Decoder splits tokens into header, payload, and signature sections with syntax highlighting. Automatically detects token expiration and displays claims in a readable format.',
    steps: [
      'Paste your JWT token into the input field.',
      'The header, payload, and signature are decoded instantly.',
      'Check the expiration status — expired tokens are flagged automatically.',
      'Inspect individual claims like iss, sub, aud, exp, and custom fields.',
    ],
    faq: [
      { q: 'Can I decode JWT tokens safely here?', a: 'Yes. Decoding happens entirely in your browser. Your token is never sent to any server, making it safe to decode tokens containing sensitive claims or API keys.' },
      { q: 'Does it verify JWT signatures?', a: 'RAW decodes and displays the signature but does not verify it, as that requires the secret key or public key. For signature verification, use the JWT Encoder tool with your signing key.' },
      { q: 'What JWT algorithms are supported?', a: 'The decoder handles all standard JWT algorithms including HS256, HS384, HS512, RS256, RS384, RS512, ES256, ES384, ES512, and PS256. The algorithm is displayed in the decoded header.' },
      { q: 'Why does my token show as expired?', a: 'RAW automatically checks the exp (expiration) claim against the current time. If the expiration timestamp is in the past, the token is flagged as expired with the exact expiry date shown.' },
    ],
  },
  'jwt-encode': {
    about: 'Build and sign JWT tokens with custom headers and payloads using HMAC-SHA256. RAW\'s JWT Encoder lets you create tokens for testing APIs, debugging authentication flows, and prototyping without needing a backend. Set custom claims, expiration times, and signing secrets.',
    steps: [
      'Edit the header JSON (algorithm and type are pre-filled).',
      'Edit the payload with your custom claims (sub, iss, exp, etc.).',
      'Enter your HMAC secret key for signing.',
      'The signed JWT token is generated in real-time — copy and use it.',
    ],
    faq: [
      { q: 'Which signing algorithms are supported?', a: 'RAW currently supports HMAC-SHA256 (HS256) for JWT signing. This is the most commonly used symmetric signing algorithm for JWT tokens.' },
      { q: 'Is it safe to enter my secret key?', a: 'Yes. The signing happens entirely in your browser. Your secret key is never transmitted to any server. However, never use production signing keys in any web tool — use test keys only.' },
      { q: 'Can I set custom expiration times?', a: 'Yes. Add an exp claim to your payload with a Unix timestamp. You can also add iat (issued at), nbf (not before), and any custom claims you need.' },
    ],
  },
  hash: {
    about: 'Generate cryptographic hashes from any text input using MD5, SHA-1, SHA-256, and SHA-512 algorithms. RAW\'s Hash Generator computes hashes instantly in your browser using the Web Crypto API. Useful for verifying file integrity, generating checksums, and testing hash-based authentication.',
    steps: [
      'Type or paste your text into the input field.',
      'All hash algorithms compute simultaneously in real-time.',
      'Click any hash value to copy it to your clipboard.',
      'Compare hashes to verify data integrity.',
    ],
    faq: [
      { q: 'Which hash algorithm should I use?', a: 'For security purposes, use SHA-256 or SHA-512. MD5 and SHA-1 are considered cryptographically broken and should only be used for checksums or non-security purposes like cache keys.' },
      { q: 'Is MD5 still safe to use?', a: 'MD5 is not safe for security-critical applications like password hashing or digital signatures due to known collision vulnerabilities. It\'s still fine for checksums, cache keys, and non-security file identification.' },
      { q: 'How are the hashes computed?', a: 'RAW uses the browser\'s built-in Web Crypto API for SHA hashes, ensuring fast and reliable computation. MD5 is computed using a pure JavaScript implementation. All processing happens locally.' },
    ],
  },
  password: {
    about: 'Generate cryptographically secure random passwords with customizable length, character sets, and a visual strength meter. RAW\'s Password Generator uses the Web Crypto API for true randomness — no pseudo-random shortcuts. Generate passwords that are strong enough for any security requirement.',
    steps: [
      'Set your desired password length using the slider.',
      'Toggle character types: uppercase, lowercase, numbers, symbols.',
      'A new password is generated instantly with each change.',
      'Check the strength meter and copy the password to your clipboard.',
    ],
    faq: [
      { q: 'How random are the generated passwords?', a: 'RAW uses the Web Crypto API (crypto.getRandomValues) which provides cryptographically secure random numbers. This is the same source of randomness used by browsers for TLS encryption.' },
      { q: 'What makes a strong password?', a: 'Password strength depends on length and character variety. A 16+ character password with uppercase, lowercase, numbers, and symbols is considered very strong. RAW\'s strength meter evaluates these factors in real-time.' },
      { q: 'Are generated passwords stored anywhere?', a: 'No. Passwords are generated entirely in your browser and are never stored, logged, or transmitted. Once you navigate away or generate a new password, the previous one exists only if you copied it.' },
    ],
  },
  uuid: {
    about: 'Generate cryptographically random UUID v4 identifiers instantly. RAW\'s UUID Generator uses the Web Crypto API for true randomness and supports bulk generation of multiple UUIDs at once. Essential for database primary keys, API request IDs, and unique identifiers in your applications.',
    steps: [
      'Click "Generate" to create a new UUID v4.',
      'Use bulk generation to create multiple UUIDs at once.',
      'Click any UUID to copy it to your clipboard.',
      'All UUIDs are RFC 4122 compliant.',
    ],
    faq: [
      { q: 'What is a UUID v4?', a: 'UUID v4 (Universally Unique Identifier version 4) is a 128-bit identifier generated using random or pseudo-random numbers. The format is xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx where 4 indicates the version and y is 8, 9, a, or b.' },
      { q: 'Are UUID v4 values truly unique?', a: 'While not guaranteed unique, the probability of a collision is astronomically low. With 122 random bits, you\'d need to generate 2.71 quintillion UUIDs to have a 50% chance of a single collision.' },
      { q: 'Can I use these UUIDs in production?', a: 'Yes. The UUIDs are generated using the Web Crypto API which provides the same cryptographic randomness used in production systems. They are fully RFC 4122 compliant.' },
    ],
  },
  regex: {
    about: 'Test and debug regular expressions online with live match highlighting and capture group inspection. RAW\'s Regex Tester shows matches as you type, highlights capture groups in different colors, and supports JavaScript regex flags. Perfect for building and validating patterns before using them in code.',
    steps: [
      'Enter your regular expression pattern in the top field.',
      'Set regex flags (global, case-insensitive, multiline, etc.).',
      'Type or paste test text in the input area.',
      'Matches are highlighted in real-time with capture groups shown separately.',
    ],
    faq: [
      { q: 'Which regex flavor does this use?', a: 'RAW uses JavaScript\'s built-in RegExp engine, which follows the ECMAScript specification. This is the same engine used in Node.js, Chrome, Firefox, and other JavaScript environments.' },
      { q: 'What regex flags are supported?', a: 'All JavaScript regex flags are supported: g (global), i (case-insensitive), m (multiline), s (dotAll), u (unicode), and y (sticky).' },
      { q: 'Can I see capture groups?', a: 'Yes. Named and numbered capture groups are displayed separately for each match, with different colors to distinguish them. This helps debug complex patterns with multiple groups.' },
    ],
  },
  timestamp: {
    about: 'Convert between Unix timestamps and human-readable dates instantly. RAW\'s Timestamp Converter supports seconds and milliseconds, shows multiple timezone formats, and includes a live clock showing the current Unix timestamp. Essential for debugging logs, API timestamps, and scheduling.',
    steps: [
      'Enter a Unix timestamp (seconds or milliseconds) to convert to a date.',
      'Or pick a date and time to get the Unix timestamp.',
      'The live clock shows the current timestamp updating in real-time.',
      'Copy any format with one click.',
    ],
    faq: [
      { q: 'What is a Unix timestamp?', a: 'A Unix timestamp (also called epoch time) is the number of seconds that have elapsed since January 1, 1970 00:00:00 UTC. It\'s a universal way to represent time in computing, independent of timezones.' },
      { q: 'Seconds vs milliseconds — which do I have?', a: 'If your timestamp is 10 digits (e.g., 1700000000), it\'s in seconds. If it\'s 13 digits (e.g., 1700000000000), it\'s in milliseconds. RAW auto-detects which format you\'re using.' },
      { q: 'Does it handle timezones?', a: 'Yes. The converter shows the date in both UTC and your local timezone. You can see exactly how a timestamp maps to different timezones.' },
    ],
  },
  markdown: {
    about: 'Write or paste Markdown and see a live rendered preview with GitHub Flavored Markdown (GFM) support. RAW\'s Markdown Preview handles headings, lists, tables, code blocks, links, images, and all standard Markdown syntax. Perfect for drafting README files, documentation, and blog posts.',
    steps: [
      'Type or paste Markdown in the left editor panel.',
      'The rendered preview updates in real-time on the right.',
      'All GFM features are supported: tables, task lists, strikethrough, code blocks.',
      'Use it to preview README.md files before committing.',
    ],
    faq: [
      { q: 'Which Markdown flavor is supported?', a: 'RAW supports GitHub Flavored Markdown (GFM) including tables, task lists, strikethrough, fenced code blocks, and autolinks. Standard Markdown (headings, bold, italic, lists, links, images) is fully supported.' },
      { q: 'Can I preview README files?', a: 'Yes. Paste the contents of any README.md or documentation file and see exactly how it will render. The styling closely matches GitHub\'s rendering.' },
      { q: 'Does it support code syntax highlighting?', a: 'Fenced code blocks with language identifiers are rendered with proper formatting. The preview shows code blocks with appropriate styling for readability.' },
    ],
  },
  epoch: {
    about: 'Convert between Unix epoch timestamps and human-readable dates with batch processing and relative time display. RAW\'s Epoch Converter handles multiple timestamps at once, shows relative time ("2 hours ago"), and supports both seconds and milliseconds. Ideal for parsing log files and debugging time-related bugs.',
    steps: [
      'Enter one or more epoch timestamps (one per line for batch mode).',
      'Each timestamp is converted to a human-readable date automatically.',
      'Relative time is shown (e.g., "3 days ago", "in 2 hours").',
      'Copy individual results or all conversions at once.',
    ],
    faq: [
      { q: 'How is this different from the Timestamp tool?', a: 'The Epoch Converter focuses on batch conversion — paste multiple timestamps and convert them all at once. It also shows relative time ("2 hours ago"). The Timestamp tool is better for single conversions with a live clock.' },
      { q: 'Can I convert dates back to epoch?', a: 'Yes. Enter a human-readable date and get the corresponding epoch timestamp in both seconds and milliseconds formats.' },
      { q: 'What date formats are supported?', a: 'The converter accepts Unix timestamps in seconds (10 digits) and milliseconds (13 digits). For date-to-epoch conversion, it accepts standard date formats like ISO 8601.' },
    ],
  },
  cron: {
    about: 'Build, parse, and validate cron expressions with a visual editor and next-run preview. RAW\'s Cron Builder helps you create cron schedules without memorizing the syntax. See upcoming execution times, validate expressions, and understand complex schedules at a glance.',
    steps: [
      'Use the visual dropdowns to set minute, hour, day, month, and weekday.',
      'Or type a cron expression directly to parse and visualize it.',
      'Preview the next scheduled run times to verify your schedule.',
      'Copy the cron expression for use in crontab, CI/CD, or schedulers.',
    ],
    faq: [
      { q: 'What cron format is used?', a: 'RAW uses the standard 5-field cron format: minute, hour, day of month, month, and day of week. This is compatible with crontab, GitHub Actions, AWS CloudWatch, and most scheduling systems.' },
      { q: 'Can I see when the cron job will run next?', a: 'Yes. The tool shows the next several scheduled execution times based on your cron expression, so you can verify the schedule is correct before deploying.' },
      { q: 'What do special characters mean?', a: 'Common cron characters: * (every), , (list, e.g., 1,3,5), - (range, e.g., 1-5), / (step, e.g., */15 for every 15 minutes). The visual editor helps you build these without memorizing syntax.' },
    ],
  },
  'screen-recorder': {
    about: 'Record your screen, a specific application window, or a browser tab directly from your browser — no software to install. RAW\'s Screen Recorder captures video with optional microphone audio and downloads recordings as WebM files. Everything happens locally, nothing is uploaded.',
    steps: [
      'Click "Start Recording" and choose what to share (screen, window, or tab).',
      'Optionally enable your microphone for voice narration.',
      'Use Pause/Resume to control the recording. A timer shows elapsed time.',
      'Click "Stop" to finish, then preview the recording and download as WebM.',
    ],
    faq: [
      { q: 'Do I need to install anything?', a: 'No. RAW\'s Screen Recorder uses your browser\'s built-in screen capture API (getDisplayMedia). It works in Chrome, Edge, Firefox, and other modern browsers without any extensions or software.' },
      { q: 'Is my recording uploaded anywhere?', a: 'No. The recording stays entirely in your browser. The video is assembled locally and you download it as a file. Nothing is uploaded to any server.' },
      { q: 'Can I record with audio?', a: 'Yes. You can enable microphone audio to narrate while recording. System audio (from the tab or app) may also be captured depending on your browser and what you\'re sharing.' },
      { q: 'What format is the recording?', a: 'Recordings are saved as WebM (VP9 video codec). WebM is supported by all modern browsers and can be converted to MP4 using free tools like FFmpeg or online converters.' },
    ],
  },
  base64: {
    about: 'Encode text to Base64 or decode Base64 back to plain text with full Unicode support. RAW\'s Base64 tool handles standard Base64, URL-safe Base64, and multi-line input. Essential for working with API authentication headers, data URIs, email encoding, and embedded content.',
    steps: [
      'Paste text to encode or Base64 string to decode.',
      'Choose "Encode" or "Decode" mode.',
      'The result updates in real-time as you type.',
      'Copy the result to your clipboard with one click.',
    ],
    faq: [
      { q: 'What is Base64 encoding?', a: 'Base64 is a binary-to-text encoding scheme that represents binary data using 64 ASCII characters (A-Z, a-z, 0-9, +, /). It\'s commonly used to embed binary data in text-based formats like JSON, XML, HTML, and email.' },
      { q: 'Does it support Unicode and emoji?', a: 'Yes. RAW properly handles Unicode text including emoji, CJK characters, and accented letters by encoding the UTF-8 byte representation to Base64.' },
      { q: 'What\'s the difference between Base64 and URL-safe Base64?', a: 'Standard Base64 uses + and / characters which have special meaning in URLs. URL-safe Base64 replaces these with - and _ to make the output safe for use in URLs and filenames.' },
    ],
  },
  color: {
    about: 'Pick any color with an interactive color wheel and get the value in HEX, RGB, and HSL formats instantly. RAW\'s Color Picker lets you drag to find the perfect color, adjust hue, saturation, and lightness, and copy color codes with one click. Ideal for web development, UI design, and CSS styling.',
    steps: [
      'Drag on the color area to pick your desired color.',
      'Use the hue slider to change the base color.',
      'Copy the HEX, RGB, or HSL value with one click.',
      'Enter a color code directly to preview it.',
    ],
    faq: [
      { q: 'What color formats are supported?', a: 'RAW supports HEX (#FF5733), RGB (rgb(255, 87, 51)), and HSL (hsl(11, 100%, 60%)) formats. All three update simultaneously as you pick colors.' },
      { q: 'Can I enter a color code to preview it?', a: 'Yes. Paste a HEX, RGB, or HSL color code and the picker will display that color. You can then adjust it visually and copy the updated value.' },
      { q: 'Is the alpha channel supported?', a: 'The color picker focuses on solid colors (HEX, RGB, HSL) without alpha/opacity. For transparent colors, you can manually add the alpha value to the generated code.' },
    ],
  },
  lorem: {
    about: 'Generate lorem ipsum placeholder text by paragraphs, sentences, or words with configurable counts and quick presets. RAW\'s Lorem Ipsum Generator creates realistic placeholder text for mockups, wireframes, and content templates. Copy the generated text with one click.',
    steps: [
      'Choose the unit: paragraphs, sentences, or words.',
      'Set the count using the slider or quick presets.',
      'The placeholder text is generated instantly.',
      'Copy the text to use in your designs and mockups.',
    ],
    faq: [
      { q: 'What is Lorem Ipsum?', a: 'Lorem Ipsum is placeholder text derived from a 1st-century BC Latin text by Cicero. It\'s used in design and publishing to fill space before final content is ready, allowing focus on visual layout without being distracted by readable text.' },
      { q: 'Can I generate specific amounts?', a: 'Yes. You can generate by paragraphs (1-20), sentences (1-100), or words (1-1000). Quick presets are available for common amounts like 1 paragraph, 3 paragraphs, or 500 words.' },
      { q: 'Is this the standard Lorem Ipsum text?', a: 'Yes. The generated text follows the traditional Lorem Ipsum corpus, starting with "Lorem ipsum dolor sit amet, consectetur adipiscing elit" and continuing with the standard passage.' },
    ],
  },
  'base64-image': {
    about: 'Decode Base64-encoded image strings to preview, inspect metadata, and download as image files. Paste a Base64 data URI or raw Base64 string and instantly see the image with dimensions, format, and file size. Useful for debugging embedded images in APIs, emails, and HTML.',
    steps: [
      'Paste a Base64 image string (with or without the data URI prefix).',
      'The image preview appears instantly with format detection.',
      'Check metadata: dimensions, file size, and image format.',
      'Download the decoded image as a file.',
    ],
    faq: [
      { q: 'What image formats are supported?', a: 'RAW supports all common image formats encoded in Base64: PNG, JPEG, GIF, WebP, SVG, BMP, and ICO. The format is auto-detected from the data URI prefix or image header bytes.' },
      { q: 'Do I need the data:image prefix?', a: 'No. You can paste either the full data URI (data:image/png;base64,...) or just the raw Base64 string. RAW will detect the image format automatically.' },
      { q: 'Can I convert the image to another format?', a: 'The Base64 to Image tool focuses on decoding and previewing. To convert formats, decode the image here, download it, and use the Image Converter tool.' },
    ],
  },
  'image-base64': {
    about: 'Upload any image and convert it to a Base64 data URI string for embedding in HTML, CSS, or JSON. RAW\'s Image to Base64 Converter handles PNG, JPEG, GIF, WebP, SVG, and more. Get the data URI, raw Base64, or CSS background-image snippet instantly.',
    steps: [
      'Drag and drop an image or click to upload.',
      'The Base64 data URI is generated instantly.',
      'Choose between full data URI, raw Base64, or CSS snippet.',
      'Copy the encoded string to embed in your code.',
    ],
    faq: [
      { q: 'Why would I embed images as Base64?', a: 'Base64 embedding eliminates extra HTTP requests, which can improve load times for small images like icons, logos, and sprites. It\'s also useful for embedding images in JSON APIs, emails, and single-file HTML documents.' },
      { q: 'Is there a size limit?', a: 'There\'s no hard limit, but Base64 encoding increases file size by ~33%. Images larger than 10KB are generally better served as separate files. Base64 is best for small icons and thumbnails.' },
      { q: 'Which output formats are available?', a: 'RAW provides three output formats: full data URI (for HTML img src), raw Base64 string (for API payloads), and CSS background-image snippet (for stylesheets).' },
    ],
  },
  'image-convert': {
    about: 'Convert images between PNG, JPEG, WebP, AVIF, BMP, TIFF, and ICO formats directly in your browser. RAW\'s Image Converter handles format conversion without uploading files to any server. Supports batch conversion and preserves image quality with adjustable settings.',
    steps: [
      'Upload an image by dragging and dropping or clicking to browse.',
      'Select the target format (PNG, JPEG, WebP, AVIF, BMP, TIFF, ICO).',
      'Adjust quality settings if converting to a lossy format.',
      'Download the converted image.',
    ],
    faq: [
      { q: 'Which image formats are supported?', a: 'RAW supports PNG, JPEG, WebP, AVIF, BMP, TIFF, and ICO for both input and output. Browser support varies for some formats — AVIF and TIFF may not be available in all browsers.' },
      { q: 'Is image quality preserved?', a: 'For lossless formats (PNG, BMP, TIFF), quality is fully preserved. For lossy formats (JPEG, WebP, AVIF), you can adjust the quality slider. Default settings maintain a good balance of quality and file size.' },
      { q: 'Can I convert to ICO for favicons?', a: 'Yes. Upload any image and convert to ICO format for use as a website favicon. The image will be resized to standard favicon dimensions.' },
    ],
  },
  qr: {
    about: 'Generate QR codes from text, URLs, or any data, and decode QR codes by uploading images. RAW\'s QR Code tool creates high-quality QR codes with customizable size and supports instant scanning of QR code images. No app installation needed.',
    steps: [
      'Enter text, a URL, or any data to encode as a QR code.',
      'The QR code is generated instantly and updates as you type.',
      'Download the QR code as a PNG image.',
      'To read a QR code, upload an image and the content is decoded automatically.',
    ],
    faq: [
      { q: 'What data can I encode in a QR code?', a: 'You can encode any text, URLs, email addresses, phone numbers, WiFi credentials, vCard contacts, and plain text. The maximum capacity depends on the content type — roughly 4,296 alphanumeric characters.' },
      { q: 'Can I scan QR codes with this tool?', a: 'Yes. Upload a QR code image (screenshot, photo, or saved file) and RAW will decode it instantly, showing the encoded content. No camera access is needed.' },
      { q: 'What format is the downloaded QR code?', a: 'QR codes are downloaded as PNG images at a resolution suitable for both screen display and printing.' },
    ],
  },
  gradient: {
    about: 'Build and preview CSS gradients with a visual editor and live code output. RAW\'s CSS Gradient Generator supports linear, radial, and conic gradients with multiple color stops, angle control, and a preset gallery. Copy the CSS code and use it directly in your stylesheets.',
    steps: [
      'Choose a gradient type: linear, radial, or conic.',
      'Add and adjust color stops by clicking on the gradient bar.',
      'Set the angle or position for directional gradients.',
      'Copy the generated CSS code to use in your project.',
    ],
    faq: [
      { q: 'Which gradient types are supported?', a: 'RAW supports all CSS gradient types: linear-gradient (straight line), radial-gradient (circular/elliptical), and conic-gradient (color wheel). Each has full control over angle, position, and color stops.' },
      { q: 'Can I use multiple color stops?', a: 'Yes. Add as many color stops as you need. Click on the gradient bar to add stops, drag them to reposition, and click to change colors. Most gradients work best with 2-5 stops.' },
      { q: 'Is the generated CSS cross-browser compatible?', a: 'Yes. The generated CSS uses the modern gradient syntax which is supported by all current browsers (Chrome, Firefox, Safari, Edge). No vendor prefixes are needed for modern browsers.' },
    ],
  },
  placeholder: {
    about: 'Generate placeholder images with custom dimensions, background colors, text overlays, and formats. RAW\'s Placeholder Image Generator creates images on the fly in your browser — perfect for mockups, wireframes, and development. No external service or API calls.',
    steps: [
      'Set the image width and height in pixels.',
      'Choose background and text colors.',
      'Optionally add overlay text (defaults to dimensions like "300x200").',
      'Download the generated placeholder image.',
    ],
    faq: [
      { q: 'What formats can I download?', a: 'Placeholder images are generated as PNG files, which support transparency and are compatible with all browsers and design tools.' },
      { q: 'Is there a maximum image size?', a: 'Since images are generated in your browser using the Canvas API, very large dimensions may be limited by your browser\'s maximum canvas size (typically 4096x4096 or larger depending on the device).' },
      { q: 'Can I use custom text on the image?', a: 'Yes. By default, the image shows its dimensions (e.g., "300x200"), but you can enter any custom text to display on the placeholder.' },
    ],
  },
  'bg-remover': {
    about: 'Remove image backgrounds using AI that runs 100% in your browser. RAW\'s Background Remover uses on-device machine learning (U2-Net model via ONNX Runtime) to separate foreground from background without uploading your images to any server. Perfect for product photos, profile pictures, and design assets.',
    steps: [
      'Upload an image by dragging and dropping or clicking to browse.',
      'The AI model processes the image in your browser (first run downloads a ~40MB model).',
      'Preview the result with a transparent background.',
      'Download the result as a PNG with transparency.',
    ],
    faq: [
      { q: 'How does background removal work without a server?', a: 'RAW uses the @imgly/background-removal library which runs a U2-Net neural network model directly in your browser via ONNX Runtime WebAssembly. The ~40MB model is downloaded once and cached.' },
      { q: 'Is my image uploaded anywhere?', a: 'No. All processing happens locally in your browser using WebAssembly and your device\'s CPU/GPU. Your images are never uploaded to any server.' },
      { q: 'Why is the first run slow?', a: 'The first time you use the tool, it downloads the AI model (~40MB). This is cached by your browser, so subsequent uses are much faster. The actual processing takes a few seconds depending on image size and device.' },
      { q: 'What types of images work best?', a: 'The AI works best with clear foreground subjects like people, products, and objects against relatively uniform backgrounds. Complex scenes with multiple overlapping subjects may produce less precise results.' },
    ],
  },
  'image-compress': {
    about: 'Compress images with adjustable quality control, format selection, and before/after size comparison. RAW\'s Image Compressor reduces file sizes while maintaining visual quality, all processed in your browser. Supports JPEG, WebP, and PNG output formats with real-time quality preview.',
    steps: [
      'Upload an image by dragging and dropping or clicking to browse.',
      'Adjust the quality slider to find the right balance.',
      'Compare the original and compressed file sizes.',
      'Download the compressed image in your chosen format.',
    ],
    faq: [
      { q: 'How much can images be compressed?', a: 'Compression ratios vary by image content and format. JPEG images can often be reduced 50-80% with minimal visible quality loss. WebP typically achieves even better compression than JPEG at the same quality level.' },
      { q: 'Is any quality lost during compression?', a: 'JPEG and WebP use lossy compression, so some quality is lost (controlled by the quality slider). PNG compression is lossless — file size reduction comes from optimizing the encoding, not removing data.' },
      { q: 'Which output format should I choose?', a: 'WebP offers the best compression-to-quality ratio and is supported by all modern browsers. JPEG is universally compatible. PNG is best when you need lossless quality or transparency.' },
    ],
  },
  'video-compress': {
    about: 'Compress videos directly in your browser with no uploads or server processing. RAW\'s Video Compressor uses FFmpeg WebAssembly to re-encode videos at lower bitrates and resolutions. Choose from quality presets and resolution options to find the right balance between file size and visual quality.',
    steps: [
      'Upload a video by dragging and dropping or clicking to browse.',
      'Choose a quality preset (High, Medium, or Low) and resolution.',
      'Click Compress and wait for processing to complete.',
      'Compare the original and compressed file sizes, then download.',
    ],
    faq: [
      { q: 'How does browser-based video compression work?', a: 'The tool uses FFmpeg compiled to WebAssembly (WASM), which runs the same compression algorithms as desktop FFmpeg entirely in your browser. The WASM engine is downloaded once (~31MB) on first use and cached for subsequent compressions.' },
      { q: 'Is my video uploaded anywhere?', a: 'No. All processing happens locally in your browser. Your video never leaves your device — nothing is uploaded to any server.' },
      { q: 'What output format is used?', a: 'Videos are compressed to MP4 (H.264 video + AAC audio), which is universally supported across all devices, browsers, and media players.' },
      { q: 'Why is compression slower than desktop software?', a: 'WebAssembly runs in a sandboxed browser environment without hardware acceleration, so it is slower than native FFmpeg. Compression time depends on video length, resolution, and your device\'s CPU.' },
    ],
  },
  'px-converter': {
    about: 'Convert pixel values to rem units and Tailwind CSS spacing classes instantly. RAW\'s PX to REM converter supports configurable base font sizes and shows the closest Tailwind class match. Essential for responsive design workflows and migrating from fixed pixel layouts to relative units.',
    steps: [
      'Enter a pixel value in the input field.',
      'View the converted rem value and matching Tailwind CSS class.',
      'Adjust the base font size if your project uses a non-standard root size.',
      'Copy any value with one click or browse the reference table for common conversions.',
    ],
    faq: [
      { q: 'What is the default base font size?', a: 'Browsers use 16px as the default root font size. This means 1rem = 16px by default. If your project sets a different root font size (e.g., 10px or 14px), adjust the base size in the tool to get accurate conversions.' },
      { q: 'How does Tailwind CSS spacing work?', a: 'Tailwind uses a spacing scale where each unit equals 4px by default (e.g., p-4 = 16px, m-8 = 32px). If your pixel value doesn\'t match an exact Tailwind class, the tool shows the closest match and the arbitrary value syntax like p-[18px].' },
      { q: 'Why should I use rem instead of px?', a: 'Rem units scale with the user\'s browser font size setting, making your layout more accessible. Users who increase their default font size for readability will see your entire layout scale proportionally, unlike fixed pixel values.' },
    ],
  },
};
