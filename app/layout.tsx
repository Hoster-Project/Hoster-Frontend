import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata();

import { Providers } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Hoster",
      "url": "https://hoster.demo",
      "logo": "https://hoster.demo/logo.png",
      "sameAs": [
        "https://twitter.com/hoster",
        "https://facebook.com/hoster"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Hoster",
      "url": "https://hoster.demo",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "description": "Centralize your multi-channel bookings. Manage Airbnb, Booking.com, and more from one dashboard.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
  ];

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning className={`${nunito.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
