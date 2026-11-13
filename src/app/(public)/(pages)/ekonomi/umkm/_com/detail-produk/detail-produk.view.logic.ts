/** Logika tampilan murni halaman detail produk UMKM. */

/** Inisial avatar penjual: huruf pertama dua kata pertama, huruf besar; kosong → "?". */
export function inisialNama(nama: string): string {
  const huruf = nama
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((kata) => Array.from(kata)[0] ?? '')
    .join('')
    .toLocaleUpperCase('id-ID');
  return huruf === '' ? '?' : huruf;
}
