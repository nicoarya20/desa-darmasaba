'use client';
import { Alert } from '@mantine/core';
import { useSnapshot } from 'valtio';
import { authStore } from '@/store/authStore';
import { canManageSampah } from '@/lib/sampah/sampah-access';
import { SampahSettings } from './_com/SampahSettings';

/** Pengaturan → Sampah: foto & dokumen terhapus dari semua menu — khusus Super Admin & Developer. */
export default function SampahPage() {
  const { user } = useSnapshot(authStore);

  if (!canManageSampah(user?.roleId)) {
    // API tetap menolak (403); ini hanya supaya role lain tidak melihat halaman kosong.
    return (
      <Alert color="red" title="Akses ditolak" m="md">
        Halaman ini hanya untuk Super Admin dan Developer.
      </Alert>
    );
  }
  return <SampahSettings />;
}
