'use client'

import { usePathname } from "next/navigation";
import LayoutTabsDetail from "./_lib/layoutTabsDetail"
import { Box } from "@mantine/core";

export default function Layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Contoh path:
    // - /darmasaba/pemerintahan/berita/semua → panjang 5 → list
    // - /darmasaba/pemerintahan/berita/Pemerintahan → panjang 5 → list
    // - /darmasaba/pemerintahan/berita/Pemerintahan/123 → panjang 6 → detail

    const segments = pathname.split('/').filter(Boolean);
    const isDetailPage = segments.length >= 5;

    if (isDetailPage) {
        // Tampilkan tanpa tab menu
        return (
            <Box>
                {children}
            </Box>
        );
    }


    return (
        <LayoutTabsDetail>
            {children}
        </LayoutTabsDetail>
    )
}