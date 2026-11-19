import {
  parseKontakDesaInput,
  type KontakDesaFormValues,
  type KontakDesaRecord,
} from "@/lib/kontak-desa";
import { toast } from "react-toastify";
import { proxy } from "valtio";

const KONTAK_DESA_ENDPOINT = "/api/desa/kontakdesa";

const defaultForm = (): KontakDesaFormValues => ({ namaKantor: "", alamat: "", telepon: "", email: "" });

/** Nilai form dari data tersimpan; data null (baris belum ada) → form kosong. */
export function toKontakFormValues(data: KontakDesaRecord | null): KontakDesaFormValues {
  if (!data) return defaultForm();
  return { namaKantor: data.namaKantor, alamat: data.alamat, telepon: data.telepon, email: data.email };
}

type ApiBody = { success?: boolean; message?: string; data?: KontakDesaRecord | null };

/**
 * State Kontak Desa: `findUnique.data` dibaca admin (form) dan pembaca publik (footer, PPID) sehingga satu kali muat
 * dipakai bersama; `form` diisi IN-PLACE (Object.assign) agar identitas proxy stabil bagi `useSnapshot(form, { sync: true })`.
 */
const stateKontakDesa = proxy({
  findUnique: {
    data: null as KontakDesaRecord | null,
    /** True setelah satu muat sukses (data boleh tetap null bila barisnya belum ada); pembaca publik tidak memuat ulang. */
    loaded: false,
    loading: false,
    error: null as string | null,

    /** GET publik; true bila respons sukses (data bisa null = belum diisi). Galat disimpan di `error`. */
    async load(): Promise<boolean> {
      const s = stateKontakDesa.findUnique;
      s.loading = true;
      s.error = null;
      try {
        const res = await fetch(KONTAK_DESA_ENDPOINT);
        const body = (await res.json().catch(() => null)) as ApiBody | null;
        if (!res.ok || !body?.success) {
          throw new Error(body?.message ?? `HTTP error! status: ${res.status}`);
        }
        s.data = body.data ?? null;
        s.loaded = true;
        return true;
      } catch (error) {
        const message = (error as Error).message;
        s.error = message;
        console.error("Gagal memuat kontak desa:", message);
        return false;
      } finally {
        s.loading = false;
      }
    },
  },

  form: defaultForm(),

  /** Salin data tersimpan ke form (in-place). */
  fillForm(data: KontakDesaRecord | null) {
    Object.assign(stateKontakDesa.form, toKontakFormValues(data));
  },

  update: {
    loading: false,

    /** Validasi (aturan sama dengan API) lalu PUT admin; true bila tersimpan. */
    async submit(): Promise<boolean> {
      const s = stateKontakDesa.update;
      const parsed = parseKontakDesaInput({ ...stateKontakDesa.form });
      if (!parsed.ok) {
        toast.error(parsed.message);
        return false;
      }
      s.loading = true;
      try {
        const res = await fetch(KONTAK_DESA_ENDPOINT, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        });
        const body = (await res.json().catch(() => null)) as ApiBody | null;
        if (!res.ok || !body?.success || !body.data) {
          throw new Error(body?.message ?? `HTTP error! status: ${res.status}`);
        }
        stateKontakDesa.findUnique.data = body.data;
        stateKontakDesa.findUnique.loaded = true;
        stateKontakDesa.fillForm(body.data);
        toast.success("Kontak desa berhasil disimpan");
        return true;
      } catch (error) {
        const message = (error as Error).message;
        console.error("Gagal menyimpan kontak desa:", message);
        toast.error(message || "Gagal menyimpan kontak desa");
        return false;
      } finally {
        s.loading = false;
      }
    },
  },
});

export default stateKontakDesa;
