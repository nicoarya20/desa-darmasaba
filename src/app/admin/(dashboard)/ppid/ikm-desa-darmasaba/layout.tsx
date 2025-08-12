'use client'
import React from 'react';
import LayoutTabsIKM from './_lib/layoutTabs';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutTabsIKM>
      {children}
    </LayoutTabsIKM>
  );
}

export default Layout;
