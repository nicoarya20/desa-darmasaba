// Aturan murni Laporan Penduduk Bulanan (tanpa I/O): konstanta, label bulan, validasi input.
// Dipakai API (create/updt/findMany) dan form admin supaya batas & pesan galatnya satu sumber.

export const BULAN_MIN = 1;
export const BULAN_MAX = 12;
/** Tahun paling awal yang diterima (selaras dengan DataBanjar: data SID desa tidak lebih tua dari ini). */
export const TAHUN_MIN = 2000;
/** Batas atas jumlah per jenis kelamin; jauh di atas penduduk desa, jauh di bawah batas Int 32-bit. */
export const JUMLAH_MAX = 1_000_000;
export const BANJAR_MAX_LENGTH = 100;

/** Nama bulan Indonesia; indeks 0 = Januari. */
export const BULAN_LABEL: readonly string[] = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

/** Tahun terbesar yang wajar: tahun berjalan + 1 (selaras dengan DataBanjar; menutup selisih zona waktu di pergantian tahun). */
export const tahunMaks = (now: Date = new Date()): number => now.getFullYear() + 1;

/** Nama bulan untuk angka 1-12; angka di luar rentang dikembalikan apa adanya. */
export const bulanLabel = (bulan: number): string => BULAN_LABEL[bulan - BULAN_MIN] ?? String(bulan);

/** Total penduduk satu baris laporan = laki-laki + perempuan. */
export const totalPenduduk = (row: { lakiLaki: number; perempuan: number }): number => row.lakiLaki + row.perempuan;

export type LaporanBulananInput = {
  banjar: string;
  tahun: number;
  bulan: number;
  lakiLaki: number;
  perempuan: number;
};

export type ParseResult = { ok: true; data: LaporanBulananInput } | { ok: false; message: string };

/** Rapikan nama banjar: trim dan spasi ganda jadi satu. */
export const normalisasiBanjar = (value: unknown): string =>
  typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";

const isInt = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v);

/** Validasi tahun bulat dalam rentang wajar; null bila valid, selain itu pesan galat. */
export function cekTahun(tahun: unknown, now: Date = new Date()): string | null {
  const maks = tahunMaks(now);
  return isInt(tahun) && tahun >= TAHUN_MIN && tahun <= maks ? null : `Tahun harus bilangan bulat ${TAHUN_MIN}-${maks}`;
}

/** Validasi bulan bulat 1-12; null bila valid, selain itu pesan galat. */
export function cekBulan(bulan: unknown): string | null {
  return isInt(bulan) && bulan >= BULAN_MIN && bulan <= BULAN_MAX ? null : `Bulan harus bilangan bulat ${BULAN_MIN}-${BULAN_MAX}`;
}

const cekJumlah = (label: string, v: unknown): string | null =>
  isInt(v) && v >= 0 && v <= JUMLAH_MAX ? null : `${label} harus bilangan bulat 0-${JUMLAH_MAX}`;

/** Validasi + normalisasi body create/update; galat pertama menjadi pesan. */
export function parseLaporanInput(body: Record<string, unknown>, now: Date = new Date()): ParseResult {
  const banjar = normalisasiBanjar(body.banjar);
  if (!banjar) return { ok: false, message: "Nama banjar wajib diisi" };
  if (banjar.length > BANJAR_MAX_LENGTH) return { ok: false, message: `Nama banjar maksimal ${BANJAR_MAX_LENGTH} karakter` };

  const galat =
    cekTahun(body.tahun, now) ??
    cekBulan(body.bulan) ??
    cekJumlah("Jumlah laki-laki", body.lakiLaki) ??
    cekJumlah("Jumlah perempuan", body.perempuan);
  if (galat) return { ok: false, message: galat };

  return {
    ok: true,
    data: {
      banjar,
      tahun: body.tahun as number,
      bulan: body.bulan as number,
      lakiLaki: body.lakiLaki as number,
      perempuan: body.perempuan as number,
    },
  };
}
