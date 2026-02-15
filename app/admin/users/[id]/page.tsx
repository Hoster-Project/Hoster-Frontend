import AdminUserDetail from '@/components/pages/admin/admin-user-detail';
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "User Details | Hoster",
  description: "View and manage individual user account details.",
  noIndex: true,
});

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <AdminUserDetail userId={resolvedParams.id} />;
}
