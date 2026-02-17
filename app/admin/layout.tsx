'use client';

import { AdminLayout } from '@/components/pages/admin/admin-layout';
import RoleGuard from '@/components/auth/role-guard';
import { usePathname } from 'next/navigation';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicAdminRoute =
    pathname === '/admin/login' || pathname === '/admin/admin-login';
  const allowedRoles = ['admin', 'moderator'];

  if (isPublicAdminRoute) {
    return <>{children}</>;
  }

  return (
    <RoleGuard allowedRoles={allowedRoles}>
      <AdminLayout>{children}</AdminLayout>
    </RoleGuard>
  );
}
