'use client'
import { Skeleton } from '@mantine/core';
import type { KontakDesaRecord } from '@/lib/kontak-desa';
import { useKontakDesa } from './use-kontak-desa';

/** Satu nilai kontak desa (email/telepon) di halaman PPID: kerangka selama memuat, kosong bila gagal dimuat. */
export function KontakDesaValue({ field }: { field: keyof Pick<KontakDesaRecord, 'email' | 'telepon'> }) {
  const { kontak, error } = useKontakDesa();
  if (kontak) return <>{kontak[field]}</>;
  return error ? null : <Skeleton component="span" display="inline-block" h={14} w={160} aria-hidden />;
}
