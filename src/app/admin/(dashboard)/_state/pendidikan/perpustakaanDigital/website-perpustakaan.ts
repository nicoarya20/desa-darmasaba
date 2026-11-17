import type { PerpustakaanWebsite } from "@/lib/perpustakaan-website";
import { toast } from "react-toastify";
import { proxy } from "valtio";

const BASE = "/api/pendidikan/perpustakaandigital/pengaturan";

/** State admin pengaturan halaman penghubung Perpustakaan Digital (satu baris aktif). */
const websitePerpustakaan = proxy({
  data: null as PerpustakaanWebsite | null,
  loading: false,
  /** true bila muat terakhir gagal (bedakan dari "belum diatur" = data null). */
  failed: false,
  async load() {
    websitePerpustakaan.loading = true;
    try {
      const res = await fetch(`${BASE}/find`);
      const result = await res.json();
      if (!res.ok || !result?.success) throw new Error(result?.message ?? `HTTP ${res.status}`);
      websitePerpustakaan.data = result.data ?? null;
      websitePerpustakaan.failed = false;
    } catch (error) {
      console.error("websitePerpustakaan.load: gagal memuat pengaturan perpustakaan", error);
      websitePerpustakaan.failed = true;
      toast.error("Gagal memuat pengaturan perpustakaan");
    } finally {
      websitePerpustakaan.loading = false;
    }
  },

  saving: false,
  /** Simpan ke server; true bila berhasil. Validasi akhir tetap di server (skema yang sama). */
  async save(values: PerpustakaanWebsite): Promise<boolean> {
    websitePerpustakaan.saving = true;
    try {
      const res = await fetch(`${BASE}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await res.json();
      if (!res.ok || !result?.success) {
        toast.error(result?.message || "Gagal menyimpan pengaturan perpustakaan");
        return false;
      }
      websitePerpustakaan.data = result.data ?? values;
      toast.success("Pengaturan perpustakaan berhasil disimpan");
      return true;
    } catch (error) {
      console.error("websitePerpustakaan.save: gagal menyimpan pengaturan perpustakaan", error);
      toast.error("Gagal menyimpan pengaturan perpustakaan");
      return false;
    } finally {
      websitePerpustakaan.saving = false;
    }
  },
});

export default websitePerpustakaan;
