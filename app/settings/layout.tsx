'use client';

import RoleGuard from '@/components/auth/role-guard';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['host']}>
      {children}
    </RoleGuard>
  );
}
