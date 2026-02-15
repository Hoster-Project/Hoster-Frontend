import { constructMetadata } from "@/lib/metadata";
import AdminLoader from "@/components/pages/admin/loader";

export const metadata = constructMetadata({
  title: "Admin Dashboard | Hoster",
  description: "System overview and administrative controls.",
  noIndex: true,
});

export default function Page() {
  return <AdminLoader />;
}
