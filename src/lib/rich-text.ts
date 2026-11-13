/**
 * Teks kaya (HTML dari editor tiptap admin/formulir publik) untuk halaman publik — fungsi murni dipakai
 * Potensi Desa, Daftar Informasi Publik PPID, dan Laporan Publik: ratakan jadi teks polos untuk cuplikan,
 * atau bersihkan sebelum dirender sebagai HTML.
 */
import DOMPurify from "dompurify";

/** Tag yang diizinkan untuk konten lengkap (format teks dasar: paragraf, tebal/miring/garis bawah, daftar). */
export const RICH_TEXT_TAGS = ["p", "br", "strong", "em", "u", "ul", "ol", "li"];

const ENTITIES: Record<string, string> = { nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

/** Ubah HTML editor jadi teks polos (cuplikan kartu/tabel); aman dirender sebagai teks. */
export function htmlToPlainText(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<(br|\/p|\/li|\/h\d)\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
      if (code[0] !== "#") return ENTITIES[code.toLowerCase()] ?? match;
      const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : match;
    })
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Bersihkan HTML (hanya `RICH_TEXT_TAGS`, tanpa atribut) sebelum dirender; string kosong bila tak ada isi.
 * DOMPurify butuh DOM: di server (tanpa `window`) `sanitize` tidak ada, jadi kembalikan "". Pemakai
 * (overlay Potensi di portal, detail Laporan Publik setelah fetch klien) hanya merender di browser,
 * sehingga cabang ini tidak pernah tampil ke pengunjung.
 */
export function sanitizeRichText(html: string | null | undefined): string {
  if (!html || typeof DOMPurify.sanitize !== "function") return "";
  // Editor menyimpan "<p></p>" untuk isian kosong — anggap tidak ada isi.
  if (htmlToPlainText(html) === "") return "";
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: RICH_TEXT_TAGS, ALLOWED_ATTR: [] });
}
