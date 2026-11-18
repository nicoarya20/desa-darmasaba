// Aturan Produk Hukum desa (Perdes, Peraturan Perbekel, SK Perbekel, dll): konstanta & fungsi murni tanpa I/O,
// dipakai bersama oleh API (Elysia), admin, dan halaman publik Pemerintahan > Produk Hukum.

/** Kategori produk hukum. Disimpan sebagai teks (bukan enum Prisma) agar kategori baru tidak butuh migrasi. */
export const KATEGORI_PRODUK_HUKUM = ["PERDES", "PERATURAN_PERBEKEL", "SK_PERBEKEL", "LAINNYA"] as const;
export type KategoriProdukHukum = (typeof KATEGORI_PRODUK_HUKUM)[number];

/** Label tampil tiap kategori (admin dan publik). */
export const KATEGORI_PRODUK_HUKUM_LABEL: Record<KategoriProdukHukum, string> = {
  PERDES: "Peraturan Desa (Perdes)",
  PERATURAN_PERBEKEL: "Peraturan Perbekel",
  SK_PERBEKEL: "SK Perbekel",
  LAINNYA: "Lainnya",
};

export const JUDUL_PRODUK_HUKUM_MAX = 255;
export const NOMOR_PRODUK_HUKUM_MAX = 100;
export const TAHUN_PRODUK_HUKUM_MIN = 1900;
export const TAHUN_PRODUK_HUKUM_MAX = 2100;

/** Daftar publik: ukuran halaman bawaan, batas atas `limit`, dan panjang maksimal kata kunci `q`. */
export const PRODUK_HUKUM_DEFAULT_LIMIT = 10;
export const PRODUK_HUKUM_MAX_LIMIT = 50;
export const PRODUK_HUKUM_SEARCH_MAX = 100;

/** Batas jumlah id yang diterima satu permintaan atur urutan (pengaman; admin mengurutkan per halaman daftar). */
export const PRODUK_HUKUM_REORDER_MAX = 200;

/** Path halaman publik daftar Produk Hukum (tautan filter kategori dan paginasi). */
export const PRODUK_HUKUM_PUBLIC_PATH = "/pemerintahan/produk-hukum";

/** Pesan galat validasi input produk hukum. */
export const PESAN_PRODUK_HUKUM = {
  judulKosong: "Judul wajib diisi",
  judulPanjang: `Judul maksimal ${JUDUL_PRODUK_HUKUM_MAX} karakter`,
  judulBukanTeksPolos: "Judul harus teks polos (tanpa tanda < atau >)",
  nomorTipe: "Nomor harus berupa teks",
  nomorPanjang: `Nomor maksimal ${NOMOR_PRODUK_HUKUM_MAX} karakter`,
  nomorBukanTeksPolos: "Nomor harus teks polos (tanpa tanda < atau >)",
  tahunTidakValid: `Tahun harus bilangan bulat ${TAHUN_PRODUK_HUKUM_MIN}-${TAHUN_PRODUK_HUKUM_MAX}`,
  kategoriTidakValid: `Kategori harus salah satu dari: ${KATEGORI_PRODUK_HUKUM.join(", ")}`,
  fileIdTipe: "fileId harus berupa teks",
} as const;

/** Berkas PDF produk hukum seperti dikirim API (tanpa path internal). */
export type ProdukHukumFileRef = { id: string; link: string; realName: string };

/** Satu produk hukum seperti dikirim API daftar/detail (`file` null = belum ada PDF). */
export type ProdukHukumRecord = {
  id: string;
  judul: string;
  nomor: string | null;
  tahun: number | null;
  kategori: string;
  file: ProdukHukumFileRef | null;
};

/** Kolom produk hukum yang siap disimpan (tanpa berkas; berkas ditangani terpisah lewat `fileId`). */
export type ProdukHukumFields = {
  judul: string;
  nomor: string | null;
  tahun: number | null;
  kategori: KategoriProdukHukum;
};

/** `fileId`: undefined = jangan ubah berkas, null = lepas berkas, string = pakai berkas ini. */
export type ProdukHukumData = ProdukHukumFields & { fileId?: string | null };

export type ProdukHukumParseResult = { ok: true; data: ProdukHukumData } | { ok: false; message: string };

