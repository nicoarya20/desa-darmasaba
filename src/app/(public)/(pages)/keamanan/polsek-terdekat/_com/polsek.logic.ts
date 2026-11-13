/**
 * Logika murni halaman Polsek Terdekat: teks kosong/"-", jarak ("5,8 Km" → 5.8), urutan terdekat,
 * jam operasional (badge "Buka 24 jam" hanya bila datanya memang begitu), daftar layanan, dan validasi URL peta.
 */

type LayananRef = { nama?: string | null; isActive?: boolean | null } | null | undefined;

/** Satu kantor polisi dari `GET /api/keamanan/polsekterdekat/find-many`. */
export type PolsekTerdekat = {
  id: string;
  nama: string;
  jarakKeDesa?: string | null;
  alamat?: string | null;
  nomorTelepon?: string | null;
  jamOperasional?: string | null;
  embedMapUrl?: string | null;
  namaTempatMaps?: string | null;
  alamatMaps?: string | null;
  linkPetunjukArah?: string | null;
  layananPolsek?: LayananRef;
  LayananToPolsek?: { isActive?: boolean | null; layanan?: LayananRef }[] | null;
};

const METERS_PER_KM = 1000;
// Isian admin yang berarti "belum diisi": kosong, "-", "–", "—", ".", "N/A".
const PLACEHOLDER = /^(?:[-–—.\s]*|n\/?a)$/i;

/** Teks terisi (sudah di-trim) atau null untuk kosong/"-". */
export function filledText(value?: string | null): string | null {
  const text = (value ?? '').replace(/\s+/g, ' ').trim();
  return PLACEHOLDER.test(text) ? null : text;
}

/**
 * Jarak dalam km dari teks admin: "7 Km" → 7, "5,8 Km" → 5.8, "1.5 km" → 1.5, "800 m" → 0.8, "1.200 m" → 1.2.
 * Tanpa satuan dianggap km. Null bila kosong/"-"/tanpa angka.
 */
export function parseJarakKm(raw?: string | null): number | null {
  const text = filledText(raw);
  if (!text) return null;
  const match = text.match(/(\d+(?:[.,]\d+)*)\s*(km|kilometer|m|meter)?\b/i);
  if (!match) return null;
  const unit = (match[2] ?? 'km').toLowerCase();
  const inMeters = unit === 'm' || unit === 'meter';
  // Meter memakai titik ribuan ("1.200 m"); km memakai koma/titik desimal ("5,8" / "5.8").
  const numeric = inMeters && /^\d{1,3}(\.\d{3})+$/.test(match[1]) ? match[1].replace(/\./g, '') : match[1].replace(',', '.');
  const value = Number(numeric);
  if (!Number.isFinite(value)) return null;
  return inMeters ? value / METERS_PER_KM : value;
}

/** Jarak siap tampil dipisah angka & satuan: 5.8 → { value: "5,8", unit: "km" }, 0.8 → { value: "800", unit: "m" }. */
export function formatJarak(km: number): { value: string; unit: 'km' | 'm' } {
  if (km < 1) return { value: String(Math.round(km * METERS_PER_KM)), unit: 'm' };
  return { value: km.toLocaleString('id-ID', { maximumFractionDigits: 1 }), unit: 'km' };
}

/** Urut jarak terdekat; jarak kosong/tak terbaca di paling bawah dengan urutan asal tetap. */
export function sortByJarak<T extends Pick<PolsekTerdekat, 'jarakKeDesa'>>(items: readonly T[]): T[] {
  return items
    .map((item, index) => ({ item, index, km: parseJarakKm(item.jarakKeDesa) }))
    .sort((a, b) => {
      if (a.km === null || b.km === null) return a.km === b.km ? a.index - b.index : a.km === null ? 1 : -1;
      return a.km - b.km || a.index - b.index;
    })
    .map(({ item }) => item);
}

/** Jam operasional untuk tampilan; `open24` hanya bila isinya memang "24 jam" (bukan jam buka biasa). */
export type JamInfo = { open24: boolean; text: string };

// Cocok seluruh isian, mis. "Buka 24 Jam", "24 jam", "24 Jam setiap hari", "24/7". Isian campuran seperti
// "Senin-Jumat 08.00-16.00, piket 24 jam" sengaja tidak cocok supaya badge tidak menjanjikan hal yang salah.
const OPEN_24 = /^(?:buka\s+)?(?:24\s*jam(?:\s+(?:setiap|tiap)\s+hari)?|24\s*\/\s*7)$/i;

/** Null bila jam kosong/"-". */
export function jamInfo(raw?: string | null): JamInfo | null {
  const text = filledText(raw);
  if (!text) return null;
  return { open24: OPEN_24.test(text), text };
}

/** Nama layanan aktif tanpa duplikat; relasi banyak-ke-banyak dulu, lalu layanan utama sebagai cadangan. */
export function layananNames(item: Pick<PolsekTerdekat, 'layananPolsek' | 'LayananToPolsek'>): string[] {
  const refs: LayananRef[] = [
    ...(item.LayananToPolsek ?? []).filter((rel) => rel.isActive !== false).map((rel) => rel.layanan),
    item.layananPolsek,
  ];
  const names = refs
    .filter((ref) => ref && ref.isActive !== false)
    .map((ref) => filledText(ref?.nama))
    .filter((name): name is string => name !== null);
  return [...new Set(names)];
}

const MAP_EMBED_HOSTS = ['www.google.com', 'google.com', 'maps.google.com'];

function parseUrl(raw?: string | null): URL | null {
  const text = filledText(raw);
  if (!text) return null;
  try {
    return new URL(text);
  } catch {
    // Bukan URL absolut (isian admin keliru): diperlakukan sama dengan kosong, peta/tombol tidak ditampilkan.
    return null;
  }
}

/** URL embed Google Maps (https, path /maps/embed) atau null; iframe hanya boleh memuat sumber ini. */
export function mapEmbedSrc(raw?: string | null): string | null {
  const url = parseUrl(raw);
  if (!url || url.protocol !== 'https:' || !MAP_EMBED_HOSTS.includes(url.hostname)) return null;
  return url.pathname.startsWith('/maps/embed') ? url.toString() : null;
}

/** Tautan petunjuk arah http(s) atau null (mencegah `javascript:` dan isian bukan URL). */
export function directionsHref(raw?: string | null): string | null {
  const url = parseUrl(raw);
  return url && (url.protocol === 'https:' || url.protocol === 'http:') ? url.toString() : null;
}

/** Polsek yang tampil di peta: pilihan pengguna bila punya peta, selain itu yang pertama (terdekat) berpeta. */
export function pickMapPolsek<T extends Pick<PolsekTerdekat, 'id' | 'embedMapUrl'>>(
  items: readonly T[],
  selectedId: string | null,
): T | null {
  const withMap = items.filter((item) => mapEmbedSrc(item.embedMapUrl) !== null);
  return withMap.find((item) => item.id === selectedId) ?? withMap[0] ?? null;
}
