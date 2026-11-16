import { DIRECTIONS_BASE_URL } from "./bank-sampah.meta";

/** Bentuk `pengelolaansampah/find-many` (satu langkah mekanisme). */
export type LangkahApiItem = { id: string; name?: string | null; icon?: string | null };

/** Bentuk `keteranganbankterdekat/find-many` (satu lokasi). */
export type LokasiApiItem = {
  id: string;
  name?: string | null;
  alamat?: string | null;
  namaTempatMaps?: string | null;
  linkPetunjukArah?: string | null;
  lat?: number | string | null;
  lng?: number | string | null;
};

export type Langkah = { id: string; name: string; icon: string };

export type Lokasi = {
  id: string;
  name: string;
  alamat: string;
  /** Nama tempat di Google Maps; ikut dicari, tidak ditampilkan bila sama dengan `name`. */
  namaTempatMaps: string;
  lat: number | null;
  lng: number | null;
  /** Tautan rute (http/https) atau `null` bila tidak ada tautan maupun koordinat. */
  petunjukArah: string | null;
};

export type MappedLokasi = Lokasi & { lat: number; lng: number };

/** Langkah tanpa nama dibuang; urutan API (createdAt ASC) = urutan langkah. */
export function toLangkah(items: readonly LangkahApiItem[]): Langkah[] {
  return items
    .map((item) => ({ id: item.id, name: item.name?.trim() ?? "", icon: item.icon?.trim() ?? "" }))
    .filter((item) => item.name !== "");
}

/** Normalisasi lokasi API: teks dipangkas, koordinat tidak valid → `null`, tautan rute dipilih lewat `petunjukArahHref`. */
export function toLokasi(item: LokasiApiItem): Lokasi {
  const name = item.name?.trim() || item.namaTempatMaps?.trim() || "";
  const coords = parseCoords(item.lat, item.lng);
  return {
    id: item.id,
    name,
    alamat: item.alamat?.trim() ?? "",
    namaTempatMaps: item.namaTempatMaps?.trim() ?? "",
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
    petunjukArah: petunjukArahHref(item.linkPetunjukArah, coords),
  };
}

/** Urut nama A-Z (bahasa Indonesia, angka alami); lokasi tanpa nama di akhir. */
export function sortLokasi(items: readonly Lokasi[]): Lokasi[] {
  const collator = new Intl.Collator("id", { sensitivity: "base", numeric: true });
  return [...items].sort((a, b) => {
    if (!a.name || !b.name) return a.name ? -1 : b.name ? 1 : 0;
    return collator.compare(a.name, b.name);
  });
}

/** Saring klien: setiap kata kunci harus ada di nama, nama tempat Maps, atau alamat (tanpa beda huruf besar). */
export function filterLokasi(items: readonly Lokasi[], query: string): Lokasi[] {
  const words = query.trim().toLocaleLowerCase("id").split(/\s+/).filter(Boolean);
  if (words.length === 0) return [...items];
  return items.filter((item) => {
    const haystack = `${item.name} ${item.namaTempatMaps} ${item.alamat}`.toLocaleLowerCase("id");
    return words.every((word) => haystack.includes(word));
  });
}

export function hasCoords(item: Lokasi): item is MappedLokasi {
  return item.lat !== null && item.lng !== null;
}

/** `linkPetunjukArah` bila URL http(s) yang sah; selain itu rute dari koordinat; tanpa keduanya `null`. */
export function petunjukArahHref(link: string | null | undefined, coords: { lat: number; lng: number } | null): string | null {
  const trimmed = link?.trim();
  if (trimmed && isHttpUrl(trimmed)) return trimmed;
  return coords ? `${DIRECTIONS_BASE_URL}${coords.lat},${coords.lng}` : null;
}

/** Koordinat sah = angka berhingga dalam rentang bumi dan bukan 0,0 (nilai bawaan form kosong). */
export function parseCoords(lat: unknown, lng: unknown): { lat: number; lng: number } | null {
  const la = toNumber(lat);
  const ln = toNumber(lng);
  if (la === null || ln === null) return null;
  if (Math.abs(la) > 90 || Math.abs(ln) > 180 || (la === 0 && ln === 0)) return null;
  return { lat: la, lng: ln };
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    // URL tidak bisa diurai = bukan tautan yang sah; pemanggil memakai cadangan koordinat.
    return false;
  }
}
