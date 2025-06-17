'use client'

import LayoutTabsEdit from "../_lib/layoutTabsEdit"

function Layout({children}: {children: React.ReactNode}) {
  return (
    <LayoutTabsEdit>
        {children}
    </LayoutTabsEdit>
  );
}

export default Layout;
