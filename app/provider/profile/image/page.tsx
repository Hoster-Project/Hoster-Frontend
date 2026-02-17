import { constructMetadata } from "@/lib/metadata";
import ProviderProfileImagePage from "@/components/pages/provider/provider-profile-image-page";

export const metadata = constructMetadata({
  title: "Provider Profile Image | Hoster",
  description: "Update provider profile picture.",
  noIndex: true,
});

export default function Page() {
  return <ProviderProfileImagePage />;
}
