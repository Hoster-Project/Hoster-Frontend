import { constructMetadata } from "@/lib/metadata";
import AdminProfilePage from "@/components/pages/admin/admin-profile-page";

export const metadata = constructMetadata({
  title: "Admin Profile | Hoster",
  description: "Update admin profile information.",
  noIndex: true,
});

export default function Page() {
  return <AdminProfilePage />;
}

