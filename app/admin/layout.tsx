'use client';

import { AdminLayout } from '@/components/pages/admin/admin-layout';
import RoleGuard from '@/components/auth/role-guard';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['admin', 'moderator']}>
      <AdminLayout>{children}</AdminLayout>
    </RoleGuard>
  );
}
