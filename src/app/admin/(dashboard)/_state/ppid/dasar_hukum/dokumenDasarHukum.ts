import type { PdfMultiItem } from "@/app/admin/_com/upload/PdfMultiDropzoneField";
import { uploadPdfFile } from "@/app/admin/_com/upload/pdf-upload";
import { validateJudulDokumen } from "@/app/api/[[...slugs]]/_lib/ppid/dasar_hukum/dokumen/dokumen.rules";
import ApiFetch from "@/lib/api-fetch";
import { toast } from "react-toastify";
import { proxy, ref } from "valtio";

/** Satu dokumen Dasar Hukum PPID dari API (`file` = berkas PDF di FileStorage). */
export type DokumenDasarHukum = {
  id: string;
  judul: string;
  urutan: number;
  file: { id: string; link: string; realName: string };
};

/** Hasil simpan banyak berkas: jumlah berhasil dan gagal. */
export type CreateManyResult = { berhasil: number; gagal: number };

const dokumen = () => ApiFetch.api.ppid.dasarhukumppid.dokumen;

/** Pesan galat dari respons Eden (`{ success: false, message }`), atau `fallback` bila tidak ada. */
function pesanGalat(res: { error: { value: unknown } | null }, fallback: string): string {
  const message = (res.error?.value as { message?: string } | undefined)?.message;
  return message ?? fallback;
}

const stateDokumenDasarHukum = proxy({
  list: {
    data: [] as DokumenDasarHukum[],
    loading: false,
    /** Judul yang sedang diedit (id → teks), belum disimpan. */
    drafts: {} as Record<string, string>,
    /** Id dokumen yang sedang disimpan/dipindah/dihapus (satu operasi pada satu waktu). */
    busyId: null as string | null,
    async load() {
      try {
        stateDokumenDasarHukum.list.loading = true;
        const res = await dokumen()["find-many"].get();
        if (res.status === 200) {
          stateDokumenDasarHukum.list.data = res.data?.data ?? [];
        } else {
          toast.error("Gagal mengambil dokumen dasar hukum");
        }
      } catch (error) {
        console.error("Gagal memuat dokumen dasar hukum:", (error as Error).message);
        toast.error("Terjadi kesalahan saat mengambil dokumen dasar hukum");
      } finally {
        stateDokumenDasarHukum.list.loading = false;
      }
    },
    setDraft(id: string, judul: string) {
      stateDokumenDasarHukum.list.drafts[id] = judul;
    },
    /** Simpan judul hasil edit; true bila tersimpan. */
    async rename(id: string): Promise<boolean> {
      const { list } = stateDokumenDasarHukum;
      const cek = validateJudulDokumen(list.drafts[id] ?? "");
      if (!cek.ok) {
        toast.error(cek.message);
        return false;
      }
      try {
        list.busyId = id;
        const res = await dokumen().updt({ id }).put({ judul: cek.judul });
        if (res.status !== 200) {
          toast.error(pesanGalat(res, "Gagal mengubah judul dokumen"));
          return false;
        }
        delete list.drafts[id];
        await list.load();
        toast.success("Judul dokumen berhasil diubah");
        return true;
      } catch (error) {
        console.error(`Gagal mengubah judul dokumen ${id}:`, (error as Error).message);
        toast.error("Terjadi kesalahan saat mengubah judul dokumen");
        return false;
      } finally {
        list.busyId = null;
      }
    },
    /** Geser dokumen satu posisi (`delta` -1 = naik, +1 = turun) dan simpan urutan baru; true bila tersimpan. */
    async move(id: string, delta: -1 | 1): Promise<boolean> {
      const { list } = stateDokumenDasarHukum;
      const from = list.data.findIndex((row) => row.id === id);
      const to = from + delta;
      if (from < 0 || to < 0 || to >= list.data.length) return false;
      const ordered = [...list.data];
      [ordered[from], ordered[to]] = [ordered[to], ordered[from]];
      try {
        list.busyId = id;
        const res = await dokumen().reorder.put({ ids: ordered.map((row) => row.id) });
        if (res.status !== 200) {
          toast.error(pesanGalat(res, "Gagal menyimpan urutan dokumen"));
          return false;
        }
        list.data = ordered.map((row, urutan) => ({ ...row, urutan }));
        return true;
      } catch (error) {
        console.error(`Gagal memindahkan dokumen ${id}:`, (error as Error).message);
        toast.error("Terjadi kesalahan saat menyimpan urutan dokumen");
        return false;
      } finally {
        list.busyId = null;
      }
    },
    /** Hapus dokumen beserta berkasnya; true bila terhapus. */
    async remove(id: string): Promise<boolean> {
      const { list } = stateDokumenDasarHukum;
      try {
        list.busyId = id;
        const res = await dokumen().del({ id }).delete();
        if (res.status !== 200) {
          toast.error(pesanGalat(res, "Gagal menghapus dokumen"));
          return false;
        }
        list.data = list.data.filter((row) => row.id !== id);
        delete list.drafts[id];
        toast.success("Dokumen berhasil dihapus");
        return true;
      } catch (error) {
        console.error(`Gagal menghapus dokumen ${id}:`, (error as Error).message);
        toast.error("Terjadi kesalahan saat menghapus dokumen");
        return false;
      } finally {
        list.busyId = null;
      }
    },
  },

  /** PDF yang dipilih admin dan menunggu disimpan sebagai dokumen baru. */
  pending: {
    items: [] as PdfMultiItem[],
    saving: false,
    setItems(items: PdfMultiItem[]) {
      // ref(): tanpa ini Valtio ikut membungkus objek File dengan proxy, dan `file.name`/unggah gagal ("private member").
      stateDokumenDasarHukum.pending.items = items.map((entry) => ({ ...entry, file: ref(entry.file) }));
    },
    /**
     * Unggah lalu simpan tiap berkas BERURUTAN (urutan dokumen mengikuti urutan pilihan). Kegagalan satu berkas
     * (judul tidak valid, unggah gagal, simpan gagal) hanya menandai berkas itu `gagal`; yang lain tetap diproses.
     * Berkas yang berhasil dikeluarkan dari antrean, yang gagal tetap ada untuk dicoba ulang.
     */
    async createMany(): Promise<CreateManyResult> {
      const { pending, list } = stateDokumenDasarHukum;
      const hasil: CreateManyResult = { berhasil: 0, gagal: 0 };
      if (pending.saving) return hasil;
      pending.saving = true;
      try {
        for (const item of [...pending.items]) {
          const ok = await simpanSatu(item.key);
          if (ok) hasil.berhasil += 1;
          else hasil.gagal += 1;
        }
        pending.items = pending.items.filter((item) => item.status !== "berhasil");
        if (hasil.berhasil > 0) await list.load();
        if (hasil.gagal === 0) toast.success(`${hasil.berhasil} dokumen berhasil ditambahkan`);
        else toast.error(`${hasil.berhasil} dokumen berhasil, ${hasil.gagal} gagal. Periksa pesan di tiap berkas.`);
      } finally {
        pending.saving = false;
      }
      return hasil;
    },
  },
});

