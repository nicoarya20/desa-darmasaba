import { formatRupiah, formatRupiahCompact } from '@/app/(public)/_com/main-page/apbdes/apbdes.logic';
import { htmlToPlainText } from '@/lib/rich-text';

/** Keunggulan program siap tampil: deskripsi sudah jadi teks polos (HTML editor tidak dirender mentah). */
export type Keunggulan = { id: string; judul: string; deskripsi: string };

/** Bentuk item `keunggulanprogram/findMany` yang dipakai halaman publik. */
export type KeunggulanApiItem = { id: string; judul?: string | null; deskripsi?: string | null };

/** Bentuk `ringkasan/stats`: `danaTersalurkan` = BigInt sebagai string, `tahunAjaran` "-" bila belum diatur. */
export type RingkasanApi = { jumlahPenerima?: number | null; danaTersalurkan?: string | null; tahunAjaran?: string | null };

/** Angka ringkasan siap tampil; `null` = belum diisi admin. */
export type Ringkasan = {
  pendaftar: number;
  danaRingkas: string | null;
  danaPenuh: string | null;
  tahunAjaran: string | null;
};

/** Item API → kartu keunggulan; item tanpa judul dibuang. */
export function toKeunggulan(items: readonly KeunggulanApiItem[]): Keunggulan[] {
  return items
    .map((item) => ({ id: item.id, judul: (item.judul ?? '').trim(), deskripsi: htmlToPlainText(item.deskripsi) }))
    .filter((item) => item.judul !== '');
}

/**
 * Stats API → ringkasan. `jumlahPenerima` dari API sebenarnya jumlah SEMUA pendaftar aktif (belum ada status
 * seleksi), jadi ditampilkan sebagai "Pendaftar". Dana 0 / tak terbaca → `null` ("Belum dicatat").
 */
export function toRingkasan(data: RingkasanApi): Ringkasan {
  const dana = Number(data.danaTersalurkan);
  const hasDana = Number.isFinite(dana) && dana > 0;
  const tahun = (data.tahunAjaran ?? '').trim();
  return {
    pendaftar: Number.isFinite(data.jumlahPenerima) ? Number(data.jumlahPenerima) : 0,
    danaRingkas: hasDana ? formatRupiahCompact(dana) : null,
    danaPenuh: hasDana ? formatRupiah(dana) : null,
    tahunAjaran: tahun && tahun !== '-' ? tahun : null,
  };
}

/** Pesan galat kiriman formulir yang manusiawi; pesan mentah server tidak ditampilkan ke pengunjung. */
export const SUBMIT_ERROR = {
  unauthorized:
    'Pendaftaran online belum bisa menerima kiriman saat ini. Isian Anda tetap tersimpan di formulir ini; coba lagi nanti atau datang langsung ke kantor desa.',
  duplicate:
    'NIK orang tua/wali ini sudah pernah dipakai untuk mendaftar. Bila ingin mendaftarkan anak lain, hubungi kantor desa.',
  rateLimit: 'Terlalu banyak kiriman dalam waktu singkat. Tunggu beberapa menit lalu coba lagi.',
  invalid: 'Ada isian yang belum sesuai. Periksa kembali formulir lalu kirim ulang.',
  network: 'Pendaftaran gagal dikirim karena gangguan jaringan atau server. Isian Anda masih ada; coba kirim lagi.',
} as const;

/** Status HTTP kiriman gagal → pesan galat di dalam modal. 0 = gagal jaringan (tanpa respons). */
export function submitErrorMessage(status: number): string {
  if (status === 401 || status === 403) return SUBMIT_ERROR.unauthorized;
  if (status === 409) return SUBMIT_ERROR.duplicate;
  if (status === 429) return SUBMIT_ERROR.rateLimit;
  if (status === 400 || status === 422) return SUBMIT_ERROR.invalid;
  return SUBMIT_ERROR.network;
}
