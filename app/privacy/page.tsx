import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - banana.fyi",
  description: "Privacy Policy for banana.fyi",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to app
        </Link>

        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>

        <div className="prose prose-invert prose-zinc max-w-none">
          <p className="text-white/70 text-lg mb-6">
            Last updated: January 26, 2025
          </p>

          <p className="text-white/60 mb-8">
            This Privacy Policy explains how banana.fyi (&quot;we,&quot; &quot;us,&quot; or &quot;the Service&quot;) collects, uses, and protects your information. We are committed to protecting your privacy and being transparent about our data practices.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>

            <h3 className="text-lg font-medium text-white/80 mb-3">Account Information</h3>
            <p className="text-white/60 mb-4">
              When you create an account, we collect:
            </p>
            <ul className="list-disc list-inside text-white/60 mb-4 space-y-2">
              <li><strong>Email address:</strong> Used for authentication and account recovery</li>
              <li><strong>Password:</strong> Stored securely using industry-standard hashing (we never see your plain-text password)</li>
            </ul>

            <h3 className="text-lg font-medium text-white/80 mb-3">Content You Create</h3>
            <p className="text-white/60 mb-4">
              When you use the Service with an account, we store:
            </p>
            <ul className="list-disc list-inside text-white/60 mb-4 space-y-2">
              <li><strong>Presentations:</strong> Topics, slide content, and settings you create</li>
              <li><strong>Generated images:</strong> AI-generated images for your slides</li>
              <li><strong>Uploaded images:</strong> Any images you attach for context</li>
            </ul>

            <h3 className="text-lg font-medium text-white/80 mb-3">Automatically Collected Information</h3>
            <p className="text-white/60 mb-4">
              We may collect basic usage information through our hosting provider (Vercel), including:
            </p>
            <ul className="list-disc list-inside text-white/60 mb-4 space-y-2">
              <li>IP address (for security and abuse prevention)</li>
              <li>Browser type and version</li>
              <li>Pages visited and time spent</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Do NOT Collect</h2>
            <p className="text-white/60 mb-4">
              We want to be clear about what we do not collect or store:
            </p>
            <ul className="list-disc list-inside text-white/60 mb-4 space-y-2">
              <li><strong>Google AI API Key:</strong> Your API key is stored only in your browser&apos;s cookies. It is never transmitted to or stored on our servers. API calls go directly from your browser to Google.</li>
              <li><strong>Payment information:</strong> We do not process payments or store financial data.</li>
              <li><strong>Precise location:</strong> We do not collect GPS or precise location data.</li>
              <li><strong>Contact lists:</strong> We do not access your contacts or address book.</li>
              <li><strong>Tracking across sites:</strong> We do not use third-party tracking or advertising cookies.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
            <p className="text-white/60 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-white/60 mb-4 space-y-2">
              <li><strong>Provide the Service:</strong> Store and display your presentations, authenticate your account</li>
              <li><strong>Improve the Service:</strong> Understand how users interact with features to make improvements</li>
              <li><strong>Security:</strong> Detect and prevent fraud, abuse, and security incidents</li>
              <li><strong>Communications:</strong> Send important service-related messages (password resets, security alerts)</li>
            </ul>
            <p className="text-white/60 mb-4">
              We do not sell your data. We do not use your content to train AI models. We do not share your information with third parties for marketing purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">4. Data Storage and Security</h2>

            <h3 className="text-lg font-medium text-white/80 mb-3">Where We Store Data</h3>
            <p className="text-white/60 mb-4">
              Your data is stored using Supabase, which provides enterprise-grade security:
            </p>
            <ul className="list-disc list-inside text-white/60 mb-4 space-y-2">
              <li><strong>Database:</strong> PostgreSQL database hosted on Supabase&apos;s secure infrastructure</li>
              <li><strong>Images:</strong> Supabase Storage with access controls ensuring only you can access your images</li>
              <li><strong>Authentication:</strong> Supabase Auth with secure session management</li>
            </ul>

            <h3 className="text-lg font-medium text-white/80 mb-3">Security Measures</h3>
            <p className="text-white/60 mb-4">
              We implement appropriate security measures including:
            </p>
            <ul className="list-disc list-inside text-white/60 mb-4 space-y-2">
              <li>HTTPS encryption for all data in transit</li>
              <li>Encryption at rest for stored data</li>
              <li>Secure password hashing</li>
              <li>Row-level security policies ensuring users can only access their own data</li>
              <li>Regular security updates and monitoring</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">5. Third-Party Services</h2>
            <p className="text-white/60 mb-4">
              We use the following third-party services, each with their own privacy policies:
            </p>
            <ul className="list-disc list-inside text-white/60 mb-4 space-y-2">
              <li>
                <strong>Google AI (Gemini):</strong> Powers AI generation using your API key. Your prompts and generated content are subject to{" "}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">Google&apos;s Privacy Policy</a>.
              </li>
              <li>
                <strong>Supabase:</strong> Provides authentication and data storage. See{" "}
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">Supabase Privacy Policy</a>.
              </li>
              <li>
                <strong>Vercel:</strong> Hosts the Service. See{" "}
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">Vercel Privacy Policy</a>.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">6. Cookies</h2>
            <p className="text-white/60 mb-4">
              We use a minimal number of cookies:
            </p>
            <ul className="list-disc list-inside text-white/60 mb-4 space-y-2">
              <li><strong>Authentication cookies:</strong> Essential cookies to keep you logged in</li>
              <li><strong>API key cookie:</strong> Stores your Google AI API key locally (httpOnly, secure)</li>
            </ul>
            <p className="text-white/60 mb-4">
              We do not use:
            </p>
            <ul className="list-disc list-inside text-white/60 mb-4 space-y-2">
              <li>Third-party tracking cookies</li>
              <li>Advertising cookies</li>
              <li>Analytics cookies that track you across sites</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">7. Data Retention</h2>
            <p className="text-white/60 mb-4">
              We retain your data as follows:
            </p>
            <ul className="list-disc list-inside text-white/60 mb-4 space-y-2">
              <li><strong>Account data:</strong> Retained while your account is active</li>
              <li><strong>Presentations and images:</strong> Retained until you delete them or delete your account</li>
              <li><strong>Deleted content:</strong> Permanently removed from our systems within 30 days</li>
              <li><strong>Inactive accounts:</strong> May be deleted after 12 months of inactivity (with prior notice)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">8. Your Rights</h2>
            <p className="text-white/60 mb-4">
              You have the following rights regarding your data:
            </p>
            <ul className="list-disc list-inside text-white/60 mb-4 space-y-2">
              <li><strong>Access:</strong> View all data associated with your account</li>
              <li><strong>Correction:</strong> Update your account information at any time</li>
              <li><strong>Deletion:</strong> Delete individual presentations or your entire account</li>
              <li><strong>Export:</strong> Download your presentations as PDF or image files</li>
              <li><strong>Portability:</strong> Request a copy of your data in a standard format</li>
            </ul>
            <p className="text-white/60 mb-4">
              To exercise these rights, you can use the features within the Service or contact us at{" "}
              <a href="mailto:hello@banana.fyi" className="text-white hover:underline">hello@banana.fyi</a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">9. Children&apos;s Privacy</h2>
            <p className="text-white/60 mb-4">
              The Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately and we will delete it.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">10. International Data Transfers</h2>
            <p className="text-white/60 mb-4">
              Your data may be processed in countries other than your own. Our service providers (Supabase, Vercel) operate globally and may transfer data internationally. By using the Service, you consent to such transfers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to This Policy</h2>
            <p className="text-white/60 mb-4">
              We may update this Privacy Policy from time to time. If we make material changes, we will:
            </p>
            <ul className="list-disc list-inside text-white/60 mb-4 space-y-2">
              <li>Update the &quot;Last updated&quot; date at the top of this page</li>
              <li>Notify registered users via email for significant changes</li>
              <li>Post a notice on the Service</li>
            </ul>
            <p className="text-white/60 mb-4">
              Your continued use of the Service after changes indicates acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">12. Contact Us</h2>
            <p className="text-white/60 mb-4">
              If you have questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p className="text-white/60 mb-4">
              <a href="mailto:hello@banana.fyi" className="text-white hover:underline">
                hello@banana.fyi
              </a>
            </p>
            <p className="text-white/60 mb-4">
              We will respond to privacy-related inquiries within 30 days.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