/** Proses satu berkas antrean (validasi judul → unggah bila belum → simpan) dan tulis hasilnya ke item; true bila berhasil. */
async function simpanSatu(key: string): Promise<boolean> {
  const tandai = (change: Partial<PdfMultiItem>) => {
    const target = stateDokumenDasarHukum.pending.items.find((row) => row.key === key);
    if (target) Object.assign(target, change);
  };
  const item = stateDokumenDasarHukum.pending.items.find((row) => row.key === key);
  if (!item) return false;

  const cek = validateJudulDokumen(item.judul);
  if (!cek.ok) {
    tandai({ status: "gagal", pesan: cek.message });
    return false;
  }
  tandai({ status: "proses", pesan: undefined });
  try {
    // fileId tersimpan bila percobaan sebelumnya sudah mengunggah berkas tetapi simpan gagal: jangan unggah dobel.
    const fileId = item.fileId ?? (await uploadPdfFile(item.file));
    if (!fileId) {
      tandai({ status: "gagal", pesan: "Unggah berkas gagal" });
      return false;
    }
    tandai({ fileId });
    const res = await dokumen().create.post({ judul: cek.judul, fileId });
    if (res.status !== 200) {
      tandai({ status: "gagal", pesan: pesanGalat(res, "Gagal menyimpan dokumen") });
      return false;
    }
    tandai({ status: "berhasil" });
    return true;
  } catch (error) {
    console.error(`Gagal menyimpan dokumen dari berkas ${item.file.name}:`, (error as Error).message);
    tandai({ status: "gagal", pesan: "Terjadi kesalahan saat menyimpan dokumen" });
    return false;
  }
}

export default stateDokumenDasarHukum;
