import AdminUserDetail from '@/components/pages/admin/admin-user-detail';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <AdminUserDetail userId={resolvedParams.id} />;
}
