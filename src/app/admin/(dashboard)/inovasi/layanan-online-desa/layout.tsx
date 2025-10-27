'use client'
import LayoutTabsLayananOnlineDesa from "./_lib/layoutTabs";

function Layout({ children }: { children: React.ReactNode }) {
    return (
        <LayoutTabsLayananOnlineDesa>
            {children}
        </LayoutTabsLayananOnlineDesa>
    );
}

export default Layout;
