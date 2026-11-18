/**
 * Logika murni foto Dokumentasi Pembangunan di form Kegiatan Desa (sebelum, sesudah, galeri progres) —
 * tanpa React/DOM supaya bisa dites langsung. Berkas baru hanya diunggah saat Simpan (`unggahFotoPembangunan`).
 * State foto hidup terpisah dari kategori: pindah kategori lalu kembali tidak mengubah foto.
 */
import type { FotoPembangunanFile } from '@/lib/kegiatan-pembangunan-foto';
import {
  galeriDariApi,
  tambahTerbatas,
  type GaleriItem,
  type GambarUtama,
  type UploadBerkas,
} from '@/app/admin/(dashboard)/pemerintahan/pengumuman/list-pengumuman/_lib/lampiran.logic';
import { kumpulkanImageIds } from '@/app/admin/(dashboard)/landing-page/profil/program-inovasi/_lib/dokumentasi.logic';

export { tambahTerbatas };

export type FotoPembangunanState = { sebelum: GambarUtama; sesudah: GambarUtama; galeri: GaleriItem[] };

/** Foto tersimpan yang dimuat ke form edit (kosong untuk create). */
export type FotoPembangunanAwal = {
  fotoSebelum?: FotoPembangunanFile | null;
  fotoSesudah?: FotoPembangunanFile | null;
  fotoProgres?: FotoPembangunanFile[] | null;
};

/** Body API foto: nilai final yang dikirim saat kategori Pembangunan. */
export type FotoPembangunanBody = {
  fotoSebelumId: string | null;
  fotoSesudahId: string | null;
  fotoProgresIds: string[];
};

export const GAMBAR_KOSONG: GambarUtama = { id: null, file: null, preview: null };
export const FOTO_KOSONG: FotoPembangunanState = { sebelum: GAMBAR_KOSONG, sesudah: GAMBAR_KOSONG, galeri: [] };

const gambarDariApi = (file: FotoPembangunanFile | null | undefined): GambarUtama =>
  file ? { id: file.id, file: null, preview: file.link } : GAMBAR_KOSONG;

/** Foto dari API detail → state form (semua berstatus tersimpan). */
export function fotoDariApi(awal: FotoPembangunanAwal | null | undefined): FotoPembangunanState {
  if (!awal) return FOTO_KOSONG;
  return {
    sebelum: gambarDariApi(awal.fotoSebelum),
    sesudah: gambarDariApi(awal.fotoSesudah),
    galeri: galeriDariApi(awal.fotoProgres),
  };
}

/** True bila data tersimpan punya minimal satu foto. */
export function adaFotoTersimpan(awal: FotoPembangunanAwal | null | undefined): boolean {
  return !!(awal?.fotoSebelum || awal?.fotoSesudah || (awal?.fotoProgres?.length ?? 0) > 0);
}

/** True bila form sedang memuat minimal satu foto (tersimpan maupun baru dipilih). */
export function adaFotoDiForm(foto: FotoPembangunanState): boolean {
  return !!(foto.sebelum.id || foto.sebelum.file || foto.sesudah.id || foto.sesudah.file || foto.galeri.length > 0);
}

/** Peringatan saat kategori bukan Pembangunan tetapi ada foto; null = tidak perlu. */
export function peringatanFotoNonPembangunan(tersimpan: boolean, diForm: boolean): string | null {
  if (tersimpan) {
    return 'Kategori bukan Pembangunan: foto dokumentasi yang sudah tersimpan akan dihapus saat Simpan. Pilih kembali kategori Pembangunan untuk mempertahankannya.';
  }
  if (diForm) {
    return 'Kategori bukan Pembangunan: foto dokumentasi yang dipilih tidak akan diunggah atau disimpan.';
  }
  return null;
}

/**
 * Unggah foto baru (berurutan: sebelum, sesudah, galeri) lalu kembalikan body API + state baru di mana berkas
 * yang sudah terunggah diganti id-nya, sehingga percobaan Simpan berikutnya (bila simpan gagal) tidak mengunggah ulang.
 */
export async function unggahFotoPembangunan(
  foto: FotoPembangunanState,
  upload: UploadBerkas,
): Promise<{ body: FotoPembangunanBody; state: FotoPembangunanState }> {
  const sebelum = await resolveGambar(foto.sebelum, upload);
  const sesudah = await resolveGambar(foto.sesudah, upload);
  const fotoProgresIds = await kumpulkanImageIds(foto.galeri, upload);
  const galeri = foto.galeri.map((item, i) => ({ key: item.key, preview: item.preview, id: fotoProgresIds[i] }));
  return {
    body: { fotoSebelumId: sebelum.id, fotoSesudahId: sesudah.id, fotoProgresIds },
    state: { sebelum, sesudah, galeri },
  };
}

async function resolveGambar(gambar: GambarUtama, upload: UploadBerkas): Promise<GambarUtama> {
  if (!gambar.file) return gambar;
  const id = await upload(gambar.file);
  if (!id) throw new Error(`Gagal mengunggah foto "${gambar.file.name}"`);
  return { id, file: null, preview: gambar.preview };
}
