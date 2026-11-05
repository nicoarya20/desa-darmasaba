import ApiFetch from "@/lib/api-fetch";
import type { MonevSummary } from "@/lib/kegiatan-pembangunan";
import { proxy } from "valtio";

export type MonevKegiatan = {
  id: string;
  judul: string;
  deskripsiSingkat: string;
  tanggal: string;
  lokasi: string;
  anggaran: number | null;
  progres: number | null;
  statusPembangunan: string | null;
  sumberDana: string | null;
  image?: { link: string } | null;
};

const PAGE_SIZE = 9;

// State halaman publik Monev & Pembangunan (GET /api/desa/kegiatandesa/monev).
const stateMonevPembangunan = proxy({
  data: [] as MonevKegiatan[],
  summary: null as MonevSummary | null,
  page: 1,
  totalPages: 1,
  loading: false,
  failed: false,
  async load(page = 1, status = "") {
    stateMonevPembangunan.loading = true;
    stateMonevPembangunan.failed = false;
    try {
      const query: Record<string, string | number> = { page, limit: PAGE_SIZE };
      if (status) query.status = status;

      const res = await ApiFetch.api.desa["kegiatandesa"]["monev"].get({ query });

      if (res.status === 200 && res.data?.success) {
        stateMonevPembangunan.data = (res.data.data ?? []) as unknown as MonevKegiatan[];
        stateMonevPembangunan.summary = (res.data.summary ?? null) as MonevSummary | null;
        stateMonevPembangunan.page = page;
        stateMonevPembangunan.totalPages = res.data.totalPages ?? 1;
      } else {
        stateMonevPembangunan.failed = true;
      }
    } catch (error) {
      console.error("Gagal memuat monev pembangunan:", error);
      stateMonevPembangunan.failed = true;
    } finally {
      stateMonevPembangunan.loading = false;
    }
  },
});

export default stateMonevPembangunan;
