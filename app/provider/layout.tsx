'use client';

import RoleGuard from '@/components/auth/role-guard';

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['provider']}>
      {children}
    </RoleGuard>
  );
}
