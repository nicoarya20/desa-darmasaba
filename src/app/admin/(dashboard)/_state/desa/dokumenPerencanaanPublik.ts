import ApiFetch from "@/lib/api-fetch";
import type { DokumenPerencanaanItem } from "./dokumenPerencanaan";
import { proxy } from "valtio";

const PAGE_SIZE = 6;
// Batas endpoint find-many; cukup untuk satu dokumen RKP per tahun selama puluhan tahun.
const RKP_INDEX_LIMIT = 50;

type RkpDoc = Pick<DokumenPerencanaanItem, "id" | "judul" | "tahun" | "file">;

// State publik section Dokumen Perencanaan di halaman Monev & Pembangunan
// (GET /api/desa/dokumenperencanaan/find-many).
const stateDokumenPerencanaanPublik = proxy({
  data: [] as DokumenPerencanaanItem[],
  page: 1,
  totalPages: 1,
  loading: false,
  failed: false,
  /** Dokumen RKP untuk label "Bersumber dari RKP Desa {tahun}" pada kartu kegiatan. */
  rkpDocs: [] as RkpDoc[],
  async load(jenis: string, page = 1) {
    stateDokumenPerencanaanPublik.loading = true;
    stateDokumenPerencanaanPublik.failed = false;
    try {
      const res = await ApiFetch.api.desa["dokumenperencanaan"]["find-many"].get({
        query: { jenis, page, limit: PAGE_SIZE },
      });
      if (res.status === 200 && res.data?.success) {
        stateDokumenPerencanaanPublik.data = (res.data.data ?? []) as unknown as DokumenPerencanaanItem[];
        stateDokumenPerencanaanPublik.page = page;
        stateDokumenPerencanaanPublik.totalPages = res.data.totalPages ?? 1;
      } else {
        stateDokumenPerencanaanPublik.failed = true;
      }
    } catch (error) {
      console.error("Gagal memuat dokumen perencanaan:", error);
      stateDokumenPerencanaanPublik.failed = true;
    } finally {
      stateDokumenPerencanaanPublik.loading = false;
    }
  },
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
