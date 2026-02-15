import ChatPage from '@/components/pages/chat';
import AppLayout from '@/components/layout/app-layout';
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Conversation | Hoster",
  description: "View and respond to guest messages.",
  noIndex: true,
});

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return (
    <AppLayout fullWidth noPadding hideMobileHeader hideBottomTabs>
      <ChatPage conversationId={resolvedParams.id} />
    </AppLayout>
  );
}
