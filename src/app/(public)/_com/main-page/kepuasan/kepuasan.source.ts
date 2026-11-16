import ApiFetch from "@/lib/api-fetch";
import { proxy } from "valtio";
import type { RespondenItem } from "./kepuasan.logic";
import { RESPONDEN_CHART_LIMIT } from "./kepuasan.meta";

// Sumber data grafik IKM publik sendiri (bukan state admin): `responden/findMany` admin-only karena memuat nama
// responden; `responden/ringkasan` hanya mengirim tanggal + kategori.

type RingkasanBody = { success?: boolean; message?: string; data?: RespondenItem[]; total?: number } | null;

/** Data grafik kepuasan publik: `data` null = belum dimuat, `total` = jumlah semua responden aktif di server. */
export const kepuasanPublik = proxy({
  data: null as RespondenItem[] | null,
  total: 0,
  loading: false,
});

/** Muat (ulang) ringkasan responden; galat → daftar kosong (tampil "belum ada data") + console.error berkonteks. */
export async function muatKepuasanPublik(): Promise<void> {
  kepuasanPublik.loading = true;
  try {
    const res = await ApiFetch.api.landingpage.responden.ringkasan.get({ query: { limit: RESPONDEN_CHART_LIMIT } });
    const body = (res.error ? res.error.value : res.data) as RingkasanBody;
    if (res.status !== 200 || body?.success !== true || !Array.isArray(body.data)) {
      throw new Error(`HTTP ${res.status}: ${body?.message ?? "respons tidak valid"}`);
    }
    kepuasanPublik.data = body.data;
    kepuasanPublik.total = Number(body.total) || 0;
  } catch (error) {
    console.error("Gagal memuat ringkasan responden IKM:", error);
    kepuasanPublik.data = [];
    kepuasanPublik.total = 0;
  } finally {
    kepuasanPublik.loading = false;
  }
}
