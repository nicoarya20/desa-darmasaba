// Aturan Indeks Desa Membangun (IDM, Kemendesa PDTT) Desa Darmasaba: konstanta & fungsi murni tanpa I/O, dipakai bersama
// oleh API (Elysia), admin, dan halaman publik Indeks Desa > Indeks Desa Membangun.
// Skor dan status DIISI admin apa adanya dari dokumen Kemendesa. Rumus IDM dan ambang status sengaja TIDAK ada di
// sini: belum diverifikasi ke sumber resmi, jadi status tidak boleh diturunkan dari skor oleh kode.

/** Lima status resmi IDM (urut dari terendah ke tertinggi). Disimpan sebagai teks persis seperti tertulis di sini. */
export const STATUS_IDM = ["Sangat Tertinggal", "Tertinggal", "Berkembang", "Maju", "Mandiri"] as const;
export type StatusIdm = (typeof STATUS_IDM)[number];

/** Tiga dimensi IDM: kunci kolom skor, singkatan resmi, dan nama lengkapnya. */
export const DIMENSI_IDM = [
  { key: "skorIks", singkatan: "IKS", nama: "Indeks Ketahanan Sosial" },
  { key: "skorIke", singkatan: "IKE", nama: "Indeks Ketahanan Ekonomi" },
  { key: "skorIkl", singkatan: "IKL", nama: "Indeks Ketahanan Lingkungan" },
] as const;
export type DimensiIdmKey = (typeof DIMENSI_IDM)[number]["key"];

/** Rentang skor yang sah (IDM dan tiap dimensinya berskala 0 sampai 1). */
export const SKOR_IDM_MIN = 0;
export const SKOR_IDM_MAX = 1;

/** Rentang tahun yang wajar untuk data IDM (IDM Kemendesa mulai dipakai 2015; batas atas pengaman salah ketik). */
export const TAHUN_IDM_MIN = 2015;
export const TAHUN_IDM_MAX = 2100;

export const CATATAN_IDM_MAX = 500;

/** Daftar: ukuran halaman bawaan dan batas atas `limit` (cukup memuat semua tahun sah dalam satu halaman). */
export const INDEKS_DESA_DEFAULT_LIMIT = 10;
export const INDEKS_DESA_MAX_LIMIT = 100;

/** Path halaman publik IDM dan halaman admin daftarnya. */
export const INDEKS_DESA_PUBLIC_PATH = "/pemerintahan/indeks-desa";
export const INDEKS_DESA_ADMIN_PATH = "/admin/pemerintahan/indeks-desa";

/** Pesan galat validasi input Indeks Desa. */
export const PESAN_INDEKS_DESA = {
  tahunTidakValid: `Tahun harus bilangan bulat ${TAHUN_IDM_MIN}-${TAHUN_IDM_MAX}`,
  skorTidakValid: (label: string) => `${label} harus angka ${SKOR_IDM_MIN} sampai ${SKOR_IDM_MAX}`,
  statusTidakValid: `Status harus salah satu dari: ${STATUS_IDM.join(", ")}`,
  catatanTipe: "Catatan harus berupa teks",
  catatanPanjang: `Catatan maksimal ${CATATAN_IDM_MAX} karakter`,
  catatanBukanTeksPolos: "Catatan harus teks polos (tanpa tanda < atau >)",
} as const;

/** Satu baris Indeks Desa seperti dikirim API daftar/detail. */
export type IndeksDesaRecord = {
  id: string;
  tahun: number;
  skorIdm: number;
  skorIks: number;
  skorIke: number;
  skorIkl: number;
  status: string;
  catatan: string | null;
};

/** Kolom Indeks Desa yang siap disimpan (sudah divalidasi). */
export type IndeksDesaFields = Omit<IndeksDesaRecord, "id" | "status"> & { status: StatusIdm };

export type IndeksDesaParseResult = { ok: true; data: IndeksDesaFields } | { ok: false; message: string };

/** Apakah nilai adalah salah satu dari 5 status resmi IDM. */
export function isStatusIdm(value: unknown): value is StatusIdm {
  return (STATUS_IDM as readonly unknown[]).includes(value);
}

function isSkorValid(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= SKOR_IDM_MIN && value <= SKOR_IDM_MAX;
}

function isTahunValid(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= TAHUN_IDM_MIN && value <= TAHUN_IDM_MAX;
}

const SKOR_TEKS = /^\d+([.,]\d+)?$/;

/** Ubah teks isian skor ("0.5" atau "0,5", koma desimal Indonesia) jadi angka; isian kosong/bukan angka → NaN (ditolak validasi). */
export function parseSkorTeks(teks: string): number {
  const bersih = teks.trim();
  return SKOR_TEKS.test(bersih) ? Number(bersih.replace(",", ".")) : Number.NaN;
}

function parseCatatan(raw: unknown): { ok: true; catatan: string | null } | { ok: false; message: string } {
  if (raw === undefined || raw === null || raw === "") return { ok: true, catatan: null };
  if (typeof raw !== "string") return { ok: false, message: PESAN_INDEKS_DESA.catatanTipe };
  const catatan = raw.replace(/\s+/g, " ").trim();
  if (catatan.length > CATATAN_IDM_MAX) return { ok: false, message: PESAN_INDEKS_DESA.catatanPanjang };
  if (/[<>]/.test(catatan)) return { ok: false, message: PESAN_INDEKS_DESA.catatanBukanTeksPolos };
  return { ok: true, catatan: catatan === "" ? null : catatan };
}

/**
 * Validasi & normalisasi body create/update: tahun bilangan bulat sah, empat skor 0-1, status salah satu dari 5 status
 * resmi, catatan opsional (teks polos ≤ 500). Keunikan tahun dicek handler API (butuh DB).
 */
export function parseIndeksDesaInput(raw: Record<string, unknown>): IndeksDesaParseResult {
  const { tahun, skorIdm, skorIks, skorIke, skorIkl, status } = raw;
  if (!isTahunValid(tahun)) return { ok: false, message: PESAN_INDEKS_DESA.tahunTidakValid };
  if (!isSkorValid(skorIdm)) return { ok: false, message: PESAN_INDEKS_DESA.skorTidakValid("Skor IDM") };
  if (!isSkorValid(skorIks)) return { ok: false, message: PESAN_INDEKS_DESA.skorTidakValid("Skor IKS") };
  if (!isSkorValid(skorIke)) return { ok: false, message: PESAN_INDEKS_DESA.skorTidakValid("Skor IKE") };
  if (!isSkorValid(skorIkl)) return { ok: false, message: PESAN_INDEKS_DESA.skorTidakValid("Skor IKL") };
  if (!isStatusIdm(status)) return { ok: false, message: PESAN_INDEKS_DESA.statusTidakValid };
  const catatan = parseCatatan(raw.catatan);
  if (!catatan.ok) return catatan;
  return {
    ok: true,
    data: { tahun, skorIdm, skorIks, skorIke, skorIkl, status, catatan: catatan.catatan },
  };
}
