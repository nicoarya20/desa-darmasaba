'use client'

import LayoutTabsDetail from "./_lib/layoutTabsDetail"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <LayoutTabsDetail>
            {children}
        </LayoutTabsDetail>
    )
}