import ApiFetch from "@/lib/api-fetch";
import type { JumlahTahun } from "@/lib/program-kemiskinan/penerima-rekap";
import type { PenerimaInput } from "@/lib/program-kemiskinan/penerima.rules";
import { toast } from "react-toastify";
import { proxy } from "valtio";

/** Baris penerima di daftar admin. */
export type PenerimaAdmin = PenerimaInput & { id: string; tahun: number; isActive: boolean; urutan: number };
/** Isian form tambah/ubah penerima (id kosong = tambah). */
export type FormPenerima = PenerimaInput & { id?: string; tahun: number; isActive: boolean };

/** Jumlah baris per halaman daftar penerima admin. */
export const PENERIMA_ADMIN_LIMIT = 20;

type Balasan = { status: number; data: unknown; error: { value: unknown } | null };

/** Pesan dari balasan Eden (`{ message }` dari server) atau `cadangan`. */
function pesanServer(res: Balasan, cadangan: string): string {
  const body = (res.error ? res.error.value : res.data) as { message?: unknown } | null;
  return typeof body?.message === "string" ? body.message : cadangan;
}

const sukses = (res: Balasan) => res.status === 200 && (res.data as { success?: boolean } | null)?.success === true;

/** State admin penerima satu Program Kemiskinan: filter tahun/cari, halaman, dan aksi kelola. */
const penerimaProgramKemiskinanState = proxy({
  programId: "",
  tahun: null as number | null,
  page: 1,
  search: "",
  data: [] as PenerimaAdmin[],
  total: 0,
  totalPages: 1,
  tahunList: [] as JumlahTahun[],
  loading: false,
  saving: false,

  /** Ganti program yang dikelola: filter dikosongkan lalu muat ulang. */
  async pilihProgram(programId: string) {
    Object.assign(penerimaProgramKemiskinanState, { programId, tahun: null, page: 1, search: "", data: [], total: 0 });
    await penerimaProgramKemiskinanState.load();
  },

  /** Muat halaman aktif sesuai filter tahun & pencarian. */
  async load() {
    const s = penerimaProgramKemiskinanState;
    if (!s.programId) return;
    s.loading = true;
    try {
      const query = {
        programId: s.programId,
        page: String(s.page),
        limit: String(PENERIMA_ADMIN_LIMIT),
        ...(s.tahun !== null ? { tahun: String(s.tahun) } : {}),
        ...(s.search ? { search: s.search } : {}),
      };
      const res = await ApiFetch.api.ekonomi.programkemiskinan.penerima.admin.get({ query });
      const body = res.data;
      if (!sukses(res) || !body || !("data" in body)) throw new Error(pesanServer(res, `HTTP ${res.status}`));
      s.data = body.data;
      s.total = body.total;
      s.totalPages = body.totalPages;
      s.tahunList = body.tahun;
    } catch (error) {
      console.error("Gagal memuat penerima program kemiskinan:", error);
      toast.error("Gagal memuat daftar penerima");
    } finally {
      s.loading = false;
    }
  },

  /** Simpan form (tambah bila tanpa id, selain itu ubah); true bila berhasil. */
  async simpan(form: FormPenerima): Promise<boolean> {
    const s = penerimaProgramKemiskinanState;
    s.saving = true;
    try {
      const isi = { tahun: form.tahun, nama: form.nama, alamat: form.alamat };
      const res = form.id
        ? await ApiFetch.api.ekonomi.programkemiskinan.penerima({ id: form.id }).put({ ...isi, isActive: form.isActive })
        : await ApiFetch.api.ekonomi.programkemiskinan.penerima.create.post({ ...isi, programId: s.programId });
      if (!sukses(res)) {
        toast.error(pesanServer(res, "Gagal menyimpan penerima"));
        return false;
      }
      toast.success(form.id ? "Penerima diperbarui" : "Penerima ditambahkan");
      await s.load();
      return true;
    } catch (error) {
      console.error("Gagal menyimpan penerima program kemiskinan:", error);
      toast.error("Gagal menyimpan penerima");
      return false;
    } finally {
      s.saving = false;
    }
  },

  /** Hapus permanen satu penerima; true bila berhasil. */
  async hapus(id: string): Promise<boolean> {
    const s = penerimaProgramKemiskinanState;
    try {
      const res = await ApiFetch.api.ekonomi.programkemiskinan.penerima.del({ id }).delete();
      if (!sukses(res)) {
        toast.error(pesanServer(res, "Gagal menghapus penerima"));
        return false;
      }
      toast.success("Penerima dihapus");
      await s.load();
      return true;
    } catch (error) {
      console.error("Gagal menghapus penerima program kemiskinan:", error);
      toast.error("Gagal menghapus penerima");
      return false;
    }
  },

  /** Impor baris CSV yang sudah dipratinjau (hanya nama + alamat dikirim); true bila berhasil. */
  async impor(opts: { tahun: number; mode: "tambah" | "ganti"; rows: PenerimaInput[] }): Promise<boolean> {
    const s = penerimaProgramKemiskinanState;
    s.saving = true;
    try {
      const rows = opts.rows.map(({ nama, alamat }) => ({ nama, alamat }));
      const res = await ApiFetch.api.ekonomi.programkemiskinan.penerima.import.post({
        programId: s.programId,
        tahun: opts.tahun,
        mode: opts.mode,
        rows,
      });
      if (!sukses(res)) {
        toast.error(pesanServer(res, "Gagal mengimpor penerima"));
        return false;
      }
      toast.success(pesanServer(res, "Impor selesai"));
      Object.assign(s, { tahun: opts.tahun, page: 1, search: "" });
      await s.load();
      return true;
    } catch (error) {
      console.error("Gagal mengimpor penerima program kemiskinan:", error);
      toast.error("Gagal mengimpor penerima");
      return false;
    } finally {
      s.saving = false;
    }
  },
});

export default penerimaProgramKemiskinanState;
