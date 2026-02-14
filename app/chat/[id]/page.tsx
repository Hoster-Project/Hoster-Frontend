import ChatPage from '@/components/pages/chat';
import AppLayout from '@/components/layout/app-layout';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return (
    <AppLayout>
      <ChatPage conversationId={resolvedParams.id} />
    </AppLayout>
  );
}
