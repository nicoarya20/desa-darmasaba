/* eslint-disable @typescript-eslint/no-explicit-any -- akses Eden dinamis `del[id]` belum bertipe (pola sama dgn state Inovasi lain) */
import ApiFetch from "@/lib/api-fetch";
import { INOVASI_KATEGORI, INOVASI_KATEGORI_DEFAULT, type InovasiKategori } from "@/lib/inovasi-teknologi/kategori";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  name: z.string().min(1).max(50),
  deskripsi: z.string().min(1).max(5000),
  imageId: z.string().min(1).max(50),
  kategori: z.enum(INOVASI_KATEGORI),
});

/** Form create/edit Inovasi Teknologi Desa. */
export type InovasiTeknologiForm = { name: string; deskripsi: string; imageId: string; kategori: InovasiKategori };

const defaultForm: InovasiTeknologiForm = {
  name: "",
  deskripsi: "",
  imageId: "",
  kategori: INOVASI_KATEGORI_DEFAULT,
};

type InovasiTeknologiItem = Prisma.InovasiTeknologiDesaGetPayload<{ include: { image: true } }>;

/** Saringan kategori daftar: '' = semua kategori. */
export type KategoriFilterValue = InovasiKategori | "";

const API = () => ApiFetch.api.inovasi.inovasiteknologi;
const detailUrl = (id: string) => `/api/inovasi/inovasiteknologi/${encodeURIComponent(id)}`;

/** Toast daftar field yang gagal validasi; `false` bila form tidak sah. */
function validateForm(form: InovasiTeknologiForm): boolean {
  const cek = templateForm.safeParse(form);
  if (cek.success) return true;
  toast.error(`[${cek.error.issues.map((v) => v.path.join(".")).join("\n")}] required`);
  return false;
}

/** State admin Inovasi Teknologi Desa: gabungan Desa Digital + Info Teknologi Tepat Guna. */
const inovasiTeknologiState = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    /** `true` bila tersimpan (pemanggil boleh redirect). */
    async create(): Promise<boolean> {
      if (!validateForm(inovasiTeknologiState.create.form)) return false;
      try {
        inovasiTeknologiState.create.loading = true;
        const res = await API()["create"].post(inovasiTeknologiState.create.form);
        if (res.status === 200 && res.data?.success) {
          toast.success("Sukses menambahkan");
          await inovasiTeknologiState.findMany.load();
          return true;
        }
        toast.error("Gagal menambahkan inovasi teknologi desa");
        return false;
      } catch (error) {
        console.error("Gagal menambahkan inovasi teknologi desa:", error);
        toast.error("Terjadi kesalahan saat menambahkan inovasi teknologi desa");
        return false;
      } finally {
        inovasiTeknologiState.create.loading = false;
      }
    },
    reset() {
      inovasiTeknologiState.create.form = { ...defaultForm };
    },
  },
  findMany: {
    data: null as InovasiTeknologiItem[] | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    kategori: "" as KategoriFilterValue,
    /** Muat satu halaman; tanpa argumen → ulangi query terakhir (halaman, kata kunci, kategori). */
    async load(
      page = inovasiTeknologiState.findMany.page,
      limit = 10,
      search = inovasiTeknologiState.findMany.search,
      kategori: KategoriFilterValue = inovasiTeknologiState.findMany.kategori,
    ) {
      const list = inovasiTeknologiState.findMany;
      list.loading = true;
      list.page = page;
      list.search = search;
      list.kategori = kategori;
      try {
        const query: Record<string, string | number> = { page, limit };
        if (search) query.search = search;
        if (kategori) query.kategori = kategori;
        const res = await API()["find-many"].get({ query });
        if (res.status === 200 && res.data?.success) {
          list.data = (res.data.data ?? []) as InovasiTeknologiItem[];
          list.totalPages = res.data.totalPages ?? 1;
        } else {
          list.data = [];
          list.totalPages = 1;
        }
      } catch (err) {
        console.error(`Gagal memuat inovasi teknologi desa (halaman ${page}, kategori "${kategori || "semua"}"):`, err);
        list.data = [];
        list.totalPages = 1;
      } finally {
        list.loading = false;
      }
    },
  },
  findUnique: {
    data: null as InovasiTeknologiItem | null,
    async load(id: string) {
      try {
        const res = await fetch(detailUrl(id));
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        const data = await res.json();
        inovasiTeknologiState.findUnique.data = data.data ?? null;
      } catch (error) {
        console.error(`Gagal memuat inovasi teknologi desa ${id}:`, error);
        inovasiTeknologiState.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    /** `true` bila terhapus (pemanggil boleh redirect). */
    async byId(id: string): Promise<boolean> {
      if (!id) {
        toast.warn("ID tidak valid");
        return false;
      }
      try {
        inovasiTeknologiState.delete.loading = true;
        // Eden tak menyetel Content-Type json untuk DELETE tanpa body → tak memicu 400 parse-body kosong di Elysia.
        const res = await (API() as any)["del"][id].delete();
        // del.ts bisa balas { status: 404, body } (tanpa success) → masuk cabang gagal.
        if (res.data?.success) {
          toast.success(res.data.message || "Inovasi teknologi desa berhasil dihapus");
          await inovasiTeknologiState.findMany.load();
          return true;
        }
        toast.error(res.data?.message || res.data?.body || "Gagal menghapus inovasi teknologi desa");
        return false;
      } catch (error) {
        console.error(`Gagal menghapus inovasi teknologi desa ${id}:`, error);
        toast.error("Terjadi kesalahan saat menghapus inovasi teknologi desa");
        return false;
      } finally {
        inovasiTeknologiState.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...defaultForm },
    loading: false,
    /** Muat entri ke form edit; `null` bila gagal (toast sudah tampil). */
    async load(id: string): Promise<InovasiTeknologiItem | null> {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      try {
        const response = await fetch(detailUrl(id));
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        if (!result?.success) throw new Error(result?.message || "Gagal memuat data");
        const data = result.data as InovasiTeknologiItem;
        inovasiTeknologiState.edit.id = data.id;
        inovasiTeknologiState.edit.form = {
          name: data.name,
          deskripsi: data.deskripsi,
          imageId: data.imageId ?? "",
          kategori: (data.kategori as InovasiKategori) || INOVASI_KATEGORI_DEFAULT,
        };
        return data;
      } catch (error) {
        console.error(`Gagal memuat inovasi teknologi desa ${id} untuk diedit:`, error);
        toast.error(error instanceof Error ? error.message : "Gagal memuat data");
        return null;
      }
    },
    /** `true` bila tersimpan. */
    async update(): Promise<boolean> {
      const { id, form } = inovasiTeknologiState.edit;
      if (!validateForm(form)) return false;
      try {
        inovasiTeknologiState.edit.loading = true;
        const response = await fetch(detailUrl(id), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result?.success) {
          throw new Error(result?.message || `HTTP error! status: ${response.status}`);
        }
        toast.success("Berhasil update inovasi teknologi desa");
        await inovasiTeknologiState.findMany.load();
        return true;
      } catch (error) {
        console.error(`Gagal update inovasi teknologi desa ${id}:`, error);
        toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat update inovasi teknologi desa");
        return false;
      } finally {
        inovasiTeknologiState.edit.loading = false;
      }
    },
    reset() {
      inovasiTeknologiState.edit.id = "";
      inovasiTeknologiState.edit.form = { ...defaultForm };
    },
  },
});

export default inovasiTeknologiState;
