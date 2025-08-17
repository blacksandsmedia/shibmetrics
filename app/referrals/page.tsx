import { Star, Gift, ExternalLink, Shield, TrendingUp, Percent } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Best Crypto Exchange Referral Codes 2024 | BYBONUS, 13sJU, 37646719 - SHIBMETRICS",
  description: "Exclusive crypto exchange referral codes: BYBONUS (Bybit), 13sJU (MEXC), 37646719 (Binance), shibmetrics-WEEX (WEEX). Get up to $30,000 USDT bonuses and massive trading discounts.",
  keywords: "BYBONUS, 13sJU, 37646719, shibmetrics-WEEX, QBSSSY97, 92pt, crypto exchange referral codes, trading bonuses, MEXC referral, WEEX bonus, Bybit bonus",
  openGraph: {
    title: "Best Crypto Exchange Referral Codes & Trading Bonuses",
    description: "Exclusive referral codes for top crypto exchanges with massive bonuses up to $30,000 USDT",
    type: "website",
    url: "https://shibmetrics.com/referrals",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Crypto Exchange Referral Codes & Trading Bonuses",
    description: "Exclusive referral codes for top crypto exchanges with massive bonuses up to $30,000 USDT",
  },
};

interface ReferralOffer {
  exchange: string;
  logo: string;
  code: string;
  bonus: string;
  features: string[];
  description: string;
  tradingFeeDiscount: string;
  signUpBonus: string;
  leverage: string;
  kyc: boolean;
  rating: number;
  pros: string[];
  cons: string[];
  link: string;
}

