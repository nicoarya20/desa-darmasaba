// Logika tampilan item Sampah per fitur (murni, tanpa I/O): badge sisa hari, info item, pratinjau, paging, teks.
// Dipakai panel Sampah tiap fitur koleksi (APBDes, galeri BUMDes, Dokumen Perencanaan).
import { formatUkuran } from "@/lib/desa-anti-korupsi-sort";
import type { SampahItem } from "@/lib/sampah/sampah-item";
import { formatTanggalId } from "../../landing-page/desa-anti-korupsi/_lib/detail-view";

/** Sisa hari yang dianggap mendesak: badge berwarna peringatan. */
export const SAMPAH_SISA_HARI_PERINGATAN = 7;

/** Teks pengantar panel Sampah (angka retensi dari respons API `retensiHari`). */
export function keteranganSampah(retensiHari: number): string {
  return `Item yang dihapus disimpan di sini selama ${retensiHari} hari sebelum terhapus permanen otomatis.`;
}

/** Warna badge sisa hari: peringatan bila ≤ batas mendesak. */
export function warnaSisaHari(sisaHari: number): "orange" | "gray" {
  return sisaHari <= SAMPAH_SISA_HARI_PERINGATAN ? "orange" : "gray";
}

/** Teks badge sisa hari sebelum terhapus permanen. */
export function labelSisaHariSampah(sisaHari: number): string {
  return sisaHari <= 0 ? "Terhapus hari ini" : `Sisa ${sisaHari} hari`;
}

/** Baris keterangan item: folder asal (bila ada), ukuran terformat, tanggal dihapus. */
export function infoItemSampah(item: Pick<SampahItem, "folderNama" | "ukuran" | "dihapusPada">): {
  folder: string | null;
  ukuran: string;
  dihapus: string;
} {
  return {
    folder: item.folderNama ? `Folder ${item.folderNama}` : null,
    ukuran: formatUkuran(item.ukuran),
    dihapus: `Dihapus ${formatTanggalId(item.dihapusPada)}`,
  };
}

/** True bila pratinjau ditampilkan sebagai gambar (selain itu dibuka sebagai dokumen di tab baru). */
export function isGambarSampah(item: Pick<SampahItem, "kategori" | "pratinjauUrl">): boolean {
  return item.kategori === "image" && item.pratinjauUrl !== null;
}

/** Jumlah halaman pagination (0 bila kosong). */
export function totalHalamanSampah(total: number, limit: number): number {
  return Math.ceil(total / limit);
}

/** Halaman setelah satu item hilang dari daftar: mundur satu bila item itu satu-satunya di halaman > 1. */
export function halamanSetelahItemHilang(page: number, jumlahDiHalaman: number): number {
  return jumlahDiHalaman <= 1 && page > 1 ? page - 1 : page;
}

/** Teks modal hapus permanen satu item. */
export function teksKonfirmasiHapus(judul: string): string {
  return `"${judul}" akan dihapus permanen beserta berkasnya. Tindakan ini tidak bisa dibatalkan.`;
}
