'use client';

import { useRouter } from 'next/navigation';
import AdminLogin from '@/components/pages/admin/admin-login';

export default function Page() {
  const router = useRouter();
  return <AdminLogin onSuccess={() => router.push('/admin')} />;
}
