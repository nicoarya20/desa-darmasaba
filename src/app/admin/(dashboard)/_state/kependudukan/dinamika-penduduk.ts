import { proxy } from "valtio";
import { toast } from "react-toastify";
import { z } from "zod";
import {
  DINAMIKA_PAGE_SIZE,
  DINAMIKA_TAHUN_MAX,
  DINAMIKA_TAHUN_MIN,
  type DinamikaInput,
  type DinamikaRow,
} from "@/lib/dinamika-penduduk";

const BASE = "/api/kependudukan/dinamikapenduduk";

const jumlah = (label: string) => z.number().int(`${label} harus bilangan bulat`).min(0, `${label} tidak boleh negatif`);
const schema = z.object({
  tahun: z.number().int().min(DINAMIKA_TAHUN_MIN, `Tahun minimal ${DINAMIKA_TAHUN_MIN}`).max(DINAMIKA_TAHUN_MAX, `Tahun maksimal ${DINAMIKA_TAHUN_MAX}`),
  kelahiran: jumlah("Kelahiran"),
  kematian: jumlah("Kematian"),
  masuk: jumlah("Pindah masuk"),
  keluar: jumlah("Pindah keluar"),
});

/** Form kosong; tahun default = tahun lalu karena rekap desa biasanya baru lengkap setelah tahun berganti. */
export function emptyDinamikaForm(): DinamikaInput {
  return { tahun: new Date().getFullYear() - 1, kelahiran: 0, kematian: 0, masuk: 0, keluar: 0 };
}

/** Validasi form di sisi klien; null bila valid, selain itu pesan error pertama. */
export function validateDinamikaForm(form: DinamikaInput): string | null {
  const cek = schema.safeParse(form);
  return cek.success ? null : cek.error.issues[0].message;
}

type ApiResult<T> = { ok: boolean; body: { success?: boolean; message?: string; data?: T; totalPages?: number } };

async function requestJson<T>(url: string, init?: RequestInit): Promise<ApiResult<T>> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = await res.json().catch(() => ({ message: `Respons server tidak valid (HTTP ${res.status})` }));
  return { ok: res.ok && body?.success === true, body };
}

/** State admin + publik Dinamika Penduduk (total per tahun). */
const dinamikaPenduduk = proxy({
  create: {
    form: emptyDinamikaForm(),
    loading: false,
    /** Kirim form; mengembalikan id baris baru, atau null bila gagal (toast sudah ditampilkan). */
    async submit(): Promise<string | null> {
      const form = { ...dinamikaPenduduk.create.form };
      const invalid = validateDinamikaForm(form);
      if (invalid) {
        toast.error(invalid);
        return null;
      }
      dinamikaPenduduk.create.loading = true;
      try {
        const { ok, body } = await requestJson<DinamikaRow>(`${BASE}/create`, { method: "POST", body: JSON.stringify(form) });
        if (!ok || !body.data) {
          toast.error(body.message || "Gagal menambahkan data dinamika penduduk");
          return null;
        }
        toast.success("Data dinamika penduduk ditambahkan");
        dinamikaPenduduk.create.form = emptyDinamikaForm();
        return body.data.id;
      } catch (error) {
        console.error("Gagal menambahkan dinamika penduduk:", error);
        toast.error("Tidak dapat terhubung ke server");
        return null;
      } finally {
        dinamikaPenduduk.create.loading = false;
      }
    },
  },

  findMany: {
    data: null as DinamikaRow[] | null,
    page: 1,
    totalPages: 1,
    loading: false,
    async load(page = 1, limit = DINAMIKA_PAGE_SIZE) {
      dinamikaPenduduk.findMany.loading = true;
      dinamikaPenduduk.findMany.page = page;
      try {
        const { ok, body } = await requestJson<DinamikaRow[]>(`${BASE}/find-many?page=${page}&limit=${limit}`);
        dinamikaPenduduk.findMany.data = ok ? (body.data ?? []) : [];
        dinamikaPenduduk.findMany.totalPages = ok ? (body.totalPages ?? 1) : 1;
        if (!ok) console.error("Gagal memuat dinamika penduduk:", body.message);
      } catch (error) {
        console.error("Gagal memuat dinamika penduduk:", error);
        dinamikaPenduduk.findMany.data = [];
        dinamikaPenduduk.findMany.totalPages = 1;
      } finally {
        dinamikaPenduduk.findMany.loading = false;
      }
    },
  },

  findUnique: {
    data: null as DinamikaRow | null,
    loading: false,
    async load(id: string) {
      dinamikaPenduduk.findUnique.loading = true;
      try {
        const { ok, body } = await requestJson<DinamikaRow>(`${BASE}/${id}`);
        dinamikaPenduduk.findUnique.data = ok ? (body.data ?? null) : null;
        if (!ok) toast.error(body.message || "Data dinamika penduduk tidak ditemukan");
      } catch (error) {
        console.error(`Gagal memuat dinamika penduduk ${id}:`, error);
        dinamikaPenduduk.findUnique.data = null;
        toast.error("Tidak dapat terhubung ke server");
      } finally {
        dinamikaPenduduk.findUnique.loading = false;
      }
    },
  },

  update: {
    loading: false,
    /** Simpan perubahan; true bila berhasil (toast sudah ditampilkan di kedua kasus). */
    async submit(id: string, form: DinamikaInput): Promise<boolean> {
      const invalid = validateDinamikaForm(form);
      if (invalid) {
        toast.error(invalid);
        return false;
      }
      dinamikaPenduduk.update.loading = true;
      try {
        const { ok, body } = await requestJson<DinamikaRow>(`${BASE}/${id}`, { method: "PUT", body: JSON.stringify(form) });
        if (!ok) {
          toast.error(body.message || "Gagal memperbarui data dinamika penduduk");
          return false;
        }
        toast.success("Data dinamika penduduk diperbarui");
        return true;
      } catch (error) {
        console.error(`Gagal memperbarui dinamika penduduk ${id}:`, error);
        toast.error("Tidak dapat terhubung ke server");
        return false;
      } finally {
        dinamikaPenduduk.update.loading = false;
      }
    },
  },

  delete: {
    loading: false,
    async byId(id: string) {
      dinamikaPenduduk.delete.loading = true;
      try {
        const { ok, body } = await requestJson<DinamikaRow>(`${BASE}/del/${id}`, { method: "DELETE" });
        if (!ok) {
          toast.error(body.message || "Gagal menghapus data dinamika penduduk");
          return;
        }
        toast.success("Data dinamika penduduk dihapus");
        await dinamikaPenduduk.findMany.load(dinamikaPenduduk.findMany.page);
      } catch (error) {
        console.error(`Gagal menghapus dinamika penduduk ${id}:`, error);
        toast.error("Tidak dapat terhubung ke server");
      } finally {
        dinamikaPenduduk.delete.loading = false;
      }
    },
  },
});

export default dinamikaPenduduk;
