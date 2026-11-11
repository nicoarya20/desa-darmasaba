// app/(public)/(pages)/pemerintahan/berita/layout.tsx
'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { Box } from '@mantine/core';
import BackButton from '../layanan/_com/BackButto';
import colors from '@/con/colors';
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
    // Tampilkan tanpa tab menu
    return (
      <Box bg={colors.Bg}>
        <Box pt={33} px={{ base: 'md', md: 100 }}>
          <BackButton />
        </Box>
        {children}
      </Box>
    );
  }

  // Daftar berita (/semua atau /{kategori}): kepala + pil kategori gaya Kabar Desa beranda
  return <BeritaShell>{children}</BeritaShell>;
}