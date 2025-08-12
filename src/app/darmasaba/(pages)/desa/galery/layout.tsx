import LayoutTabsGalery from "./_lib/layoutTabs";

export default function LayoutGalery({ children }: { children: React.ReactNode }) {
    return (
        <LayoutTabsGalery>
            {children}
        </LayoutTabsGalery>
    )
}