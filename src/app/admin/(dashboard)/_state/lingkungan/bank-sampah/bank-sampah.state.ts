import ApiFetch from "@/lib/api-fetch";
import type { BankSampahDetail, BankSampahRingkas } from "@/lib/bank-sampah/bank-sampah.types";
import { getServerMessage } from "@/utils/api-message";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { hapusUnggahanYatim, unggahGambar } from "../../konten-bersama/unggah-gambar";
import { cekFormBankSampah, payloadDariForm, type BankSampahForm } from "./bank-sampah.form";

const BASE = "/api/lingkungan/keteranganbankterdekat";

const pesanError = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

/** Simpan body bank sampah (POST baru / PUT edit); mengembalikan id tersimpan atau melempar Error berpesan. */
async function kirimBankSampah(id: string | null, body: ReturnType<typeof payloadDariForm>): Promise<string> {
  const res = await fetch(id ? `${BASE}/${encodeURIComponent(id)}` : `${BASE}/create`, {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  // Body bukan JSON (mis. halaman error proxy) → diperlakukan kosong; status HTTP jadi alasan di pesan error.
  const json: unknown = await res.json().catch(() => null);
  const data = (json as { success?: boolean; data?: { id?: string } } | null) ?? null;
  if (!res.ok || !data?.success || !data.data?.id) {
    throw new Error(getServerMessage(json) ?? `Gagal menyimpan bank sampah (HTTP ${res.status})`);
  }
  return data.data.id;
}

/**
 * State Bank Sampah (Keterangan Bank Sampah Terdekat): daftar berpaginasi (publik + admin), detail lengkap
 * (modal publik + admin), simpan form (dengan unggah foto bagan), hapus.
 */
const keteranganSampah = proxy({
  findMany: {
    data: null as BankSampahRingkas[] | null,
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      keteranganSampah.findMany.loading = true;
      keteranganSampah.findMany.page = page;
      keteranganSampah.findMany.search = search;
      try {
        const query: Record<string, string | number> = { page, limit };
        if (search) query.search = search;
        const res = await ApiFetch.api.lingkungan.keteranganbankterdekat["find-many"].get({ query });
        const ok = res.status === 200 && res.data?.success;
        if (!ok) console.error("[bank sampah] Gagal memuat daftar:", res.data?.message);
        keteranganSampah.findMany.data = ok ? ((res.data?.data ?? []) as BankSampahRingkas[]) : [];
        keteranganSampah.findMany.total = ok ? (res.data?.total ?? 0) : 0;
        keteranganSampah.findMany.totalPages = ok ? (res.data?.totalPages ?? 1) : 1;
      } catch (error) {
        console.error("[bank sampah] Gagal memuat daftar:", error);
        keteranganSampah.findMany.data = [];
        keteranganSampah.findMany.total = 0;
        keteranganSampah.findMany.totalPages = 1;
      } finally {
        keteranganSampah.findMany.loading = false;
      }
    },
  },

  findUnique: {
    /** Id yang terakhir diminta; respons untuk id lain (klik cepat) diabaikan. */
    id: null as string | null,
    data: null as BankSampahDetail | null,
    loading: false,
    gagal: false,
    async load(id: string) {
      keteranganSampah.findUnique.id = id;
      keteranganSampah.findUnique.loading = true;
      keteranganSampah.findUnique.gagal = false;
      try {
        const res = await fetch(`${BASE}/${encodeURIComponent(id)}`);
        const json = (await res.json()) as { success?: boolean; data?: BankSampahDetail };
        if (keteranganSampah.findUnique.id !== id) return;
        const ok = res.ok && json.success && json.data;
        keteranganSampah.findUnique.data = ok ? (json.data as BankSampahDetail) : null;
        keteranganSampah.findUnique.gagal = !ok;
      } catch (error) {
        console.error(`[bank sampah] Gagal memuat detail ${id}:`, error);
        if (keteranganSampah.findUnique.id !== id) return;
        keteranganSampah.findUnique.data = null;
        keteranganSampah.findUnique.gagal = true;
      } finally {
        if (keteranganSampah.findUnique.id === id) keteranganSampah.findUnique.loading = false;
      }
    },
  },

  saving: false,
  /**
   * Simpan form (id null = tambah). Foto bagan baru diunggah dulu dan dibersihkan bila simpan gagal.
   * Mengembalikan id bank sampah, atau null bila gagal (pesan sudah ditampilkan).
   */
  async simpan(id: string | null, form: BankSampahForm, baganBaru: File | null): Promise<string | null> {
    const salah = cekFormBankSampah(form);
    if (salah) {
      toast.error(salah);
      return null;
    }
    keteranganSampah.saving = true;
    const unggahan: string[] = [];
    try {
      if (baganBaru) unggahan.push(await unggahGambar(baganBaru));
      const savedId = await kirimBankSampah(id, payloadDariForm(form, unggahan[0] ?? form.fotoBaganStrukturId));
      toast.success(id ? "Data bank sampah berhasil diperbarui" : "Data bank sampah berhasil ditambahkan");
      return savedId;
    } catch (error) {
      await hapusUnggahanYatim(unggahan, "bagan bank sampah");
      toast.error(pesanError(error, "Gagal menyimpan data bank sampah"));
      return null;
    } finally {
      keteranganSampah.saving = false;
    }
  },

  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");
      keteranganSampah.delete.loading = true;
      try {
        const response = await fetch(`${BASE}/del/${encodeURIComponent(id)}`, { method: "DELETE" });
        const result = await response.json();
        if (response.ok && result?.success) {
          toast.success(result.message || "Keterangan sampah berhasil dihapus");
          await keteranganSampah.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus keterangan sampah");
        }
      } catch (error) {
        console.error(`[bank sampah] Gagal menghapus ${id}:`, error);
        toast.error("Terjadi kesalahan saat menghapus keterangan sampah");
      } finally {
        keteranganSampah.delete.loading = false;
      }
    },
  },
});

export default keteranganSampah;
