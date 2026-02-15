import SettingsTemplatesPage from '@/components/pages/settings-templates';
import AppLayout from '@/components/layout/app-layout';
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Message Templates | Hoster",
  description: "Create and manage reusable message templates for guest communication.",
});

export default function Page() {
  return (
    <AppLayout>
      <SettingsTemplatesPage />
    </AppLayout>
  );
}
