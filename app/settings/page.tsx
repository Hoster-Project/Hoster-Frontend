import SettingsPage from '@/components/pages/settings';
import AppLayout from '@/components/layout/app-layout';
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Settings | Hoster",
  description: "Configure your account, channels, and preferences.",
});

export default function Page() {
  return (
    <AppLayout>
      <SettingsPage />
    </AppLayout>
  );
}
