/** Fungsi murni rekap tindak lanjut pengaduan publik (tanpa React; dites di __tests__/api/pengaduan_rekap_publik_ui.test.tsx). */
import type { PengaduanRekap } from "@/lib/pengaduan-rekap";
import { PENGADUAN_STATUS, PENGADUAN_STATUS_LABEL, type PengaduanStatus } from "@/lib/pengaduan-status";

/** Zona waktu desa (Bali, WITA) untuk tanggal tanggapan, supaya sama di server dan di peramban pengunjung. */
export const REKAP_TIME_ZONE = "Asia/Makassar";

const tanggalFormat = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: REKAP_TIME_ZONE });

/** Satu kartu angka status: urutan tampil = urutan alur penanganan (Baru → Ditolak). */
export type StatusCard = { status: PengaduanStatus; label: string; jumlah: number };

/** Kartu angka per status dari rekap, selalu keempat status (jumlah 0 tetap tampil agar perbandingan jelas). */
export function statusCards(rekap: PengaduanRekap): StatusCard[] {
  return PENGADUAN_STATUS.map((status) => ({ status, label: PENGADUAN_STATUS_LABEL[status], jumlah: rekap.perStatus[status] }));
}

/** "17 November 2026" (WITA) dari ISO; string kosong bila null atau tidak valid. */
export function formatTanggalTanggapan(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : tanggalFormat.format(date);
}
