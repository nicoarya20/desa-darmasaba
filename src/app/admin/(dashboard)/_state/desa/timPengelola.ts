import { uploadPdfFile } from "@/app/admin/_com/upload/pdf-upload";
import {
  parseTimPengelolaInput,
  type TimPengelolaAdminRecord,
  type TimPengelolaFormValues,
  type TimPengelolaPublicRecord,
} from "@/lib/tim-pengelola";
import { toast } from "react-toastify";
import { proxy } from "valtio";

const TIM_PENGELOLA_ENDPOINT = "/api/desa/timpengelola";
const TIM_PENGELOLA_ADMIN_ENDPOINT = `${TIM_PENGELOLA_ENDPOINT}/admin`;

const defaultForm = (): TimPengelolaFormValues => ({ nomorSk: "", tanggalSk: "", anggota: [] });

/** Nilai form dari data tersimpan; data null (baris belum ada) → form kosong. Tanggal ISO dipotong jadi TTTT-BB-HH. */
export function toTimFormValues(data: TimPengelolaAdminRecord | null): TimPengelolaFormValues {
  if (!data) return defaultForm();
  return {
    nomorSk: data.nomorSk,
    tanggalSk: data.tanggalSk ? data.tanggalSk.slice(0, 10) : "",
    anggota: data.anggota.map((a) => ({ nama: a.nama, jabatan: a.jabatan })),
  };
}

/** Bagian data admin yang boleh dilihat publik (tanpa anggota): dipakai menyegarkan footer setelah admin menyimpan. */
export function toPublicRecord(data: TimPengelolaAdminRecord): TimPengelolaPublicRecord {
  return { id: data.id, nomorSk: data.nomorSk, tanggalSk: data.tanggalSk, skFile: data.skFile, updatedAt: data.updatedAt };
}

type PublicBody = { success?: boolean; message?: string; data?: TimPengelolaPublicRecord | null };
type AdminBody = { success?: boolean; message?: string; data?: TimPengelolaAdminRecord | null };

/** GET `url` lalu kembalikan `data` (null = belum diisi); melempar Error berpesan dari API bila gagal. */
async function fetchTim<T extends PublicBody | AdminBody>(url: string): Promise<T["data"]> {
  const res = await fetch(url);
  const body = (await res.json().catch(() => null)) as T | null;
  if (!res.ok || !body?.success) throw new Error(body?.message ?? `HTTP error! status: ${res.status}`);
  return body.data ?? null;
}

/**
 * State Tim Pengelola Website. `findUnique` = data publik (nomor SK + tautan PDF) untuk footer, dimuat sekali dan dibagi;
 * `findAdmin` = data lengkap beserta anggota dari endpoint ber-guard untuk form admin. `form` diisi IN-PLACE
 * (Object.assign) agar identitas proxy stabil bagi `useSnapshot(form, { sync: true })`.
 */
const stateTimPengelola = proxy({
  findUnique: {
    data: null as TimPengelolaPublicRecord | null,
    /** True setelah satu muat sukses (data boleh tetap null bila belum diisi); footer tidak memuat ulang. */
    loaded: false,
    loading: false,
    error: null as string | null,

    /** GET publik; true bila sukses. Galat disimpan di `error`. */
    async load(): Promise<boolean> {
      const s = stateTimPengelola.findUnique;
      s.loading = true;
      s.error = null;
      try {
        s.data = (await fetchTim<PublicBody>(TIM_PENGELOLA_ENDPOINT)) ?? null;
        s.loaded = true;
        return true;
      } catch (error) {
        s.error = (error as Error).message;
        console.error("Gagal memuat tim pengelola website:", s.error);
        return false;
      } finally {
        s.loading = false;
      }
    },

    /** Muat hanya bila belum pernah sukses dan tidak sedang memuat: footer di tiap halaman tidak memanggil API berulang. */
    async ensureLoaded(): Promise<void> {
      const s = stateTimPengelola.findUnique;
      if (!s.loaded && !s.loading) await s.load();
    },
  },

  findAdmin: {
    data: null as TimPengelolaAdminRecord | null,
    loading: false,
    error: null as string | null,

    /** GET admin (dengan anggota); true bila sukses. Galat disimpan di `error`. */
    async load(): Promise<boolean> {
      const s = stateTimPengelola.findAdmin;
      s.loading = true;
      s.error = null;
      try {
        s.data = (await fetchTim<AdminBody>(TIM_PENGELOLA_ADMIN_ENDPOINT)) ?? null;
        return true;
      } catch (error) {
        s.error = (error as Error).message;
        console.error("Gagal memuat tim pengelola website (admin):", s.error);
        return false;
      } finally {
        s.loading = false;
      }
    },
  },

  form: defaultForm(),

  /** Salin data tersimpan ke form (in-place). */
  fillForm(data: TimPengelolaAdminRecord | null) {
    Object.assign(stateTimPengelola.form, toTimFormValues(data));
  },

  update: {
    loading: false,

    /** Validasi (aturan sama dengan API), unggah PDF SK baru bila ada, lalu PUT admin; true bila tersimpan. */
    async submit(pdf: File | null): Promise<boolean> {
      const s = stateTimPengelola.update;
      const { form } = stateTimPengelola;
      const parsed = parseTimPengelolaInput({
        nomorSk: form.nomorSk,
        tanggalSk: form.tanggalSk,
        anggota: form.anggota.map((a) => ({ nama: a.nama, jabatan: a.jabatan })),
      });
      if (!parsed.ok) {
        toast.error(parsed.message);
        return false;
      }
      s.loading = true;
      try {
        // PDF baru diunggah dulu; tanpa PDF baru `skFileId` tidak dikirim sehingga berkas tersimpan tetap.
        const skFileId = pdf ? await uploadPdfFile(pdf) : undefined;
        if (pdf && !skFileId) return false;

        const res = await fetch(TIM_PENGELOLA_ENDPOINT, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...parsed.data, skFileId }),
        });
        const body = (await res.json().catch(() => null)) as AdminBody | null;
        if (!res.ok || !body?.success || !body.data) {
          throw new Error(body?.message ?? `HTTP error! status: ${res.status}`);
        }
        stateTimPengelola.findAdmin.data = body.data;
        stateTimPengelola.findUnique.data = toPublicRecord(body.data);
        stateTimPengelola.findUnique.loaded = true;
        stateTimPengelola.fillForm(body.data);
        toast.success("Tim pengelola website berhasil disimpan");
        return true;
      } catch (error) {
        const message = (error as Error).message;
        console.error("Gagal menyimpan tim pengelola website:", message);
        toast.error(message || "Gagal menyimpan tim pengelola website");
        return false;
      } finally {
        s.loading = false;
      }
    },
  },
});

export default stateTimPengelola;
