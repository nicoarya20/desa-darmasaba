import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import {
  MENU_VISIBILITY_TAG,
  toOverrides,
  type MenuVisibilityOverrides,
} from "@/app/darmasaba/_com/menu-visibility.logic";

/**
 * Override visibilitas menu publik dari DB, di-cache lintas request (tag MENU_VISIBILITY_TAG).
 * Dibaca di layout publik setiap request, jadi wajib ringan: tabel kecil (≤ jumlah submenu).
 * Cache dibuang oleh endpoint update via revalidateTag, bukan TTL.
 */
export const getMenuVisibilityOverrides = unstable_cache(
  async (): Promise<MenuVisibilityOverrides> => {
    const rows = await prisma.menuVisibility.findMany({
      select: { menuKey: true, isVisible: true },
    });
    return toOverrides(rows);
  },
  ["menu-visibility-overrides"],
  { tags: [MENU_VISIBILITY_TAG] },
);
