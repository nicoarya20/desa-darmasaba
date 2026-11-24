/**
 * Aturan gambar sisipan di teks kaya (deskripsi Program Inovasi) — murni, tanpa I/O.
 * Dipakai bersama server (simpan + sanitasi render) dan admin (editor), supaya hanya gambar dari penyimpanan
 * sendiri (`/api/img/<nama berkas>`) yang boleh muncul di tengah teks.
 */

/** Batas jumlah gambar sisipan per deskripsi (dicek di form admin dan API). */
export const MAX_GAMBAR_SISIPAN = 10;

/** Batas ukuran berkas gambar sisipan sebelum diunggah (sama dengan logo/dokumentasi: 5 MB). */
export const MAX_UKURAN_GAMBAR_SISIPAN = 5 * 1024 ** 2;

const SRC_SISIPAN = /^\/api\/img\/([A-Za-z0-9._-]+)$/;
const IMG_SRC = /<img\b[^>]*?\bsrc\s*=\s*(["'])(.*?)\1/gi;

/** True bila `src` menunjuk gambar di penyimpanan sendiri (`/api/img/<nama>`), tanpa host, query, atau path lain. */
export function isGambarSisipanSrc(src: string | null | undefined): boolean {
  return typeof src === "string" && SRC_SISIPAN.test(src);
}

/** Semua nilai `src` tag `<img>` di HTML, berurutan, tanpa duplikat. */
export function srcGambarDalamHtml(html: string | null | undefined): string[] {
  if (!html) return [];
  const hasil = new Set<string>();
  for (const match of html.matchAll(IMG_SRC)) hasil.add(match[2]);
  return [...hasil];
}

/** Nama berkas FileStorage (`FileStorage.name`) dari gambar sisipan yang sah di HTML; src lain diabaikan. */
export function namaGambarSisipan(html: string | null | undefined): string[] {
  return srcGambarDalamHtml(html)
    .map((src) => SRC_SISIPAN.exec(src)?.[1])
    .filter((nama): nama is string => Boolean(nama));
}

const IMG_TAG = /<img\b[^>]*>/gi;
const ATTR_ESCAPE: Record<string, string> = { "&": "&amp;", '"': "&quot;", "<": "&lt;", ">": "&gt;" };

/**
 * Untuk HTML yang SUDAH disanitasi (atribut berkutip ganda, mis. keluaran DOMPurify): buang `<img>` yang bukan
 * gambar sisipan sah, lalu tulis ulang sisanya hanya dengan src, alt (kosong → `altBawaan`), dan lazy-load.
 */
export function rapikanGambarSisipan(html: string, altBawaan = ""): string {
  return html.replace(IMG_TAG, (tag) => {
    const src = /\bsrc="([^"]*)"/i.exec(tag)?.[1];
    if (!src || !isGambarSisipanSrc(src)) return "";
    // Alt dari HTML tersanitasi sudah ter-escape; alt bawaan (mis. nama program) di-escape di sini.
    const alt = /\balt="([^"]*)"/i.exec(tag)?.[1]?.trim() || altBawaan.replace(/[&"<>]/g, (c) => ATTR_ESCAPE[c]);
    return `<img src="${src}" alt="${alt}" loading="lazy" decoding="async">`;
  });
}

/** Ganti setiap `src` gambar yang ada di `peta` (mis. blob preview → link hasil unggah); src lain dibiarkan. */
export function gantiSrcGambar(html: string, peta: ReadonlyMap<string, string>): string {
  if (peta.size === 0) return html;
  return html.replace(IMG_SRC, (tag, kutip: string, src: string) => {
    const baru = peta.get(src);
    return baru === undefined ? tag : tag.replace(`${kutip}${src}${kutip}`, `${kutip}${baru}${kutip}`);
  });
}
