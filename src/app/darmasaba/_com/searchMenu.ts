import navbarListMenu from '@/con/navbar-list-menu';
import searchExtraPages from '@/con/search-extra-pages';
import type { MenuItem } from '../../../../types/menu-item';

/** Sumber default pencarian: menu navbar dulu, lalu halaman publik di luar navbar. */
const DEFAULT_SEARCH_MENUS: readonly MenuItem[] = [...navbarListMenu, ...searchExtraPages];

/** Batas jumlah hasil menu yang tampil di dropdown pencarian global. */
export const MAX_MENU_RESULTS = 8;

/** Satu submenu navbar yang bisa dicari: nama submenu, nama menu utamanya, dan tujuan link. */
export type MenuSearchItem = {
  id: string;
  label: string;
  parent: string;
  href: string;
};

/** Ratakan menu navbar jadi daftar submenu ber-href, urut sesuai config. */
export function flattenMenu(menus: readonly MenuItem[]): MenuSearchItem[] {
  return menus.flatMap((menu) =>
    (menu.children ?? []).flatMap((child) =>
      child.href ? [{ id: child.id, label: child.name, parent: menu.name, href: child.href }] : [],
    ),
  );
}

/**
 * Prioritas kecocokan (kecil = lebih atas): 0 awal nama submenu, 1 tengah nama submenu,
 * 2 hanya nama menu utama, null = tidak cocok.
 */
function matchRank(item: MenuSearchItem, needle: string): number | null {
  const label = item.label.toLowerCase();
  if (label.startsWith(needle)) return 0;
  if (label.includes(needle)) return 1;
  if (item.parent.toLowerCase().includes(needle)) return 2;
  return null;
}

/** Cari submenu navbar (dan halaman tambahan) yang nama submenu atau nama menu utamanya memuat query (tidak peka huruf besar/kecil). */
export default function searchMenu(
  query: string,
  menus: readonly MenuItem[] = DEFAULT_SEARCH_MENUS,
  limit: number = MAX_MENU_RESULTS,
): MenuSearchItem[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  return flattenMenu(menus)
    .map((item, order) => ({ item, order, rank: matchRank(item, needle) }))
    .filter((m): m is { item: MenuSearchItem; order: number; rank: number } => m.rank !== null)
    .sort((a, b) => a.rank - b.rank || a.order - b.order)
    .slice(0, limit)
    .map((m) => m.item);
}
