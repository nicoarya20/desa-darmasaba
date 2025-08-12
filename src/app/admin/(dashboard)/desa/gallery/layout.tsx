'use client'
import LayoutTabsGallery from "./lib/layoutTabs"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <LayoutTabsGallery>
            {children}
        </LayoutTabsGallery>
    )
}