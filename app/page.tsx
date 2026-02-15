import LandingPage from "@/components/pages/landing";
import { constructMetadata } from "@/lib/metadata";

export const dynamic = "force-static";

export const metadata = constructMetadata({
  title: "Hoster - Smart Rental Management",
  description: "Centralize your multi-channel bookings. Manage Airbnb, Booking.com, and more from one dashboard.",
});

export default function Home() {
  return <LandingPage />;
}
