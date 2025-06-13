'use client'
import LayoutTabsGallery from "../../ppid/_com/layoutTabsGallery"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <LayoutTabsGallery>
            {children}
        </LayoutTabsGallery>
    )
}