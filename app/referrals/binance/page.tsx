import { ExternalLink, Shield, TrendingUp, Star, Gift, AlertTriangle, CheckCircle, Crown } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Binance Exchange Referral Code 2024 | 37646719 Bonus - SHIBMETRICS",
  description: "Binance referral code: 37646719. Join the world's largest crypto exchange with exclusive bonuses, 20% fee discount. Trade SHIB and 350+ cryptocurrencies.",
  keywords: "Binance referral code, Binance bonus, 37646719, Binance SHIB trading, crypto exchange bonus, world largest exchange",
  openGraph: {
    title: "Binance Exchange - 37646719 Referral Code | World's Largest",
    description: "Join Binance, the world's largest crypto exchange, with exclusive referral code and bonuses",
    type: "website",
    url: "https://shibmetrics.com/referrals/binance",
  },
  twitter: {
    card: "summary_large_image",
    title: "Binance Exchange - 37646719 Referral Code | World's Largest",
    description: "Join Binance, the world's largest crypto exchange, with exclusive referral code and bonuses",
  },
};

export default function BinanceReferralPage() {
  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="text-6xl mr-4">🟡</div>
            <h1 className="text-4xl font-bold text-white">Binance Exchange</h1>
          </div>
          <p className="text-xl text-gray-400 mb-6">
            World&apos;s largest cryptocurrency exchange by trading volume with comprehensive features
          </p>
          
          {/* Main CTA */}
          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl p-6 mb-8">
            <div className="text-white text-center">
              <h2 className="text-2xl font-bold mb-2">World&apos;s Largest Exchange</h2>
              <div className="text-lg mb-4">
                <span className="bg-black/20 px-4 py-2 rounded-lg font-mono">37646719</span>
              </div>
              <a
                href="https://accounts.binance.com/en-GB/register?ref=37646719"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-white text-yellow-600 font-bold rounded-lg hover:bg-gray-100 transition-colors text-lg"
              >
                Join Binance with 37646719
                <ExternalLink className="h-5 w-5 ml-2" />
              </a>
              <p className="text-sm mt-3 opacity-90">
                20% fee discount • 125x leverage • 350+ cryptocurrencies
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <Crown className="h-8 w-8 text-yellow-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Market Leader</h3>
            <p className="text-gray-300">World&apos;s largest exchange by trading volume</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <Shield className="h-8 w-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Comprehensive Features</h3>
            <p className="text-gray-300">Spot, futures, options, NFTs, and more</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <TrendingUp className="h-8 w-8 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">High Liquidity</h3>
            <p className="text-gray-300">Deepest liquidity and best spreads</p>
          </div>
        </div>

        {/* SHIB Trading Info */}
        <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center">
            <span className="mr-2">🐕</span>
            SHIB Trading on Binance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
            <div>
              <span className="text-gray-400">SHIB Pairs:</span>
              <p>SHIB/USDT, SHIB/BTC, SHIB/EUR, futures</p>
            </div>
            <div>
              <span className="text-gray-400">Max Leverage:</span>
              <p>Up to 125x on futures</p>
            </div>
            <div>
              <span className="text-gray-400">Trading Fees:</span>
              <p>20% discount with referral code</p>
            </div>
            <div>
              <span className="text-gray-400">Features:</span>
              <p>Spot, futures, options, earn</p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center bg-gray-800 rounded-lg p-8 border border-gray-700">
          <h3 className="text-2xl font-bold text-white mb-4">Join the World&apos;s Largest Exchange</h3>
          <p className="text-gray-300 mb-6">
            Trade on Binance with the most comprehensive features and deepest liquidity
          </p>
          
          <div className="bg-gray-900 rounded-lg p-4 mb-6 inline-block">
            <span className="text-gray-400 text-sm">Referral Code:</span>
            <div className="text-xl font-mono text-yellow-400 font-bold">37646719</div>
          </div>
          
          <div className="space-y-4">
            <a
              href="https://accounts.binance.com/en-GB/register?ref=37646719"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg transition-colors text-lg"
            >
              Create Binance Account
              <ExternalLink className="h-5 w-5 ml-2" />
            </a>
            
            <div className="text-sm text-gray-400">
              <Link href="/referrals" className="text-yellow-400 hover:text-yellow-300">
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
