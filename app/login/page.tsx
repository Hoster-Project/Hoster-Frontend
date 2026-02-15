import LoginPage from "@/components/pages/login";
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Login | Hoster",
  description: "Sign in to manage your rentals, view bookings, and communicate with guests.",
});

export default function Page() {
  return <LoginPage />;
}
