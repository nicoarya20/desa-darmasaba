import type { HargaPublik } from "@/lib/umkm/harga-publik";
import { toast } from "react-toastify";
import { proxy } from "valtio";

const BASE = "/api/ekonomi/umkm/produk/pengaturan";

/** State admin saklar "Sembunyikan harga di website publik" (satu baris aktif `UmkmConfig`). */
const hargaPublik = proxy({
  data: null as HargaPublik | null,
  loading: false,
  /** true bila muat terakhir gagal: saklar dinonaktifkan agar admin tidak menimpa nilai yang tidak diketahui. */
  failed: false,
  async load() {
    hargaPublik.loading = true;
    try {
      const res = await fetch(`${BASE}/find`);
      const result = await res.json();
      if (!res.ok || !result?.success) throw new Error(result?.message ?? `HTTP ${res.status}`);
      hargaPublik.data = result.data;
      hargaPublik.failed = false;
    } catch (error) {
      console.error("hargaPublik.load: gagal memuat pengaturan harga produk", error);
      hargaPublik.failed = true;
      toast.error("Gagal memuat pengaturan harga produk");
    } finally {
      hargaPublik.loading = false;
    }
  },

  saving: false,
  /** Simpan saklar; true bila berhasil. Nilai di layar hanya berubah setelah server menyimpan. */
  async save(sembunyikanHarga: boolean): Promise<boolean> {
    hargaPublik.saving = true;
    try {
      const res = await fetch(`${BASE}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sembunyikanHarga }),
      });
      const result = await res.json();
      if (!res.ok || !result?.success) {
        toast.error(result?.message || "Gagal menyimpan pengaturan harga produk");
        return false;
      }
      hargaPublik.data = result.data;
      toast.success(result.message);
      return true;
    } catch (error) {
      console.error("hargaPublik.save: gagal menyimpan pengaturan harga produk", error);
      toast.error("Gagal menyimpan pengaturan harga produk");
      return false;
    } finally {
      hargaPublik.saving = false;
    }
  },
});

export default hargaPublik;
