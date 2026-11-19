// Aturan impor CSV Data UMKM — fungsi murni, satu sumber untuk browser (pratinjau) dan server (validasi ulang).
// Pesan galat hanya menyebut nama kolom (bukan isi data warga), kecuali nama kategori yang memang perlu
// diketahui admin agar bisa dibuat/diperbaiki.
import { rapikanTeks, type Validasi } from "@/lib/program-kemiskinan/penerima.rules";

/** Batas baris per sekali impor (satu permintaan). */
export const IMPOR_UMKM_MAKS_BARIS = 1000;
/** Batas ukuran berkas CSV (byte). */
export const IMPOR_UMKM_MAKS_BYTES = 2 * 1024 * 1024;
/** Batas panjang (karakter, setelah dirapikan). Form UMKM belum membatasi panjang teks; angka ini batas wajar impor. */
export const UMKM_NAMA_MAKS = 150;
export const UMKM_PEMILIK_MAKS = 150;
export const UMKM_KATEGORI_MAKS = 100;
export const UMKM_ALAMAT_MAKS = 255;
export const UMKM_DESKRIPSI_MAKS = 2000;
/** Sama dengan form UMKM (create/edit): kontak hanya angka, maksimal 13 digit. */
export const UMKM_KONTAK_MAKS_DIGIT = 13;

/** `lewati` = UMKM yang sudah ada dilewati; `perbarui` = diperbarui (sel kosong tidak menimpa). */
export type ModeImporUmkm = "lewati" | "perbarui";

/** Satu baris impor yang sudah dirapikan dan valid. `kategori` berupa NAMA; field opsional dihilangkan bila kosong. */
export type UmkmImporInput = {
  nama: string;
  pemilik: string;
  kategori: string;
  deskripsi?: string;
  alamat?: string;
  kontak?: string;
};

// Karakter kontrol (kecuali tab/baris baru yang dirapikan sebagai spasi) dan karakter lebar-nol dari Excel/web.
const KARAKTER_BUANG = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200D\u2060\uFEFF]/g;

/** Buang karakter kontrol, lalu rapikan spasi (satu baris). */
export function bersihkanTeks(raw: unknown): string {
  return typeof raw === "string" ? rapikanTeks(raw.replace(KARAKTER_BUANG, "")) : "";
}

/** Seperti `bersihkanTeks` tetapi menjaga pemisah paragraf: tiap baris dirapikan, baris kosong dibuang, digabung "\n". */
export function bersihkanParagraf(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw
    .replace(KARAKTER_BUANG, "")
    .split(/\r\n|\r|\n/)
    .map(rapikanTeks)
    .filter(Boolean)
    .join("\n");
}

/** Nama ternormalisasi untuk pencocokan: dirapikan, NFC, huruf kecil. */
export function normalNama(raw: unknown): string {
  return bersihkanTeks(raw).normalize("NFC").toLowerCase();
}

/** Kunci duplikat UMKM = nama + pemilik ternormalisasi. */
export function kunciUmkm(nama: unknown, pemilik: unknown): string {
  return `${normalNama(nama)}\u0001${normalNama(pemilik)}`;
}

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Teks biasa (paragraf dipisah "\n") → HTML `<p>` ber-escape, bentuk yang sama dengan editor deskripsi UMKM. */
export function deskripsiKeHtml(plain: string): string {
  return plain
    .split("\n")
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("");
}

/** Peringatan (bukan galat) bila kontak tampak kehilangan angka 0 di depan akibat Excel: 9–13 digit diawali "8". */
export function peringatanKontak(kontak: string | undefined): string | null {
  if (!kontak || !/^8\d{8,12}$/.test(kontak)) return null;
  return "Kolom 'kontak' diawali angka 8 tanpa 0 di depan (kemungkinan hilang karena Excel). Nomor tidak diubah, periksa kembali";
}

type BarisMentah = {
  nama?: unknown;
  pemilik?: unknown;
  kategori?: unknown;
  deskripsi?: unknown;
  alamat?: unknown;
  kontak?: unknown;
};

/** Validasi satu baris impor; semua galat baris digabung (dipisah "; "), tanpa menyebut isi data. */
export function validasiBarisUmkm(raw: BarisMentah): Validasi<UmkmImporInput> {
  const galat: string[] = [];
  const wajib = (kolom: string, nilai: string, maks: number) => {
    if (!nilai) galat.push(`Kolom '${kolom}' wajib diisi`);
    else if (nilai.length > maks) galat.push(`Kolom '${kolom}' maksimal ${maks} karakter`);
  };
  const opsional = (kolom: string, nilai: string, maks: number) => {
    if (nilai.length > maks) galat.push(`Kolom '${kolom}' maksimal ${maks} karakter`);
  };

  const nama = bersihkanTeks(raw.nama);
  const pemilik = bersihkanTeks(raw.pemilik);
  const kategori = bersihkanTeks(raw.kategori);
  const deskripsi = bersihkanParagraf(raw.deskripsi);
  const alamat = bersihkanTeks(raw.alamat);
  wajib("nama", nama, UMKM_NAMA_MAKS);
  wajib("pemilik", pemilik, UMKM_PEMILIK_MAKS);
  wajib("kategori", kategori, UMKM_KATEGORI_MAKS);
  opsional("deskripsi", deskripsi, UMKM_DESKRIPSI_MAKS);
  opsional("alamat", alamat, UMKM_ALAMAT_MAKS);

  const kontakMentah = bersihkanTeks(raw.kontak);
  let kontak = "";
  if (kontakMentah) {
    kontak = kontakMentah.replace(/\D/g, "");
    if (/[^\d\s+\-().]/.test(kontakMentah) || !kontak) galat.push("Kolom 'kontak' hanya boleh berisi angka");
    else if (kontak.length > UMKM_KONTAK_MAKS_DIGIT) galat.push(`Kolom 'kontak' maksimal ${UMKM_KONTAK_MAKS_DIGIT} digit`);
  }

  if (galat.length > 0) return { ok: false, alasan: galat.join("; ") };
  return {
    ok: true,
    value: {
      nama,
      pemilik,
      kategori,
      ...(deskripsi && { deskripsi }),
      ...(alamat && { alamat }),
      ...(kontak && { kontak }),
    },
  };
}
