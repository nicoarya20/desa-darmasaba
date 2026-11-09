'use client'
import { usePathname } from "next/navigation";
import LayoutTabsLayanan from "../_com/layoutTabLayanan";
import { Box } from "@mantine/core";

export default function Layout({children} : {children: React.ReactNode}) {
  const pathname = usePathname();

  // Contoh path:
  // - /darmasaba/pemerintahan/layanan/semua → panjang 5 → list
  // - /darmasaba/pemerintahan/layanan/Pemerintahan → panjang 5 → list
  // - /darmasaba/pemerintahan/layanan/Pemerintahan/123 → panjang 6 → detail

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
    <LayoutTabsLayanan>
      {children}
    </LayoutTabsLayanan>
  );
}