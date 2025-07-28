import { ExternalLink, Shield, TrendingUp, Percent, Star, Gift, AlertTriangle, CheckCircle, UserX, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function BlofinReferralPage() {
  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="text-6xl mr-4">🟢</div>
            <h1 className="text-4xl font-bold text-white">Blofin Exchange</h1>
          </div>
          <p className="text-xl text-gray-400 mb-6">
            Professional derivatives trading with advanced tools - get up to $8,500 USDT
          </p>
          
          {/* Main CTA */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 mb-8">
            <div className="text-white text-center">
              <h2 className="text-2xl font-bold mb-2">Professional Trading Platform</h2>
              <div className="text-lg mb-4">
                <span className="bg-black/20 px-4 py-2 rounded-lg font-mono">shibmetrics-BLOFIN</span>
              </div>
              <a
                href="https://blofin.com/register?code=shibmetrics-BLOFIN"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-white text-green-600 font-bold rounded-lg hover:bg-gray-100 transition-colors text-lg"
              >
                Join Blofin & Get $8,500 USDT
                <ExternalLink className="h-5 w-5 ml-2" />
              </a>
              <p className="text-sm mt-3 opacity-90">
                125x leverage • Advanced tools • No KYC required
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <BarChart3 className="h-8 w-8 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Advanced Trading Tools</h3>
            <p className="text-gray-300">Professional-grade tools for sophisticated trading strategies</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <UserX className="h-8 w-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No KYC Required</h3>
            <p className="text-gray-300">Start trading immediately without identity verification</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <TrendingUp className="h-8 w-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">125x Leverage</h3>
            <p className="text-gray-300">High leverage for experienced derivatives traders</p>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* About Blofin */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">About Blofin</h3>
            <p className="text-gray-300 mb-4">
              Blofin specializes in derivatives trading with sophisticated tools for professional traders. 
              Offers competitive rates, good liquidity, and doesn&apos;t require KYC for most trading activities.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 mr-3" />
                <span className="text-white">4.5/5 Rating</span>
              </div>
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 text-green-400 mr-3" />
                <span className="text-white">Professional Tools</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-blue-400 mr-3" />
                <span className="text-white">Good Liquidity</span>
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
                  <li>• Professional trading tools</li>
                  <li>• No KYC requirements</li>
                  <li>• Good market liquidity</li>
                  <li>• Competitive trading fees</li>
                  <li>• Advanced order types</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-yellow-400">Considerations</h4>
                <ul className="text-gray-300 text-sm space-y-1 mt-2">
                  <li>• Focus on derivatives trading</li>
                  <li>• Not ideal for beginners</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* SHIB Trading Info */}
        <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-green-400 mb-4 flex items-center">
            <span className="mr-2">🐕</span>
            SHIB Trading on Blofin
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
            <div>
              <span className="text-gray-400">SHIB Pairs:</span>
              <p>SHIB/USDT futures, SHIB/USD perpetual</p>
            </div>
            <div>
              <span className="text-gray-400">Max Leverage:</span>
              <p>Up to 125x on SHIB futures</p>
            </div>
            <div>
              <span className="text-gray-400">Trading Fees:</span>
              <p>Reduced maker/taker fees</p>
            </div>
            <div>
              <span className="text-gray-400">Min Order:</span>
              <p>1 USDT equivalent</p>
            </div>
          </div>
        </div>

        {/* Professional Tools */}
        <div className="bg-gradient-to-r from-gray-900/50 to-green-900/20 border border-gray-500/30 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-300 mb-4 flex items-center">
            <BarChart3 className="h-6 w-6 mr-2" />
            Professional Trading Features
          </h3>
          <div className="text-white space-y-2">
            <p>✅ Advanced charting and technical analysis</p>
            <p>✅ Multiple order types (limit, market, stop-loss)</p>
            <p>✅ Portfolio management tools</p>
            <p>✅ Risk management features</p>
            <p>✅ API access for algorithmic trading</p>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center bg-gray-800 rounded-lg p-8 border border-gray-700">
          <h3 className="text-2xl font-bold text-white mb-4">Ready for Professional SHIB Trading?</h3>
          <p className="text-gray-300 mb-6">
            Join Blofin and access advanced derivatives trading tools for SHIB and other cryptocurrencies
          </p>
          
          <div className="bg-gray-900 rounded-lg p-4 mb-6 inline-block">
            <span className="text-gray-400 text-sm">Referral Code:</span>
            <div className="text-xl font-mono text-green-400 font-bold">shibmetrics-BLOFIN</div>
          </div>
          
          <div className="space-y-4">
            <a
              href="https://blofin.com/register?code=shibmetrics-BLOFIN"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors text-lg"
            >
              Start Professional Trading
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
              <strong>Professional Trading Warning:</strong> Derivatives trading involves substantial risk and is suitable for experienced traders only. 
              High leverage can amplify both profits and losses. Ensure you understand the risks before trading.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 