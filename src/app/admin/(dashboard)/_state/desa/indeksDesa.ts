import ApiFetch from "@/lib/api-fetch";
import {
  parseIndeksDesaInput,
  parseSkorTeks,
  type IndeksDesaRecord,
  type StatusIdm,
} from "@/lib/indeks-desa";
import { toast } from "react-toastify";
import { proxy } from "valtio";

/** Satu baris Indeks Desa dari API. */
export type IndeksDesaItem = IndeksDesaRecord;

/** Isi form create/edit. Skor disimpan sebagai teks isian (boleh "0,5") supaya mengetik "0." tidak terhapus; diubah ke angka saat kirim. */
export type IndeksDesaFormValues = {
  tahun: number | null;
  skorIdm: string;
  skorIks: string;
  skorIke: string;
  skorIkl: string;
  status: StatusIdm | null;
  catatan: string;
};

const defaultForm = (): IndeksDesaFormValues => ({
  tahun: null,
  skorIdm: "",
  skorIks: "",
  skorIke: "",
  skorIkl: "",
  status: null,
  catatan: "",
});

/** Jumlah baris per halaman daftar admin. */
export const INDEKS_DESA_ADMIN_PAGE_SIZE = 10;

const api = () => ApiFetch.api.desa.indeksdesa;

/** Pesan galat dari respons Eden (`{ success: false, message }`), atau `fallback` bila tidak ada. */
function pesanGalat(res: { error: { value: unknown } | null }, fallback: string): string {
  const message = (res.error?.value as { message?: string } | undefined)?.message;
  return message ?? fallback;
}

/** Isi form → body API: skor teks jadi angka (isian tak valid jadi NaN, ditolak validasi). */
function toRaw(form: IndeksDesaFormValues): Record<string, unknown> {
  return {
    tahun: form.tahun,
    skorIdm: parseSkorTeks(form.skorIdm),
    skorIks: parseSkorTeks(form.skorIks),
    skorIke: parseSkorTeks(form.skorIke),
    skorIkl: parseSkorTeks(form.skorIkl),
    status: form.status,
    catatan: form.catatan,
  };
}

/** Validasi form di klien dengan aturan yang sama dengan API; kembalikan body siap kirim atau pesan galat. */
function validateForm(form: IndeksDesaFormValues) {
  const cek = parseIndeksDesaInput(toRaw(form));
  return cek.ok ? { body: cek.data, message: null } : { body: null, message: cek.message };
}

// State admin CRUD Indeks Desa (/api/desa/indeksdesa). Form di-reset/diisi IN-PLACE (Object.assign) agar identitas proxy
// `form` stabil bagi komponen yang memakai `useSnapshot(form, { sync: true })`.
const stateIndeksDesa = proxy({
  findMany: {
    data: [] as IndeksDesaItem[],
    page: 1,
    totalPages: 1,
    loading: false,
    async load(page = 1) {
      const s = stateIndeksDesa.findMany;
      s.loading = true;
      s.page = page;
      try {
        const res = await api()["find-many"].get({ query: { page, limit: INDEKS_DESA_ADMIN_PAGE_SIZE } });
        const body = res.data as { success?: boolean; data?: IndeksDesaItem[]; totalPages?: number } | null;
        if (res.status === 200 && body?.success) {
          s.data = body.data ?? [];
          s.totalPages = body.totalPages ?? 1;
        } else {
          s.data = [];
          s.totalPages = 1;
          toast.error(pesanGalat(res, "Gagal mengambil daftar Indeks Desa"));
        }
      } catch (error) {
        console.error("Gagal memuat Indeks Desa:", (error as Error).message);
        s.data = [];
        s.totalPages = 1;
        toast.error("Terjadi kesalahan saat mengambil daftar Indeks Desa");
      } finally {
        s.loading = false;
      }
    },
  },

  create: {
    form: defaultForm(),
    loading: false,
    reset() {
      Object.assign(stateIndeksDesa.create.form, defaultForm());
    },
    /** Validasi lalu simpan; true bila tersimpan. */
    async submit(): Promise<boolean> {
      const s = stateIndeksDesa.create;
      const { body, message } = validateForm(s.form);
      if (!body) {
        toast.error(message);
        return false;
      }
      s.loading = true;
      try {
        const res = await api().create.post(body);
        if (res.status !== 200) {
          toast.error(pesanGalat(res, "Gagal menyimpan data Indeks Desa"));
          return false;
        }
        toast.success("Data Indeks Desa berhasil disimpan");
        return true;
      } catch (error) {
        console.error("Gagal menyimpan Indeks Desa:", (error as Error).message);
        toast.error("Terjadi kesalahan saat menyimpan data Indeks Desa");
        return false;
      } finally {
        s.loading = false;
      }
    },
  },

  edit: {
    id: "",
    form: defaultForm(),
    loading: false,
    /** Muat satu baris ke form; true bila ditemukan. */
    async load(id: string): Promise<boolean> {
      const s = stateIndeksDesa.edit;
      s.loading = true;
      try {
        const res = await api()({ id }).get();
        const item = (res.data as { success?: boolean; data?: IndeksDesaItem } | null)?.data;
        if (res.status !== 200 || !item) {
          toast.error(pesanGalat(res, "Data Indeks Desa tidak ditemukan"));
          return false;
        }
        s.id = item.id;
        Object.assign(s.form, {
          tahun: item.tahun,
          skorIdm: String(item.skorIdm),
          skorIks: String(item.skorIks),
          skorIke: String(item.skorIke),
          skorIkl: String(item.skorIkl),
          status: item.status as StatusIdm,
          catatan: item.catatan ?? "",
        });
        return true;
      } catch (error) {
        console.error(`Gagal memuat Indeks Desa ${id}:`, (error as Error).message);
        toast.error("Terjadi kesalahan saat memuat data Indeks Desa");
        return false;
      } finally {
        s.loading = false;
      }
    },
    /** Validasi lalu simpan perubahan; true bila tersimpan. */
    async submit(): Promise<boolean> {
      const s = stateIndeksDesa.edit;
      const { body, message } = validateForm(s.form);
      if (!body) {
        toast.error(message);
        return false;
      }
      s.loading = true;
      try {
        const res = await api().updt({ id: s.id }).put(body);
        if (res.status !== 200) {
          toast.error(pesanGalat(res, "Gagal menyimpan perubahan"));
          return false;
        }
        toast.success("Data Indeks Desa berhasil diubah");
        return true;
      } catch (error) {
        console.error(`Gagal mengubah Indeks Desa ${s.id}:`, (error as Error).message);
        toast.error("Terjadi kesalahan saat menyimpan perubahan");
        return false;
      } finally {
        s.loading = false;
      }
    },
  },

  delete: {
    loading: false,
    /** Hapus satu baris; true bila terhapus (pemanggil memuat ulang daftar). */
    async byId(id: string): Promise<boolean> {
      const s = stateIndeksDesa.delete;
      s.loading = true;
      try {
        const res = await api().del({ id }).delete();
        if (res.status !== 200) {
          toast.error(pesanGalat(res, "Gagal menghapus data Indeks Desa"));
          return false;
        }
        toast.success("Data Indeks Desa berhasil dihapus");
        return true;
      } catch (error) {
        console.error(`Gagal menghapus Indeks Desa ${id}:`, (error as Error).message);
        toast.error("Terjadi kesalahan saat menghapus data Indeks Desa");
        return false;
      } finally {
        s.loading = false;
      }
    },
  },
});

export default stateIndeksDesa;
