'use client'
import React from 'react';
import LayoutTabsKegiatanDesa from './_com/layoutTabs';
import { usePathname } from 'next/navigation';
import { Box } from '@mantine/core';

function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const segments = pathname.split('/').filter(Boolean);
  const isDetailPage = segments.length >= 5;

  if (isDetailPage) {
    return (
      <Box>
        {children}
      </Box>
    );
  }

  return (
    <LayoutTabsKegiatanDesa>
      {children}
    </LayoutTabsKegiatanDesa>
  );
}

export default Layout;
