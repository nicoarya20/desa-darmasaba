import React from 'react';
import LayoutTabsKolaborasi from './_lib/layoutTabs';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutTabsKolaborasi>
      {children}
    </LayoutTabsKolaborasi>
  );
}

export default Layout;
