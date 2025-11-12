import React from 'react';
import LayoutTabs from './_lib/layoutTabs';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutTabs>
      {children}
    </LayoutTabs>
  );
}
export default Layout;
