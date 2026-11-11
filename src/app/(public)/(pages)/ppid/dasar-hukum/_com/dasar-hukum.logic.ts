import { parsePlainListItems } from '../../_com/cms-list.logic';

/** Satu peraturan: penanda ("UU Nomor 14 Tahun 2008") dan perihalnya (teks setelah "tentang"). */
export type DasarHukumItem = { nomor: string; perihal: string | null };

/** Kata yang memisahkan penanda peraturan dari perihalnya dalam penulisan baku Indonesia. */
const PERIHAL_SEPARATOR = ' tentang ';

/**
 * Mengurai HTML dasar hukum dari CMS menjadi daftar peraturan.
 * Mengembalikan `null` bila isinya bukan satu daftar teks polos — pemanggil lalu merender HTML apa adanya.
 */
export function parseDasarHukumItems(html: string): DasarHukumItem[] | null {
  const items = parsePlainListItems(html);
  if (!items) return null;

  return items.map((text) => {
    const at = text.toLowerCase().indexOf(PERIHAL_SEPARATOR);
    return at > 0
      ? { nomor: text.slice(0, at), perihal: text.slice(at + PERIHAL_SEPARATOR.length) }
      : { nomor: text, perihal: null };
  });
}
