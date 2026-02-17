import CalendarPage from '@/components/pages/host/calendar';
import AppLayout from '@/components/layout/app-layout';
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Calendar | Hoster",
  description: "Manage bookings, pricing, and availability across all channels.",
});

export default function Page() {
  return (
    <AppLayout>
      <CalendarPage />
    </AppLayout>
  );
}
