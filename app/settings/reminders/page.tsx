import SettingsRemindersPage from '@/components/pages/settings-reminders';
import AppLayout from '@/components/layout/app-layout';
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Reminders | Hoster",
  description: "Set up automated reminders for guests and staff.",
});

export default function Page() {
  return (
    <AppLayout>
      <SettingsRemindersPage />
    </AppLayout>
  );
}
