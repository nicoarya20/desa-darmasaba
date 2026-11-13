'use client';
import { Alert } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import { useSnapshot } from 'valtio';
import { authStore } from '@/store/authStore';
import { isDeveloperRole } from '@/lib/auth-policy';

/** Semua halaman /admin/developer/* khusus role Developer; children (dan fetch-nya) tidak dirender untuk role lain. */
export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
  const { user } = useSnapshot(authStore);

  if (!isDeveloperRole(user?.roleId)) {
    // API /api/developer/* tetap menolak (403); ini supaya role lain tidak melihat halaman rusak.
    return (
      <Alert color="red" title="Akses ditolak" icon={<IconLock size={18} />} m="md" role="alert">
        Halaman ini hanya untuk Developer.
      </Alert>
    );
  }
  return <>{children}</>;
}
