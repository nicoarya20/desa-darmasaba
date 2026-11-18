import {
  parseLaporanInput,
  type LaporanBulananInput,
} from "@/app/api/[[...slugs]]/_lib/kependudukan/laporan-bulanan/laporan-bulanan.rules";
import ApiFetch from "@/lib/api-fetch";
import { toast } from "react-toastify";
import { proxy } from "valtio";

/** Satu baris laporan dari API (agregat per banjar per bulan). */
export type LaporanBulananItem = LaporanBulananInput & { id: string };

/** Filter daftar: tahun/bulan kosong = semua; `banjar` mencari nama (mengandung). */
export type LaporanBulananFilter = { tahun?: number; bulan?: number; banjar?: string };

/** Isian form create/edit (tahun & bulan awal = periode berjalan). */
export const defaultLaporanForm = (now: Date = new Date()): LaporanBulananInput => ({
  banjar: "",
  tahun: now.getFullYear(),
  bulan: now.getMonth() + 1,
  lakiLaki: 0,
  perempuan: 0,
});

const LIST_PAGE_SIZE = 10;
/** Jumlah baris Data Banjar yang diminta untuk saran nama banjar (nama sama per tahun dideduplikasi). */
const BANJAR_SUGGESTION_LIMIT = 100;

// `value` bertipe unknown pada rute GET (tipe error Elysia berupa union), jadi pesan dibaca dengan penyempitan tipe.
type ApiError = { value?: unknown } | null | undefined;
const errorMessage = (error: ApiError): string | undefined => {
  const value = error?.value;
  if (typeof value !== "object" || value === null || !("message" in value)) return undefined;
  return typeof value.message === "string" ? value.message : undefined;
};

type ApiBody<T> = { success?: boolean; message?: string; data?: T; totalPages?: number; total?: number } | null;
/** Bentuk body respons yang longgar: union tipe Eden (sukses/galat) tak bisa dipersempit lewat alias kondisi. */
const bodyOf = <T>(res: { data: unknown }): ApiBody<T> => res.data as ApiBody<T>;

