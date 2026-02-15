import InboxPage from '@/components/pages/inbox';
import AppLayout from '@/components/layout/app-layout';
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Inbox | Hoster",
  description: "Unified messaging for all your guest communications.",
});

export default function Page() {
  return (
    <AppLayout>
      <InboxPage />
    </AppLayout>
  );
}
