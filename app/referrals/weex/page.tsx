import { ExternalLink, Percent, Star, Gift, AlertTriangle, CheckCircle, UserX } from 'lucide-react';
import Link from 'next/link';

export default function WEEXReferralPage() {
  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="text-6xl mr-4">🔵</div>
            <h1 className="text-4xl font-bold text-white">WEEX Exchange</h1>
          </div>
          <p className="text-xl text-gray-400 mb-6">
            Anonymous trading with no KYC - get up to $30,000 USDT in bonuses
          </p>
          
          {/* Main CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 mb-8">
            <div className="text-white text-center">
              <h2 className="text-2xl font-bold mb-2">Anonymous Trading • No KYC</h2>
              <div className="text-lg mb-4">
                <span className="bg-black/20 px-4 py-2 rounded-lg font-mono">shibmetrics-WEEX</span>
              </div>
              <a
                href="https://weex.com/register?code=shibmetrics-WEEX"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-colors text-lg"
              >
                Sign Up Anonymously & Get $30,000 USDT
                <ExternalLink className="h-5 w-5 ml-2" />
              </a>
              <p className="text-sm mt-3 opacity-90">
                20% cashback • 200x leverage • No identity verification required
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <UserX className="h-8 w-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No KYC Required</h3>
            <p className="text-gray-300">Trade completely anonymously without identity verification</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <Gift className="h-8 w-8 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">$30,000 USDT Bonus</h3>
            <p className="text-gray-300">Massive welcome bonus package for new users</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <Percent className="h-8 w-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">20% Cashback</h3>
            <p className="text-gray-300">Get 20% cashback on all your deposits</p>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* About WEEX */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">About WEEX</h3>
            <p className="text-gray-300 mb-4">
              WEEX offers anonymous trading with no KYC requirements, making it perfect for users who value privacy. 
              Features competitive fees, high leverage, and instant deposits with professional trading tools.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 mr-3" />
                <span className="text-white">4.6/5 Rating</span>
              </div>
              <div className="flex items-center">
                <UserX className="h-5 w-5 text-blue-400 mr-3" />
                <span className="text-white">No KYC Required</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                <span className="text-white">Instant Deposits</span>
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
                  <li>• Complete anonymity - no KYC</li>
                  <li>• Anonymous trading capabilities</li>
                  <li>• High leverage up to 200x</li>
                  <li>• Instant deposits & withdrawals</li>
                  <li>• Competitive trading fees</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-yellow-400">Considerations</h4>
                <ul className="text-gray-300 text-sm space-y-1 mt-2">
                  <li>• Smaller selection of cryptocurrencies</li>
                  <li>• Newer exchange (less established)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* SHIB Trading Info */}
        <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-500/30 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-blue-400 mb-4 flex items-center">
            <span className="mr-2">🐕</span>
            SHIB Trading on WEEX
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
            <div>
              <span className="text-gray-400">SHIB Pairs:</span>
              <p>SHIB/USDT, SHIB/BTC</p>
            </div>
            <div>
              <span className="text-gray-400">Max Leverage:</span>
              <p>Up to 200x on SHIB futures</p>
            </div>
            <div>
              <span className="text-gray-400">Trading Fees:</span>
              <p>0.1% maker, 0.1% taker</p>
            </div>
            <div>
              <span className="text-gray-400">Min Order:</span>
              <p>5 USDT equivalent</p>
            </div>
          </div>
        </div>

        {/* Privacy Focus */}
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-purple-400 mb-4 flex items-center">
            <UserX className="h-6 w-6 mr-2" />
            Privacy-First Trading
          </h3>
          <div className="text-white space-y-2">
            <p>✅ No identity verification required</p>
            <p>✅ Anonymous account creation</p>
            <p>✅ Privacy-focused trading environment</p>
            <p>✅ Instant deposits without verification delays</p>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center bg-gray-800 rounded-lg p-8 border border-gray-700">
          <h3 className="text-2xl font-bold text-white mb-4">Start Anonymous SHIB Trading</h3>
          <p className="text-gray-300 mb-6">
            Join WEEX today and trade SHIB without any identity verification requirements
          </p>
          
          <div className="bg-gray-900 rounded-lg p-4 mb-6 inline-block">
            <span className="text-gray-400 text-sm">Referral Code:</span>
            <div className="text-xl font-mono text-blue-400 font-bold">shibmetrics-WEEX</div>
          </div>
          
          <div className="space-y-4">
            <a
              href="https://weex.com/register?code=shibmetrics-WEEX"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-lg"
            >
              Create Anonymous WEEX Account
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
              <strong>Risk Warning:</strong> Cryptocurrency trading involves substantial risk. While WEEX offers anonymous trading, 
              please ensure you comply with your local laws and regulations regarding cryptocurrency trading.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 