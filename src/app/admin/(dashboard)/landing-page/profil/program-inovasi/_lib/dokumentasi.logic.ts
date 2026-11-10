/**
 * Logika murni media form Program Inovasi (logo opsional + galeri dokumentasi):
 * tanpa React/DOM supaya bisa dites langsung.
 */

/** Ukuran maksimal satu gambar (sama dengan dropzone gambar lain di admin). */
export const GAMBAR_MAX_BYTES = 5 * 1024 ** 2;

/** Format gambar yang diterima dropzone logo & dokumentasi. */
export const GAMBAR_ACCEPT = { "image/*": [".jpeg", ".jpg", ".png", ".webp"] };

/** Satu gambar galeri: sudah tersimpan (`id`) atau baru dipilih (`file`, diunggah saat Simpan). */
export type DokumentasiItem = {
  key: string;
  preview: string;
  id?: string;
  file?: File;
};

/** Pengunggah file → id FileStorage (null bila gagal). */
export type UploadGambar = (file: File) => Promise<string | null>;

/** Ubah relasi `images` dari API menjadi item galeri tersimpan. */
export function itemsDariImages(
  images: { id: string; link: string }[] | null | undefined
): DokumentasiItem[] {
  return (images ?? []).map((img) => ({ key: img.id, id: img.id, preview: img.link }));
}

/** Tambah item baru tanpa melewati batas; sisanya dihitung sebagai `ditolak`. */
export function tambahDokumentasi(
  items: DokumentasiItem[],
  baru: DokumentasiItem[],
  max: number
): { items: DokumentasiItem[]; ditolak: DokumentasiItem[] } {
  const sisa = Math.max(max - items.length, 0);
  return { items: [...items, ...baru.slice(0, sisa)], ditolak: baru.slice(sisa) };
}

/** Hapus satu item galeri berdasarkan key. */
export function hapusDokumentasi(items: DokumentasiItem[], key: string): DokumentasiItem[] {
  return items.filter((item) => item.key !== key);
}

/** Unggah item baru secara berurutan lalu kembalikan semua id sesuai urutan tampilan. */
export async function kumpulkanImageIds(
  items: DokumentasiItem[],
  upload: UploadGambar
): Promise<string[]> {
  const ids: string[] = [];
  for (const item of items) {
    if (item.id) {
      ids.push(item.id);
      continue;
    }
    if (!item.file) continue;
    const id = await upload(item.file);
    if (!id) {
      throw new Error(`Gagal mengunggah gambar dokumentasi "${item.file.name}"`);
    }
    ids.push(id);
  }
  return ids;
}

/** Tentukan imageId logo: file baru diunggah, jika tidak pakai id lama (null = tanpa logo). */
export async function resolveLogoId(
  logo: { file: File | null; existingId: string | null },
  upload: UploadGambar
): Promise<string | null> {
  if (!logo.file) return logo.existingId || null;
  const id = await upload(logo.file);
  if (!id) throw new Error("Gagal mengunggah logo program, silakan coba lagi");
  return id;
}

/** Label kolom Dokumentasi di list admin: "3 foto" atau "-" bila kosong. */
export function labelJumlahDokumentasi(jumlah: number | null | undefined): string {
  return jumlah && jumlah > 0 ? `${jumlah} foto` : "-";
}
