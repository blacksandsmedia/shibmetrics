import { Star, Gift, ExternalLink, Shield, TrendingUp, Percent } from 'lucide-react';
import Link from 'next/link';

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
    exchange: "MEXC",
    logo: "🟡",
    code: "shibmetrics-MEXC",
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
    link: "https://mexc.com/register?inviteCode=shibmetrics-MEXC"
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
    code: "shibmetrics-LBANK",
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
    link: "https://lbank.com/register?code=shibmetrics-LBANK"
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
            Best SHIB Trading Platforms
          </h1>
          <p className="text-xl text-gray-400 mb-6 max-w-3xl mx-auto">
            Trade Shiba Inu with exclusive bonuses and discounts using our verified referral codes. 
            Get the best deals from top cryptocurrency exchanges.
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