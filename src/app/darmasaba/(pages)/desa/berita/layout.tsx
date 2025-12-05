// app/darmasaba/(pages)/desa/berita/layout.tsx
'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { Box } from '@mantine/core';
import BackButton from '../layanan/_com/BackButto';
import colors from '@/con/colors';
const LayoutTabsBerita = dynamic(
  () => import('./_lib/layoutTabs'),
  { ssr: false }
);

export default function BeritaLayoutClient({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  // Contoh path:
  // - /darmasaba/desa/berita/semua → panjang 5 → list
  // - /darmasaba/desa/berita/Pemerintahan → panjang 5 → list
  // - /darmasaba/desa/berita/Pemerintahan/123 → panjang 6 → detail

  const segments = pathname.split('/').filter(Boolean);
  const isDetailPage = segments.length === 5; // [darmasaba, desa, berita, kategori, id]

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

  // Tampilkan dengan tab menu (untuk /semua atau /kategori)
  return <LayoutTabsBerita>{children}</LayoutTabsBerita>;
}