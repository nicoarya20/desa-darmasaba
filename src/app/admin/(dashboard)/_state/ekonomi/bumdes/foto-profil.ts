import { moveDokumen } from "@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/dokumen-draft";
import ApiFetch from "@/lib/api-fetch";
import { hapusBerkas } from "@/lib/file-storage-delete.client";
import { getServerMessage } from "@/utils/api-message";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { uploadBumdesImage } from "./bumdes-image";

export type FotoProfilBumdesData = {
  id: string;
  imageId: string;
  keterangan: string | null;
  urutan: number;
  image: { id: string; name: string; link: string };
};

const pesanError = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

/**
 * Hapus permanen berkas yang sudah terunggah tetapi gagal didaftarkan ke galeri (tidak ada yang bisa dipulihkan).
 * Aman: belum ada baris galeri yang mereferensikannya. Kegagalan dicatat agar berkas yatim bisa dilacak.
 */
async function hapusUnggahanYatim(imageIds: readonly string[]) {
  const hasil = await Promise.allSettled(
    imageIds.map((id) => hapusBerkas(id)),
  );
  const gagal = imageIds.filter((_, i) => hasil[i].status === "rejected");
  if (gagal.length > 0) {
    console.error(`[galeri BUMDes] Gagal membersihkan ${gagal.length} berkas yatim:`, gagal);
  }
}

/** State galeri foto Profil BUMDes: `load` dipakai publik + admin; unggah/ubah/hapus/urutkan hanya admin. */
const fotoProfilBumdes = proxy({
  data: null as FotoProfilBumdesData[] | null,
  loading: false,
  loaded: false,
  async load() {
    fotoProfilBumdes.loading = true;
    try {
      const res = await ApiFetch.api.ekonomi.bumdes.profil.foto.get();
      fotoProfilBumdes.data = res.status === 200 ? ((res.data?.data as FotoProfilBumdesData[] | undefined) ?? []) : [];
    } catch {
      // Gagal jaringan diperlakukan sebagai galeri kosong agar halaman tidak menggantung di loading.
      fotoProfilBumdes.data = [];
    } finally {
      fotoProfilBumdes.loading = false;
      fotoProfilBumdes.loaded = true;
    }
  },

  uploading: false,
  /** Unggah beberapa file lalu daftarkan sekaligus ke galeri; berkas yang terlanjur terunggah dibersihkan bila gagal. */
  async upload(files: readonly File[]): Promise<boolean> {
    if (files.length === 0) return false;
    fotoProfilBumdes.uploading = true;
    const imageIds: string[] = [];
    try {
      for (const file of files) imageIds.push(await uploadBumdesImage(file));
      const res = await ApiFetch.api.ekonomi.bumdes.profil.foto.post({
        items: imageIds.map((imageId) => ({ imageId })),
      });
      if (res.status !== 200) {
        await hapusUnggahanYatim(imageIds);
        toast.error(getServerMessage(res) ?? "Gagal menambahkan foto ke galeri");
        return false;
      }
      toast.success(getServerMessage(res) ?? "Foto berhasil ditambahkan");
      await fotoProfilBumdes.load();
      return true;
    } catch (error) {
      await hapusUnggahanYatim(imageIds);
      toast.error(pesanError(error, "Terjadi kesalahan saat mengunggah foto galeri"));
      return false;
    } finally {
      fotoProfilBumdes.uploading = false;
    }
  },

  savingId: null as string | null,
  /** Simpan keterangan satu foto; string kosong menghapus keterangan. */
  async saveKeterangan(id: string, keterangan: string): Promise<boolean> {
    fotoProfilBumdes.savingId = id;
    try {
      const res = await ApiFetch.api.ekonomi.bumdes.profil.foto({ id }).put({ keterangan });
      if (res.status !== 200) {
        toast.error(getServerMessage(res) ?? "Gagal menyimpan keterangan foto");
        return false;
      }
      const item = fotoProfilBumdes.data?.find((f) => f.id === id);
      if (item) item.keterangan = keterangan.trim() || null;
      toast.success("Keterangan foto berhasil disimpan");
      return true;
    } catch (error) {
      toast.error(pesanError(error, "Terjadi kesalahan saat menyimpan keterangan foto"));
      return false;
    } finally {
      fotoProfilBumdes.savingId = null;
    }
  },

  deleting: false,
  /** Hapus (soft delete) satu foto dari galeri. */
  async remove(id: string): Promise<boolean> {
    fotoProfilBumdes.deleting = true;
    try {
      const res = await ApiFetch.api.ekonomi.bumdes.profil.foto({ id }).delete();
      if (res.status !== 200) {
        toast.error(getServerMessage(res) ?? "Gagal menghapus foto");
        return false;
      }
      fotoProfilBumdes.data = (fotoProfilBumdes.data ?? []).filter((f) => f.id !== id);
      toast.success("Foto berhasil dihapus dari galeri");
      return true;
    } catch (error) {
      toast.error(pesanError(error, "Terjadi kesalahan saat menghapus foto"));
      return false;
    } finally {
      fotoProfilBumdes.deleting = false;
    }
  },

  reordering: false,
  /** Geser foto ke atas (-1) / bawah (+1) lalu simpan urutan; dimuat ulang dari server bila gagal. */
  async move(index: number, direction: -1 | 1): Promise<boolean> {
    const list = fotoProfilBumdes.data ?? [];
    const next = moveDokumen(list, index, direction);
    if (next.every((f, i) => f === list[i])) return false;

    fotoProfilBumdes.data = next;
    fotoProfilBumdes.reordering = true;
    try {
      const res = await ApiFetch.api.ekonomi.bumdes.profil.foto.urutan.put({ ids: next.map((f) => f.id) });
      if (res.status !== 200) {
        toast.error(getServerMessage(res) ?? "Gagal menyimpan urutan foto");
        await fotoProfilBumdes.load();
        return false;
      }
      return true;
    } catch (error) {
      toast.error(pesanError(error, "Terjadi kesalahan saat menyimpan urutan foto"));
      await fotoProfilBumdes.load();
      return false;
    } finally {
      fotoProfilBumdes.reordering = false;
    }
  },
});

export default fotoProfilBumdes;
