'use client'
import { Skeleton } from '@mantine/core';
import type { ReactNode } from 'react';
import type { KontakDesaRecord } from '@/lib/kontak-desa';
import { useKontakDesa } from './use-kontak-desa';

/** Satu nilai kontak desa (email/telepon/WhatsApp/jam layanan) di halaman PPID: kerangka selama memuat, kosong bila gagal dimuat. */
export function KontakDesaValue({ field }: { field: keyof Pick<KontakDesaRecord, 'email' | 'telepon' | 'whatsapp' | 'jamLayanan'> }) {
  const { kontak, error } = useKontakDesa();
  if (kontak) return <>{kontak[field]}</>;
  return error ? null : <Skeleton component="span" display="inline-block" h={14} w={160} aria-hidden />;
}

/**
 * Pembungkus baris WhatsApp opsional: anaknya hanya dirender bila admin sudah mengisi nomor. Selama memuat, gagal, atau
 * belum diisi tidak ada baris sama sekali (tidak ada label tanpa nilai). Anak berupa elemen biasa agar aman dipakai dari
 * Server Component.
 */
export function KontakDesaIfWhatsapp({ children }: { children: ReactNode }) {
  const { kontak } = useKontakDesa();
  return kontak?.whatsapp ? <>{children}</> : null;
}

/** Pembungkus baris jam layanan opsional: aturan sama dengan `KontakDesaIfWhatsapp` (anak hanya dirender bila admin mengisinya). */
export function KontakDesaIfJamLayanan({ children }: { children: ReactNode }) {
  const { kontak } = useKontakDesa();
  return kontak?.jamLayanan ? <>{children}</> : null;
}
