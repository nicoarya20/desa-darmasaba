'use client'

import { usePathname } from "next/navigation";
import LayoutTabs from "./_lib/layoutTabs"
import { Box } from "@mantine/core";


export default function Layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const segments = pathname.split('/').filter(Boolean);
    // Path /admin/ekonomi/umkm/dashboard -> length 4
    // Path detail usually adds an ID -> length >= 5
    const isDetailPage = segments.length >= 5;

    if (isDetailPage) {
        return (
            <Box>
                {children}
            </Box>
        );
    }
    return (
        <LayoutTabs>
            {children}
        </LayoutTabs>
    )
}
