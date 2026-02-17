import SettingsMaintenancePage from '@/components/pages/host/settings-maintenance';
import AppLayout from '@/components/layout/app-layout';
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Maintenance Settings | Hoster",
  description: "Track maintenance requests and provider contacts.",
});

export default function Page() {
  return (
    <AppLayout>
      <SettingsMaintenancePage />
    </AppLayout>
  );
}
