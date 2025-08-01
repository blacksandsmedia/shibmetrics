# 🔥 SHIBMETRICS 5-Year Complete Historical Burn System

## 🎯 Overview

SHIBMETRICS now includes a **complete 5-year historical burn collection system** that stores ALL SHIB burn transactions from the token's launch in August 2020 to the present day. This system provides:

- ✅ **Complete Historical Coverage**: All burns since SHIB launch (~5 years)
- ✅ **Persistent Storage**: Uses Netlify Blobs (survives deployments)
- ✅ **Serverless Compatible**: Works in Netlify's serverless environment
- ✅ **Incremental Updates**: Only collects new data on subsequent runs
- ✅ **Bulletproof Reliability**: Multiple fallback layers prevent data loss
- ✅ **High Performance**: Cached and optimized for fast access

## 🚀 Quick Start

### 1. Collect Complete Historical Data

**Option A: Use the script (recommended)**
```bash
# Set your site URL (optional, defaults to https://shibmetrics.com)
export SHIBMETRICS_URL="https://your-site.netlify.app"

# Run the collection script
node scripts/collect-5year-history.js
```

**Option B: Direct API call**
```bash
# Trigger full 5-year collection
curl -X POST https://shibmetrics.com/api/historical/complete-collection

# Check progress/update with new data
curl https://shibmetrics.com/api/historical/complete-collection
```

### 2. Access Your Historical Data

Your complete burn history is now available:

- **Website**: Visit `/history` for paginated browsing
- **API**: `GET /api/historical/dataset` for programmatic access
- **Homepage**: Automatic fallback to historical data

## 📊 What You Get

After collection, you'll have:

- **~18,000+ transactions** (complete burn history)
- **5+ years of data** (August 2020 → Present)
- **All major burn addresses**:
  - BA-1: `0xdead000000000000000042069420694206942069`
  - BA-2: `0x000000000000000000000000000000000000dead`
  - BA-3: `0x0000000000000000000000000000000000000000`
  - Community: `0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce`

## 🔧 API Endpoints

### Complete Collection
```http
POST /api/historical/complete-collection
```
Triggers full 5-year historical data collection. **Run this once** to populate your dataset.

**Response:**
```json
{
  "success": true,
  "totalTransactions": 18934,
  "startBlock": 10569013,
  "endBlock": 23045927,
  "timeRange": {
    "start": "2020-08-01T00:00:00.000Z",
    "end": "2025-08-01T14:04:42.489Z"
  },
  "addressCounts": {
    "0xdead000000000000000042069420694206942069": 9924,
    "0x000000000000000000000000000000000000dead": 2098,
    "0x0000000000000000000000000000000000000000": 5084,
    "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce": 1919
  }
}
```

### Incremental Updates
```http
GET /api/historical/complete-collection
```
Updates existing dataset with new transactions (run periodically).

### Access Historical Data
```http
GET /api/historical/dataset?limit=100&page=1&address=all
```

**Query Parameters:**
- `limit`: Number of transactions per page (max 2000)
- `page`: Page number (starts at 1)
- `address`: Filter by burn address or 'all'
- `startDate`: Filter from date (YYYY-MM-DD)
- `endDate`: Filter to date (YYYY-MM-DD)
- `metadata`: Set to 'true' for metadata only

**Response:**
```json
{
  "transactions": [...],
  "pagination": {
    "page": 1,
    "limit": 100,
    "totalTransactions": 18934,
    "totalPages": 190,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "metadata": {
    "dataSource": "netlify-blobs-5year-dataset",
    "collectionVersion": "2.0.0",
    "startBlock": 10569013,
    "endBlock": 23045927,
    "lastSync": "2025-08-01T14:04:42.234Z",
    "totalDatasizeTransactions": 18934
  },
  "summary": {
    "years_of_data": 4.9,
    "earliest_burn": "2020-08-01",
    "latest_burn": "2025-08-01"
  }
}
```

## 🏗️ System Architecture

### Storage: Netlify Blobs
- **Persistent**: Survives deployments and function restarts
- **Serverless**: No database setup required
- **Scalable**: Handles large datasets efficiently
- **Integrated**: Built into Netlify platform

### Data Collection Strategy
1. **Block-by-block scanning** from SHIB launch block
2. **Rate-limited API calls** (200ms delays)
3. **Deduplication** prevents duplicate transactions
4. **Incremental updates** only collect new data
5. **Progress tracking** allows resumption if interrupted

### Bulletproof Fallback System
1. **Live API** (recent transactions)
2. **5-Year Historical Dataset** (complete history)
3. **Emergency fallback** (prevents errors)

## 📈 Performance

- **Initial Collection**: ~10-30 minutes (one-time)
- **Incremental Updates**: ~1-5 minutes
- **Data Access**: <200ms (cached)
- **Homepage Load**: <1 second (instant fallback)

## 🔄 Automation

### Daily Updates (Recommended)
Set up a daily cron job to keep data current:

```bash
# Add to your cron or CI/CD pipeline
0 6 * * * curl -s https://shibmetrics.com/api/historical/complete-collection > /dev/null
```

### Netlify Functions
The system automatically updates when triggered and maintains data integrity.

## 🚨 Troubleshooting

### "Historical dataset not available"
**Solution**: Run the initial collection:
```bash
node scripts/collect-5year-history.js
```

### Collection fails or times out
**Solution**: The system saves progress automatically. Simply re-run:
```bash
curl -X POST https://shibmetrics.com/api/historical/complete-collection
```

### API rate limits
**Solution**: The system includes built-in rate limiting and retry logic. Wait and re-run.

### Missing environment variables
**Solution**: Ensure `NEXT_PUBLIC_ETHERSCAN_API_KEY` is configured in your Netlify environment.

## 📚 Integration Examples

### Frontend (React)
```typescript
// Fetch complete historical data
const response = await fetch('/api/historical/dataset?limit=1000');
const data = await response.json();

console.log(`Loaded ${data.transactions.length} burns`);
console.log(`Dataset spans ${data.summary.years_of_data} years`);
```

### Backend (Node.js)
```typescript
import { HistoricalBlobsStorage } from './lib/historical-blobs-collector';

const storage = new HistoricalBlobsStorage();
const dataset = await storage.loadDataset();

console.log(`Total burns: ${dataset.metadata.totalTransactions}`);
```

## 🎉 Benefits

1. **Complete History**: Never miss any burn transaction
2. **Lightning Fast**: Instant access to any historical data
3. **Reliable**: Works even when external APIs are down
4. **Cost Effective**: Minimal API usage after initial collection
5. **Future Proof**: Automatically includes new burns
6. **SEO Friendly**: Rich historical content for search engines

## 🔐 Data Integrity

- **Cryptographic hashing** ensures data hasn't been corrupted
- **Duplicate detection** prevents data pollution
- **Timestamp validation** ensures chronological accuracy
- **Cross-validation** against multiple sources
- **Version tracking** for data format changes

---

## 🎯 Next Steps

1. **Run initial collection**: `node scripts/collect-5year-history.js`
2. **Set up daily updates**: Add cron job or CI/CD trigger
3. **Customize frontend**: Update your UI to show historical insights
4. **Monitor performance**: Check `/api/historical/dataset?metadata=true`

Your SHIBMETRICS site now has the most complete SHIB burn dataset available! 🚀🔥