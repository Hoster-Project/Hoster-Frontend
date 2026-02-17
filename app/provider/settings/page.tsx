import { constructMetadata } from "@/lib/metadata";
import ProviderAppSettingsPage from "@/components/pages/provider/provider-app-settings-page";

export const metadata = constructMetadata({
  title: "Provider App Settings | Hoster",
  description: "Configure provider app preferences.",
  noIndex: true,
});

export default function Page() {
  return <ProviderAppSettingsPage />;
}
