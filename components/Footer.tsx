import Link from 'next/link';
import { Flame, Twitter, ExternalLink } from 'lucide-react';

interface FooterLink {
  name: string;
  href: string;
  external?: boolean;
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks: Record<string, FooterLink[]> = {
    'Navigation': [
      { name: 'Home', href: '/' },
      { name: 'Burn Tracker', href: '/burn-tracker' },
      { name: 'Burn History', href: '/history' },
      { name: 'Exchange Activity', href: '/exchanges' },
    ],
    'Resources': [
      { name: 'Referral Codes', href: '/referrals' },
      { name: 'API Status', href: '/api-status' },
      { name: 'SHIB Official Site', href: 'https://shibatoken.com', external: true },
    ],
  };

  return (
    <footer className="bg-orange-900 border-t border-orange-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Flame className="h-8 w-8 text-orange-500" />
              <span className="text-xl font-bold text-white">SHIBMETRICS</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              The ultimate destination for Shiba Inu burn tracking, analytics, and ecosystem data. 
              Real-time burn statistics, exchange activity, and comprehensive SHIB metrics.
            </p>
            <div className="inline-flex items-center gap-2 bg-green-900/20 border border-green-500/30 rounded-full px-3 py-1 mb-4">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              <span className="text-green-400 text-xs font-medium">
                🚫 Ad-Free Forever • No Spam • Clean Interface
              </span>
            </div>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com/shibmetrics"
                className="text-gray-400 hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors flex items-center space-x-1"
                      >
                        <span>{link.name}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} SHIBMETRICS. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 