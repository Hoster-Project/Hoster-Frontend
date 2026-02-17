import { constructMetadata } from "@/lib/metadata";
import ProviderCompanyProfilePage from "@/components/pages/provider/provider-company-profile-page";

export const metadata = constructMetadata({
  title: "Provider Company Profile | Hoster",
  description: "Update provider company profile and pricing.",
  noIndex: true,
});

export default function Page() {
  return <ProviderCompanyProfilePage />;
}
