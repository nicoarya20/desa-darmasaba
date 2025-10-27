'use client'
import React from 'react';
import LayoutTabsPotensi from './_lib/layoutTabs';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutTabsPotensi>
      {children}
    </LayoutTabsPotensi>
  )
}

export default Layout;

