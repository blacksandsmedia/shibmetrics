'use client';

import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission (replace with actual form handling)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      setSubmitStatus('error');
    }
    
    setIsSubmitting(false);
    setTimeout(() => setSubmitStatus('idle'), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-4xl font-bold text-orange-500 mb-8 text-center">Contact Us</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-6">Get in Touch</h2>
              <p className="text-gray-300 mb-6">
                Have questions about ShibMetrics? Need technical support? Want to suggest a feature? 
                We&apos;d love to hear from you!
              </p>
            </div>

            {/* Contact Methods */}
            <div className="space-y-6">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-orange-400 mb-3">General Inquiries</h3>
                <p className="text-gray-300">📧 info@shibmetrics.com</p>
                <p className="text-gray-300 mt-2">For general questions about our service and platform.</p>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-orange-400 mb-3">Technical Support</h3>
                <p className="text-gray-300">🔧 support@shibmetrics.com</p>
                <p className="text-gray-300 mt-2">Having technical issues? Our support team is here to help.</p>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-orange-400 mb-3">API & Developer Support</h3>
                <p className="text-gray-300">🚀 api@shibmetrics.com</p>
                <p className="text-gray-300 mt-2">Questions about our API, rate limits, or integration support.</p>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-orange-400 mb-3">Business & Partnerships</h3>
                <p className="text-gray-300">🤝 business@shibmetrics.com</p>
                <p className="text-gray-300 mt-2">Interested in partnerships or business opportunities?</p>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-orange-400 mb-3">Legal & Privacy</h3>
                <p className="text-gray-300">⚖️ legal@shibmetrics.com</p>
                <p className="text-gray-300 mt-2">Privacy concerns, legal questions, or compliance matters.</p>
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-orange-900/20 border border-orange-500/30 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-orange-400 mb-3">🚀 Quick Facts</h3>
              <ul className="text-gray-300 space-y-2">
                <li>✅ Real-time SHIB burn tracking</li>
                <li>✅ Historical burn data analytics</li>
                <li>✅ Free API endpoints available</li>
                <li>✅ 24/7 automated monitoring</li>
                <li>✅ Community-driven development</li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-800 p-8 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-6">Send us a Message</h2>
            
            {submitStatus === 'success' && (
              <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-lg mb-6">
                <p className="text-green-400">✅ Thank you! Your message has been sent successfully.</p>
              </div>
            )}
            
            {submitStatus === 'error' && (
              <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg mb-6">
                <p className="text-red-400">❌ Sorry, there was an error sending your message. Please try again.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Question</option>
                  <option value="technical">Technical Support</option>
                  <option value="api">API / Developer Support</option>
                  <option value="feature">Feature Request</option>
                  <option value="bug">Bug Report</option>
                  <option value="business">Business Inquiry</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-600">
              <p className="text-sm text-gray-400">
                📍 <strong>Response Time:</strong> We typically respond within 24-48 hours during business days.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                🌍 <strong>Time Zone:</strong> All support is provided in UTC timezone.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-orange-400 mb-3">How often is burn data updated?</h3>
              <p className="text-gray-300">
                Our system monitors the blockchain 24/7 and updates burn data in real-time as new transactions are confirmed.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-orange-400 mb-3">Is the API free to use?</h3>
              <p className="text-gray-300">
                Yes! We provide free API endpoints with reasonable rate limits. Contact us for higher usage requirements.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-orange-400 mb-3">Can I integrate ShibMetrics data?</h3>
              <p className="text-gray-300">
                Absolutely! We encourage developers to integrate our data. Check our API documentation and terms of service.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-orange-400 mb-3">How accurate is the burn data?</h3>
              <p className="text-gray-300">
                We source data directly from the Ethereum blockchain via verified APIs, ensuring maximum accuracy and transparency.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 