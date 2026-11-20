// Aturan Lembaga & Komunitas desa (PPL, STT, PKK, dll; juknis lomba butir 7.4): konstanta & fungsi murni tanpa I/O,
// dipakai bersama oleh API (Elysia), admin, dan halaman publik Pemerintahan > Lembaga & Komunitas.
// BUKAN model `Lembaga` (sekolah PAUD). `jenis` teks bebas supaya desa menambah jenis baru tanpa migrasi.

export const NAMA_LEMBAGA_MAX = 150;
export const JENIS_LEMBAGA_MAX = 50;
export const KETUA_LEMBAGA_MAX = 100;
export const KONTAK_LEMBAGA_MAX = 100;
export const DESKRIPSI_LEMBAGA_MAX = 2000;

/** Rentang `urutan` (pemutus seri dalam satu jenis; batas atas = pengaman salah ketik). */
export const URUTAN_LEMBAGA_MIN = 0;
export const URUTAN_LEMBAGA_MAX = 9999;

/** Jumlah digit sah pada nomor telepon (E.164 maksimal 15; di bawah 6 jelas bukan nomor). */
export const TELEPON_DIGIT_MIN = 6;
export const TELEPON_DIGIT_MAX = 15;

/** Daftar: ukuran halaman bawaan, batas atas `limit`, panjang maksimal kata kunci `q`, dan batas saran jenis. */
export const LEMBAGA_KOMUNITAS_DEFAULT_LIMIT = 10;
export const LEMBAGA_KOMUNITAS_MAX_LIMIT = 100;
export const LEMBAGA_KOMUNITAS_SEARCH_MAX = 100;
export const LEMBAGA_KOMUNITAS_JENIS_SUGGEST_MAX = 100;

/** Path halaman publik dan halaman admin daftarnya. */
export const LEMBAGA_KOMUNITAS_PUBLIC_PATH = "/pemerintahan/lembaga-komunitas";
export const LEMBAGA_KOMUNITAS_ADMIN_PATH = "/admin/pemerintahan/lembaga-komunitas";

/** Pesan galat validasi input Lembaga & Komunitas. */
export const PESAN_LEMBAGA_KOMUNITAS = {
  wajib: (label: string) => `${label} wajib diisi`,
  tipe: (label: string) => `${label} harus berupa teks`,
  panjang: (label: string, max: number) => `${label} maksimal ${max} karakter`,
  bukanTeksPolos: (label: string) => `${label} harus teks polos (tanpa tanda < atau >)`,
  kontakTidakValid: "Kontak harus berupa nomor telepon atau email",
  urutanTidakValid: `Urutan harus bilangan bulat ${URUTAN_LEMBAGA_MIN}-${URUTAN_LEMBAGA_MAX}`,
  fotoIdTipe: "fotoId harus berupa teks",
} as const;

/** Foto lembaga seperti dikirim API (`link` = alamat `/api/img/...`; tanpa path internal). */
export type LembagaKomunitasFotoRef = { id: string; link: string };

/** Satu lembaga seperti dikirim API daftar/detail (`foto` null = belum ada foto). */
export type LembagaKomunitasRecord = {
  id: string;
  nama: string;
  jenis: string;
  deskripsi: string | null;
  ketua: string | null;
  kontak: string | null;
  urutan: number;
  foto: LembagaKomunitasFotoRef | null;
};

/** Kolom lembaga yang siap disimpan (sudah divalidasi). Foto ditangani terpisah lewat `fotoId`. */
export type LembagaKomunitasFields = Omit<LembagaKomunitasRecord, "id" | "foto">;

/** `fotoId`: undefined = foto tidak diubah, null = lepas foto, string = foto baru (keberadaannya dicek handler API). */
export type LembagaKomunitasParsed = { fields: LembagaKomunitasFields; fotoId: string | null | undefined };

export type LembagaKomunitasParseResult = { ok: true; data: LembagaKomunitasParsed } | { ok: false; message: string };

type TeksResult = { ok: true; value: string | null } | { ok: false; message: string };

type TeksOpsi = { label: string; max: number; wajib: boolean; multiBaris?: boolean };

