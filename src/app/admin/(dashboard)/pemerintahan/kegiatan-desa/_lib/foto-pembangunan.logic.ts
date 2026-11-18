/**
 * Logika murni foto Dokumentasi Pembangunan di form Kegiatan Desa (foto sebelum & foto sesudah, maks 5 per jenis) —
 * tanpa React/DOM supaya bisa dites langsung. Berkas baru hanya diunggah saat Simpan (`unggahFotoPembangunan`).
 * State foto hidup terpisah dari kategori: pindah kategori lalu kembali tidak mengubah foto.
 */
import type { FotoPembangunanFile, JenisFoto } from '@/lib/kegiatan-pembangunan-foto';
import {
  galeriDariApi,
  tambahTerbatas,
  type GaleriItem,
  type UploadBerkas,
} from '@/app/admin/(dashboard)/pemerintahan/pengumuman/list-pengumuman/_lib/lampiran.logic';
import { kumpulkanImageIds } from '@/app/admin/(dashboard)/landing-page/profil/program-inovasi/_lib/dokumentasi.logic';

export { tambahTerbatas };

export type FotoPembangunanState = Record<JenisFoto, GaleriItem[]>;

/** Foto tersimpan yang dimuat ke form edit (kosong untuk create). */
export type FotoPembangunanAwal = {
  fotoSebelum?: FotoPembangunanFile[] | null;
  fotoSesudah?: FotoPembangunanFile[] | null;
};

/** Body API foto: nilai final yang dikirim saat kategori Pembangunan. */
export type FotoPembangunanBody = {
  fotoSebelumIds: string[];
  fotoSesudahIds: string[];
};

export const FOTO_KOSONG: FotoPembangunanState = { sebelum: [], sesudah: [] };

/** Foto dari API detail → state form (semua berstatus tersimpan). */
export function fotoDariApi(awal: FotoPembangunanAwal | null | undefined): FotoPembangunanState {
  if (!awal) return FOTO_KOSONG;
  return { sebelum: galeriDariApi(awal.fotoSebelum), sesudah: galeriDariApi(awal.fotoSesudah) };
}

/** True bila data tersimpan punya minimal satu foto. */
export function adaFotoTersimpan(awal: FotoPembangunanAwal | null | undefined): boolean {
  return (awal?.fotoSebelum?.length ?? 0) > 0 || (awal?.fotoSesudah?.length ?? 0) > 0;
}

/** True bila form sedang memuat minimal satu foto (tersimpan maupun baru dipilih). */
export function adaFotoDiForm(foto: FotoPembangunanState): boolean {
  return foto.sebelum.length > 0 || foto.sesudah.length > 0;
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
 * Unggah foto baru (berurutan: sebelum lalu sesudah, sesuai urutan tampil) lalu kembalikan body API + state baru di
 * mana berkas yang sudah terunggah diganti id-nya, sehingga percobaan Simpan berikutnya (bila simpan gagal) tidak
 * mengunggah ulang.
 */
export async function unggahFotoPembangunan(
  foto: FotoPembangunanState,
  upload: UploadBerkas,
): Promise<{ body: FotoPembangunanBody; state: FotoPembangunanState }> {
  const fotoSebelumIds = await kumpulkanImageIds(foto.sebelum, upload);
  const fotoSesudahIds = await kumpulkanImageIds(foto.sesudah, upload);
  const gantiId = (items: GaleriItem[], ids: string[]) =>
    items.map((item, i) => ({ key: item.key, preview: item.preview, id: ids[i] }));
  return {
    body: { fotoSebelumIds, fotoSesudahIds },
    state: { sebelum: gantiId(foto.sebelum, fotoSebelumIds), sesudah: gantiId(foto.sesudah, fotoSesudahIds) },
  };
}
