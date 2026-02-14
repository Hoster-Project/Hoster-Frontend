import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Hoster - Smart Rental Management",
    template: "%s | Hoster"
  },
  description: "Manage your short-term rentals with automation, unified inbox, and smart calendar syncing.",
  metadataBase: new URL('https://hoster.demo'), // Placeholder for demo
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://hoster.demo',
    title: 'Hoster - Smart Rental Management',
    description: 'Manage your short-term rentals with automation, unified inbox, and smart calendar syncing.',
    siteName: 'Hoster',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hoster - Smart Rental Management',
    description: 'Manage your short-term rentals with automation, unified inbox, and smart calendar syncing.',
  },
  icons: {
    icon: '/favicon.ico',
  },
  alternates: {
    canonical: '/',
  },
};

import { Providers } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Hoster",
    "url": "https://hoster.demo",
    "logo": "https://hoster.demo/logo.png",
    "sameAs": [
      "https://twitter.com/hoster",
      "https://facebook.com/hoster"
    ]
  };

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
