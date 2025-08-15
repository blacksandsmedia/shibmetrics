import { ExternalLink, Shield, TrendingUp, Star, Gift, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Bybit Exchange Referral Code 2024 | BYBONUS Exclusive Bonus - SHIBMETRICS",
  description: "Bybit referral code: BYBONUS. Join the world's leading crypto derivatives exchange with exclusive bonuses. Trade SHIB futures, spot, and options with advanced tools.",
  keywords: "Bybit referral code, BYBONUS, Bybit bonus, Bybit SHIB trading, crypto derivatives, Bybit futures trading, crypto exchange bonus",
  openGraph: {
    title: "Bybit Exchange - BYBONUS Referral Code | Leading Derivatives Exchange",
    description: "Join Bybit with exclusive BYBONUS referral code for advanced crypto derivatives trading",
    type: "website",
    url: "https://shibmetrics.com/referrals/bybit",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bybit Exchange - BYBONUS Referral Code | Leading Derivatives Exchange",
    description: "Join Bybit with exclusive BYBONUS referral code for advanced crypto derivatives trading",
  },
};

export default function BybitReferralPage() {
  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="text-6xl mr-4">🟡</div>
            <h1 className="text-4xl font-bold text-white">Bybit Exchange</h1>
          </div>
          <p className="text-xl text-gray-400 mb-6">
            World's leading crypto derivatives exchange - join with exclusive BYBONUS referral code
          </p>
          
          {/* Main CTA */}
          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl p-6 mb-8">
            <div className="text-white text-center">
              <h2 className="text-2xl font-bold mb-2">Leading Derivatives Exchange</h2>
              <div className="text-lg mb-4">
                <span className="bg-black/20 px-4 py-2 rounded-lg font-mono">BYBONUS</span>
              </div>
              <a
                href="https://www.bybit.com/en/register?ref=BYBONUS"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-white text-yellow-600 font-bold rounded-lg hover:bg-gray-100 transition-colors text-lg"
              >
                Join Bybit with BYBONUS
                <ExternalLink className="h-5 w-5 ml-2" />
              </a>
              <p className="text-sm mt-3 opacity-90">
                Advanced trading tools • Institutional grade • Global leader
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <BarChart3 className="h-8 w-8 text-yellow-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Advanced Trading Tools</h3>
            <p className="text-gray-300">Professional-grade tools for sophisticated trading strategies</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <Shield className="h-8 w-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Institutional Grade Security</h3>
            <p className="text-gray-300">Bank-level security with multi-signature cold storage</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <TrendingUp className="h-8 w-8 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Market Leader</h3>
            <p className="text-gray-300">One of the world's largest crypto derivatives exchanges</p>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* About Bybit */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">About Bybit</h3>
            <p className="text-gray-300 mb-4">
              Bybit is one of the world's leading cryptocurrency derivatives exchanges, serving over 15 million users globally. 
              Known for its advanced trading tools, high liquidity, and institutional-grade security.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 mr-3" />
                <span className="text-white">4.7/5 Rating</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-blue-400 mr-3" />
                <span className="text-white">Institutional Security</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                <span className="text-white">15M+ Users</span>
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
                  <li>• Advanced trading interface</li>
                  <li>• High liquidity and tight spreads</li>
                  <li>• Comprehensive product suite</li>
                  <li>• Strong institutional backing</li>
                  <li>• 24/7 customer support</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-yellow-400">Considerations</h4>
                <ul className="text-gray-300 text-sm space-y-1 mt-2">
                  <li>• KYC verification required</li>
                  <li>• Complex interface for beginners</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* SHIB Trading Info */}
        <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center">
            <span className="mr-2">🐕</span>
            SHIB Trading on Bybit
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
            <div>
              <span className="text-gray-400">SHIB Pairs:</span>
              <p>SHIB/USDT spot, SHIB/USDT perpetual</p>
            </div>
            <div>
              <span className="text-gray-400">Max Leverage:</span>
              <p>Up to 50x on SHIB perpetual</p>
            </div>
            <div>
              <span className="text-gray-400">Trading Fees:</span>
              <p>Competitive maker/taker fees</p>
            </div>
            <div>
              <span className="text-gray-400">Min Order:</span>
              <p>1 USDT equivalent</p>
            </div>
          </div>
        </div>

        {/* Professional Features */}
        <div className="bg-gradient-to-r from-gray-900/50 to-yellow-900/20 border border-gray-500/30 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-300 mb-4 flex items-center">
            <BarChart3 className="h-6 w-6 mr-2" />
            Professional Trading Features
          </h3>
          <div className="text-white space-y-2">
            <p>✅ Spot, futures, and options trading</p>
            <p>✅ Advanced order types and strategies</p>
            <p>✅ Portfolio margin and risk management</p>
            <p>✅ Institutional-grade API</p>
            <p>✅ Copy trading and social features</p>
          </div>
        </div>

        {/* Why Choose Bybit */}
        <div className="bg-gradient-to-r from-blue-900/20 to-yellow-900/20 border border-blue-500/30 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-blue-400 mb-4 flex items-center">
            <Shield className="h-6 w-6 mr-2" />
            Why Choose Bybit?
          </h3>
          <div className="text-white space-y-2">
            <p>🏆 Trusted by 15+ million traders worldwide</p>
            <p>🔒 Multi-signature cold storage security</p>
            <p>💎 Deep liquidity and competitive spreads</p>
            <p>🚀 Regular product innovations and updates</p>
            <p>🎯 Dedicated customer support team</p>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center bg-gray-800 rounded-lg p-8 border border-gray-700">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Trade with the Best?</h3>
          <p className="text-gray-300 mb-6">
            Join Bybit today with the exclusive BYBONUS referral code and experience world-class crypto trading
          </p>
          
          <div className="bg-gray-900 rounded-lg p-4 mb-6 inline-block">
            <span className="text-gray-400 text-sm">Referral Code:</span>
            <div className="text-xl font-mono text-yellow-400 font-bold">BYBONUS</div>
          </div>
          
          <div className="space-y-4">
            <a
              href="https://www.bybit.com/en/register?ref=BYBONUS"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg transition-colors text-lg"
            >
              Join Bybit Now
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
              Derivatives trading can result in significant losses. Please ensure you understand the risks before trading.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
