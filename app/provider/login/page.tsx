import ProviderLoginPage from "@/components/pages/provider/provider-login-page";
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Provider Login | Hoster",
  description: "Sign in to the provider portal.",
  noIndex: true,
});

export default function Page() {
  return <ProviderLoginPage />;
}
