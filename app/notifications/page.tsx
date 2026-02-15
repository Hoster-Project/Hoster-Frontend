import NotificationsPage from '@/components/pages/notifications';
import AppLayout from '@/components/layout/app-layout';
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Notifications | Hoster",
  description: "View your latest notifications and alerts.",
  noIndex: true,
});

export default function Page() {
  return (
    <AppLayout>
      <NotificationsPage />
    </AppLayout>
  );
}
