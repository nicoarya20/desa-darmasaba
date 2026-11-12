/** Bentuk item potensi dari `potensiDesa.findMany` yang dipakai halaman publik. */
export type PotensiItem = {
  id: string;
  name: string;
  deskripsi?: string | null;
  content?: string | null;
  kategori?: { nama?: string | null } | null;
  image?: { link?: string | null } | null;
  // TODO(potensi-info): 4 field di bawah belum ada di model PotensiDesa — menunggu backend rekan.
  // Usulan kontrak respons find-many: lokasi/pengelola/status = string opsional (mis. "Buka untuk Umum"),
  // dokumentasi = relasi FileStorage[] di-include ({ id, link }). Sampai ada, overlay menampilkan "–".
  lokasi?: string | null;
  pengelola?: string | null;
  status?: string | null;
  dokumentasi?: ReadonlyArray<{ id?: string | null; link?: string | null }> | null;
};

/**
 * Batas muat halaman daftar: semua potensi tampil di satu halaman (data desa belasan, jauh di bawah batas ini).
 * Default `findMany.load()` = 10 sehingga data ke-11 dst. tidak pernah tampil dan kartu jumlah salah.
 */
export const POTENSI_LIST_LIMIT = 100;

export type PotensiInfoKey = "lokasi" | "pengelola" | "status";

/** Baris info overlay (Lokasi, Pengelola, Status) berurutan; `value` null bila kosong (UI menampilkan "–"). */
export function potensiInfoRows(item: PotensiItem): { key: PotensiInfoKey; value: string | null }[] {
  return (["lokasi", "pengelola", "status"] as const).map((key) => ({ key, value: item[key]?.trim() || null }));
}

/** Foto dokumentasi yang punya tautan; kosong → galeri disembunyikan. */
export function dokumentasiImages(item: PotensiItem): { key: string; link: string }[] {
  return (item.dokumentasi ?? []).flatMap((foto, i) => (foto.link ? [{ key: foto.id ?? `${i}`, link: foto.link }] : []));
}

/** Pilihan saring di kepala halaman: semua, potensi (non-wisata), atau wisata. */
export type PotensiFilter = "semua" | "potensi" | "wisata";

export const POTENSI_FILTERS: readonly PotensiFilter[] = ["semua", "potensi", "wisata"];

/** Wisata = kategori bernama "Wisata" (tanpa peduli huruf besar/kecil); kategori lain dihitung "Potensi". */
export function isWisata(item: PotensiItem): boolean {
  return item.kategori?.nama?.trim().toLowerCase() === "wisata";
}

/** Jumlah item per pilihan saring (angka di tombol pil). */
export function countByFilter(items: readonly PotensiItem[]): Record<PotensiFilter, number> {
  const wisata = items.filter(isWisata).length;
  return { semua: items.length, potensi: items.length - wisata, wisata };
}

/** Item yang tampil di grid untuk pilihan saring aktif. */
export function filterPotensi(items: readonly PotensiItem[], filter: PotensiFilter): PotensiItem[] {
  if (filter === "semua") return [...items];
  return items.filter((item) => isWisata(item) === (filter === "wisata"));
}
