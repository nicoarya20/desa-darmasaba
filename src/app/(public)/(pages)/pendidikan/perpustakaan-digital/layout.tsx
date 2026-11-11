'use client'
import colors from '@/con/colors';
import { Box } from '@mantine/core';
import { usePathname } from 'next/navigation';
import React, { Suspense } from 'react';
import LayoutTabs from './_lib/layoutTabs';

function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const isDetailPage = segments.length === 4; // [pendidikan, perpustakaan-digital, kategoriBuku, id]

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
