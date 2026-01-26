import Link from "next/link";

export const metadata = {
  title: "Terms of Service - banana.fyi",
  description: "Terms of Service for banana.fyi",
};

export default function TermsPage() {
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

        <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>

        <div className="prose prose-invert prose-zinc max-w-none">
          <p className="text-white/70 text-lg mb-6">
            Last updated: January 26, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-white/60 mb-4">
              By accessing and using banana.fyi (&quot;the Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not access or use the Service.
            </p>
            <p className="text-white/60 mb-4">
              We may update these Terms from time to time. If we make material changes, we will notify you by updating the &quot;Last updated&quot; date above. Your continued use of the Service after any changes indicates your acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
            <p className="text-white/60 mb-4">
              banana.fyi is a web-based presentation generator that uses artificial intelligence to create slide decks. The Service allows you to:
            </p>
            <ul className="list-disc list-inside text-white/60 mb-4 space-y-2">
              <li>Generate presentation outlines and content from topics you provide</li>
              <li>Create AI-generated images for your slides</li>
              <li>Edit, customize, and reorder slides</li>
              <li>Save presentations to your account (requires registration)</li>
              <li>Export presentations as PDF or image files</li>
            </ul>
            <p className="text-white/60 mb-4">
              The Service uses Google&apos;s Gemini AI for text and image generation. You must provide your own Google AI API key to use the generation features.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
            <p className="text-white/60 mb-4">
              You may use the Service without an account, but saving presentations requires registration. When you create an account, you agree to:
            </p>
            <ul className="list-disc list-inside text-white/60 mb-4 space-y-2">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>
            <p className="text-white/60 mb-4">
              We reserve the right to suspend or terminate accounts that violate these Terms or remain inactive for extended periods.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">4. API Key Usage</h2>
            <p className="text-white/60 mb-4">
              The Service requires a Google AI API key to generate content. Regarding your API key:
            </p>
            <ul className="list-disc list-inside text-white/60 mb-4 space-y-2">
              <li><strong>Storage:</strong> Your API key is stored only in your browser&apos;s cookies. It is never transmitted to or stored on our servers.</li>
              <li><strong>Usage:</strong> API calls are made directly from your browser to Google&apos;s servers using your key.</li>
              <li><strong>Costs:</strong> You are solely responsible for any charges incurred through your API key usage with Google.</li>
              <li><strong>Security:</strong> Keep your API key confidential. Do not share it with others.</li>
            </ul>
            <p className="text-white/60 mb-4">
              We are not responsible for any misuse of your API key or charges you may incur from Google.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">5. User Content and Intellectual Property</h2>
            <p className="text-white/60 mb-4">
              <strong>Your Content:</strong> You retain full ownership of the topics, text, and other content you input into the Service. You also retain ownership of the presentations you create.
            </p>
            <p className="text-white/60 mb-4">
              <strong>AI-Generated Content:</strong> Content generated by AI (including text and images) is created using your inputs and your API key. The ownership and licensing of AI-generated content is subject to Google&apos;s terms of service for the Gemini API.
            </p>
            <p className="text-white/60 mb-4">
              <strong>License to Us:</strong> By using the Service, you grant us a limited, non-exclusive license to store and process your content solely to provide the Service to you. We do not claim ownership of your content.
            </p>
            <p className="text-white/60 mb-4">
              <strong>Our Content:</strong> The Service, including its design, code, and branding, is owned by us and protected by intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">6. Acceptable Use</h2>
            <p className="text-white/60 mb-4">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc list-inside text-white/60 mb-4 space-y-2">
              <li>Create content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable</li>
              <li>Generate content that infringes on intellectual property rights of others</li>
              <li>Create misleading content intended to deceive or defraud</li>
              <li>Generate content depicting minors in inappropriate contexts</li>
              <li>Attempt to bypass safety filters or content policies</li>
              <li>Use automated systems to abuse the Service</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
            <p className="text-white/60 mb-4">
              We reserve the right to remove content and suspend accounts that violate these guidelines.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">7. AI-Generated Content Disclaimer</h2>
            <p className="text-white/60 mb-4">
              AI-generated content may be inaccurate, incomplete, or inappropriate. You acknowledge that:
            </p>
            <ul className="list-disc list-inside text-white/60 mb-4 space-y-2">
              <li>AI outputs should not be relied upon as factual without verification</li>
              <li>Generated images may not accurately represent real people, places, or events</li>
              <li>The &quot;absurdity&quot; feature intentionally creates humorous or exaggerated content</li>
              <li>You are responsible for reviewing and editing content before use</li>
              <li>We do not endorse or guarantee the accuracy of any AI-generated content</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">8. Third-Party Services</h2>
            <p className="text-white/60 mb-4">
              The Service integrates with third-party services:
            </p>
            <ul className="list-disc list-inside text-white/60 mb-4 space-y-2">
              <li><strong>Google AI (Gemini):</strong> Powers text and image generation. Subject to Google&apos;s <a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">Gemini API Terms of Service</a>.</li>
              <li><strong>Supabase:</strong> Provides authentication and data storage.</li>
              <li><strong>Vercel:</strong> Hosts the Service.</li>
            </ul>
            <p className="text-white/60 mb-4">
              Your use of these third-party services is subject to their respective terms and privacy policies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">9. Service Availability</h2>
            <p className="text-white/60 mb-4">
              We strive to maintain Service availability but do not guarantee uninterrupted access. The Service may be unavailable due to:
            </p>
            <ul className="list-disc list-inside text-white/60 mb-4 space-y-2">
              <li>Scheduled maintenance or updates</li>
              <li>Technical issues or outages</li>
              <li>Third-party service disruptions (Google AI, Supabase, etc.)</li>
              <li>Circumstances beyond our control</li>
            </ul>
            <p className="text-white/60 mb-4">
              We are not liable for any loss or damage resulting from Service unavailability.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">10. Disclaimer of Warranties</h2>
            <p className="text-white/60 mb-4">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc list-inside text-white/60 mb-4 space-y-2">
              <li>MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE</li>
              <li>ACCURACY, RELIABILITY, OR COMPLETENESS OF CONTENT</li>
              <li>NON-INFRINGEMENT OF THIRD-PARTY RIGHTS</li>
              <li>UNINTERRUPTED, SECURE, OR ERROR-FREE OPERATION</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">11. Limitation of Liability</h2>
            <p className="text-white/60 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc list-inside text-white/60 mb-4 space-y-2">
              <li>Loss of profits, data, or business opportunities</li>
              <li>Costs incurred from third-party services (including Google API charges)</li>
              <li>Damages arising from AI-generated content</li>
              <li>Service interruptions or data loss</li>
            </ul>
            <p className="text-white/60 mb-4">
              Our total liability for any claims arising from these Terms or your use of the Service shall not exceed the amount you paid us (if any) in the twelve months preceding the claim.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">12. Indemnification</h2>
            <p className="text-white/60 mb-4">
              You agree to indemnify and hold us harmless from any claims, damages, losses, or expenses (including legal fees) arising from:
            </p>
            <ul className="list-disc list-inside text-white/60 mb-4 space-y-2">
              <li>Your use of the Service</li>
              <li>Content you create or share using the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">13. Termination</h2>
            <p className="text-white/60 mb-4">
              You may stop using the Service at any time. You may delete your account through the Service or by contacting us.
            </p>
            <p className="text-white/60 mb-4">
              We may suspend or terminate your access to the Service at any time, with or without cause, with or without notice. Reasons for termination may include violations of these Terms, extended inactivity, or discontinuation of the Service.
            </p>
            <p className="text-white/60 mb-4">
              Upon termination, your right to use the Service ceases immediately. We may delete your data, including saved presentations and images.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">14. Governing Law</h2>
            <p className="text-white/60 mb-4">
              These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles. Any disputes arising from these Terms or your use of the Service shall be resolved through good-faith negotiation or, if necessary, binding arbitration.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">15. Severability</h2>
            <p className="text-white/60 mb-4">
              If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">16. Contact</h2>
            <p className="text-white/60 mb-4">
              For questions about these Terms, please contact us at{" "}
              <a href="mailto:hello@banana.fyi" className="text-white hover:underline">
                hello@banana.fyi
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
