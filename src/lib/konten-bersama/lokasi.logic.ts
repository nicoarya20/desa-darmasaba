import { z } from "zod";
import { isHttpUrl, urlHttpSchema } from "./tautan.validation";

/** Titik awal peta admin saat lokasi belum dipilih (sekitar Desa Darmasaba, Badung). */
export const PUSAT_PETA_DEFAULT = { lat: -8.65, lng: 115.2 } as const;

export type Koordinat = { lat: number; lng: number };

/** Lintang (derajat) valid. */
export const lintangSchema = z.number({ invalid_type_error: "Lintang harus berupa angka" }).finite().min(-90).max(90);
/** Bujur (derajat) valid. */
export const bujurSchema = z.number({ invalid_type_error: "Bujur harus berupa angka" }).finite().min(-180).max(180);

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
