import { constructMetadata } from "@/lib/metadata";
import ProviderSupportChatPage from "@/components/pages/provider/provider-support-chat";

export const metadata = constructMetadata({
  title: "Provider Support Chat | Hoster",
  description: "Chat with Hoster support from provider portal.",
  noIndex: true,
});

export default function Page() {
  return <ProviderSupportChatPage />;
}
