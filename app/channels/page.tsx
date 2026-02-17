import ChannelsPage from '@/components/pages/host/channels';
import AppLayout from '@/components/layout/app-layout';
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Channel Connections | Hoster",
  description: "Connect and manage your Airbnb, Booking.com, and other channel integrations.",
  noIndex: true,
});

export default function Page() {
  return (
    <AppLayout>
      <ChannelsPage />
    </AppLayout>
  );
}
