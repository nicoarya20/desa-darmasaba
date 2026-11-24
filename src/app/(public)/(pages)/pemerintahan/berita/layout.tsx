// app/(public)/(pages)/pemerintahan/berita/layout.tsx
'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { Box } from '@mantine/core';
import { DetailBackLink } from '@/app/(public)/_com/detail-back-link/DetailBackLink';
import { BERITA_LIST_HREF } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import { BERITA_TEXT } from './_com/berita.text';
const BeritaShell = dynamic(
  () => import('./_com/BeritaShell'),
  { ssr: false }
);

export default function BeritaLayoutClient({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  // Contoh path:
  // - /pemerintahan/berita/semua → panjang 3 → list
  // - /pemerintahan/berita/Pemerintahan → panjang 3 → list
  // - /pemerintahan/berita/Pemerintahan/123 → panjang 4 → detail

  const segments = pathname.split('/').filter(Boolean);
  const isDetailPage = segments.length === 4; // [pemerintahan, berita, kategori, id]

  if (isDetailPage) {
    // Tanpa tab menu; tautan kembali teks "‹ Berita" dengan jarak atas sama dengan detail produk UMKM (40/24px).
    return (
      <Box bg="var(--c-bg)">
        <Box pt={{ base: 24, md: 40 }} pb={24} px={{ base: 'md', md: 100 }}>
          <DetailBackLink href={BERITA_LIST_HREF} label={BERITA_TEXT.backLink} />
        </Box>
        {children}
      </Box>
    );
  }

  // Daftar berita (/semua atau /{kategori}): kepala + pil kategori gaya Kabar Desa beranda
  return <BeritaShell>{children}</BeritaShell>;
}