const referralOffers: ReferralOffer[] = [
  {
    exchange: "Bybit",
    logo: "🟡",
    code: "BYBONUS",
    bonus: "Exclusive Bonuses",
    features: ["World's Leading Exchange", "Advanced Tools", "Institutional Grade"],
    description: "Bybit is one of the world's leading cryptocurrency derivatives exchanges, serving over 15 million users globally. Known for its advanced trading tools, high liquidity, and institutional-grade security.",
    tradingFeeDiscount: "Competitive maker/taker fees",
    signUpBonus: "Exclusive bonuses with BYBONUS",
    leverage: "Up to 50x on SHIB",
    kyc: true,
    rating: 4.7,
    pros: ["Market leader", "Advanced tools", "High liquidity", "Institutional security"],
    cons: ["KYC required", "Complex for beginners"],
    link: "https://www.bybit.com/en/register?ref=BYBONUS"
  },
  {
    exchange: "MEXC",
    logo: "🟡",
    code: "13sJU",
    bonus: "Up to $28,100 USDT",
    features: ["500x Leverage", "2,104+ Coins", "50% Fee Discount"],
    description: "MEXC is one of the world's leading cryptocurrency exchanges, offering an extensive selection of over 2,100 cryptocurrencies including SHIB. Known for its competitive trading fees, advanced trading features, and high leverage options.",
    tradingFeeDiscount: "50% off all trading fees",
    signUpBonus: "$28,100 USDT in bonuses",
    leverage: "Up to 500x",
    kyc: true,
    rating: 4.8,
    pros: ["Huge coin selection", "Very low fees", "High leverage", "Strong security"],
    cons: ["KYC required", "Complex interface for beginners"],
    link: "https://www.mexc.com/register?inviteCode=13sJU"
  },
  {
    exchange: "WEEX",
    logo: "🔵",
    code: "shibmetrics-WEEX",
    bonus: "Up to $30,000 USDT",
    features: ["No KYC", "200x Leverage", "20% Cashback"],
    description: "WEEX offers anonymous trading with no KYC requirements, making it perfect for users who value privacy. Features competitive fees, high leverage, and instant deposits.",
    tradingFeeDiscount: "20% cashback on all deposits",
    signUpBonus: "$30,000 USDT bonus package",
    leverage: "Up to 200x",
    kyc: false,
    rating: 4.6,
    pros: ["No KYC required", "Anonymous trading", "High leverage", "Instant deposits"],
    cons: ["Smaller coin selection", "Newer exchange"],
    link: "https://weex.com/register?code=shibmetrics-WEEX"
  },
  {
    exchange: "Blofin",
    logo: "🟢",
    code: "shibmetrics-BLOFIN",
    bonus: "Up to $8,500 USDT",
    features: ["No KYC", "125x Leverage", "Advanced Tools"],
    description: "Blofin specializes in derivatives trading with sophisticated tools for professional traders. Offers competitive rates and doesn't require KYC for most trading activities.",
    tradingFeeDiscount: "Reduced maker/taker fees",
    signUpBonus: "$8,500 USDT in trading bonuses",
    leverage: "Up to 125x",
    kyc: false,
    rating: 4.5,
    pros: ["Professional trading tools", "No KYC", "Good liquidity", "Competitive fees"],
    cons: ["Focus on derivatives", "Not for beginners"],
    link: "https://blofin.com/register?code=shibmetrics-BLOFIN"
  },
  {
    exchange: "LBank",
    logo: "🟠",
    code: "1MY7E",
    bonus: "Up to $6,000 USDT",
    features: ["No KYC", "125x Leverage", "20% Fee Discount"],
    description: "LBank is a global cryptocurrency exchange providing professional digital asset trading services. Known for its user-friendly interface and comprehensive trading features.",
    tradingFeeDiscount: "20% discount on trading fees",
    signUpBonus: "$6,000 USDT sign-up bonus",
    leverage: "Up to 125x",
    kyc: false,
    rating: 4.4,
    pros: ["No KYC required", "Good selection of altcoins", "User-friendly", "Regular promotions"],
    cons: ["Lower liquidity on some pairs", "Limited fiat options"],
    link: "https://www.lbank.com/invitevip?icode=1MY7E"
  },
  {
    exchange: "KuCoin",
    logo: "🟢",
    code: "QBSSSY97",
    bonus: "Up to $500 USDT",
    features: ["200+ Coins", "Futures Trading", "Low Fees"],
    description: "KuCoin is a leading global cryptocurrency exchange with advanced trading features, a wide variety of cryptocurrencies, and competitive fees. Known for its innovative products and strong security.",
    tradingFeeDiscount: "20% discount on trading fees",
    signUpBonus: "Up to $500 USDT bonus",
    leverage: "Up to 100x",
    kyc: true,
    rating: 4.5,
    pros: ["Wide coin selection", "Advanced features", "Good liquidity", "Competitive fees"],
    cons: ["KYC required", "Complex interface"],
    link: "https://www.kucoin.com/ucenter/signup?rcode=QBSSSY97"
  },
  {
    exchange: "Bitget",
    logo: "🔵",
    code: "92pt",
    bonus: "Up to $1,000 USDT",
    features: ["Copy Trading", "Futures", "Spot Trading"],
    description: "Bitget is a leading crypto derivatives exchange offering copy trading, futures, and spot trading. Known for its innovative copy trading features and professional trading tools.",
    tradingFeeDiscount: "Up to 50% fee discount",
    signUpBonus: "Up to $1,000 USDT bonus",
    leverage: "Up to 125x",
    kyc: true,
    rating: 4.3,
    pros: ["Copy trading features", "Good liquidity", "Professional tools", "Mobile app"],
    cons: ["KYC required", "Limited in some regions"],
    link: "https://www.bitget.com/expressly?channelCode=qgog&vipCode=92pt&languageType=0"
  },
  {
    exchange: "Margex",
    logo: "🟣",
    code: "20657931",
    bonus: "Up to $200 USDT",
    features: ["Bitcoin Trading", "No KYC", "Low Spreads"],
    description: "Margex specializes in Bitcoin trading with leverage up to 100x. No KYC required for trading, making it perfect for privacy-focused traders.",
    tradingFeeDiscount: "Reduced trading fees",
    signUpBonus: "Up to $200 USDT bonus",
    leverage: "Up to 100x",
    kyc: false,
    rating: 4.2,
    pros: ["No KYC required", "Bitcoin focused", "Low spreads", "Simple interface"],
    cons: ["Limited coin selection", "Bitcoin focus only"],
    link: "https://margex.com/app/signup?rid=20657931"
  },
  {
    exchange: "Binance",
    logo: "🟡",
    code: "37646719",
    bonus: "Up to $100 USDT",
    features: ["World's Largest", "Spot & Futures", "NFT Marketplace"],
    description: "Binance is the world's largest cryptocurrency exchange by trading volume. Offers comprehensive trading features, NFT marketplace, and extensive cryptocurrency selection.",
    tradingFeeDiscount: "20% discount on trading fees",
    signUpBonus: "Up to $100 USDT bonus",
    leverage: "Up to 125x",
    kyc: true,
    rating: 4.6,
    pros: ["Largest exchange", "Comprehensive features", "High liquidity", "Global presence"],
    cons: ["KYC required", "Complex for beginners"],
    link: "https://accounts.binance.com/en-GB/register?ref=37646719"
  },
  {
    exchange: "Phemex",
    logo: "🔶",
    code: "GNFLL",
    bonus: "Up to $4,000 USDT",
    features: ["Zero Fees Spot", "Derivatives", "Web3 Features"],
    description: "Phemex offers zero-fee spot trading and advanced derivatives trading. Known for its high-performance trading engine and Web3 integration features.",
    tradingFeeDiscount: "Zero fees on spot trading",
    signUpBonus: "Up to $4,000 USDT bonus",
    leverage: "Up to 100x",
    kyc: true,
    rating: 4.4,
    pros: ["Zero spot trading fees", "High performance", "Web3 features", "Good security"],
    cons: ["KYC required", "Smaller user base"],
    link: "https://phemex.com/register?group=970&referralCode=GNFLL"
  },
  {
    exchange: "Poloniex",
    logo: "⚫",
    code: "VTTJQPXY",
    bonus: "Trading Bonuses",
    features: ["Established Exchange", "Margin Trading", "Lending"],
    description: "Poloniex is one of the oldest cryptocurrency exchanges, offering spot trading, margin trading, and lending services. Known for its reliability and extensive trading history.",
    tradingFeeDiscount: "Competitive trading fees",
    signUpBonus: "Various trading bonuses",
    leverage: "Up to 2.5x margin",
    kyc: true,
    rating: 4.1,
    pros: ["Established reputation", "Margin trading", "Lending features", "Reliable"],
    cons: ["KYC required", "Limited modern features"],
    link: "https://poloniex.com/signup"
  },
  {
    exchange: "BitMart",
    logo: "🔷",
    code: "BONUS",
    bonus: "Up to $1,000 USDT",
    features: ["Altcoin Focus", "Futures", "Staking"],
    description: "BitMart is a global digital asset trading platform with a focus on altcoins and emerging cryptocurrencies. Offers futures trading and staking services.",
    tradingFeeDiscount: "Fee discounts available",
    signUpBonus: "Up to $1,000 USDT bonus",
    leverage: "Up to 100x",
    kyc: true,
    rating: 4.0,
    pros: ["Good altcoin selection", "Staking services", "User-friendly", "Mobile app"],
    cons: ["KYC required", "Lower liquidity on some pairs"],
    link: "https://www.bitmart.com/register/en-US?r=BONUS"
  },
  {
    exchange: "Bitfinex",
    logo: "🟢",
    code: "95ML4NVra",
    bonus: "Trading Fee Discounts",
    features: ["Professional Trading", "Lending", "Margin Trading"],
    description: "Bitfinex is a professional trading platform offering advanced trading features, lending, and margin trading. Popular among institutional and professional traders.",
    tradingFeeDiscount: "Progressive fee discounts",
    signUpBonus: "Fee discounts and bonuses",
    leverage: "Up to 10x",
    kyc: true,
    rating: 4.2,
    pros: ["Professional platform", "Advanced features", "Lending options", "High liquidity"],
    cons: ["KYC required", "Complex for beginners"],
    link: "https://bitfinex.com/sign-up/?refcode=95ML4NVra"
  },
  {
    exchange: "Bitrue",
    logo: "🔴",
    code: "EQAVGVH",
    bonus: "Up to $300 USDT",
    features: ["XRP Focus", "Yield Farming", "Staking"],
    description: "Bitrue is known for its strong focus on XRP and Ripple ecosystem tokens. Offers yield farming, staking, and various earning opportunities for crypto holders.",
    tradingFeeDiscount: "Reduced trading fees",
    signUpBonus: "Up to $300 USDT bonus",
    leverage: "Up to 5x",
    kyc: true,
    rating: 4.1,
    pros: ["XRP ecosystem focus", "Yield farming", "Staking rewards", "Earning opportunities"],
    cons: ["KYC required", "Limited coin selection"],
    link: "https://www.bitrue.com/user/register?cn=900000&inviteCode=EQAVGVH"
  },
  {
    exchange: "Pionex",
    logo: "🤖",
    code: "4HIobJkL",
    bonus: "Trading Bot Access",
    features: ["Trading Bots", "Grid Trading", "DCA Bots"],
    description: "Pionex offers built-in trading bots including grid trading, DCA bots, and other automated trading strategies. Perfect for algorithmic and automated trading.",
    tradingFeeDiscount: "Low trading fees",
    signUpBonus: "Free trading bot access",
    leverage: "Up to 3x",
    kyc: true,
    rating: 4.3,
    pros: ["Built-in trading bots", "Automated strategies", "Grid trading", "User-friendly bots"],
    cons: ["KYC required", "Limited manual trading features"],
    link: "https://www.pionex.com/en/sign/ref/4HIobJkL"
  },
  {
    exchange: "BingX",
    logo: "🟠",
    code: "XBONUS",
    bonus: "Up to $5,000 USDT",
    features: ["Copy Trading", "Social Trading", "Futures"],
    description: "BingX is a social trading platform offering copy trading, social trading features, and futures trading. Known for its innovative social trading approach.",
    tradingFeeDiscount: "Fee discounts available",
    signUpBonus: "Up to $5,000 USDT bonus",
    leverage: "Up to 125x",
    kyc: true,
    rating: 4.2,
    pros: ["Social trading features", "Copy trading", "Good mobile app", "Community features"],
    cons: ["KYC required", "Newer platform"],
    link: "https://bingx.com/partner/XBONUS"
  }
];

