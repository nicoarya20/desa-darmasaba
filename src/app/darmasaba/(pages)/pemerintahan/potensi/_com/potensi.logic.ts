import DOMPurify from "dompurify";

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

/** Tag yang diizinkan untuk konten lengkap (sama dengan tampilan detail di admin). */
export const RICH_TEXT_TAGS = ["p", "br", "strong", "em", "u", "ul", "ol", "li"];

const ENTITIES: Record<string, string> = { nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

/** Ubah HTML editor admin (deskripsi singkat) jadi teks polos untuk cuplikan kartu; aman dirender sebagai teks. */
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
 * Bersihkan HTML konten lengkap sebelum dirender di overlay detail; string kosong bila tak ada isi.
 * DOMPurify butuh DOM: di server (tanpa `window`) `sanitize` tidak ada, jadi kembalikan "" — overlay
 * (Modal di portal) hanya dirender di browser, sehingga cabang ini tidak pernah tampil ke pengunjung.
 */
export function sanitizePotensiHtml(html: string | null | undefined): string {
  if (!html || typeof DOMPurify.sanitize !== "function") return "";
  // Editor menyimpan "<p></p>" untuk isian kosong — anggap tidak ada isi.
  if (htmlToPlainText(html) === "") return "";
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: RICH_TEXT_TAGS, ALLOWED_ATTR: [] });
}
