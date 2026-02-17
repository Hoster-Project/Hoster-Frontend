import { constructMetadata } from "@/lib/metadata";
import ProviderLoader from "@/components/pages/provider/provider-loader";

export const metadata = constructMetadata({
  title: "Provider Portal | Hoster",
  description: "Manage your cleaning and maintenance service assignments.",
  noIndex: true,
});

export default function Page() {
  return <ProviderLoader />;
}
