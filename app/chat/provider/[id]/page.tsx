import AppLayout from "@/components/layout/app-layout";
import ProviderChatPage from "@/components/pages/host/provider-chat";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppLayout noPadding fullWidth hideMobileHeader hideBottomTabs>
      <ProviderChatPage threadId={id} />
    </AppLayout>
  );
}
