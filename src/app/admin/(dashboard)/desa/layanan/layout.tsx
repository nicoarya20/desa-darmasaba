'use client'
import LayoutTabsLayanan from "../_com/layoutTabLayanan";

export default function Layout({children} : {children: React.ReactNode}) {
    return (
      <LayoutTabsLayanan>
        {children}
      </LayoutTabsLayanan>
    )
}