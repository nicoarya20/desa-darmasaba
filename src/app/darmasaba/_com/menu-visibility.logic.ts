import navbarListMenu from "@/con/navbar-list-menu";
import searchExtraPages from "@/con/search-extra-pages";
import type { MenuItem } from "../../../../types/menu-item";
import { isPathActive, visibleMenu } from "./navbar-menu.logic";

// Visibilitas EFEKTIF submenu publik = default `hidden` di navbar-list-menu.ts, ditimpa
// override DB (tabel MenuVisibility, key = href submenu). Fungsi murni — dipakai server
// (layout + API) dan client (navbar, pencarian, Peta Informasi, guard 404).

/** Tag cache Next untuk daftar override; di-revalidate setiap kali pengaturan disimpan. */
export const MENU_VISIBILITY_TAG = "menu-visibility";

/** Override per submenu: href submenu → true tampil / false sembunyi. Tanpa key = default config. */
export type MenuVisibilityOverrides = Readonly<Record<string, boolean>>;

/** Satu baris override seperti disimpan di DB dan dikirim API publik. */
export type MenuVisibilityRow = { menuKey: string; isVisible: boolean };

/** Submenu yang bisa diatur visibilitasnya, beserta default & status efektifnya. */
export type MenuVisibilityItem = {
  menuKey: string;
  name: string;
  defaultVisible: boolean;
  isVisible: boolean;
  overridden: boolean;
};

/** Satu menu utama dan submenu-submenunya untuk halaman pengaturan admin. */
export type MenuVisibilityGroup = { id: string; name: string; items: MenuVisibilityItem[] };

/** Hasil turunan override yang dipakai seluruh UI publik. */
export type EffectiveMenuVisibility = {
  navbarMenu: MenuItem[];
  searchMenus: MenuItem[];
  hiddenHrefs: string[];
};

/** Semua submenu ber-href di config navbar — himpunan menuKey yang sah. */
function submenusOf(menus: readonly MenuItem[]): MenuItem[] {
  return menus.flatMap((menu) => (menu.children ?? []).filter((child) => Boolean(child.href)));
}

const KNOWN_MENU_KEYS = new Set(submenusOf(navbarListMenu).map((child) => child.href as string));

/** Benar bila `key` adalah href submenu yang memang ada di navbar-list-menu.ts. */
export function isKnownMenuKey(key: string): boolean {
  return KNOWN_MENU_KEYS.has(key);
}

/** Ubah baris DB jadi peta override; key yang sudah tidak ada di config diabaikan. */
export function toOverrides(rows: readonly MenuVisibilityRow[]): MenuVisibilityOverrides {
  const overrides: Record<string, boolean> = {};
  for (const row of rows) {
    if (isKnownMenuKey(row.menuKey)) overrides[row.menuKey] = row.isVisible;
  }
  return overrides;
}

/** Terapkan override ke config: item ber-href yang punya override mendapat `hidden` baru (di semua level). */
export function applyMenuOverrides(menus: readonly MenuItem[], overrides: MenuVisibilityOverrides): MenuItem[] {
  return menus.map((item): MenuItem => {
    const children = item.children ? applyMenuOverrides(item.children, overrides) : undefined;
    const override = item.href !== undefined ? overrides[item.href] : undefined;
    const next = children ? { ...item, children } : { ...item };
    return override === undefined ? next : { ...next, hidden: !override };
  });
}

/** Href submenu navbar yang tersembunyi secara efektif (default config + override). */
export function hiddenMenuHrefs(overrides: MenuVisibilityOverrides, menus: readonly MenuItem[] = navbarListMenu): string[] {
  return submenusOf(applyMenuOverrides(menus, overrides))
    .filter((child) => child.hidden)
    .map((child) => child.href as string);
}

/** Benar bila `pathname` sama dengan atau berada di bawah (per segmen) salah satu href tersembunyi. */
export function isPathHidden(pathname: string, hiddenHrefs: readonly string[]): boolean {
  return hiddenHrefs.some((href) => isPathActive(pathname, href));
}

/** Hitung menu navbar, sumber pencarian menu, dan daftar href tersembunyi dari override. */
export function effectiveMenuVisibility(overrides: MenuVisibilityOverrides): EffectiveMenuVisibility {
  const hiddenHrefs = hiddenMenuHrefs(overrides);
  const navbar = applyMenuOverrides(navbarListMenu, overrides);
  // Halaman tambahan pencarian di bawah href tersembunyi ikut dibuang (halamannya 404).
  const extras = searchExtraPages.map((group) => ({
    ...group,
    children: (group.children ?? []).filter((page) => !page.href || !isPathHidden(page.href, hiddenHrefs)),
  }));
  return {
    navbarMenu: visibleMenu(navbar),
    searchMenus: visibleMenu([...navbar, ...extras]),
    hiddenHrefs,
  };
}

/** Kelompokkan submenu navbar per menu utama untuk halaman pengaturan admin (urutan config). */
export function menuVisibilityGroups(overrides: MenuVisibilityOverrides): MenuVisibilityGroup[] {
  return navbarListMenu
    .map((menu) => ({
      id: menu.id,
      name: menu.name,
      items: submenusOf([menu]).map((child): MenuVisibilityItem => {
        const href = child.href as string;
        const defaultVisible = !child.hidden;
        const override = overrides[href];
        return {
          menuKey: href,
          name: child.name,
          defaultVisible,
          isVisible: override ?? defaultVisible,
          overridden: override !== undefined,
        };
      }),
    }))
    .filter((group) => group.items.length > 0);
}
