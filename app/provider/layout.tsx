'use client';

import RoleGuard from '@/components/auth/role-guard';
import { useRealtimeSocket } from '@/hooks/use-realtime-socket';
import { usePathname } from 'next/navigation';

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useRealtimeSocket();

  const isProviderAuthPath =
    pathname === "/provider/login" ||
    pathname === "/provider/signup" ||
    pathname === "/provider/company-signup";

  if (isProviderAuthPath) {
    return <>{children}</>;
  }

  return (
    <RoleGuard allowedRoles={['provider', 'employee']}>
      {children}
    </RoleGuard>
  );
}
