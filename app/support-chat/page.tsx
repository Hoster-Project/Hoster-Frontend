import SupportChatPage from '@/components/pages/host/support-chat';
import AppLayout from '@/components/layout/app-layout';
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Support Chat | Hoster",
  description: "Get help from our support team.",
  noIndex: true,
});

export default function Page() {
  return (
    <AppLayout fullWidth noPadding hideMobileHeader hideBottomTabs>
      <SupportChatPage />
    </AppLayout>
  );
}
