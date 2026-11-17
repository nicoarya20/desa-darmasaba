import ApiFetch from "@/lib/api-fetch";
import type { BankSampahDetail, BankSampahRingkas } from "@/lib/bank-sampah/bank-sampah.types";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { createDetailEntriState } from "../../konten-bersama/detail-entri.state";
import { kirimEntri } from "../../konten-bersama/kirim-entri";
import { hapusUnggahanYatim, unggahGambar } from "../../konten-bersama/unggah-gambar";
import { cekFormBankSampah, payloadDariForm, type BankSampahForm } from "./bank-sampah.form";

const BASE = "/api/lingkungan/keteranganbankterdekat";

const pesanError = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

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

  findUnique: createDetailEntriState<BankSampahDetail>({ url: (id) => `${BASE}/${encodeURIComponent(id)}`, tag: "bank sampah" }),

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
      const body = payloadDariForm(form, unggahan[0] ?? form.fotoBaganStrukturId);
      const savedId = await kirimEntri(BASE, id, body, "bank sampah");
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
