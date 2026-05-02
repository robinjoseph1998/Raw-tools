'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import type { ToolId } from '@/types';
import { useAppContext } from '@/contexts/AppContext';
import { TOOL_META, TOOL_SLUGS, RELATED_TOOLS, TOOL_CATEGORY, TOOL_CONTENT } from '@/lib/tools';
import { useRecentTools } from '@/hooks/useRecentTools';
import dynamic from 'next/dynamic';

// Tool component imports
import JsonFormatter from '@/components/tools/JsonFormatter';
import DataConverter from '@/components/tools/DataConverter';
import JwtDecoder from '@/components/tools/JwtDecoder';
import JwtEncoder from '@/components/tools/JwtEncoder';
import Base64Tool from '@/components/tools/Base64Tool';
import UrlTool from '@/components/tools/UrlTool';
import HashTool from '@/components/tools/HashTool';
import UuidTool from '@/components/tools/UuidTool';
import ColorTool from '@/components/tools/ColorTool';
import RegexTester from '@/components/tools/RegexTester';
import TimestampTool from '@/components/tools/TimestampTool';
import LoremTool from '@/components/tools/LoremTool';
import Base64ToImageTool from '@/components/tools/Base64ToImageTool';
import ImageToBase64Tool from '@/components/tools/ImageToBase64Tool';
import ImageFormatConverter from '@/components/tools/ImageFormatConverter';
import DiffTool from '@/components/tools/DiffTool';
import PasswordTool from '@/components/tools/PasswordTool';
import QrCodeTool from '@/components/tools/QrCodeTool';
import MarkdownPreviewTool from '@/components/tools/MarkdownPreviewTool';
import SqlFormatterTool from '@/components/tools/SqlFormatterTool';
import CssGradientTool from '@/components/tools/CssGradientTool';
import JsonToTsTool from '@/components/tools/JsonToTsTool';
import EpochConverterTool from '@/components/tools/EpochConverterTool';
import PlaceholderImageTool from '@/components/tools/PlaceholderImageTool';
import CronBuilderTool from '@/components/tools/CronBuilderTool';
const BgRemoverTool = dynamic(() => import('@/components/tools/BgRemoverTool'), { ssr: false });
import ImageCompressTool from '@/components/tools/ImageCompressTool';
import ScreenRecorderTool from '@/components/tools/ScreenRecorderTool';
import PxConverterTool from '@/components/tools/PxConverterTool';
const VideoCompressTool = dynamic(() => import('@/components/tools/VideoCompressTool'), { ssr: false });

function renderTool(toolId: ToolId, p: { onStatusChange: (s: import('@/types').StatusState) => void; onToast: (msg: string) => void }) {
  switch (toolId) {
    case 'format': return <JsonFormatter {...p} />;
    case 'convert': return <DataConverter {...p} />;
    case 'jwt': return <JwtDecoder {...p} />;
    case 'jwt-encode': return <JwtEncoder {...p} />;
    case 'base64': return <Base64Tool {...p} />;
    case 'url': return <UrlTool {...p} />;
    case 'hash': return <HashTool {...p} />;
    case 'uuid': return <UuidTool {...p} />;
    case 'color': return <ColorTool {...p} />;
    case 'regex': return <RegexTester {...p} />;
    case 'timestamp': return <TimestampTool {...p} />;
    case 'lorem': return <LoremTool {...p} />;
    case 'base64-image': return <Base64ToImageTool {...p} />;
    case 'image-base64': return <ImageToBase64Tool {...p} />;
    case 'image-convert': return <ImageFormatConverter {...p} />;
    case 'diff': return <DiffTool {...p} />;
    case 'password': return <PasswordTool {...p} />;
    case 'qr': return <QrCodeTool {...p} />;
    case 'markdown': return <MarkdownPreviewTool {...p} />;
    case 'sql': return <SqlFormatterTool {...p} />;
    case 'gradient': return <CssGradientTool {...p} />;
    case 'json-ts': return <JsonToTsTool {...p} />;
    case 'epoch': return <EpochConverterTool {...p} />;
    case 'placeholder': return <PlaceholderImageTool {...p} />;
    case 'cron': return <CronBuilderTool {...p} />;
    case 'bg-remover': return <BgRemoverTool {...p} />;
    case 'image-compress': return <ImageCompressTool {...p} />;
    case 'screen-recorder': return <ScreenRecorderTool {...p} />;
    case 'px-converter': return <PxConverterTool {...p} />;
    case 'video-compress': return <VideoCompressTool {...p} />;
    default: return null;
  }
}

