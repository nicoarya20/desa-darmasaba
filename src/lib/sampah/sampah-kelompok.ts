// Kelompok Sampah = section sidebar admin (urutan sidebar) + "Lainnya". Fungsi murni tanpa I/O.
import { allDomains } from "@/app/admin/_com/nav";

export type SampahKelompok = { id: string; nama: string };
export type SampahAsal = { kelompokId: string; kelompokNama: string; menuId: string | null; menuNama: string | null };

/** Kelompok untuk item yang asalnya tidak diketahui / bukan menu sidebar. */
export const SAMPAH_KELOMPOK_LAINNYA: SampahKelompok = { id: "lainnya", nama: "Lainnya" };
/** Nilai query `kelompok` untuk semua item. */
export const SAMPAH_KELOMPOK_SEMUA = "semua";

type MenuInfo = { menuNama: string; kelompok: SampahKelompok };

/** ID menu (submenu, atau section tanpa submenu seperti "Musik") → nama menu + section-nya. */
const MENU_INDEX: ReadonlyMap<string, MenuInfo> = new Map(
  allDomains.flatMap((section): [string, MenuInfo][] => {
    const kelompok = { id: section.id, nama: section.name };
    if (!section.children?.length) return [[section.id, { menuNama: section.name, kelompok }]];
    return section.children.map((child): [string, MenuInfo] => [child.id, { menuNama: child.name, kelompok }]);
  }),
);

/** Daftar kelompok lengkap: section sidebar sesuai urutan, lalu "Lainnya". */
export function sampahKelompokList(): SampahKelompok[] {
  return [...allDomains.map((s) => ({ id: s.id, nama: s.name })), SAMPAH_KELOMPOK_LAINNYA];
}

/** True bila `id` adalah ID kelompok yang valid (termasuk "lainnya"), bukan "semua". */
export function isSampahKelompokId(id: string): boolean {
  return sampahKelompokList().some((k) => k.id === id);
}

/** True bila `menuId` adalah ID menu sidebar yang dikenal. */
export function isKnownSampahMenuId(menuId: string): boolean {
  return MENU_INDEX.has(menuId);
}

/** Semua ID menu sidebar yang dikenal (untuk filter "Lainnya" = di luar daftar ini). */
export function knownSampahMenuIds(): string[] {
  return [...MENU_INDEX.keys()];
}

/** ID menu yang termasuk satu kelompok (section); kosong untuk "lainnya"/ID tak dikenal. */
export function menuIdsOfKelompok(kelompokId: string): string[] {
  return [...MENU_INDEX.entries()].filter(([, info]) => info.kelompok.id === kelompokId).map(([id]) => id);
}

/** Kelompok tempat sebuah ID menu berada; null/tidak dikenal → "lainnya". */
export function kelompokIdOfMenu(menuId: string | null): string {
  return (menuId && MENU_INDEX.get(menuId)?.kelompok.id) || SAMPAH_KELOMPOK_LAINNYA.id;
}

/** Asal item untuk respons API (kelompok + menu); menu tak dikenal tetap dilaporkan apa adanya di "Lainnya". */
export function resolveSampahAsal(menuId: string | null): SampahAsal {
  const info = menuId ? MENU_INDEX.get(menuId) : undefined;
  if (!info) {
    return { kelompokId: SAMPAH_KELOMPOK_LAINNYA.id, kelompokNama: SAMPAH_KELOMPOK_LAINNYA.nama, menuId, menuNama: null };
  }
  return { kelompokId: info.kelompok.id, kelompokNama: info.kelompok.nama, menuId, menuNama: info.menuNama };
}
