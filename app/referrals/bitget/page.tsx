import { ExternalLink, Shield, TrendingUp, Star, Gift, AlertTriangle, CheckCircle, Users } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "92pt - Bitget Referral Code 2024 | $1,000 USDT Copy Trading Bonus - SHIBMETRICS",
  description: "Use Bitget referral code 92pt for $1,000 USDT bonus and copy trading features. Trade SHIB with code 92pt on Bitget's innovative platform with 50% fee discount.",
  keywords: "92pt, Bitget referral code 92pt, 92pt Bitget, Bitget promo code 92pt, 92pt copy trading, Bitget SHIB trading 92pt",
  openGraph: {
    title: "Bitget Exchange - 92pt Referral Code | Copy Trading Leader",
    description: "Join Bitget with exclusive referral code for innovative copy trading and professional features",
    type: "website",
    url: "https://shibmetrics.com/referrals/bitget",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bitget Exchange - 92pt Referral Code | Copy Trading Leader",
    description: "Join Bitget with exclusive referral code for innovative copy trading and professional features",
  },
};

export default function BitgetReferralPage() {
  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="text-6xl mr-4">🔵</div>
            <h1 className="text-4xl font-bold text-white">92pt - Bitget Referral Code</h1>
          </div>
          <p className="text-xl text-gray-400 mb-6">
            Leading crypto derivatives exchange with innovative copy trading features
          </p>
          
          {/* Main CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 mb-8">
            <div className="text-white text-center">
              <h2 className="text-2xl font-bold mb-2">Copy Trading Innovation</h2>
              <div className="text-lg mb-4">
                <span className="bg-black/20 px-4 py-2 rounded-lg font-mono">92pt</span>
              </div>
              <a
                href="https://www.bitget.com/expressly?channelCode=qgog&vipCode=92pt&languageType=0"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-colors text-lg"
              >
                Join Bitget with 92pt
                <ExternalLink className="h-5 w-5 ml-2" />
              </a>
              <p className="text-sm mt-3 opacity-90">
                50% fee discount • 125x leverage • Copy trading features
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <Users className="h-8 w-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Copy Trading</h3>
            <p className="text-gray-300">Follow and copy successful traders automatically</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <Shield className="h-8 w-8 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Professional Tools</h3>
            <p className="text-gray-300">Advanced trading features and analytics</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <TrendingUp className="h-8 w-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">High Leverage</h3>
            <p className="text-gray-300">Up to 125x leverage on futures trading</p>
          </div>
        </div>

        {/* SHIB Trading Info */}
        <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-500/30 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-blue-400 mb-4 flex items-center">
            <span className="mr-2">🐕</span>
            SHIB Trading on Bitget
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
              <span className="text-gray-400">Trading Fees:</span>
              <p>Up to 50% discount with referral</p>
            </div>
            <div>
              <span className="text-gray-400">Copy Trading:</span>
              <p>Follow SHIB trading experts</p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center bg-gray-800 rounded-lg p-8 border border-gray-700">
          <h3 className="text-2xl font-bold text-white mb-4">Start Copy Trading Today</h3>
          <p className="text-gray-300 mb-6">
            Join Bitget and access innovative copy trading features with professional tools
          </p>
          
          <div className="bg-gray-900 rounded-lg p-4 mb-6 inline-block">
            <span className="text-gray-400 text-sm">Referral Code:</span>
            <div className="text-xl font-mono text-blue-400 font-bold">92pt</div>
          </div>
          
          <div className="space-y-4">
            <a
              href="https://www.bitget.com/expressly?channelCode=qgog&vipCode=92pt&languageType=0"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-lg"
            >
              Create Bitget Account
              <ExternalLink className="h-5 w-5 ml-2" />
            </a>
            
            <div className="text-sm text-gray-400">
              <Link href="/referrals" className="text-blue-400 hover:text-blue-300">
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
              <strong>Trading Risk:</strong> Copy trading and cryptocurrency trading involve substantial risk. 
              Past performance does not guarantee future results. Please understand the risks before trading.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
