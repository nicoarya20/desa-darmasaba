import searchMenu, { DEFAULT_SEARCH_MENUS, flattenMenu, type MenuSearchItem } from '@/app/darmasaba/_com/searchMenu';
import type { MenuItem } from '../../../../../../types/menu-item';

/** Alamat halaman Peta Informasi; dipakai footer dan dropdown pencarian sebagai pintu masuk. */
export const PETA_INFORMASI_HREF = '/darmasaba/peta-informasi';

/** Satu kartu di Peta Informasi: nama menu utama dan halaman-halaman di dalamnya. */
export type PetaInformasiGroup = {
  name: string;
  pages: MenuSearchItem[];
};

/**
 * Kelompokkan halaman per menu utama, urutan grup = urutan kemunculan pertama
 * (grup navbar dulu, lalu grup tambahan). Grup bernama sama digabung, href ganda dan
 * halaman Peta Informasi sendiri dibuang, grup yang jadi kosong tidak ikut.
 */
export function groupPetaInformasi(pages: readonly MenuSearchItem[]): PetaInformasiGroup[] {
  const groups = new Map<string, MenuSearchItem[]>();
  const seen = new Set<string>([PETA_INFORMASI_HREF]);
  for (const page of pages) {
    if (seen.has(page.href)) continue;
    seen.add(page.href);
    const group = groups.get(page.parent);
    if (group) group.push(page);
    else groups.set(page.parent, [page]);
  }
  return [...groups].map(([name, grouped]) => ({ name, pages: grouped }));
}

/**
 * Grup Peta Informasi untuk teks saring: kosong → semua halaman; selain itu hanya halaman
 * yang cocok menurut `searchMenu`, tetap dalam urutan config (bukan urutan relevansi).
 */
export function petaInformasiGroups(
  query: string,
  menus: readonly MenuItem[] = DEFAULT_SEARCH_MENUS,
): PetaInformasiGroup[] {
  const all = flattenMenu(menus);
  if (!query.trim()) return groupPetaInformasi(all);
  const matched = new Set(searchMenu(query, menus).map((m) => m.href));
  return groupPetaInformasi(all.filter((page) => matched.has(page.href)));
}

/** Jumlah seluruh halaman dalam daftar grup (untuk ringkasan hasil saring). */
export function countPages(groups: readonly PetaInformasiGroup[]): number {
  return groups.reduce((total, group) => total + group.pages.length, 0);
}
