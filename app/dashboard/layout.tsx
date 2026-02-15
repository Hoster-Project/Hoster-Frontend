'use client';

import RoleGuard from '@/components/auth/role-guard';

export default function HostLayout({ children }: { children: React.ReactNode }) {
  // Only hosts (default role) can access the main dashboard
  // Note: 'host' is the role name in DB logic. Default is often 'host'.
  return (
    <RoleGuard allowedRoles={['host']}>
      {children}
    </RoleGuard>
  );
}
