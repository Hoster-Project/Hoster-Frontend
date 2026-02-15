import AppLayout from "@/components/layout/app-layout";
import { constructMetadata } from "@/lib/metadata";
import HomeLoader from "@/components/pages/home-loader";

export const metadata = constructMetadata({
  title: "Dashboard | Hoster",
  description: "Overview of your rental business performance and upcoming activities.",
});

export default function Dashboard() {
  return (
    <AppLayout>
      <HomeLoader />
    </AppLayout>
  );
}
