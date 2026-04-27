import type { Metadata } from 'next';
import HomeContent from '@/components/HomeContent';

const SITE_URL = 'https://www.rawtools.site';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: {
    title: 'RAW — 28 Free Browser-Based Developer Tools',
    description:
      'Format JSON, decode JWT, encode Base64, generate UUIDs, hash text, convert images and more. 100% client-side — your data never leaves your browser.',
    url: '/',
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'RAW Developer Toolkit',
  url: SITE_URL,
  description:
    '28 free browser-based developer tools. Format JSON, decode JWT tokens, encode Base64, generate UUIDs, hash text, and more.',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

const appSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'RAW Developer Toolkit',
  url: SITE_URL,
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description:
    '28 free browser-based developer tools including JSON formatter, JWT decoder, Base64 encoder, UUID generator, hash generator, regex tester, and more.',
  featureList: [
    'JSON Formatter & Validator',
    'JWT Decoder & Encoder',
    'Base64 Encoder & Decoder',
    'UUID Generator',
    'Hash Generator',
    'URL Encoder & Decoder',
    'Regex Tester',
    'Data Converter (JSON, YAML, CSV, XML)',
    'Color Picker',
    'QR Code Generator',
    'SQL Formatter',
    'Markdown Preview',
    'Image Converter & Compressor',
    'Password Generator',
    'Screen Recorder',
    'CSS Gradient Generator',
    'Cron Expression Builder',
    'Background Remover',
  ],
};

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'RAW',
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.svg`,
  sameAs: [],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <HomeContent />
    </>
  );
}