export default function ReferralsPage() {
  // Helper function to get the slug for each exchange
  const getExchangeSlug = (exchangeName: string) => {
    return exchangeName.toLowerCase();
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Best Crypto Exchange Referral Codes 2024
          </h1>
          <p className="text-xl text-gray-400 mb-6 max-w-3xl mx-auto">
            Exclusive referral codes for top crypto exchanges: <span className="text-yellow-400 font-bold">BYBONUS</span>, <span className="text-orange-400 font-bold">13sJU</span>, <span className="text-yellow-400 font-bold">37646719</span>, and more. 
            Get massive bonuses and trade SHIB with the best rates.
          </p>
          <div className="flex justify-center items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              <span>Verified Partners</span>
            </div>
            <div className="flex items-center">
              <Gift className="h-4 w-4 mr-2" />
              <span>Exclusive Bonuses</span>
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-2" />
              <span>Top Rated</span>
            </div>
          </div>
        </div>

        {/* Exchange Cards */}
        <div className="space-y-8">
          {referralOffers.map((offer, index) => (
            <div key={index} className="bg-gray-800 rounded-xl p-8 border border-gray-700 hover:border-orange-500/30 transition-colors">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Side - Basic Info */}
                <div className="lg:w-1/3">
                  <div className="flex items-center mb-4">
                    <span className="text-4xl mr-4">{offer.logo}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{offer.exchange}</h2>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < Math.floor(offer.rating) ? 'text-yellow-400 fill-current' : 'text-gray-500'}`} />
                        ))}
                        <span className="text-gray-400 ml-2 text-sm">({offer.rating}/5)</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-6 leading-relaxed">{offer.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {offer.features.map((feature, i) => (
                      <span key={i} className="bg-orange-600/20 text-orange-300 px-3 py-1 rounded-full text-sm">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Side - Details */}
                <div className="lg:w-2/3">
                  {/* Key Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-750 rounded-lg p-4">
                      <div className="flex items-center text-green-400 mb-2">
                        <Gift className="h-5 w-5 mr-2" />
                        <span className="font-semibold">Sign-up Bonus</span>
                      </div>
                      <p className="text-white text-lg font-bold">{offer.signUpBonus}</p>
                    </div>
                    <div className="bg-gray-750 rounded-lg p-4">
                      <div className="flex items-center text-blue-400 mb-2">
                        <Percent className="h-5 w-5 mr-2" />
                        <span className="font-semibold">Trading Fees</span>
                      </div>
                      <p className="text-white text-lg font-bold">{offer.tradingFeeDiscount}</p>
                    </div>
                    <div className="bg-gray-750 rounded-lg p-4">
                      <div className="flex items-center text-purple-400 mb-2">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        <span className="font-semibold">Max Leverage</span>
                      </div>
                      <p className="text-white text-lg font-bold">{offer.leverage}</p>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-green-400 font-semibold mb-3">✅ Pros</h4>
                      <ul className="space-y-2">
                        {offer.pros.map((pro, i) => (
                          <li key={i} className="text-gray-300 text-sm">• {pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-orange-400 font-semibold mb-3">⚠️ Considerations</h4>
                      <ul className="space-y-2">
                        {offer.cons.map((con, i) => (
                          <li key={i} className="text-gray-300 text-sm">• {con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Referral Code and CTAs */}
                  <div className="bg-gray-750 rounded-lg p-6 border border-orange-500/20">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                      <div className="mb-4 md:mb-0">
                        <div className="text-orange-400 font-semibold mb-1">Exclusive Referral Code</div>
                        <div className="bg-gray-800 px-4 py-2 rounded border border-gray-600 font-mono text-white">
                          {offer.code}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {offer.kyc ? "KYC Required" : "No KYC Required"} • Click to copy code automatically
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                          href={`/referrals/${getExchangeSlug(offer.exchange)}`}
                          className="inline-flex items-center px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors text-center"
                        >
                          Learn More
                        </Link>
                        <a
                          href={offer.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
                        >
                          Claim Bonus
                          <ExternalLink className="h-5 w-5 ml-2" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Important Notice */}
        <div className="mt-12 bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-6">
          <h3 className="text-yellow-400 font-semibold mb-2">⚠️ Important Trading Disclaimer</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            Cryptocurrency trading involves substantial risk and may not be suitable for all investors. 
            High leverage trading can result in significant losses that may exceed your initial investment. 
            Please ensure you understand the risks involved and consider seeking independent financial advice. 
            SHIBMETRICS receives a commission when you sign up through our referral codes, which helps support our platform.
          </p>
        </div>
      </div>
    </div>
  );
} 