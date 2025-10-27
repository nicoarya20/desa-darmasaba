'use client'
import dynamic from 'next/dynamic';
import React from 'react';

const LayoutSekolah = dynamic(
  () => import('./_lib/layoutTabs'),
  { ssr: false }
);

function Layout({children} : {children: React.ReactNode}) {
  return (
    <LayoutSekolah>
      {children}
    </LayoutSekolah>
  );
}

export default Layout;
