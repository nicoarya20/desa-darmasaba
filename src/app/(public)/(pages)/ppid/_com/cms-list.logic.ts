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
 * Mengurai HTML dari editor CMS yang berupa satu daftar (`<ol>`/`<ul>`) menjadi teks polos per butir.
 * Mengembalikan `null` bila isinya bukan satu daftar teks polos — pemanggil lalu merender HTML apa adanya.
 */
export function parsePlainListItems(html: string): string[] | null {
  const list = SINGLE_LIST.exec(html.trim());
  if (!list) return null;

  const inner = list[2];
  if (INNER_LIST_TAG.test(inner)) return null;
  const items: string[] = [];
  for (const match of inner.matchAll(LIST_ITEM)) {
    if (RICH_CONTENT.test(match[1])) return null;
    const text = toPlainText(match[1]);
    if (text) items.push(text);
  }

  // Ada teks di luar <li> (mis. paragraf terselip) → jangan ambil risiko membuang isi.
  if (toPlainText(inner.replace(LIST_ITEM, ''))) return null;
  return items.length > 0 ? items : null;
}