export default function ToolPageClient({ toolId }: { toolId: ToolId }) {
  const { setStatus, showToast } = useAppContext();
  const { recordUsage } = useRecentTools();
  const meta = TOOL_META[toolId];
  const related = RELATED_TOOLS[toolId];
  const content = TOOL_CONTENT[toolId];

  // Track usage & reset status on mount
  useEffect(() => {
    setStatus('idle');
    recordUsage(toolId);
  }, [toolId, setStatus, recordUsage]);

  return (
    <div className="animate-fade-in">
      {/* Back button — mobile only */}
      <div className="flex items-center justify-between mb-4 sm:mb-5 lg:hidden">
        <Link href="/" className="btn-ghost inline-flex items-center gap-2 py-2 text-xs sm:text-[13px]">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M15 19l-7-7 7-7" />
          </svg>
          All tools
        </Link>
        <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 bg-white/[0.04] border border-white/[0.06] rounded">ESC</kbd>
      </div>

      {/* Tool header */}
      <div className="mb-4 sm:mb-6 flex items-start gap-3">
        <div className={`w-1.5 h-8 rounded-full ${meta.accent} opacity-80 flex-shrink-0 mt-0.5`} />
        <div>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
            {TOOL_CATEGORY[toolId]} <span className="text-zinc-600 mx-1">/</span> <span className="text-zinc-300">{meta.title}</span>
          </p>
          <h1 className="text-lg sm:text-xl font-bold text-white mb-1">{meta.title}</h1>
          <p className="text-xs sm:text-[13px] text-zinc-400">{meta.desc}</p>
        </div>
      </div>

      {/* Tool component */}
      {renderTool(toolId, { onStatusChange: setStatus, onToast: showToast })}

      {/* Related tools */}
      <div className="mt-8 pt-6 border-t border-white/[0.04]">
        <h3 className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-3 flex items-center gap-2">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          Try next
        </h3>
        <div className="flex flex-wrap gap-2">
          {related.map((relId) => (
            <Link
              key={relId}
              href={`/tools/${TOOL_SLUGS[relId]}`}
              className="inline-flex items-center gap-2 px-3 py-2 sm:py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-200 group"
            >
              <div className={`w-1 h-1 rounded-full ${TOOL_META[relId].accent} opacity-50 group-hover:opacity-100 transition-opacity`} />
              <span className="text-[12px] font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
                {TOOL_META[relId].title}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* SEO content section */}
      {content && (
        <div className="mt-6 sm:mt-10 pt-6 sm:pt-8 border-t border-white/[0.04]">
          {/* About */}
          <section className="mb-8">
            <h2 className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
              About {meta.title}
            </h2>
            <p className="text-xs sm:text-[13px] text-zinc-500 leading-relaxed max-w-2xl">
              {content.about}
            </p>
          </section>

          {/* How to use */}
          <section className="mb-8">
            <h2 className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
              How to use
            </h2>
            <ol className="space-y-2 max-w-2xl">
              {content.steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-xs sm:text-[13px] text-zinc-500 leading-relaxed">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[10px] font-bold text-zinc-600 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
              Frequently Asked Questions
            </h2>
            <div className="space-y-2 max-w-2xl">
              {content.faq.map((item, i) => (
                <details key={i} className="group rounded-lg bg-white/[0.02] border border-white/[0.04] overflow-hidden">
                  <summary className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-white/[0.02] transition-colors">
                    <span className="text-[13px] font-medium text-zinc-400 group-open:text-zinc-300 transition-colors">
                      {item.q}
                    </span>
                    <svg className="h-3.5 w-3.5 text-zinc-600 group-open:rotate-180 transition-transform flex-shrink-0 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-4 pb-3 text-[13px] text-zinc-500 leading-relaxed">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
