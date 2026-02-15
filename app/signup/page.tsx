import SignupPage from "@/components/pages/signup";
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Sign Up | Hoster",
  description: "Create your Hoster account and start optimizing your vacation rental business.",
});

export default function Page() {
  return <SignupPage />;
}
