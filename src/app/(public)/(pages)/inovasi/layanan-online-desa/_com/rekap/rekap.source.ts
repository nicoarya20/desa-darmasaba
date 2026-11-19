import ApiFetch from "@/lib/api-fetch";
import type { PengaduanRekap } from "@/lib/pengaduan-rekap";

type RekapBody = { success?: boolean; message?: string; data?: PengaduanRekap } | null | undefined;

/** Muat rekap publik (agregat + tanggapan terbaru, tanpa data pelapor); gagal → Error berkonteks. */
export async function loadPengaduanRekap(): Promise<PengaduanRekap> {
  const res = await ApiFetch.api.inovasi.layananonlinedesa.pengaduanmasyarakat.rekap.get();
  const body = res.data as RekapBody;
  if (res.status !== 200 || !body?.success || !body.data) {
    throw new Error(`muat rekap pengaduan gagal (HTTP ${res.status}): ${body?.message ?? "respons tidak valid"}`);
  }
  return body.data;
}
