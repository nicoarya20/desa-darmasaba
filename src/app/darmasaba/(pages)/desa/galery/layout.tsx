'use client'
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import LayoutTabsGalery from "./_lib/layoutTabs";

// export default function LayoutGalery({ children }: { children: React.ReactNode }) {
//     return (
//         <LayoutTabsGalery>
//             {children}
//         </LayoutTabsGalery>
//     )
// }

export default function BeritaLayoutClient({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  // Contoh path:
  // - /darmasaba/desa/berita/semua → panjang 5 → list
  // - /darmasaba/desa/berita/Pemerintahan → panjang 5 → list
  // - /darmasaba/desa/berita/Pemerintahan/123 → panjang 6 → detail

  const segments = pathname.split('/').filter(Boolean);
  const isDetailPage = segments.length === 5; // [darmasaba, desa, berita, kategori, id]

  if (isDetailPage) {
    // Tampilkan tanpa tab menu
    return <>{children}</>
  }

  // Tampilkan dengan tab menu (untuk /semua atau /kategori)
  return <LayoutTabsGalery>{children}</LayoutTabsGalery>;
}