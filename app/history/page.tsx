// Unified SHIB Burn History & Tracker - Fast Loading with Complete Historical Data
import type { Metadata } from 'next';
import BurnHistoryClient from './BurnHistoryClient';

export const metadata: Metadata = {
  title: "SHIB Burn History & Tracker | Complete Transaction Records - SHIBMETRICS",
  description: "Explore complete SHIB burn history with real-time tracking. View all burn transactions, filter by destination addresses (BA-1, BA-2, BA-3, CA), and analyze historical burn data patterns.",
  keywords: "SHIB burn history, Shiba Inu burn tracker, SHIB burn transactions, burn address history, SHIB historical data, cryptocurrency burn analytics",
  openGraph: {
    title: "SHIB Burn History & Transaction Tracker",
    description: "Complete historical record of all SHIB token burns with real-time updates and advanced filtering",
    type: "website",
    url: "https://shibmetrics.com/history",
  },
  twitter: {
    card: "summary_large_image",
    title: "SHIB Burn History & Transaction Tracker",
    description: "Complete historical record of all SHIB token burns with real-time updates and advanced filtering",
  },
};

export default function BurnHistoryPage() {
  return <BurnHistoryClient />;
} 