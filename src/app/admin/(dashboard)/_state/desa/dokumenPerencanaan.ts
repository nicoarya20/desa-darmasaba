import ApiFetch from "@/lib/api-fetch";
import type { JenisDokumen, JenisMusyawarah } from "@/lib/dokumen-perencanaan";
import { parseDokumenPerencanaanInput } from "@/lib/dokumen-perencanaan";
import { toast } from "react-toastify";
import { proxy } from "valtio";

export type DokumenPerencanaanItem = {
  id: string;
  jenis: string;
  judul: string;
  tahun: number | null;
  tahunMulai: number | null;
  tahunSelesai: number | null;
  nomorPerdes: string | null;
  ringkasan: string | null;
  jenisMusyawarah: string | null;
  fileId: string | null;
  file: { id: string; link: string; realName: string } | null;
};

export type DokumenPerencanaanForm = {
  jenis: JenisDokumen;
  judul: string;
  tahun: number | null;
  tahunMulai: number | null;
  tahunSelesai: number | null;
  nomorPerdes: string;
  ringkasan: string;
  jenisMusyawarah: JenisMusyawarah | null;
  fileId: string | null | undefined;
};

const defaultForm = (): DokumenPerencanaanForm => ({
  jenis: "RPJM",
  judul: "",
  tahun: null,
  tahunMulai: null,
  tahunSelesai: null,
  nomorPerdes: "",
  ringkasan: "",
  jenisMusyawarah: null,
  fileId: undefined,
});

const LIST_PAGE_SIZE = 10;

type ApiError = { value?: { message?: string } } | null | undefined;
const errorMessage = (error: ApiError) => error?.value?.message;

/** Unggah PDF lewat jalur FileStorage yang sudah ada; kembalikan id file atau null bila gagal. */
export async function uploadDokumenPdf(file: File): Promise<string | null> {
  try {
    const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
    const id = (res?.data as { data?: { id?: string } } | null)?.data?.id;
    if (!id) toast.error("Gagal mengunggah file PDF");
    return id ?? null;
  } catch (error) {
    console.error("Gagal upload PDF dokumen perencanaan:", error);
    toast.error("Terjadi kesalahan saat mengunggah file PDF");
    return null;
  }
}

// State admin CRUD Dokumen Perencanaan (/api/desa/dokumenperencanaan).
const stateDokumenPerencanaan = proxy({
  findMany: {
    data: [] as DokumenPerencanaanItem[],
    page: 1,
    totalPages: 1,
    loading: false,
    async load(page = 1, search = "", jenis = "") {
      const s = stateDokumenPerencanaan.findMany;
      s.loading = true;
      s.page = page;
      try {
        const query: Record<string, string | number> = { page, limit: LIST_PAGE_SIZE };
        if (search) query.search = search;
        if (jenis) query.jenis = jenis;
        const res = await ApiFetch.api.desa["dokumenperencanaan"]["find-many"].get({ query });
        const ok = res.status === 200 && res.data?.success;
        s.data = ok ? ((res.data?.data ?? []) as unknown as DokumenPerencanaanItem[]) : [];
        s.totalPages = ok ? (res.data?.totalPages ?? 1) : 1;
      } catch (error) {
        console.error("Gagal memuat dokumen perencanaan:", error);
        s.data = [];
        s.totalPages = 1;
      } finally {
        s.loading = false;
      }
    },
  },

  create: {
    form: defaultForm(),
    loading: false,
    reset() {
      stateDokumenPerencanaan.create.form = defaultForm();
    },
    async submit() {
      const s = stateDokumenPerencanaan.create;
      const cek = parseDokumenPerencanaanInput({ ...s.form });
      if (!cek.ok) {
        toast.error(cek.message);
        return false;
      }
      s.loading = true;
      try {
        const res = await ApiFetch.api.desa["dokumenperencanaan"]["create"].post({ ...s.form });
        if (res.status === 200 && res.data?.success) {
          toast.success("Dokumen perencanaan berhasil disimpan!");
          return true;
        }
        toast.error(res.data?.message || errorMessage(res.error) || "Gagal menyimpan dokumen perencanaan");
        return false;
      } catch (error) {
        console.error("Error membuat dokumen perencanaan:", error);
        toast.error("Terjadi kesalahan saat menyimpan dokumen");
        return false;
      } finally {
        s.loading = false;
      }
    },
  },

  edit: {
    id: "",
    form: defaultForm(),
    currentFile: null as DokumenPerencanaanItem["file"],
    loading: false,
    async load(id: string) {
      const s = stateDokumenPerencanaan.edit;
      s.loading = true;
      try {
        const res = await ApiFetch.api.desa["dokumenperencanaan"]({ id }).get();
        const d = res.data?.success ? (res.data.data as unknown as DokumenPerencanaanItem) : null;
        if (!d) {
          toast.error(res.data?.message || errorMessage(res.error) || "Dokumen tidak ditemukan");
          return false;
        }
        s.id = d.id;
        s.currentFile = d.file;
        s.form = {
          jenis: d.jenis as JenisDokumen,
          judul: d.judul,
          tahun: d.tahun,
          tahunMulai: d.tahunMulai,
          tahunSelesai: d.tahunSelesai,
          nomorPerdes: d.nomorPerdes ?? "",
          ringkasan: d.ringkasan ?? "",
          jenisMusyawarah: d.jenisMusyawarah as JenisMusyawarah | null,
          fileId: undefined, // undefined = pertahankan PDF lama
        };
        return true;
      } catch (error) {
        console.error("Error memuat dokumen perencanaan:", error);
        toast.error("Terjadi kesalahan saat memuat dokumen");
        return false;
      } finally {
        s.loading = false;
      }
    },
    async submit() {
      const s = stateDokumenPerencanaan.edit;
      const cek = parseDokumenPerencanaanInput({ ...s.form });
      if (!cek.ok) {
        toast.error(cek.message);
        return false;
      }
      s.loading = true;
      try {
        const res = await ApiFetch.api.desa["dokumenperencanaan"]({ id: s.id }).put({ ...s.form });
        if (res.status === 200 && res.data?.success) {
          toast.success("Dokumen perencanaan berhasil diupdate");
          return true;
        }
        toast.error(res.data?.message || errorMessage(res.error) || "Gagal mengupdate dokumen perencanaan");
        return false;
      } catch (error) {
        console.error("Error update dokumen perencanaan:", error);
        toast.error("Terjadi kesalahan saat update dokumen");
        return false;
      } finally {
        s.loading = false;
      }
    },
  },

  delete: {
    loading: false,
    async byId(id: string) {
      const s = stateDokumenPerencanaan.delete;
      s.loading = true;
      try {
        // Pakai Eden: DELETE tanpa body tidak diberi Content-Type json, jadi tidak memicu
        // 400 parse-body kosong di build production (lihat .DISKUSI/2026-07-13 delete-eden).
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- segmen dinamis [id] pada path "del"
        const res = await (ApiFetch.api.desa["dokumenperencanaan"] as any)["del"][id].delete();
        if (res.data?.success) {
          toast.success(res.data.message || "Dokumen perencanaan berhasil dihapus");
          const list = stateDokumenPerencanaan.findMany;
          await list.load(list.page);
        } else {
          toast.error(res.data?.message || errorMessage(res.error) || "Gagal menghapus dokumen perencanaan");
        }
      } catch (error) {
        console.error("Gagal delete dokumen perencanaan:", error);
        toast.error("Terjadi kesalahan saat menghapus dokumen");
      } finally {
        s.loading = false;
      }
    },
  },
});

export default stateDokumenPerencanaan;
