import { constructMetadata } from "@/lib/metadata";
import ProviderProfileInfoPage from "@/components/pages/provider/provider-profile-info-page";

export const metadata = constructMetadata({
  title: "Provider Profile | Hoster",
  description: "Update provider profile information.",
  noIndex: true,
});

export default function Page() {
  return <ProviderProfileInfoPage />;
}
