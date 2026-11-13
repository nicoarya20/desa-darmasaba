/** Helper murni halaman Laporan Publik: bentuk data, label status, format tanggal, URL, validasi formulir. */
import { withListQuery } from "@/app/(public)/_com/kabar-list/kabar-list.logic";
import { DESA_TIME_ZONE } from "@/app/(public)/_com/main-page/apbdes/apbdes.logic";
import { formatTanggalTerbit } from "@/lib/tanggal-terbit";
import { LAPORAN_LIST_HREF, LAPORAN_MIN_TEXT } from "./laporan.meta";
import { LAPORAN_FORM_TEXT } from "./laporan.text";

/** Bentuk JSON laporan dari `/api/keamanan/laporanpublik/*` (tanggal berupa string ISO). */
export type LaporanPublik = {
  id: string;
  judul: string;
  lokasi: string;
  tanggalWaktu: string;
  /** Enum `StatusLaporan`: Baru | Proses | Selesai | Gagal. */
  status: string;
  kronologi?: string | null;
  isActive?: boolean;
  penanganan?: ReadonlyArray<{ id: string; deskripsi: string }> | null;
};

export type StatusTone = "selesai" | "proses" | "gagal" | "baru" | "lain";

const STATUS: Record<string, { label: string; tone: StatusTone }> = {
  Selesai: { label: "Selesai", tone: "selesai" },
  Proses: { label: "Dalam proses", tone: "proses" },
  // Nilai enum/API tetap `Gagal`; label tampilan dilunakkan atas keputusan user (2026-11-12).
  Gagal: { label: "Tidak terselesaikan", tone: "gagal" },
  Baru: { label: "Baru", tone: "baru" },
};

/** Label teks + nada warna status; nilai tak dikenal ditampilkan apa adanya dengan nada netral. */
export function statusInfo(status: string | null | undefined): { label: string; tone: StatusTone } {
  const key = status?.trim() ?? "";
  return STATUS[key] ?? { label: key || "Tanpa status", tone: "lain" };
}

const jam = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: DESA_TIME_ZONE,
});

/** Tanggal + jam kejadian (WITA), mis. `Senin, 24 November 2025, 16.58`; tanggal tidak valid → `null`. */
export function formatTanggalWaktu(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${formatTanggalTerbit(date)}, ${jam.format(date)}`;
}

/** URL daftar dengan `?search=&page=` (kosong/halaman 1 tidak ditulis). */
export function laporanListHref(opts: { search?: string; page?: number } = {}): string {
  return withListQuery(LAPORAN_LIST_HREF, opts);
}

export function laporanDetailHref(id: string): string {
  return `${LAPORAN_LIST_HREF}/${encodeURIComponent(id)}`;
}

/* ---------- Formulir Tambah Laporan ---------- */

export type LaporanFormValues = { judul: string; lokasi: string; tanggalWaktu: string; kronologi: string };
export type LaporanFormErrors = Partial<Record<"judul" | "lokasi" | "tanggalWaktu", string>>;

/**
 * Validasi klien sebelum `laporanPublikState.create.create()` dipanggil. Aturan = skema zod state admin
 * (judul & lokasi ≥ 3 karakter, tanggal wajib) ditambah trim, cek tanggal valid, dan waktu kejadian tidak
 * melewati `now` (keputusan user). Tanpa ini, isian tidak valid tetap menutup modal dan mengosongkan
 * formulir (state hanya memberi toast tanpa sinyal gagal).
 */
export function validateLaporanForm(form: LaporanFormValues, now: Date = new Date()): LaporanFormErrors {
  const errors: LaporanFormErrors = {};
  if (form.judul.trim().length < LAPORAN_MIN_TEXT) errors.judul = LAPORAN_FORM_TEXT.errJudul;
  if (form.lokasi.trim().length < LAPORAN_MIN_TEXT) errors.lokasi = LAPORAN_FORM_TEXT.errLokasi;
  const tanggal = pickerValue(form.tanggalWaktu);
  if (!tanggal) errors.tanggalWaktu = LAPORAN_FORM_TEXT.errTanggal;
  else if (tanggal.getTime() > now.getTime()) errors.tanggalWaktu = LAPORAN_FORM_TEXT.errTanggalMasaDepan;
  return errors;
}

/**
 * Nilai DateTimePicker (`"YYYY-MM-DD HH:mm:ss"`, waktu lokal) → string tanggal di form state.
 * Spasi diganti `T` supaya `new Date()` di state membacanya sama di semua peramban: format berspasi tidak
 * baku ECMAScript dan menjadi Invalid Date di Safari lama.
 */
export function pickerToForm(value: string | null): string {
  return value ? value.trim().replace(" ", "T") : "";
}

/** String tanggal di form state → Date untuk DateTimePicker; kosong/tidak valid → `null`. */
export function pickerValue(value: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