/** Apakah nilai adalah kategori produk hukum yang valid. */
export function isKategoriProdukHukum(value: unknown): value is KategoriProdukHukum {
  return (KATEGORI_PRODUK_HUKUM as readonly unknown[]).includes(value);
}

/** Label kategori untuk ditampilkan; nilai tak dikenal (data lama/rusak) ditampilkan apa adanya. */
export function labelKategoriProdukHukum(kategori: string): string {
  return isKategoriProdukHukum(kategori) ? KATEGORI_PRODUK_HUKUM_LABEL[kategori] : kategori;
}

const isBlank = (value: unknown) => value === undefined || value === null || value === "";
const PLAIN_TEXT_FORBIDDEN = /[<>]/;

/** Rapikan (trim + satukan spasi berulang) lalu validasi judul: wajib ada, ≤ 255, teks polos. */
export function parseJudulProdukHukum(raw: unknown): { ok: true; judul: string } | { ok: false; message: string } {
  const judul = typeof raw === "string" ? raw.replace(/\s+/g, " ").trim() : "";
  if (!judul) return { ok: false, message: PESAN_PRODUK_HUKUM.judulKosong };
  if (judul.length > JUDUL_PRODUK_HUKUM_MAX) return { ok: false, message: PESAN_PRODUK_HUKUM.judulPanjang };
  if (PLAIN_TEXT_FORBIDDEN.test(judul)) return { ok: false, message: PESAN_PRODUK_HUKUM.judulBukanTeksPolos };
  return { ok: true, judul };
}

function parseNomor(raw: unknown): { ok: true; nomor: string | null } | { ok: false; message: string } {
  if (isBlank(raw)) return { ok: true, nomor: null };
  if (typeof raw !== "string") return { ok: false, message: PESAN_PRODUK_HUKUM.nomorTipe };
  const nomor = raw.replace(/\s+/g, " ").trim();
  if (nomor.length > NOMOR_PRODUK_HUKUM_MAX) return { ok: false, message: PESAN_PRODUK_HUKUM.nomorPanjang };
  if (PLAIN_TEXT_FORBIDDEN.test(nomor)) return { ok: false, message: PESAN_PRODUK_HUKUM.nomorBukanTeksPolos };
  return { ok: true, nomor: nomor === "" ? null : nomor };
}

function parseTahun(raw: unknown): { ok: true; tahun: number | null } | { ok: false; message: string } {
  if (isBlank(raw)) return { ok: true, tahun: null };
  const valid =
    typeof raw === "number" && Number.isInteger(raw) && raw >= TAHUN_PRODUK_HUKUM_MIN && raw <= TAHUN_PRODUK_HUKUM_MAX;
  return valid ? { ok: true, tahun: raw } : { ok: false, message: PESAN_PRODUK_HUKUM.tahunTidakValid };
}

function parseFileId(raw: unknown): { ok: true; fileId: string | null | undefined } | { ok: false; message: string } {
  if (raw === undefined) return { ok: true, fileId: undefined };
  if (raw === null || raw === "") return { ok: true, fileId: null };
  if (typeof raw !== "string") return { ok: false, message: PESAN_PRODUK_HUKUM.fileIdTipe };
  return { ok: true, fileId: raw };
}

/**
 * Validasi & normalisasi body create/update produk hukum: judul wajib (teks polos ≤ 255), nomor opsional (≤ 100),
 * tahun opsional (1900-2100), kategori harus salah satu nilai sah. Keberadaan `fileId` di FileStorage dicek handler.
 */
export function parseProdukHukumInput(raw: Record<string, unknown>): ProdukHukumParseResult {
  const judul = parseJudulProdukHukum(raw.judul);
  if (!judul.ok) return judul;
  const nomor = parseNomor(raw.nomor);
  if (!nomor.ok) return nomor;
  const tahun = parseTahun(raw.tahun);
  if (!tahun.ok) return tahun;
  const kategori = raw.kategori;
  if (!isKategoriProdukHukum(kategori)) return { ok: false, message: PESAN_PRODUK_HUKUM.kategoriTidakValid };
  const fileId = parseFileId(raw.fileId);
  if (!fileId.ok) return fileId;
  return {
    ok: true,
    data: { judul: judul.judul, nomor: nomor.nomor, tahun: tahun.tahun, kategori, fileId: fileId.fileId },
  };
}
