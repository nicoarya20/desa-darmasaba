import { phoneInfo } from "@/app/(public)/_com/kontak-darurat/kontak-phone.logic";

/** Kontak siap tampil: teks asli + tautan telepon/WhatsApp bila teks memuat nomor yang valid. */
export type TautanKontak = { teks: string; telHref: string | null; waHref: string | null };

// Deret angka mirip nomor telepon ("0815 5888 3388", "+62-815-5888-3388", "(0361) 846 3263").
const POLA_NOMOR = /\+?\(?\d[\d\s().-]{6,}\d/;
// Nomor telepon/seluler terpendek yang dianggap nomor (0 + kode wilayah 2 digit + 6 digit pelanggan).
const MIN_DIGIT_NOMOR = 9;

/**
 * Kontak bebas ("081558883388 (TPS3R OFFICIAL)") → teks asli + `tel:` (dan wa.me untuk nomor seluler)
 * memakai aturan nomor kontak darurat. Tanpa nomor valid → hanya teks. Null bila kontak kosong.
 */
export function tautanKontak(raw?: string | null): TautanKontak | null {
  const teks = (raw ?? "").trim();
  if (!teks) return null;

  const nomor = teks.match(POLA_NOMOR)?.[0] ?? "";
  const info = nomor.replace(/\D/g, "").length >= MIN_DIGIT_NOMOR ? phoneInfo(nomor) : null;
  if (!info || info.kind === "service") return { teks, telHref: null, waHref: null };
  return { teks, telHref: info.telHref, waHref: info.waHref };
}
