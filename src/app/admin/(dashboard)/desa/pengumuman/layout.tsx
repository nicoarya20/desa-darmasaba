import React from 'react';
import LayoutTabs from './_com/layoutTabs';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutTabs>
      {children}
    </LayoutTabs>
  );
}

export default Layout;
