// Logika murni tab kategori Desa Anti Korupsi — dipakai halaman kartu (page.tsx) dan detail.

const DETAIL_PATH = '/darmasaba/desa-anti-korupsi/detail';
const DEFAULT_KATEGORI = 'PENGUATAN TATA LAKSANA';

type ItemBerkategori = { kategori?: { name?: string | null } | null };

const normalize = (value: string) => value.trim().toLowerCase();

/** URL halaman detail yang langsung membuka tab kategori tertentu. */
export function detailHref(kategori: string): string {
  return `${DETAIL_PATH}?kategori=${encodeURIComponent(kategori)}`;
}

/** Tab awal: kategori yang cocok dengan param (abaikan kapital/spasi), fallback Tata Laksana, lalu kategori pertama. */
export function resolveInitialKategori(param: string | null | undefined, categories: string[]): string {
  if (param) {
    const match = categories.find(k => normalize(k) === normalize(param));
    if (match) return match;
  }
  if (categories.includes(DEFAULT_KATEGORI)) return DEFAULT_KATEGORI;
  return categories[0] ?? '';
}

/** Item yang nama kategorinya persis sama dengan tab terpilih. */
export function filterByKategori<T extends ItemBerkategori>(data: readonly T[], kategori: string): T[] {
  return data.filter(i => i.kategori?.name === kategori);
}
