import {
  gantiSrcGambar,
  isGambarSisipanSrc,
  MAX_GAMBAR_SISIPAN,
  MAX_UKURAN_GAMBAR_SISIPAN,
  srcGambarDalamHtml,
} from '@/lib/gambar-sisipan';

/** Unggah satu berkas gambar dan kembalikan link tersimpannya (`/api/img/...`), atau null bila gagal. */
export type UnggahGambarSisipan = (file: File) => Promise<string | null>;

/** Pesan penolakan berkas gambar sisipan, atau null bila boleh disisipkan. */
export function periksaBerkasSisipan(file: Pick<File, 'type' | 'size'>): string | null {
  if (!file.type.startsWith('image/')) return 'Berkas yang disisipkan harus berupa gambar';
  if (file.size > MAX_UKURAN_GAMBAR_SISIPAN) return 'Ukuran gambar maksimal 5MB';
  return null;
}

/** Pesan bila jumlah gambar di deskripsi melebihi batas, atau null. */
export function periksaJumlahSisipan(html: string): string | null {
  const jumlah = srcGambarDalamHtml(html).length;
  return jumlah > MAX_GAMBAR_SISIPAN
    ? `Maksimal ${MAX_GAMBAR_SISIPAN} gambar di dalam deskripsi (sekarang ${jumlah})`
    : null;
}

/**
 * Unggah gambar sisipan yang masih berupa preview lokal (`blob:`) di HTML deskripsi, lalu ganti src-nya dengan link
 * tersimpan. Src lain (gambar yang sudah tersimpan) dibiarkan. Galat dilempar dengan nama berkas sebagai konteks.
 */
export async function unggahGambarSisipan(
  html: string,
  berkas: ReadonlyMap<string, File>,
  unggah: UnggahGambarSisipan,
): Promise<string> {
  const peta = new Map<string, string>();
  for (const src of srcGambarDalamHtml(html)) {
    if (!src.startsWith('blob:')) continue;
    const file = berkas.get(src);
    if (!file) throw new Error('Gambar sisipan tidak ditemukan untuk diunggah. Hapus gambar itu lalu sisipkan ulang.');
    const link = await unggah(file);
    if (!link || !isGambarSisipanSrc(link)) throw new Error(`Gagal mengunggah gambar sisipan "${file.name}"`);
    peta.set(src, link);
  }
  return gantiSrcGambar(html, peta);
}
