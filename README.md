# SHIBMETRICS 🔥

A real-time Shiba Inu (SHIB) burn tracker and analytics platform, inspired by LuncMetrics but focused on the SHIB ecosystem.

## Features

- **🔥 Live Burn Tracking**: Real-time monitoring of SHIB token burns across all burn addresses
- **📊 Comprehensive Analytics**: SHIB price, market cap, supply metrics, and burn statistics
- **📱 Responsive Design**: Modern dark theme optimized for desktop and mobile
- **🔗 Exchange Referrals**: Curated referral codes for top cryptocurrency exchanges
- **📈 Historical Data**: Track burn trends over time with detailed transaction history
- **🖥️ API Monitoring**: Real-time status monitoring of data provider APIs
- **⚡ Auto-Refresh**: Live data updates every 30 seconds

## Live Demo

Visit [SHIBMETRICS.com](https://shibmetrics.com) to see the platform in action.

## Technology Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Data Sources**: Etherscan API, CoinGecko API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Etherscan API key (free at [etherscan.io](https://etherscan.io/apis))
- CoinGecko API key (optional, has free tier)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/shibmetrics.git
   cd shibmetrics
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_ETHERSCAN_API_KEY=your_etherscan_api_key_here
   NEXT_PUBLIC_COINGECKO_API_KEY=your_coingecko_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Data Sources

### Primary Data Sources

- **Etherscan API**: SHIB burn transaction data and token balances
- **CoinGecko API**: SHIB price, market cap, and volume data

### Burn Addresses Tracked

1. **BA-1**: `0xdead000000000000000042069420694206942069` (Vitalik's burn address)
2. **BA-2**: `0x000000000000000000000000000000000000dead` (ShibaSwap address)
3. **BA-3**: `0x0000000000000000000000000000000000000000` (Black Hole address)

## Project Structure

```
shibmetrics/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Homepage
│   ├── burn-tracker/      # Live burn tracker
│   ├── referrals/         # Exchange referral codes
│   ├── api-status/        # API monitoring
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── Header.tsx         # Navigation header
│   ├── Footer.tsx         # Site footer
│   ├── StatCard.tsx       # Metric display cards
│   └── BurnTransactionTable.tsx
├── lib/                   # Utilities and API functions
│   └── api.ts            # Data fetching functions
└── public/               # Static assets
```

## Key Components

### Homepage
- Real-time SHIB burn statistics
- Price and market data
- Supply overview with burn progress
- Latest burn transactions

### Burn Tracker
- Detailed burn transaction history
- Filtering by burn address
- Sorting by time or amount
- Pagination and export functionality

### Referral Codes
- SEO-optimized exchange pages
- Exclusive bonus offers
- Detailed exchange comparisons
- Trading disclaimers

### API Status
- Real-time API health monitoring
- Response time tracking
- Uptime statistics
- Status history

## Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy with automatic CI/CD**

### Manual Deployment

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_ETHERSCAN_API_KEY` | Etherscan API key for burn data | Yes |
| `NEXT_PUBLIC_COINGECKO_API_KEY` | CoinGecko API key for price data | Optional |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

- [ ] Multi-language support (20+ languages)
- [ ] Advanced historical charts
- [ ] Exchange volume tracking
- [ ] Mobile app
- [ ] Real-time notifications
- [ ] Custom alerts

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This platform is for informational purposes only. Cryptocurrency trading involves substantial risk and may not be suitable for all investors. Please conduct your own research and consider seeking independent financial advice.

## Support

- **Website**: [shibmetrics.com](https://shibmetrics.com)
- **Email**: support@shibmetrics.com
- **Twitter**: [@shibmetrics](https://twitter.com/shibmetrics)

---

**Built with ❤️ for the SHIB community**
