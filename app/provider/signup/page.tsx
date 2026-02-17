import ProviderSignupPage from "@/components/pages/provider/provider-signup-page";
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Provider Signup | Hoster",
  description: "Create an individual provider account.",
  noIndex: true,
});

export default function Page() {
  return <ProviderSignupPage />;
}
