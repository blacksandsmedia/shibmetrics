import { ExternalLink, Shield, TrendingUp, Star, Gift, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "KuCoin Exchange Referral Code 2024 | QBSSSY97 Bonus - SHIBMETRICS",
  description: "KuCoin referral code: QBSSSY97. Join KuCoin with exclusive bonuses, 20% fee discount, 100x leverage. Trade SHIB and 200+ cryptocurrencies with advanced features.",
  keywords: "KuCoin referral code, KuCoin bonus, QBSSSY97, KuCoin SHIB trading, crypto exchange bonus, KuCoin futures",
  openGraph: {
    title: "KuCoin Exchange - QBSSSY97 Referral Code | Advanced Trading",
    description: "Join KuCoin with exclusive referral code for advanced crypto trading features and bonuses",
    type: "website",
    url: "https://shibmetrics.com/referrals/kucoin",
  },
  twitter: {
    card: "summary_large_image",
    title: "KuCoin Exchange - QBSSSY97 Referral Code | Advanced Trading",
    description: "Join KuCoin with exclusive referral code for advanced crypto trading features and bonuses",
  },
};

export default function KuCoinReferralPage() {
  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="text-6xl mr-4">🟢</div>
            <h1 className="text-4xl font-bold text-white">KuCoin Exchange</h1>
          </div>
          <p className="text-xl text-gray-400 mb-6">
            Leading global crypto exchange with advanced trading features and 200+ cryptocurrencies
          </p>
          
          {/* Main CTA */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 mb-8">
            <div className="text-white text-center">
              <h2 className="text-2xl font-bold mb-2">Advanced Trading Platform</h2>
              <div className="text-lg mb-4">
                <span className="bg-black/20 px-4 py-2 rounded-lg font-mono">QBSSSY97</span>
              </div>
              <a
                href="https://www.kucoin.com/ucenter/signup?rcode=QBSSSY97"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-white text-green-600 font-bold rounded-lg hover:bg-gray-100 transition-colors text-lg"
              >
                Join KuCoin with QBSSSY97
                <ExternalLink className="h-5 w-5 ml-2" />
              </a>
              <p className="text-sm mt-3 opacity-90">
                20% fee discount • 100x leverage • 200+ cryptocurrencies
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <BarChart3 className="h-8 w-8 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Advanced Features</h3>
            <p className="text-gray-300">Professional trading tools and innovative products</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <Shield className="h-8 w-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Strong Security</h3>
            <p className="text-gray-300">Bank-level security with cold storage protection</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <TrendingUp className="h-8 w-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">High Liquidity</h3>
            <p className="text-gray-300">Deep liquidity and competitive spreads</p>
          </div>
        </div>

        {/* SHIB Trading Info */}
        <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-green-400 mb-4 flex items-center">
            <span className="mr-2">🐕</span>
            SHIB Trading on KuCoin
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
            <div>
              <span className="text-gray-400">SHIB Pairs:</span>
              <p>SHIB/USDT, SHIB/BTC, SHIB futures</p>
            </div>
            <div>
              <span className="text-gray-400">Max Leverage:</span>
              <p>Up to 100x on futures</p>
            </div>
            <div>
              <span className="text-gray-400">Trading Fees:</span>
              <p>20% discount with referral code</p>
            </div>
            <div>
              <span className="text-gray-400">Min Order:</span>
              <p>1 USDT equivalent</p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center bg-gray-800 rounded-lg p-8 border border-gray-700">
          <h3 className="text-2xl font-bold text-white mb-4">Start Trading on KuCoin</h3>
          <p className="text-gray-300 mb-6">
            Join millions of traders on KuCoin with advanced features and exclusive bonuses
          </p>
          
          <div className="bg-gray-900 rounded-lg p-4 mb-6 inline-block">
            <span className="text-gray-400 text-sm">Referral Code:</span>
            <div className="text-xl font-mono text-green-400 font-bold">QBSSSY97</div>
          </div>
          
          <div className="space-y-4">
            <a
              href="https://www.kucoin.com/ucenter/signup?rcode=QBSSSY97"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors text-lg"
            >
              Create KuCoin Account
              <ExternalLink className="h-5 w-5 ml-2" />
            </a>
            
            <div className="text-sm text-gray-400">
              <Link href="/referrals" className="text-green-400 hover:text-green-300">
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
              <strong>Trading Risk:</strong> Cryptocurrency trading involves substantial risk and may not be suitable for all investors. 
              Please ensure you understand the risks before trading.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
