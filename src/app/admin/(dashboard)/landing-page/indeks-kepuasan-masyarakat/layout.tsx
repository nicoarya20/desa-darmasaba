'use client'
import React from 'react';
import LayoutTabsKepuasan from './_lib/layoutTab';
import { usePathname } from 'next/navigation';
import { Box } from '@mantine/core';

function Layout({ children }: { children: React.ReactNode }) {
const pathname = usePathname();

  // Contoh path:
  // - /darmasaba/pemerintahan/berita/semua → panjang 5 → list
  // - /darmasaba/pemerintahan/berita/Pemerintahan → panjang 5 → list
  // - /darmasaba/pemerintahan/berita/Pemerintahan/123 → panjang 6 → detail

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
    <LayoutTabsKepuasan>
      {children}
    </LayoutTabsKepuasan>
  );
}

export default Layout;
