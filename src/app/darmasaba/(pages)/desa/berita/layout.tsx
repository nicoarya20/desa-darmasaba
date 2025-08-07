import React from 'react';
import LayoutTabsBerita from './_lib/layoutTabs';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutTabsBerita>
      {children}
    </LayoutTabsBerita>
  );
}

export default Layout;
