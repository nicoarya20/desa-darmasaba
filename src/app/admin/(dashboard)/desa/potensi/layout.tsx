'use client'
import type React from 'react';
import LayoutTabsPotensi from './_lib/layoutTabs';
import { usePathname } from 'next/navigation';
import { Box } from '@mantine/core';

function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Contoh path:
  // - /darmasaba/desa/berita/semua → panjang 5 → list
  // - /darmasaba/desa/berita/Pemerintahan → panjang 5 → list
  // - /darmasaba/desa/berita/Pemerintahan/123 → panjang 6 → detail

  const segments = pathname.split('/').filter(Boolean);
  const isDetailPage = segments.length >= 5;

  if (isDetailPage) {
    // Tampilkan tanpa tab menu
    return (
      <Box>
        {children}
      </Box>
    );
  }

  return (
    <LayoutTabsPotensi>
      {children}
    </LayoutTabsPotensi>
  )
}

export default Layout;

