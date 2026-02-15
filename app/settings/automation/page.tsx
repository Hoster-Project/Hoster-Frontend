import SettingsAutomationPage from '@/components/pages/settings-automation';
import AppLayout from '@/components/layout/app-layout';
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Automation Rules | Hoster",
  description: "Configure automated messages and check-in instructions.",
});

export default function Page() {
  return (
    <AppLayout>
      <SettingsAutomationPage />
    </AppLayout>
  );
}
