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

/** Kotak (piksel) yang memuat isi gambar. */
export type KotakIsi = { x: number; y: number; w: number; h: number };

/** Piksel dengan alpha ≤ ambang ini dianggap transparan (sisa antialias tepi diabaikan). */
const AMBANG_ALPHA = 8;
/** Tepi transparan lebih tipis dari ini (persen sisi) tidak dipotong: hasilnya tidak terlihat bedanya. */
const MIN_POTONG = 0.02;

/**
 * Kotak isi gambar RGBA (data `ImageData`): batas piksel yang tidak transparan. null bila gambar kosong total atau
 * tepi transparannya terlalu tipis untuk dipotong — pemanggil memakai berkas asli.
 */
export function kotakIsiTidakTransparan(rgba: ArrayLike<number>, lebar: number, tinggi: number): KotakIsi | null {
  let minX = lebar;
  let minY = tinggi;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < tinggi; y++) {
    for (let x = 0; x < lebar; x++) {
      if (rgba[(y * lebar + x) * 4 + 3] <= AMBANG_ALPHA) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return null;
  const kotak = { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
  const potongX = 1 - kotak.w / lebar;
  const potongY = 1 - kotak.h / tinggi;
  return potongX < MIN_POTONG && potongY < MIN_POTONG ? null : kotak;
}
