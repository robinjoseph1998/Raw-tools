import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TOOL_SLUGS, SLUG_TO_TOOL, TOOL_SEO, TOOL_CONTENT, TOOL_CATEGORY, SITE_URL } from '@/lib/tools';
import ToolPageClient from '@/components/ToolPageClient';

export function generateStaticParams() {
  return Object.values(TOOL_SLUGS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const toolId = SLUG_TO_TOOL[slug];
  if (!toolId) return {};

  const seo = TOOL_SEO[toolId];
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: `/tools/${slug}` },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: `/tools/${slug}`,
    },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const toolId = SLUG_TO_TOOL[slug];
  if (!toolId) notFound();

  const seo = TOOL_SEO[toolId];
  const content = TOOL_CONTENT[toolId];
  const toolUrl = `${SITE_URL}/tools/${slug}`;

  const faqSchema = content?.faq?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: content.faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
      }
    : null;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: TOOL_CATEGORY[toolId], item: `${SITE_URL}/#tools-section` },
      { '@type': 'ListItem', position: 3, name: seo.title, item: toolUrl },
    ],
  };

  const toolAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: seo.title,
    url: toolUrl,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: seo.description,
    isPartOf: { '@type': 'WebSite', name: 'RAW Developer Toolkit', url: SITE_URL },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolAppSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <ToolPageClient toolId={toolId} />
    </>
  );
}