// State admin CRUD Laporan Penduduk Bulanan (/api/kependudukan/laporanbulanan).
const laporanBulanan = proxy({
  findMany: {
    data: [] as LaporanBulananItem[],
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    filter: {} as LaporanBulananFilter,
    async load(page = 1, filter: LaporanBulananFilter = laporanBulanan.findMany.filter) {
      const s = laporanBulanan.findMany;
      s.loading = true;
      s.page = page;
      s.filter = filter;
      try {
        const query: Record<string, string | number> = { page, limit: LIST_PAGE_SIZE };
        if (filter.tahun) query.tahun = filter.tahun;
        if (filter.bulan) query.bulan = filter.bulan;
        if (filter.banjar) query.banjar = filter.banjar;
        const res = await ApiFetch.api.kependudukan.laporanbulanan["find-many"].get({ query });
        const body = bodyOf<LaporanBulananItem[]>(res);
        const ok = res.status === 200 && body?.success === true;
        s.data = ok ? (body?.data ?? []) : [];
        s.totalPages = ok ? (body?.totalPages ?? 1) : 1;
        s.total = ok ? (body?.total ?? 0) : 0;
        if (!ok) toast.error(body?.message || errorMessage(res.error) || "Gagal memuat laporan bulanan");
      } catch (error) {
        console.error("Gagal memuat laporan bulanan:", error);
        s.data = [];
        s.totalPages = 1;
        s.total = 0;
        toast.error("Terjadi kesalahan saat memuat laporan bulanan");
      } finally {
        s.loading = false;
      }
    },
  },

  // Saran nama banjar dari Data Banjar; kosong/gagal tidak menghalangi input teks bebas.
  banjarOptions: {
    data: [] as string[],
    loaded: false,
    async load() {
      const s = laporanBulanan.banjarOptions;
      if (s.loaded) return;
      try {
        const res = await ApiFetch.api.kependudukan.databanjar["find-many"].get({ query: { limit: BANJAR_SUGGESTION_LIMIT } });
        const body = bodyOf<{ nama: string }[]>(res);
        const rows = res.status === 200 && body?.success === true ? (body.data ?? []) : [];
        s.data = [...new Set(rows.map((r) => r.nama.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, "id"));
        s.loaded = true;
      } catch (error) {
        console.error("Gagal memuat saran nama banjar:", error);
      }
    },
  },

  create: {
    form: defaultLaporanForm(),
    loading: false,
    reset() {
      laporanBulanan.create.form = defaultLaporanForm();
    },
    async submit() {
      const s = laporanBulanan.create;
      const cek = parseLaporanInput({ ...s.form });
      if (!cek.ok) {
        toast.error(cek.message);
        return false;
      }
      s.loading = true;
      try {
        const res = await ApiFetch.api.kependudukan.laporanbulanan.create.post(cek.data);
        if (res.status === 200 && res.data?.success) {
          toast.success("Laporan bulanan berhasil disimpan!");
          return true;
        }
        toast.error(res.data?.message || errorMessage(res.error) || "Gagal menyimpan laporan bulanan");
        return false;
      } catch (error) {
        console.error("Error membuat laporan bulanan:", error);
        toast.error("Terjadi kesalahan saat menyimpan laporan bulanan");
        return false;
      } finally {
        s.loading = false;
      }
    },
  },

  edit: {
    id: "",
    form: defaultLaporanForm(),
    loading: false,
    async load(id: string) {
      const s = laporanBulanan.edit;
      s.loading = true;
      try {
        const res = await ApiFetch.api.kependudukan.laporanbulanan({ id }).get();
        const body = bodyOf<LaporanBulananItem>(res);
        const d = body?.success === true ? (body.data ?? null) : null;
        if (!d) {
          toast.error(body?.message || errorMessage(res.error) || "Laporan bulanan tidak ditemukan");
          return false;
        }
        s.id = d.id;
        s.form = { banjar: d.banjar, tahun: d.tahun, bulan: d.bulan, lakiLaki: d.lakiLaki, perempuan: d.perempuan };
        return true;
      } catch (error) {
        console.error("Error memuat laporan bulanan:", error);
        toast.error("Terjadi kesalahan saat memuat laporan bulanan");
        return false;
      } finally {
        s.loading = false;
      }
    },
    async submit() {
      const s = laporanBulanan.edit;
      const cek = parseLaporanInput({ ...s.form });
      if (!cek.ok) {
        toast.error(cek.message);
        return false;
      }
      s.loading = true;
      try {
        const res = await ApiFetch.api.kependudukan.laporanbulanan({ id: s.id }).put(cek.data);
        if (res.status === 200 && res.data?.success) {
          toast.success("Laporan bulanan berhasil diubah");
          return true;
        }
        toast.error(res.data?.message || errorMessage(res.error) || "Gagal mengubah laporan bulanan");
        return false;
      } catch (error) {
        console.error("Error mengubah laporan bulanan:", error);
        toast.error("Terjadi kesalahan saat mengubah laporan bulanan");
        return false;
      } finally {
        s.loading = false;
      }
    },
  },

  delete: {
    loading: false,
    async byId(id: string) {
      const s = laporanBulanan.delete;
      s.loading = true;
      try {
        // fetch tanpa header Content-Type: DELETE tanpa body yang ditandai JSON memicu 400 parse-body kosong di build production.
        const res = await fetch(`/api/kependudukan/laporanbulanan/del/${encodeURIComponent(id)}`, { method: "DELETE" });
        const result = (await res.json()) as { success?: boolean; message?: string };
        if (res.ok && result.success) {
          toast.success(result.message || "Laporan bulanan berhasil dihapus");
          const list = laporanBulanan.findMany;
          await list.load(list.page);
        } else {
          toast.error(result.message || "Gagal menghapus laporan bulanan");
        }
      } catch (error) {
        console.error("Gagal menghapus laporan bulanan:", error);
        toast.error("Terjadi kesalahan saat menghapus laporan bulanan");
      } finally {
        s.loading = false;
      }
    },
  },
});

export default laporanBulanan;
