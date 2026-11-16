'use client';
import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';
import { GOTONG_ROYONG_SCOPE } from './_com/gotong-royong.scope';

// Kerangka daftar Kegiatan Desa (kepala membaca useSearchParams → klien saja, sama dengan Kegiatan Desa).
const KegiatanShell = dynamic(() => import('../../pemerintahan/kegiatan-desa/_com/KegiatanShell'), { ssr: false });

/** Halaman Gotong Royong = daftar Kegiatan Desa berkategori Gotong Royong, tanpa pil kategori. */
export default function GotongRoyongLayout({ children }: { children: ReactNode }) {
  return <KegiatanShell scope={GOTONG_ROYONG_SCOPE}>{children}</KegiatanShell>;
}
