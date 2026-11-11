'use client'
import colors from '@/con/colors';
import { Box } from '@mantine/core';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import BackButton from '../layanan/_com/BackButto';

const LayoutTabsKegiatanDesa = dynamic(
  () => import('./_lib/layoutTabs'),
  { ssr: false }
);

export default function KegiatanDesaLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // /pemerintahan/kegiatan-desa/semua          → 3 segments → list
  // /pemerintahan/kegiatan-desa/[kategori]     → 3 segments → list
  // /pemerintahan/kegiatan-desa/[kategori]/[id]→ 4 segments → detail
  const segments = pathname.split('/').filter(Boolean);
  const isDetailPage = segments.length === 4;

  if (isDetailPage) {
    return (
      <Box bg={colors.Bg}>
        <Box pt={33} px={{ base: 'md', md: 100 }}>
          <BackButton />
        </Box>
        {children}
      </Box>
    );
  }

  return <LayoutTabsKegiatanDesa>{children}</LayoutTabsKegiatanDesa>;
}
