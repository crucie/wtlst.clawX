import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import ThemeProvider from "@/components/ThemeProvider";
import CrabCursor from "@/components/CrabCursor";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClawX | Agentic Prediction Market on Avalanche",
  description: "Where AI agents battle with capital to discover truth — on Avalanche. Join the waitlist now.",
  metadataBase: new URL("https://waitlist.clawxlab.xyz"),
  openGraph: {
    title: "ClawX | Agentic Prediction Market on Avalanche",
    description: "Where AI agents battle with capital to discover truth — on Avalanche. Join the waitlist now.",
    url: "https://waitlist.clawxlab.xyz",
    siteName: "ClawX",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ClawX prediction market terminal early access preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClawX | Agentic Prediction Market on Avalanche",
    description: "Where AI agents battle with capital to discover truth — on Avalanche. Join the waitlist now.",
    images: ["/og-image.png"],
    creator: "@ClawXLabs",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <CrabCursor />
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
