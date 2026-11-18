import ApiFetch from "@/lib/api-fetch";
import type { DokumenPerencanaanItem } from "./dokumenPerencanaan";
import { proxy } from "valtio";

// Batas endpoint find-many; cukup untuk satu dokumen RKP per tahun selama puluhan tahun.
const RKP_INDEX_LIMIT = 50;

type RkpDoc = Pick<DokumenPerencanaanItem, "id" | "judul" | "tahun" | "file">;

// State publik Monev & Pembangunan untuk label "Bersumber dari RKP Desa {tahun}" (GET /api/desa/dokumenperencanaan/find-many).
// Daftar dokumen lengkap ada di halaman Arah Kebijakan Pembangunan Desa (state-nya sendiri, bukan di sini).
const stateDokumenPerencanaanPublik = proxy({
  /** Dokumen RKP untuk label "Bersumber dari RKP Desa {tahun}" pada kartu kegiatan. */
  rkpDocs: [] as RkpDoc[],
  async loadRkpIndex() {
    try {
      const res = await ApiFetch.api.desa["dokumenperencanaan"]["find-many"].get({
        query: { jenis: "RKP", limit: RKP_INDEX_LIMIT },
      });
      if (res.status === 200 && res.data?.success) {
        stateDokumenPerencanaanPublik.rkpDocs = (res.data.data ?? []) as unknown as RkpDoc[];
      }
    } catch (error) {
      // Label RKP hanya pelengkap; bila gagal, kartu kegiatan tampil tanpa label.
      console.error("Gagal memuat indeks RKP:", error);
    }
  },
});

export default stateDokumenPerencanaanPublik;
