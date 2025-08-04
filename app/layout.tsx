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
  title: "SHIBMETRICS - SHIB Burn Tracker & Analytics",
  description: "Real-time Shiba Inu burn tracking, statistics, and ecosystem data. Track SHIB burns, exchange activity, and get the latest metrics.",
  keywords: "SHIB, Shiba Inu, burn tracker, crypto analytics, token burns, SHIB statistics",
  authors: [{ name: "SHIBMETRICS" }],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/png", sizes: "32x32" }
    ],
    apple: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "SHIBMETRICS - SHIB Burn Tracker",
    description: "Real-time Shiba Inu burn tracking and analytics", 
    type: "website",
    url: "https://shibmetrics.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "SHIBMETRICS - SHIB Burn Tracker",
    description: "Real-time Shiba Inu burn tracking and analytics",
  },
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
