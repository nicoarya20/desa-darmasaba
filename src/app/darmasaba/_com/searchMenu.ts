import navbarListMenu from '@/con/navbar-list-menu';
import searchExtraPages from '@/con/search-extra-pages';
import type { MenuItem } from '../../../../types/menu-item';
import { visibleMenu } from './navbar-menu.logic';

/** Sumber default pencarian: menu navbar yang terlihat dulu, lalu halaman publik di luar navbar. */
export const DEFAULT_SEARCH_MENUS: readonly MenuItem[] = visibleMenu([...navbarListMenu, ...searchExtraPages]);

/** Jumlah hasil "Halaman" yang tampil sebelum pengunjung menekan "Tampilkan N halaman lainnya". */
export const MENU_PREVIEW_COUNT = 5;

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
  limit: number = Infinity,
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

/** Potong hasil menu jadi pratinjau: `visible` yang dirender dan `hiddenCount` sisa yang belum dibuka. */
export function previewMenuResults<T>(
  results: readonly T[],
  expanded: boolean,
  previewCount: number = MENU_PREVIEW_COUNT,
): { visible: T[]; hiddenCount: number } {
  if (expanded || results.length <= previewCount) return { visible: [...results], hiddenCount: 0 };
  return { visible: results.slice(0, previewCount), hiddenCount: results.length - previewCount };
}
