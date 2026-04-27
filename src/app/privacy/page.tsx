import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for RAW Developer Toolkit — learn how we handle your data.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-16 animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Privacy Policy</h1>
      <p className="text-[13px] text-zinc-500 mb-10">Last updated: April 27, 2025</p>

      <div className="space-y-8 text-[14px] text-zinc-400 leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-zinc-200 mb-3">Overview</h2>
          <p>
            RAW (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the website{' '}
            <span className="text-zinc-300">rawtools.site</span>. We are committed to protecting your
            privacy. This policy explains what information we collect, how we use it, and your rights.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-200 mb-3">Data Processing</h2>
          <p>
            All tools on RAW run <span className="text-zinc-300 font-medium">entirely in your browser</span>.
            Your data &mdash; JSON, tokens, images, text, or any other input &mdash; is never sent to our
            servers. We do not store, log, or have access to any content you process using our tools.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-200 mb-3">Information We Collect</h2>
          <p className="mb-3">We collect minimal, non-personal information through third-party services:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <span className="text-zinc-300 font-medium">Google Analytics</span> &mdash; We use Google
              Analytics to understand how visitors use our site (page views, device type, country). This data
              is aggregated and anonymous. Google may set cookies on your browser. See{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                Google&apos;s Privacy Policy
              </a>.
            </li>
            <li>
              <span className="text-zinc-300 font-medium">Google AdSense</span> &mdash; We use Google AdSense
              to display ads. Google may use cookies and tracking technologies to serve personalized ads based
              on your browsing history. See{' '}
              <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                How Google uses information from sites that use its services
              </a>.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-200 mb-3">Cookies</h2>
          <p>
            We do not set any first-party cookies. Third-party services (Google Analytics and Google AdSense)
            may set cookies on your browser. You can control cookie behavior through your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-200 mb-3">Local Storage</h2>
          <p>
            We use your browser&apos;s local storage to save preferences such as recently used tools. This
            data never leaves your device and can be cleared through your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-200 mb-3">Third-Party Links</h2>
          <p>
            Our site may contain links to third-party websites. We are not responsible for the privacy
            practices of those sites.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-200 mb-3">Children&apos;s Privacy</h2>
          <p>
            Our service is not directed at children under 13. We do not knowingly collect personal
            information from children.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-200 mb-3">Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. Changes will be posted on this page with an
            updated date.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-200 mb-3">Contact</h2>
          <p>
            If you have questions about this privacy policy, please reach out to us at{' '}
            <span className="text-zinc-300">contact@rawtools.site</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
