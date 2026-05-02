import type { Metadata } from 'next';
import Script from 'next/script';
import { Space_Grotesk, JetBrains_Mono, Inter } from 'next/font/google';
import './globals.css';
import AppShell from '@/components/AppShell';
import { SITE_URL } from '@/lib/tools';

const GA_ID = 'G-706XC6LLSG';

const grotesk = Space_Grotesk({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-grotesk',
  display: 'swap',
});

const inter = Inter({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'RAW — Developer Toolkit | 30 Free Browser-Based Tools',
    template: '%s — RAW',
  },
  description:
    '30 free browser-based developer tools. Format JSON, decode JWT tokens, encode Base64, generate UUIDs, hash text, and more. 100% client-side — no data sent to servers.',
  keywords: [
    'developer tools', 'online tools', 'JSON formatter', 'JWT decoder', 'Base64 encoder',
    'UUID generator', 'hash generator', 'regex tester', 'URL encoder', 'data converter',
    'SQL formatter', 'QR code generator', 'color picker', 'markdown preview',
    'image converter', 'password generator', 'screen recorder', 'cron builder',
    'browser-based tools', 'client-side tools', 'free developer tools',
  ],
  icons: { icon: '/favicon.svg', apple: '/favicon.svg' },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    siteName: 'RAW Developer Toolkit',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'RAW — 30 Free Browser-Based Developer Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RAW — 30 Free Browser-Based Developer Tools',
    description: 'Format JSON, decode JWT, encode Base64, generate UUIDs, and more. 100% client-side.',
    images: ['/og-image.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark bg-[#0a0a0a]">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5303477479330024"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${grotesk.variable} ${inter.variable} ${jetbrains.variable} bg-[#0a0a0a] text-zinc-200 font-sans min-h-screen antialiased`}
      >
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="ga-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
        </Script>
        <div className="relative flex flex-col min-h-screen">
          <AppShell>{children}</AppShell>
        </div>
      </body>
    </html>
  );
}
