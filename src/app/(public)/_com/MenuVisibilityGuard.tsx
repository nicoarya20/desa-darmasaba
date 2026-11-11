"use client";
import { notFound, usePathname } from "next/navigation";
import { useMenuVisibility } from "./MenuVisibilityContext";
import { isPathHidden } from "./menu-visibility.logic";

/**
 * 404 untuk halaman publik di bawah submenu tersembunyi. Dicek di client component (bukan
 * server layout) karena layout tidak menerima pathname dan tidak dirender ulang saat navigasi
 * client; usePathname berlaku saat SSR (buka URL langsung) maupun saat pindah halaman.
 */
export function MenuVisibilityGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { hiddenHrefs } = useMenuVisibility();
  if (isPathHidden(pathname, hiddenHrefs)) notFound();
  return <>{children}</>;
}
