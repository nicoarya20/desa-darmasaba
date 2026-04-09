'use client'
import colors from '@/con/colors';
import { Box } from '@mantine/core';
import { usePathname } from 'next/navigation';
import type React from 'react';
import { Suspense } from 'react';
import LayoutTabs from './_lib/layoutTabs';

function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const isDetailPage = segments.length === 5; // [darmasaba, desa, berita, kategori, id]

  if (isDetailPage) {
      // Tampilkan tanpa tab menu
      return (
        <Box bg={colors.Bg}>
          {children}
        </Box>
      );
    }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LayoutTabs>
        {children}
      </LayoutTabs>
    </Suspense>
  );
}

export default Layout;