/** Rapikan spasi: satu baris → semua spasi jadi satu; multi baris → ujung baris dirapikan, maksimal satu baris kosong berturut. */
function rapikan(teks: string, multiBaris: boolean): string {
  if (!multiBaris) return teks.replace(/\s+/g, " ").trim();
  return teks
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((baris) => baris.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseTeks(raw: unknown, { label, max, wajib, multiBaris = false }: TeksOpsi): TeksResult {
  if (raw === undefined || raw === null || raw === "") {
    return wajib ? { ok: false, message: PESAN_LEMBAGA_KOMUNITAS.wajib(label) } : { ok: true, value: null };
  }
  if (typeof raw !== "string") return { ok: false, message: PESAN_LEMBAGA_KOMUNITAS.tipe(label) };
  const teks = rapikan(raw, multiBaris);
  if (teks === "") return wajib ? { ok: false, message: PESAN_LEMBAGA_KOMUNITAS.wajib(label) } : { ok: true, value: null };
  if (teks.length > max) return { ok: false, message: PESAN_LEMBAGA_KOMUNITAS.panjang(label, max) };
  if (/[<>]/.test(teks)) return { ok: false, message: PESAN_LEMBAGA_KOMUNITAS.bukanTeksPolos(label) };
  return { ok: true, value: teks };
}

const EMAIL_LONGGAR = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const TELEPON_LONGGAR = /^\+?[\d\s().-]+$/;

/** Bentuk kontak lembaga: email, telepon (longgar: angka, spasi, tanda hubung, tanda kurung, titik, `+` di depan), atau bukan keduanya. */
export function jenisKontak(kontak: string): "email" | "telepon" | null {
  if (EMAIL_LONGGAR.test(kontak)) return "email";
  if (!TELEPON_LONGGAR.test(kontak)) return null;
  const digit = kontak.replace(/\D/g, "").length;
  return digit >= TELEPON_DIGIT_MIN && digit <= TELEPON_DIGIT_MAX ? "telepon" : null;
}

function parseUrutan(raw: unknown): { ok: true; value: number } | { ok: false; message: string } {
  if (raw === undefined || raw === null) return { ok: true, value: URUTAN_LEMBAGA_MIN };
  const valid = typeof raw === "number" && Number.isInteger(raw) && raw >= URUTAN_LEMBAGA_MIN && raw <= URUTAN_LEMBAGA_MAX;
  return valid ? { ok: true, value: raw } : { ok: false, message: PESAN_LEMBAGA_KOMUNITAS.urutanTidakValid };
}

function parseFotoId(raw: unknown): { ok: true; value: string | null | undefined } | { ok: false; message: string } {
  if (raw === undefined) return { ok: true, value: undefined };
  if (raw === null || raw === "") return { ok: true, value: null };
  if (typeof raw !== "string") return { ok: false, message: PESAN_LEMBAGA_KOMUNITAS.fotoIdTipe };
  return { ok: true, value: raw };
}

/**
 * Validasi & normalisasi body create/update: `nama` dan `jenis` wajib; `ketua`, `deskripsi`, `kontak` opsional (semua
 * teks polos; kontak berbentuk telepon/email); `urutan` bilangan bulat (bawaan 0); `fotoId` opsional (lihat tipe).
 */
export function parseLembagaKomunitasInput(raw: Record<string, unknown>): LembagaKomunitasParseResult {
  const nama = parseTeks(raw.nama, { label: "Nama", max: NAMA_LEMBAGA_MAX, wajib: true });
  if (!nama.ok) return nama;
  const jenis = parseTeks(raw.jenis, { label: "Jenis", max: JENIS_LEMBAGA_MAX, wajib: true });
  if (!jenis.ok) return jenis;
  const ketua = parseTeks(raw.ketua, { label: "Ketua", max: KETUA_LEMBAGA_MAX, wajib: false });
  if (!ketua.ok) return ketua;
  const deskripsi = parseTeks(raw.deskripsi, { label: "Deskripsi", max: DESKRIPSI_LEMBAGA_MAX, wajib: false, multiBaris: true });
  if (!deskripsi.ok) return deskripsi;
  const kontak = parseTeks(raw.kontak, { label: "Kontak", max: KONTAK_LEMBAGA_MAX, wajib: false });
  if (!kontak.ok) return kontak;
  if (kontak.value !== null && jenisKontak(kontak.value) === null) {
    return { ok: false, message: PESAN_LEMBAGA_KOMUNITAS.kontakTidakValid };
  }
  const urutan = parseUrutan(raw.urutan);
  if (!urutan.ok) return urutan;
  const fotoId = parseFotoId(raw.fotoId);
  if (!fotoId.ok) return fotoId;

  // `nama`/`jenis` wajib: parseTeks tidak pernah mengembalikan null untuknya (cast hanya menyempitkan tipe).
  return {
    ok: true,
    data: {
      fields: {
        nama: nama.value as string,
        jenis: jenis.value as string,
        deskripsi: deskripsi.value,
        ketua: ketua.value,
        kontak: kontak.value,
        urutan: urutan.value,
      },
      fotoId: fotoId.value,
    },
  };
}
