/** Batas panjang teks (karakter, tanpa tag) di atas mana teks CMS tanpa sub-judul dipotong + "Baca selengkapnya". */
export const CLAMP_MIN_CHARS = 1200;

/** Satu pembahasan: judul (teks polos dari <h3>) dan HTML isinya sampai <h3> berikutnya. */
export type ProseSection = { title: string; html: string };
/** Teks CMS yang dipecah per <h3>: `intro` = bagian sebelum <h3> pertama (bisa kosong). */
export type ProseSplit = { intro: string; sections: ProseSection[] };

const NAMED_ENTITIES: Record<string, string> = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

/** HTML → teks polos satu baris (tag dibuang, entitas umum didekode). Dipakai untuk judul tombol dan ukuran teks. */
export function plainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&([a-z]+);/gi, (whole, name: string) => NAMED_ENTITIES[name.toLowerCase()] ?? whole)
    .replace(/\s+/g, ' ')
    .trim();
}

/** Pembuka dan penutup wadah harus sama banyak, kalau tidak pemecahan memutus elemen bersarang (mis. <h3> di dalam <blockquote>). */
function containersBalanced(html: string): boolean {
  const opens = html.match(/<(ul|ol|blockquote|table|div|section)[\s>]/gi)?.length ?? 0;
  const closes = html.match(/<\/(ul|ol|blockquote|table|div|section)>/gi)?.length ?? 0;
  return opens === closes;
}

/**
 * Pecah HTML CMS per <h3> bila ada minimal dua. Mengembalikan null bila tidak layak dipecah (kurang dari dua
 * sub-judul, judul kosong, atau potongan memutus elemen bersarang) — pemanggil lalu memakai tampilan biasa.
 */
export function splitByHeading(html: string): ProseSplit | null {
  const parts = html.split(/(?=<h3[\s>])/i);
  const startsWithHeading = /^\s*<h3[\s>]/i.test(parts[0] ?? '');
  const intro = startsWithHeading ? '' : (parts.shift() ?? '');
  if (parts.length < 2) return null;

  const sections: ProseSection[] = [];
  for (const part of parts) {
    const match = /^\s*<h3[^>]*>([\s\S]*?)<\/h3>([\s\S]*)$/i.exec(part);
    const title = match ? plainText(match[1]) : '';
    if (!match || !title || !containersBalanced(match[2])) return null;
    sections.push({ title, html: match[2] });
  }
  return containersBalanced(intro) ? { intro, sections } : null;
}

/** True bila teks cukup panjang untuk dipotong. */
export function isLongProse(html: string): boolean {
  return plainText(html).length > CLAMP_MIN_CHARS;
}
