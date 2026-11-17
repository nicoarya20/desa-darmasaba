import { z } from "zod";
import { isHttpUrl, urlHttpSchema } from "./tautan.validation";

/** Titik awal peta admin saat lokasi belum dipilih (sekitar Desa Darmasaba, Badung). */
export const PUSAT_PETA_DEFAULT = { lat: -8.5712, lng: 115.1923 } as const;

export type Koordinat = { lat: number; lng: number };

/** Lintang (derajat) valid. */
export const lintangSchema = z.number({ invalid_type_error: "Lintang harus berupa angka" }).finite().min(-90).max(90);
/** Bujur (derajat) valid. */
export const bujurSchema = z.number({ invalid_type_error: "Bujur harus berupa angka" }).finite().min(-180).max(180);

const ANGKA = "-?\\d+(?:\\.\\d+)?";
const RE_PASANGAN = new RegExp(`^(${ANGKA})(\\s*,\\s*|\\s+)(${ANGKA})$`);
const RE_URL_PIN = new RegExp(`!3d(${ANGKA})!4d(${ANGKA})`);
const RE_URL_AT = new RegExp(`@(${ANGKA}),(${ANGKA})(?:[,/?]|$)`);

function koordinatValid(lat: number, lng: number): Koordinat | null {
  return lintangSchema.safeParse(lat).success && bujurSchema.safeParse(lng).success ? { lat, lng } : null;
}

function parsePasangan(teks: string): Koordinat | null {
  const m = RE_PASANGAN.exec(teks.trim());
  if (!m) return null;
  const [, lat, pemisah, lng] = m;
  // "-8,57" tanpa spasi bisa berarti koma desimal: wajib titik desimal di kedua angka.
  if (pemisah === "," && !(lat.includes(".") && lng.includes("."))) return null;
  return koordinatValid(Number(lat), Number(lng));
}

function parseUrlGoogleMaps(teks: string): Koordinat | null {
  if (!isLinkGoogleMaps(teks)) return null;
  const url = new URL(teks);
  const pin = RE_URL_PIN.exec(url.href);
  if (pin) return koordinatValid(Number(pin[1]), Number(pin[2]));
  for (const kunci of ["q", "query"]) {
    const nilai = url.searchParams.get(kunci);
    if (nilai) return parsePasangan(nilai);
  }
  const at = RE_URL_AT.exec(url.href);
  return at ? koordinatValid(Number(at[1]), Number(at[2])) : null;
}

/**
 * Koordinat dari teks tempelan admin: pasangan `"lat, lng"` / `"lat lng"` (titik desimal) atau URL Google Maps
 * berisi `!3dlat!4dlng`, `q=`/`query=lat,lng`, atau `@lat,lng`. Koma desimal & di luar rentang → null.
 */
export function parseKoordinatTeks(teks: string): Koordinat | null {
  const t = teks.trim();
  return parsePasangan(t) ?? parseUrlGoogleMaps(t);
}

/** True bila lat & lng sama-sama terisi atau sama-sama kosong (titik setengah tidak bermakna). */
export function koordinatBerpasangan({ lat, lng }: { lat?: number | null; lng?: number | null }): boolean {
  return (lat === undefined || lat === null) === (lng === undefined || lng === null);
}

/** Pesan bila hanya salah satu dari lintang/bujur dikirim. */
export const PESAN_KOORDINAT_TIDAK_LENGKAP = "Titik lokasi harus berisi lintang dan bujur";

/** URL petunjuk arah Google Maps ke koordinat (dipakai saat admin tidak memberi link Google Maps). */
export function linkRuteKoordinat({ lat, lng }: Koordinat): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/** True bila host URL milik Google Maps (termasuk link pendek `maps.app.goo.gl` dan `g.page`). */
export function isLinkGoogleMaps(value: string): boolean {
  if (!isHttpUrl(value)) return false;
  const host = new URL(value).hostname.toLowerCase();
  return host === "goo.gl" || host.endsWith(".goo.gl") || host === "g.page" || /(^|\.)google\.[a-z.]+$/.test(host);
}

/** Skema link Google Maps opsional dari admin: kosong → null, selain host Google Maps ditolak. */
export const linkGoogleMapsSchema = z
  .union([z.literal(""), urlHttpSchema.refine(isLinkGoogleMaps, "Link harus dari Google Maps (mis. https://maps.app.goo.gl/...)")])
  .nullable()
  .optional()
  .transform((v) => (v === undefined ? undefined : v || null));

/** Link yang dibuka tombol "Buka di Google Maps": link tersimpan bila valid, selain itu rute ke koordinat. */
export function linkGoogleMaps(link: string | null | undefined, koordinat?: Partial<Koordinat> | null): string | null {
  if (link && isHttpUrl(link)) return link;
  const { lat, lng } = koordinat ?? {};
  return typeof lat === "number" && typeof lng === "number" && (lat !== 0 || lng !== 0)
    ? linkRuteKoordinat({ lat, lng })
    : null;
}
