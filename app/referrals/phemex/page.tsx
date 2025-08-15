import { ExternalLink, Shield, TrendingUp, Star, Gift, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Phemex Exchange Referral Code 2024 | GNFLL Zero Fees Bonus - SHIBMETRICS",
  description: "Phemex referral code: GNFLL. Join Phemex for zero-fee spot trading and derivatives with up to $4,000 USDT bonus. High-performance trading engine.",
  keywords: "Phemex referral code, Phemex bonus, GNFLL, zero fees trading, Phemex SHIB trading, crypto exchange bonus",
  openGraph: {
    title: "Phemex Exchange - GNFLL Referral Code | Zero Fees Trading",
    description: "Join Phemex with exclusive referral code for zero-fee spot trading and advanced derivatives",
    type: "website",
    url: "https://shibmetrics.com/referrals/phemex",
  },
  twitter: {
    card: "summary_large_image",
    title: "Phemex Exchange - GNFLL Referral Code | Zero Fees Trading",
    description: "Join Phemex with exclusive referral code for zero-fee spot trading and advanced derivatives",
  },
};

export default function PhemexReferralPage() {
  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="text-6xl mr-4">🔶</div>
            <h1 className="text-4xl font-bold text-white">Phemex Exchange</h1>
          </div>
          <p className="text-xl text-gray-400 mb-6">
            High-performance exchange with zero-fee spot trading and advanced derivatives
          </p>
          
          {/* Main CTA */}
          <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 mb-8">
            <div className="text-white text-center">
              <h2 className="text-2xl font-bold mb-2">Zero Fees Spot Trading</h2>
              <div className="text-lg mb-4">
                <span className="bg-black/20 px-4 py-2 rounded-lg font-mono">GNFLL</span>
              </div>
              <a
                href="https://phemex.com/register?group=970&referralCode=GNFLL"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-white text-orange-600 font-bold rounded-lg hover:bg-gray-100 transition-colors text-lg"
              >
                Join Phemex with GNFLL
                <ExternalLink className="h-5 w-5 ml-2" />
              </a>
              <p className="text-sm mt-3 opacity-90">
                Zero spot trading fees • 100x leverage • $4,000 USDT bonus
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <Zap className="h-8 w-8 text-orange-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Zero Fees</h3>
            <p className="text-gray-300">Zero fees on spot trading for all users</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <Shield className="h-8 w-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">High Performance</h3>
            <p className="text-gray-300">Ultra-fast trading engine and execution</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <TrendingUp className="h-8 w-8 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Web3 Features</h3>
            <p className="text-gray-300">Integration with Web3 and DeFi protocols</p>
          </div>
        </div>

        {/* SHIB Trading Info */}
        <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-orange-400 mb-4 flex items-center">
            <span className="mr-2">🐕</span>
            SHIB Trading on Phemex
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
            <div>
              <span className="text-gray-400">SHIB Pairs:</span>
              <p>SHIB/USDT spot and perpetual</p>
            </div>
            <div>
              <span className="text-gray-400">Max Leverage:</span>
              <p>Up to 100x on perpetual</p>
            </div>
            <div>
              <span className="text-gray-400">Spot Trading:</span>
              <p>Zero fees on SHIB spot trading</p>
            </div>
            <div>
              <span className="text-gray-400">Performance:</span>
              <p>Ultra-fast order execution</p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center bg-gray-800 rounded-lg p-8 border border-gray-700">
          <h3 className="text-2xl font-bold text-white mb-4">Trade with Zero Fees</h3>
          <p className="text-gray-300 mb-6">
            Join Phemex and enjoy zero-fee spot trading with high-performance execution
          </p>
          
          <div className="bg-gray-900 rounded-lg p-4 mb-6 inline-block">
            <span className="text-gray-400 text-sm">Referral Code:</span>
            <div className="text-xl font-mono text-orange-400 font-bold">GNFLL</div>
          </div>
          
          <div className="space-y-4">
            <a
              href="https://phemex.com/register?group=970&referralCode=GNFLL"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors text-lg"
            >
              Create Phemex Account
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
              <strong>Trading Risk:</strong> Cryptocurrency trading involves substantial risk and may not be suitable for all investors. 
              Please ensure you understand the risks before trading.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
