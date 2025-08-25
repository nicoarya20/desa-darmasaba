import React from 'react';
import LayoutTabsKepuasan from './_lib/layoutTab';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutTabsKepuasan>
      {children}
    </LayoutTabsKepuasan>
  );
}

export default Layout;
