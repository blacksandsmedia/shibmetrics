import { ExternalLink, Shield, TrendingUp, Percent, Star, Gift, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "MEXC Exchange Referral Code 2024 | Get $28,100 USDT Bonus - SHIBMETRICS",
  description: "Exclusive MEXC referral code: 13sJU. Get up to $28,100 USDT bonus, 50% fee discount, 500x leverage. Trade SHIB and 2,100+ cryptocurrencies.",
  keywords: "MEXC referral code, MEXC bonus, 13sJU, MEXC trading discount, MEXC SHIB trading, crypto exchange bonus",
  openGraph: {
    title: "MEXC Exchange - $28,100 USDT Bonus with Referral Code",
    description: "Join MEXC with exclusive referral code and get massive bonuses plus 50% trading fee discount",
    type: "website",
    url: "https://shibmetrics.com/referrals/mexc",
  },
  twitter: {
    card: "summary_large_image",
    title: "MEXC Exchange - $28,100 USDT Bonus with Referral Code",
    description: "Join MEXC with exclusive referral code and get massive bonuses plus 50% trading fee discount",
  },
};

export default function MEXCReferralPage() {
  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="text-6xl mr-4">🟡</div>
            <h1 className="text-4xl font-bold text-white">MEXC Exchange</h1>
          </div>
          <p className="text-xl text-gray-400 mb-6">
            Join MEXC with our exclusive referral code and get up to $28,100 USDT in bonuses
          </p>
          
          {/* Main CTA */}
          <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 mb-8">
            <div className="text-white text-center">
              <h2 className="text-2xl font-bold mb-2">Exclusive ShibMetrics Offer</h2>
              <div className="text-lg mb-4">
                <span className="bg-black/20 px-4 py-2 rounded-lg font-mono">13sJU</span>
              </div>
              <a
                href="https://www.mexc.com/register?inviteCode=13sJU"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-white text-orange-600 font-bold rounded-lg hover:bg-gray-100 transition-colors text-lg"
              >
                Sign Up Now & Get $28,100 USDT
                <ExternalLink className="h-5 w-5 ml-2" />
              </a>
              <p className="text-sm mt-3 opacity-90">
                50% off trading fees • 500x leverage • 2,100+ cryptocurrencies
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <Gift className="h-8 w-8 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Huge Sign-Up Bonus</h3>
            <p className="text-gray-300">Get up to $28,100 USDT in welcome bonuses when you register</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <Percent className="h-8 w-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">50% Fee Discount</h3>
            <p className="text-gray-300">Save on all trading fees with our exclusive referral code</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <TrendingUp className="h-8 w-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">500x Leverage</h3>
            <p className="text-gray-300">Access high leverage trading on thousands of pairs</p>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* About MEXC */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">About MEXC</h3>
            <p className="text-gray-300 mb-4">
              MEXC is one of the world&apos;s leading cryptocurrency exchanges, offering an extensive selection of over 2,100 cryptocurrencies including SHIB. Known for its competitive trading fees, advanced trading features, and high leverage options.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 mr-3" />
                <span className="text-white">4.8/5 Rating</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-green-400 mr-3" />
                <span className="text-white">Regulated & Secure</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-blue-400 mr-3" />
                <span className="text-white">2,100+ Cryptocurrencies</span>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Key Features</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-green-400">Pros</h4>
                <ul className="text-gray-300 text-sm space-y-1 mt-2">
                  <li>• Huge selection of cryptocurrencies</li>
                  <li>• Very competitive trading fees</li>
                  <li>• High leverage up to 500x</li>
                  <li>• Strong security measures</li>
                  <li>• Advanced trading tools</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-yellow-400">Considerations</h4>
                <ul className="text-gray-300 text-sm space-y-1 mt-2">
                  <li>• KYC verification required</li>
                  <li>• Interface can be complex for beginners</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* SHIB Trading Info */}
        <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-orange-400 mb-4 flex items-center">
            <span className="mr-2">🐕</span>
            SHIB Trading on MEXC
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
            <div>
              <span className="text-gray-400">SHIB Pairs:</span>
              <p>SHIB/USDT, SHIB/BTC, SHIB/ETH</p>
            </div>
            <div>
              <span className="text-gray-400">Max Leverage:</span>
              <p>Up to 500x on SHIB futures</p>
            </div>
            <div>
              <span className="text-gray-400">Trading Fees:</span>
              <p>0.2% (50% off with referral)</p>
            </div>
            <div>
              <span className="text-gray-400">Min Order:</span>
              <p>10 USDT equivalent</p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center bg-gray-800 rounded-lg p-8 border border-gray-700">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Trading SHIB?</h3>
          <p className="text-gray-300 mb-6">
            Use our exclusive referral code to unlock the best bonuses and trading conditions on MEXC
          </p>
          
          <div className="bg-gray-900 rounded-lg p-4 mb-6 inline-block">
            <span className="text-gray-400 text-sm">Referral Code:</span>
            <div className="text-xl font-mono text-orange-400 font-bold">13sJU</div>
          </div>
          
          <div className="space-y-4">
            <a
              href="https://www.mexc.com/register?inviteCode=13sJU"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors text-lg"
            >
              Create MEXC Account
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
              <strong>Risk Warning:</strong> Cryptocurrency trading involves substantial risk and may not be suitable for all investors. 
              High leverage can work against you as well as for you. Please ensure you understand the risks involved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 