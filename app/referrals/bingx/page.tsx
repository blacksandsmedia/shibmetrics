import { ExternalLink, Shield, TrendingUp, AlertTriangle, Users } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "BingX Exchange Referral Code 2024 | XBONUS Social Trading - SHIBMETRICS",
  description: "BingX referral code: XBONUS. Join BingX for social trading, copy trading, and futures with up to $5,000 USDT bonus. Innovative social trading platform.",
  keywords: "BingX referral code, BingX bonus, XBONUS, social trading, copy trading, BingX SHIB trading, crypto exchange bonus",
  openGraph: {
    title: "BingX Exchange - XBONUS Referral Code | Social Trading Platform",
    description: "Join BingX with exclusive referral code for innovative social trading and copy trading features",
    type: "website",
    url: "https://shibmetrics.com/referrals/bingx",
  },
  twitter: {
    card: "summary_large_image",
    title: "BingX Exchange - XBONUS Referral Code | Social Trading Platform",
    description: "Join BingX with exclusive referral code for innovative social trading and copy trading features",
  },
};

export default function BingXReferralPage() {
  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="text-6xl mr-4">🟠</div>
            <h1 className="text-4xl font-bold text-white">BingX Exchange</h1>
          </div>
          <p className="text-xl text-gray-400 mb-6">
            Social trading platform with copy trading features and community-driven strategies
          </p>
          
          {/* Main CTA */}
          <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 mb-8">
            <div className="text-white text-center">
              <h2 className="text-2xl font-bold mb-2">Social Trading Innovation</h2>
              <div className="text-lg mb-4">
                <span className="bg-black/20 px-4 py-2 rounded-lg font-mono">XBONUS</span>
              </div>
              <a
                href="https://bingx.com/partner/XBONUS"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-white text-orange-600 font-bold rounded-lg hover:bg-gray-100 transition-colors text-lg"
              >
                Join BingX with XBONUS
                <ExternalLink className="h-5 w-5 ml-2" />
              </a>
              <p className="text-sm mt-3 opacity-90">
                $5,000 USDT bonus • 125x leverage • Social trading features
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <Users className="h-8 w-8 text-orange-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Social Trading</h3>
            <p className="text-gray-300">Connect with traders and share strategies</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <Shield className="h-8 w-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Copy Trading</h3>
            <p className="text-gray-300">Follow and copy successful traders automatically</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <TrendingUp className="h-8 w-8 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Community Features</h3>
            <p className="text-gray-300">Learn from trading community and experts</p>
          </div>
        </div>

        {/* Social Trading Features */}
        <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-orange-400 mb-4 flex items-center">
            <Users className="h-6 w-6 mr-2" />
            Social Trading Features
          </h3>
          <div className="text-white space-y-2">
            <p>👥 Follow top-performing traders</p>
            <p>📊 Real-time trading leaderboards</p>
            <p>💬 Trading community and discussions</p>
            <p>🎯 Copy trades with customizable settings</p>
            <p>📱 Mobile-first social trading experience</p>
          </div>
        </div>

        {/* SHIB Trading Info */}
        <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-orange-400 mb-4 flex items-center">
            <span className="mr-2">🐕</span>
            SHIB Social Trading on BingX
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
            <div>
              <span className="text-gray-400">SHIB Pairs:</span>
              <p>SHIB/USDT spot and futures</p>
            </div>
            <div>
              <span className="text-gray-400">Max Leverage:</span>
              <p>Up to 125x on futures</p>
            </div>
            <div>
              <span className="text-gray-400">Copy Trading:</span>
              <p>Follow SHIB trading experts</p>
            </div>
            <div>
              <span className="text-gray-400">Community:</span>
              <p>Join SHIB trading discussions</p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center bg-gray-800 rounded-lg p-8 border border-gray-700">
          <h3 className="text-2xl font-bold text-white mb-4">Join the Trading Community</h3>
          <p className="text-gray-300 mb-6">
            Connect with successful traders and grow your portfolio with social trading on BingX
          </p>
          
          <div className="bg-gray-900 rounded-lg p-4 mb-6 inline-block">
            <span className="text-gray-400 text-sm">Referral Code:</span>
            <div className="text-xl font-mono text-orange-400 font-bold">XBONUS</div>
          </div>
          
          <div className="space-y-4">
            <a
              href="https://bingx.com/partner/XBONUS"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors text-lg"
            >
              Create BingX Account
              <ExternalLink className="h-5 w-5 ml-2" />
            </a>
            
            <div className="text-sm text-gray-400">
              <Link href="/referrals" className="text-orange-400 hover:text-orange-300">
                ← Back to all exchanges
              </Link>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-yellow-200 text-sm">
              <strong>Social Trading Risk:</strong> Copy trading and social trading involve risk and may not be suitable for all investors. 
              Past performance of copied traders does not guarantee future results. Please understand the risks before trading.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
