/** Satu peraturan: penanda ("UU Nomor 14 Tahun 2008") dan perihalnya (teks setelah "tentang"). */
export type DasarHukumItem = { nomor: string; perihal: string | null };

/** Kata yang memisahkan penanda peraturan dari perihalnya dalam penulisan baku Indonesia. */
const PERIHAL_SEPARATOR = ' tentang ';

const SINGLE_LIST = /^<(ul|ol)\b[^>]*>([\s\S]*)<\/\1>$/i;
const LIST_ITEM = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
/** Tag daftar di dalam daftar terluar: daftar bersarang, atau dua daftar berurutan yang ikut tertangkap. */
const INNER_LIST_TAG = /<\/?(ul|ol)\b/i;
/** Isi butir yang tidak bisa diwakili teks polos: tautan, gambar, tabel. */
const RICH_CONTENT = /<(a|img|table)\b/i;

const ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

function toPlainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(nbsp|amp|lt|gt|quot|#39);/g, (entity) => ENTITIES[entity])
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Mengurai HTML dasar hukum dari CMS menjadi daftar peraturan.
 * Mengembalikan `null` bila isinya bukan satu daftar teks polos — pemanggil lalu merender HTML apa adanya.
 */
export function parseDasarHukumItems(html: string): DasarHukumItem[] | null {
  const list = SINGLE_LIST.exec(html.trim());
  if (!list) return null;

  const inner = list[2];
  if (INNER_LIST_TAG.test(inner)) return null;
  const items: DasarHukumItem[] = [];
  for (const match of inner.matchAll(LIST_ITEM)) {
    if (RICH_CONTENT.test(match[1])) return null;
    const text = toPlainText(match[1]);
    if (!text) continue;
    const at = text.toLowerCase().indexOf(PERIHAL_SEPARATOR);
    items.push(
      at > 0
        ? { nomor: text.slice(0, at), perihal: text.slice(at + PERIHAL_SEPARATOR.length) }
        : { nomor: text, perihal: null },
    );
  }

  // Ada teks di luar <li> (mis. paragraf terselip) → jangan ambil risiko membuang isi.
  if (toPlainText(inner.replace(LIST_ITEM, ''))) return null;
  return items.length > 0 ? items : null;
}
