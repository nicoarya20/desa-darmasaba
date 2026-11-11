/**
 * Logika murni lampiran form Pengumuman (gambar utama, galeri, dokumen PDF) — tanpa React/DOM
 * supaya bisa dites langsung. Berkas baru hanya diunggah saat Simpan (`kumpulkanLampiran`),
 * sehingga batal/reset tidak meninggalkan berkas yatim di MinIO.
 */
import type { PengumumanFile } from '@/lib/pengumuman-lampiran';
import { PENGUMUMAN_DOKUMEN_MIME } from '@/lib/pengumuman-lampiran';
import {
  itemsDariImages,
  kumpulkanImageIds,
  type DokumentasiItem,
  type UploadGambar,
} from '@/app/admin/(dashboard)/landing-page/profil/program-inovasi/_lib/dokumentasi.logic';

export { formatUkuran } from '@/lib/desa-anti-korupsi-sort';
export { GAMBAR_ACCEPT, GAMBAR_MAX_BYTES } from '@/app/admin/(dashboard)/landing-page/profil/program-inovasi/_lib/dokumentasi.logic';

/** Ukuran maksimal satu PDF lampiran (scan pengumuman bisa beberapa halaman). */
export const DOKUMEN_PDF_MAX_BYTES = 10 * 1024 ** 2;
/** Dropzone dokumen hanya menerima PDF (selalu bisa dipratinjau di iframe). */
export const DOKUMEN_PDF_ACCEPT = { [PENGUMUMAN_DOKUMEN_MIME]: ['.pdf'] };

/** Item galeri: sama dengan galeri dokumentasi Program Inovasi (tersimpan `id` / baru `file`). */
export type GaleriItem = DokumentasiItem;

/** Satu dokumen di form: tersimpan (`id`) atau baru dipilih (`file`); `preview` = URL iframe. */
export type DokumenItem = {
  key: string;
  nama: string;
  preview: string;
  size: number | null;
  id?: string;
  file?: File;
};

/** Gambar utama di form: `file` baru menang atas `id` tersimpan; keduanya null = tanpa gambar. */
export type GambarUtama = { id: string | null; file: File | null; preview: string | null };

/** Pengunggah berkas → id FileStorage (null bila gagal). */
export type UploadBerkas = UploadGambar;

/** Relasi `images` dari API → item galeri tersimpan. */
export const galeriDariApi = itemsDariImages;

/** Relasi `dokumen` dari API → item dokumen tersimpan. */
export function dokumenDariApi(files: PengumumanFile[] | null | undefined): DokumenItem[] {
  return (files ?? []).map((f) => ({ key: f.id, id: f.id, nama: f.realName, preview: f.link, size: f.size ?? null }));
}

/** Tambah item tanpa melewati batas; sisanya `ditolak` (preview-nya perlu dilepas pemanggil). */
export function tambahTerbatas<T>(items: T[], baru: T[], max: number): { items: T[]; ditolak: T[] } {
  const sisa = Math.max(max - items.length, 0);
  return { items: [...items, ...baru.slice(0, sisa)], ditolak: baru.slice(sisa) };
}

/** Unggah dokumen baru berurutan; id tersimpan dipertahankan sesuai urutan tampilan. */
export async function kumpulkanDokumenIds(items: DokumenItem[], upload: UploadBerkas): Promise<string[]> {
  const ids: string[] = [];
  for (const item of items) {
    if (item.id) {
      ids.push(item.id);
      continue;
    }
    if (!item.file) continue;
    const id = await upload(item.file);
    if (!id) throw new Error(`Gagal mengunggah dokumen "${item.file.name}"`);
    ids.push(id);
  }
  return ids;
}

/** Id gambar utama: file baru diunggah, jika tidak pakai id lama (null = tanpa gambar). */
export async function resolveGambarUtamaId(gambar: GambarUtama, upload: UploadBerkas): Promise<string | null> {
  if (!gambar.file) return gambar.id;
  const id = await upload(gambar.file);
  if (!id) throw new Error(`Gagal mengunggah gambar utama "${gambar.file.name}"`);
  return id;
}

/** Unggah semua berkas baru lalu kembalikan id lampiran untuk body API. */
export async function kumpulkanLampiran(
  lampiran: { gambar: GambarUtama; galeri: GaleriItem[]; dokumen: DokumenItem[] },
  upload: UploadBerkas,
): Promise<{ imageId: string | null; imageIds: string[]; dokumenIds: string[] }> {
  const imageId = await resolveGambarUtamaId(lampiran.gambar, upload);
  const imageIds = await kumpulkanImageIds(lampiran.galeri, upload);
  const dokumenIds = await kumpulkanDokumenIds(lampiran.dokumen, upload);
  return { imageId, imageIds, dokumenIds };
}
