import SettingsCleaningPage from '@/components/pages/host/settings-cleaning';
import AppLayout from '@/components/layout/app-layout';
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Cleaning Settings | Hoster",
  description: "Manage cleaning schedules and provider preferences.",
});

export default function Page() {
  return (
    <AppLayout>
      <SettingsCleaningPage />
    </AppLayout>
  );
}
