import type { PengaduanStatus } from "./pengaduan-status";

/** Satu tanggapan di rekap publik: sengaja tanpa id, nama, judul, lokasi, atau isi pengaduan. */
export type PengaduanTanggapanPublik = {
  jenis: string;
  status: PengaduanStatus;
  tanggapan: string;
  tanggapanAt: string | null;
};

/** Bentuk `data` dari `GET /api/inovasi/layananonlinedesa/pengaduanmasyarakat/rekap` (publik, hanya agregat). */
export type PengaduanRekap = {
  total: number;
  perStatus: Record<PengaduanStatus, number>;
  perJenis: Array<{ jenis: string; jumlah: number }>;
  tanggapanTerbaru: PengaduanTanggapanPublik[];
};

/** Rekap kosong (belum ada pengaduan) — dipakai saat server belum punya data atau gagal dimuat. */
export function isRekapKosong(rekap: PengaduanRekap | null | undefined): boolean {
  return !rekap || rekap.total === 0;
}
