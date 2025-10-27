'use client'
import React, { Suspense } from 'react';
import LayoutTabs from './_lib/layoutTabs';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LayoutTabs>
        {children}
      </LayoutTabs>
    </Suspense>
  );
}

export default Layout;
