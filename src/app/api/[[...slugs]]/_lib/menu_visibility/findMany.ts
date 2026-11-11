import { getMenuVisibilityOverrides } from "@/lib/menu-visibility.server";
import type { MenuVisibilityRow } from "@/app/darmasaba/_com/menu-visibility.logic";

/** GET publik: daftar override visibilitas submenu ({ menuKey, isVisible }); tanpa row = default config. */
export default async function menuVisibilityFindMany() {
  const overrides = await getMenuVisibilityOverrides();
  const data: MenuVisibilityRow[] = Object.entries(overrides).map(([menuKey, isVisible]) => ({
    menuKey,
    isVisible,
  }));
  return { success: true, data };
}
