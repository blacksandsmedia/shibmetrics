import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Force deployment - UI cleanup build v2 - Aug 4 2025 3:50 PM

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | SHIBMETRICS',
    default: 'SHIBMETRICS - Real-time SHIB Burn Tracker & Analytics Platform'
  },
  description: "Track Shiba Inu token burns in real-time with comprehensive analytics. Monitor SHIB burn transactions, historical data, exchange activity, and get exclusive trading bonuses from top crypto exchanges.",
  keywords: "SHIB burn tracker, Shiba Inu burns, SHIB analytics, cryptocurrency burn data, SHIB statistics, token burns, crypto exchange bonuses, SHIB trading, SHIB burn history, SHIB exchange activity, API status monitor, contact SHIBMETRICS",
  authors: [{ name: "SHIBMETRICS" }],
  creator: "SHIBMETRICS",
  publisher: "SHIBMETRICS",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/png", sizes: "32x32" }
    ],
    apple: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "SHIBMETRICS - Real-time SHIB Burn Tracker & Analytics",
    description: "Track Shiba Inu token burns in real-time with comprehensive analytics and exclusive crypto exchange bonuses",
    type: "website",
    url: "https://shibmetrics.com",
    siteName: "SHIBMETRICS",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SHIBMETRICS - Real-time SHIB Burn Tracker & Analytics",
    description: "Track Shiba Inu token burns in real-time with comprehensive analytics and exclusive crypto exchange bonuses",
    creator: "@shibmetrics",
  },
  alternates: {
    canonical: "https://shibmetrics.com",
  },
  category: "Cryptocurrency Analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=2" />
        <link rel="shortcut icon" href="/favicon.svg?v=2" />
        <link rel="apple-touch-icon" href="/favicon.svg?v=2" />
      </head>
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
