import { z } from "zod";
import { isHttpUrl, urlHttpSchema } from "./tautan.validation";

/** Titik awal peta admin saat lokasi belum dipilih (sekitar Desa Darmasaba, Badung). */
export const PUSAT_PETA_DEFAULT = { lat: -8.65, lng: 115.2 } as const;

export type Koordinat = { lat: number; lng: number };

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
