import ApiFetch from "@/lib/api-fetch";
import type { PustuDetail, PustuRingkas } from "@/lib/pustu/pustu.types";
import { getServerMessage } from "@/utils/api-message";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { hapusUnggahanYatim, unggahGambar } from "../../konten-bersama/unggah-gambar";
import { cekFormPustu, payloadDariForm, type PustuForm } from "./pustu.form";

const BASE = "/api/kesehatan/puskesmas";

const pesanError = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

/** Simpan body PUSTU (POST baru / PUT edit); mengembalikan id tersimpan atau melempar Error berpesan. */
async function kirimPustu(id: string | null, body: ReturnType<typeof payloadDariForm>): Promise<string> {
  const res = await fetch(id ? `${BASE}/${encodeURIComponent(id)}` : `${BASE}/create`, {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  // Body bukan JSON (mis. halaman error proxy) → diperlakukan kosong; status HTTP jadi alasan di pesan error.
  const json: unknown = await res.json().catch(() => null);
  const data = (json as { success?: boolean; data?: { id?: string } } | null) ?? null;
  if (!res.ok || !data?.success || !data.data?.id) {
    throw new Error(getServerMessage(json) ?? `Gagal menyimpan PUSTU (HTTP ${res.status})`);
  }
  return data.data.id;
}

/** Foto baru yang dipilih admin di form (diunggah saat simpan). */
export type FotoBaruPustu = { foto: File | null; bagan: File | null };

/**
 * State PUSTU (model Puskesmas): daftar berpaginasi (publik + admin), detail lengkap (publik + admin),
 * simpan form (unggah foto lokasi & bagan), hapus.
 */
const pustuState = proxy({
  findMany: {
    data: null as PustuRingkas[] | null,
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      pustuState.findMany.loading = true;
      pustuState.findMany.page = page;
      pustuState.findMany.search = search;
      try {
        const query: Record<string, string | number> = { page, limit };
        if (search) query.search = search;
        const res = await ApiFetch.api.kesehatan.puskesmas["find-many"].get({ query });
        const ok = res.status === 200 && res.data?.success;
        if (!ok) console.error("[pustu] Gagal memuat daftar:", res.data?.message);
        pustuState.findMany.data = ok ? ((res.data?.data ?? []) as PustuRingkas[]) : [];
        pustuState.findMany.total = ok ? (res.data?.total ?? 0) : 0;
        pustuState.findMany.totalPages = ok ? (res.data?.totalPages ?? 1) : 1;
      } catch (error) {
        console.error("[pustu] Gagal memuat daftar:", error);
        pustuState.findMany.data = [];
        pustuState.findMany.total = 0;
        pustuState.findMany.totalPages = 1;
      } finally {
        pustuState.findMany.loading = false;
      }
    },
  },

  findUnique: {
    /** Id yang terakhir diminta; respons untuk id lain (klik cepat) diabaikan. */
    id: null as string | null,
    data: null as PustuDetail | null,
    loading: false,
    gagal: false,
    /** True bila server membalas 404 (bukan galat jaringan). */
    tidakDitemukan: false,
    async load(id: string) {
      const f = pustuState.findUnique;
      f.id = id;
      f.loading = true;
      f.gagal = false;
      f.tidakDitemukan = false;
      try {
        const res = await fetch(`${BASE}/${encodeURIComponent(id)}`);
        const json = (await res.json().catch(() => null)) as { success?: boolean; data?: PustuDetail } | null;
        if (f.id !== id) return;
        const ok = res.ok && json?.success && json.data;
        f.data = ok ? (json.data as PustuDetail) : null;
        f.gagal = !ok;
        f.tidakDitemukan = res.status === 404;
      } catch (error) {
        console.error(`[pustu] Gagal memuat detail ${id}:`, error);
        if (f.id !== id) return;
        f.data = null;
        f.gagal = true;
      } finally {
        if (f.id === id) f.loading = false;
      }
    },
  },

  saving: false,
  /**
   * Simpan form (id null = tambah). Foto lokasi/bagan baru diunggah dulu dan dibersihkan bila simpan gagal.
   * Mengembalikan id PUSTU, atau null bila gagal (pesan sudah ditampilkan).
   */
  async simpan(id: string | null, form: PustuForm, baru: FotoBaruPustu): Promise<string | null> {
    const salah = cekFormPustu(form);
    if (salah) {
      toast.error(salah);
      return null;
    }
    pustuState.saving = true;
    const unggahan: string[] = [];
    try {
      const imageId = baru.foto ? await unggahGambar(baru.foto) : form.imageId;
      if (baru.foto && imageId) unggahan.push(imageId);
      const baganId = baru.bagan ? await unggahGambar(baru.bagan) : form.fotoBaganStrukturId;
      if (baru.bagan && baganId) unggahan.push(baganId);
      const savedId = await kirimPustu(id, payloadDariForm(form, { imageId, baganId }));
      toast.success(id ? "Data PUSTU berhasil diperbarui" : "Data PUSTU berhasil ditambahkan");
      return savedId;
    } catch (error) {
      await hapusUnggahanYatim(unggahan, "foto pustu");
      toast.error(pesanError(error, "Gagal menyimpan data PUSTU"));
      return null;
    } finally {
      pustuState.saving = false;
    }
  },

  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");
      pustuState.delete.loading = true;
      try {
        const res = await fetch(`${BASE}/del/${encodeURIComponent(id)}`, { method: "DELETE" });
        const result = await res.json();
        if (res.ok && result?.success) {
          toast.success(result.message || "PUSTU berhasil dihapus");
          await pustuState.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus PUSTU");
        }
      } catch (error) {
        console.error(`[pustu] Gagal menghapus ${id}:`, error);
        toast.error("Terjadi kesalahan saat menghapus PUSTU");
      } finally {
        pustuState.delete.loading = false;
      }
    },
  },
});

export default pustuState;
