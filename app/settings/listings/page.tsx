import SettingsListingsPage from '@/components/pages/host/settings-listings';
import AppLayout from '@/components/layout/app-layout';
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Manage Listings | Hoster",
  description: "Add, edit, and manage your property listings.",
  noIndex: true,
});

export default function Page() {
  return (
    <AppLayout>
      <SettingsListingsPage />
    </AppLayout>
  );
}
