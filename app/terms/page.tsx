export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-orange-500 mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg prose-invert max-w-none space-y-6">
          <p className="text-gray-300">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-300">
              By accessing and using ShibMetrics (shibmetrics.com), you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
            <p className="text-gray-300">
              ShibMetrics is a blockchain data analytics platform that provides real-time tracking and analysis of 
              SHIB token burn transactions on the Ethereum blockchain. Our service includes:
            </p>
            <ul className="list-disc list-inside text-gray-300 ml-4">
              <li>Real-time burn transaction monitoring</li>
              <li>Historical burn data and analytics</li>
              <li>Burn rate calculations and statistics</li>
              <li>Market data and exchange information</li>
              <li>API endpoints for data access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Use License</h2>
            <p className="text-gray-300">
              Permission is granted to temporarily download one copy of ShibMetrics' materials for personal, 
              non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside text-gray-300 ml-4">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on the website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Use automated scripts or bots to excessively access our API</li>
            </ul>
            <p className="text-gray-300 mt-4">
              This license shall automatically terminate if you violate any of these restrictions and may be terminated 
              by ShibMetrics at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Disclaimer</h2>
            <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4 my-4">
              <p className="text-yellow-200 font-semibold">⚠️ IMPORTANT DISCLAIMER</p>
            </div>
            <p className="text-gray-300">
              The information provided by ShibMetrics is for informational purposes only and should not be considered 
              as financial, investment, or trading advice. ShibMetrics:
            </p>
            <ul className="list-disc list-inside text-gray-300 ml-4">
              <li>Does not provide financial or investment advice</li>
              <li>Is not a financial advisor or investment service</li>
              <li>Does not guarantee the accuracy or completeness of data</li>
              <li>Is not responsible for any investment decisions made based on our data</li>
              <li>Displays publicly available blockchain data "as is"</li>
            </ul>
            <p className="text-gray-300 mt-4">
              <strong>Always conduct your own research and consult with qualified financial advisors before making any investment decisions.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Data Accuracy and Limitations</h2>
            <p className="text-gray-300">
              While we strive to provide accurate and up-to-date information, ShibMetrics:
            </p>
            <ul className="list-disc list-inside text-gray-300 ml-4">
              <li>Does not guarantee the accuracy, completeness, or timeliness of any data</li>
              <li>May experience delays or interruptions in data updates</li>
              <li>Relies on third-party APIs and blockchain networks</li>
              <li>May display cached or delayed information</li>
              <li>Does not warrant uninterrupted service availability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. User Conduct</h2>
            <p className="text-gray-300">You agree not to:</p>
            <ul className="list-disc list-inside text-gray-300 ml-4">
              <li>Use our service for any unlawful purpose or activity</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Use automated tools to access our API beyond reasonable limits</li>
              <li>Reproduce, duplicate, or resell our content without permission</li>
              <li>Transmit any malicious code or harmful content</li>
              <li>Impersonate ShibMetrics or falsely claim affiliation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. API Usage</h2>
            <p className="text-gray-300">
              If you access our API endpoints, you agree to:
            </p>
            <ul className="list-disc list-inside text-gray-300 ml-4">
              <li>Respect rate limits and usage guidelines</li>
              <li>Not overload our servers with excessive requests</li>
              <li>Properly attribute data when redistributing</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
            <p className="text-gray-300 mt-4">
              We reserve the right to limit, suspend, or terminate API access at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Intellectual Property</h2>
            <p className="text-gray-300">
              The service and its original content, features, and functionality are and will remain the exclusive 
              property of ShibMetrics and its licensors. The service is protected by copyright, trademark, and other laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-300">
              In no event shall ShibMetrics, nor its directors, employees, partners, agents, suppliers, or affiliates, 
              be liable for any indirect, incidental, punitive, consequential, or special damages, including without 
              limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
            </p>
            <ul className="list-disc list-inside text-gray-300 ml-4">
              <li>Your use or inability to use the service</li>
              <li>Any unauthorized access to your data</li>
              <li>Any interruption or cessation of transmission to or from our service</li>
              <li>Any bugs, viruses, or harmful code that may be transmitted through our service</li>
              <li>Any errors or omissions in any content or for any loss or damage incurred as a result of the use of any content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Indemnification</h2>
            <p className="text-gray-300">
              You agree to defend, indemnify, and hold harmless ShibMetrics and its affiliates from and against any 
              and all claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including attorney's fees) 
              arising from your use of and access to the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Termination</h2>
            <p className="text-gray-300">
              We may terminate or suspend your access immediately, without prior notice or liability, for any reason whatsoever, 
              including without limitation if you breach the Terms. Upon termination, your right to use the service will cease immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Third-Party Services</h2>
            <p className="text-gray-300">
              Our service may contain links to third-party websites or services that are not owned or controlled by ShibMetrics. 
              We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">13. Changes to Terms</h2>
            <p className="text-gray-300">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, 
              we will try to provide at least 30 days notice prior to any new terms taking effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">14. Governing Law</h2>
            <p className="text-gray-300">
              These Terms shall be interpreted and governed by the laws of the jurisdiction in which ShibMetrics operates, 
              without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">15. Contact Information</h2>
            <p className="text-gray-300">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-800 p-4 rounded-lg mt-4">
              <p className="text-white">Email: legal@shibmetrics.com</p>
              <p className="text-white">Website: shibmetrics.com/contact</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">16. Severability</h2>
            <p className="text-gray-300">
              If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions 
              of these Terms will remain in effect.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
} 