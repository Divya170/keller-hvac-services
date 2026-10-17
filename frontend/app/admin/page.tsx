import { Suspense } from 'react';
import { AdminApp } from '@/components/admin/AdminApp';

export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <AdminApp />
    </Suspense>
  );
}
