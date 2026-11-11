'use client'
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
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
  // - /pemerintahan/galery/foto → panjang 3 → list
  // - /pemerintahan/galery/video → panjang 3 → list
  // - /pemerintahan/galery/video/123 → panjang 4 → detail

  const segments = pathname.split('/').filter(Boolean);
  const isDetailPage = segments.length === 4; // [pemerintahan, galery, video, id]

  if (isDetailPage) {
    // Tampilkan tanpa tab menu
    return <>{children}</>
  }

  // Tampilkan dengan tab menu (untuk /semua atau /kategori)
  return <LayoutTabsGalery>{children}</LayoutTabsGalery>;
}