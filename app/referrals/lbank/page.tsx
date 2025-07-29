import { ExternalLink, Percent, Star, Gift, AlertTriangle, CheckCircle, Smile } from 'lucide-react';
import Link from 'next/link';

export default function LBankReferralPage() {
  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="text-6xl mr-4">🟠</div>
            <h1 className="text-4xl font-bold text-white">LBank Exchange</h1>
          </div>
          <p className="text-xl text-gray-400 mb-6">
            User-friendly global exchange with great altcoin selection - get up to $6,000 USDT
          </p>
          
          {/* Main CTA */}
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl p-6 mb-8">
            <div className="text-white text-center">
              <h2 className="text-2xl font-bold mb-2">User-Friendly Trading</h2>
              <div className="text-lg mb-4">
                <span className="bg-black/20 px-4 py-2 rounded-lg font-mono">shibmetrics-LBANK</span>
              </div>
              <a
                href="https://lbank.com/register?code=shibmetrics-LBANK"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-white text-orange-600 font-bold rounded-lg hover:bg-gray-100 transition-colors text-lg"
              >
                Join LBank & Get $6,000 USDT
                <ExternalLink className="h-5 w-5 ml-2" />
              </a>
              <p className="text-sm mt-3 opacity-90">
                20% fee discount • 125x leverage • No KYC required
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <Smile className="h-8 w-8 text-orange-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">User-Friendly Interface</h3>
            <p className="text-gray-300">Easy-to-use platform perfect for both beginners and pros</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <CheckCircle className="h-8 w-8 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Great Altcoin Selection</h3>
            <p className="text-gray-300">Wide variety of altcoins including early-stage gems</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <Percent className="h-8 w-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">20% Fee Discount</h3>
            <p className="text-gray-300">Significant savings on all trading activities</p>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* About LBank */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">About LBank</h3>
            <p className="text-gray-300 mb-4">
              LBank is a global cryptocurrency exchange providing professional digital asset trading services. 
              Known for its user-friendly interface, comprehensive trading features, and excellent selection of altcoins.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 mr-3" />
                <span className="text-white">4.4/5 Rating</span>
              </div>
              <div className="flex items-center">
                <Smile className="h-5 w-5 text-orange-400 mr-3" />
                <span className="text-white">Beginner-Friendly</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                <span className="text-white">Regular Promotions</span>
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
                  <li>• No KYC requirements</li>
                  <li>• Good selection of altcoins</li>
                  <li>• User-friendly interface</li>
                  <li>• Regular trading promotions</li>
                  <li>• Competitive fees with discount</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-yellow-400">Considerations</h4>
                <ul className="text-gray-300 text-sm space-y-1 mt-2">
                  <li>• Lower liquidity on some pairs</li>
                  <li>• Limited fiat currency options</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* SHIB Trading Info */}
        <div className="bg-gradient-to-r from-orange-900/20 to-amber-900/20 border border-orange-500/30 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-orange-400 mb-4 flex items-center">
            <span className="mr-2">🐕</span>
            SHIB Trading on LBank
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
            <div>
              <span className="text-gray-400">SHIB Pairs:</span>
              <p>SHIB/USDT, SHIB/BTC, SHIB/ETH</p>
            </div>
            <div>
              <span className="text-gray-400">Max Leverage:</span>
              <p>Up to 125x on SHIB futures</p>
            </div>
            <div>
              <span className="text-gray-400">Trading Fees:</span>
              <p>0.1% (20% discount with referral)</p>
            </div>
            <div>
              <span className="text-gray-400">Min Order:</span>
              <p>5 USDT equivalent</p>
            </div>
          </div>
        </div>

        {/* Beginner-Friendly Features */}
        <div className="bg-gradient-to-r from-blue-900/20 to-orange-900/20 border border-blue-500/30 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-blue-400 mb-4 flex items-center">
            <Smile className="h-6 w-6 mr-2" />
            Perfect for New Traders
          </h3>
          <div className="text-white space-y-2">
            <p>✅ Intuitive and clean interface design</p>
            <p>✅ Comprehensive trading tutorials</p>
            <p>✅ 24/7 customer support</p>
            <p>✅ Mobile app for trading on-the-go</p>
            <p>✅ Regular educational content and market analysis</p>
          </div>
        </div>

        {/* Promotions */}
        <div className="bg-gradient-to-r from-purple-900/20 to-orange-900/20 border border-purple-500/30 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-purple-400 mb-4 flex items-center">
            <Gift className="h-6 w-6 mr-2" />
            Regular Promotions & Benefits
          </h3>
          <div className="text-white space-y-2">
            <p>🎁 Weekly trading competitions with prizes</p>
            <p>🎁 Staking rewards for various cryptocurrencies</p>
            <p>🎁 Referral bonus programs</p>
            <p>🎁 Special promotions for new listings</p>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center bg-gray-800 rounded-lg p-8 border border-gray-700">
          <h3 className="text-2xl font-bold text-white mb-4">Start Your SHIB Trading Journey</h3>
          <p className="text-gray-300 mb-6">
            Join LBank today and enjoy user-friendly trading with great bonuses and regular promotions
          </p>
          
          <div className="bg-gray-900 rounded-lg p-4 mb-6 inline-block">
            <span className="text-gray-400 text-sm">Referral Code:</span>
            <div className="text-xl font-mono text-orange-400 font-bold">shibmetrics-LBANK</div>
          </div>
          
          <div className="space-y-4">
            <a
              href="https://lbank.com/register?code=shibmetrics-LBANK"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors text-lg"
            >
              Create LBank Account
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
              <strong>Trading Risk:</strong> Cryptocurrency trading involves risk and may not be suitable for all users. 
              While LBank offers user-friendly features, always trade responsibly and never invest more than you can afford to lose.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 