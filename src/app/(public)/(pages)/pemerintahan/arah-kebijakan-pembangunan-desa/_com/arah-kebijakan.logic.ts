// Aturan tampilan halaman Arah Kebijakan Pembangunan Desa: kategori, urutan, penomoran. Fungsi murni tanpa I/O.
import { isJenisMusyawarah, JENIS_MUSYAWARAH_LABEL, type JenisDokumen } from "@/lib/dokumen-perencanaan";

/** Kategori yang selalu tampil, berurutan sebagai tab. */
export const KATEGORI_TETAP: readonly JenisDokumen[] = ["RPJM", "RKP", "APBDES", "PELAPORAN_APBDES"];

/** Berita acara tidak diminta juknis: tab baru tampil bila ada minimal satu dokumen aktif. */
export const KATEGORI_BERITA_ACARA: JenisDokumen = "BERITA_ACARA_MUSYAWARAH";

/** Dokumen per halaman tabel (paginasi sisi server). */
export const ARAH_PAGE_SIZE = 10;

/** Dokumen sebagaimana dikirim GET /api/desa/dokumenperencanaan/find-many (bagian yang dipakai halaman). */
export type ArahDokumen = {
  id: string;
  jenis: string;
  judul: string;
  tahun: number | null;
  tahunMulai: number | null;
  tahunSelesai: number | null;
  nomorPerdes: string | null;
  ringkasan: string | null;
  jenisMusyawarah: string | null;
  file: { link: string; realName: string } | null;
};

/** Satu halaman hasil find-many. */
export type ArahDokumenPage = { items: ArahDokumen[]; totalPages: number; total: number };

/** Daftar tab: empat kategori tetap, ditambah Berita Acara hanya bila sudah ada dokumennya. */
export function kategoriTampil(adaBeritaAcara: boolean): JenisDokumen[] {
  return adaBeritaAcara ? [...KATEGORI_TETAP, KATEGORI_BERITA_ACARA] : [...KATEGORI_TETAP];
}

/** Tahun pengurut: RPJM memakai tahun mulai, jenis lain memakai tahun dokumen; null bila belum diisi. */
function tahunUrut(item: ArahDokumen): number | null {
  return item.jenis === "RPJM" ? item.tahunMulai : item.tahun;
}

/** Urut tahun menurun (tanpa tahun di akhir); urutan API (terbaru dibuat dulu) dipertahankan untuk tahun sama. */
export function urutkanTahunMenurun(items: readonly ArahDokumen[]): ArahDokumen[] {
  return items
    .map((item, index) => ({ item, index, tahun: tahunUrut(item) }))
    .sort((a, b) => {
      if (a.tahun === b.tahun) return a.index - b.index;
      if (a.tahun === null) return 1;
      if (b.tahun === null) return -1;
      return b.tahun - a.tahun;
    })
    .map(({ item }) => item);
}

/** Nomor baris tabel yang berlanjut antarhalaman (halaman dan indeks mulai dari 1 dan 0). */
export function nomorBaris(page: number, index: number): number {
  return (page - 1) * ARAH_PAGE_SIZE + index + 1;
}

/** Jenis musyawarah berita acara sebagai teks, atau null bila bukan berita acara / tidak dikenal. */
export function musyawarahDokumen(item: ArahDokumen): string | null {
  return isJenisMusyawarah(item.jenisMusyawarah) ? JENIS_MUSYAWARAH_LABEL[item.jenisMusyawarah] : null;
}
