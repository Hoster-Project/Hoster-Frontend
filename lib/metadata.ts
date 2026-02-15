import { Metadata } from "next";

export function constructMetadata({
  title = "Hoster - Smart Rental Management",
  description = "Centralize your multi-channel bookings. Manage Airbnb, Booking.com, and more from one dashboard.",
  image = "/og-image.jpg",
  icons = "/favicon.ico",
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@hoster_app",
    },
    icons,
    metadataBase: new URL("https://hoster-demo.replit.app"),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
