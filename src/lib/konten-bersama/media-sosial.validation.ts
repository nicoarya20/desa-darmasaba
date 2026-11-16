import { z } from "zod";
import {
  MAX_MEDIA_SOSIAL,
  PLATFORM_MEDIA_SOSIAL,
  isPlatformMediaSosial,
  type MediaSosialItem,
} from "./media-sosial.model";
import { isHttpUrl, urlHttpSchema } from "./tautan.validation";

/** Skema satu tautan media sosial: platform dikenal + URL http/https. */
export const mediaSosialItemSchema = z.object({
  platform: z.enum(PLATFORM_MEDIA_SOSIAL, { errorMap: () => ({ message: "Platform media sosial tidak dikenal" }) }),
  url: urlHttpSchema,
});

/** Skema daftar media sosial (body API); null/kosong = tidak punya media sosial. */
export const mediaSosialListSchema = z
  .array(mediaSosialItemSchema)
  .max(MAX_MEDIA_SOSIAL, `Maksimal ${MAX_MEDIA_SOSIAL} tautan media sosial`);

/**
 * Baca kolom `Json` media sosial dari DB untuk dikirim ke klien: entri yang rusak (platform tak dikenal,
 * URL bukan http/https) dibuang agar data lama/terketik manual tidak pernah dirender sebagai tautan berbahaya.
 */
export function bacaMediaSosial(raw: unknown): MediaSosialItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item): MediaSosialItem[] => {
    if (!item || typeof item !== "object") return [];
    const { platform, url } = item as Record<string, unknown>;
    if (!isPlatformMediaSosial(platform) || typeof url !== "string" || !isHttpUrl(url.trim())) return [];
    return [{ platform, url: url.trim() }];
  });
}
