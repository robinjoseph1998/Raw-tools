import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for RAW Developer Toolkit.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-16 animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Terms of Service</h1>
      <p className="text-[13px] text-zinc-500 mb-10">Last updated: April 27, 2025</p>

      <div className="space-y-8 text-[14px] text-zinc-400 leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-zinc-200 mb-3">Acceptance of Terms</h2>
          <p>
            By accessing and using RAW (<span className="text-zinc-300">rawtools.site</span>), you agree to
            be bound by these Terms of Service. If you do not agree to these terms, please do not use our
            service.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-200 mb-3">Description of Service</h2>
          <p>
            RAW provides free, browser-based developer tools including but not limited to JSON formatting,
            data conversion, encoding/decoding, hashing, image processing, and other utilities. All tools
            run entirely client-side in your browser.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-200 mb-3">Use of Service</h2>
          <p className="mb-3">You agree to use RAW only for lawful purposes. You may not:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Use the service for any illegal or unauthorized purpose</li>
            <li>Attempt to interfere with or disrupt the service</li>
            <li>Attempt to gain unauthorized access to the service or its systems</li>
            <li>Use automated tools to scrape or overload the service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-200 mb-3">Your Data</h2>
          <p>
            All data processing happens locally in your browser. We do not store, transmit, or have access
            to any data you input into our tools. You are solely responsible for the data you process and
            any output generated.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-200 mb-3">Disclaimer of Warranties</h2>
          <p>
            RAW is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind,
            either express or implied. We do not guarantee that the service will be uninterrupted,
            error-free, or that results from the tools will be accurate or reliable. You use the service at
            your own risk.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-200 mb-3">Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, RAW and its creators shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages resulting from your use of or
            inability to use the service.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-200 mb-3">Intellectual Property</h2>
          <p>
            The RAW name, logo, design, and code are the property of their respective owners. You may not
            copy, modify, or distribute any part of the service without permission.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-200 mb-3">Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued use of the service after
            changes constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-200 mb-3">Contact</h2>
          <p>
            If you have questions about these terms, please reach out to us at{' '}
            <span className="text-zinc-300">contact@rawtools.site</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
