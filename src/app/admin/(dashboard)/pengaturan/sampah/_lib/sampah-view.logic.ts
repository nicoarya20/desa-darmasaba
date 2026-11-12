// Logika tampilan halaman Pengaturan → Sampah (murni, tanpa I/O): label tab, badge sisa hari, teks konfirmasi.
import { formatUkuran } from "@/lib/desa-anti-korupsi-sort";
import type { SampahItem } from "@/lib/sampah/sampah-item";
import { SAMPAH_KELOMPOK_SEMUA, type SampahKelompok } from "@/lib/sampah/sampah-kelompok";
import { SAMPAH_JENDELA_MAX } from "@/lib/sampah/sampah-query";
import { SAMPAH_RETENSI_HARI } from "@/lib/sampah/sampah-retensi";
import { formatTanggalId } from "../../../landing-page/desa-anti-korupsi/_lib/detail-view";

/** Sisa hari yang dianggap mendesak: badge berwarna peringatan. */
export const SAMPAH_SISA_HARI_PERINGATAN = 7;

/** Teks pengantar halaman (angka retensi dari konstanta backend). */
export const SAMPAH_KETERANGAN = `Foto & dokumen yang dihapus disimpan di sini selama ${SAMPAH_RETENSI_HARI} hari sebelum terhapus permanen otomatis.`;

/** Tab "Semua" di depan daftar kelompok dari API. */
export const SAMPAH_TAB_SEMUA: SampahKelompok = { id: SAMPAH_KELOMPOK_SEMUA, nama: "Semua" };

export type SampahTab = SampahKelompok & { jumlah: number; label: string };

/** Label tab ber-jumlah, mis. "Landing Page (3)". */
export function labelTabSampah(nama: string, jumlah: number): string {
  return `${nama} (${jumlah})`;
}

/** Tab "Semua" + semua kelompok (urutan API), jumlah dari `counts`; kelompok tanpa hitungan = 0. */
export function sampahTabs(kelompok: readonly SampahKelompok[], counts: Readonly<Record<string, number>>): SampahTab[] {
  return [SAMPAH_TAB_SEMUA, ...kelompok].map((k) => {
    const jumlah = counts[k.id] ?? 0;
    return { ...k, jumlah, label: labelTabSampah(k.nama, jumlah) };
  });
}

/** Warna badge sisa hari: peringatan bila ≤ batas mendesak. */
export function warnaSisaHari(sisaHari: number): "orange" | "gray" {
  return sisaHari <= SAMPAH_SISA_HARI_PERINGATAN ? "orange" : "gray";
}

/** Teks badge sisa hari sebelum terhapus permanen. */
export function labelSisaHariSampah(sisaHari: number): string {
  return sisaHari <= 0 ? "Terhapus hari ini" : `Sisa ${sisaHari} hari`;
}

/** Asal item: "Kelompok › Menu", atau kelompok saja bila menu tidak dikenal. */
export function labelAsalSampah(asal: SampahItem["asal"]): string {
  return asal.menuNama ? `${asal.kelompokNama} › ${asal.menuNama}` : asal.kelompokNama;
}

/** Baris keterangan item: asal, ukuran terformat, tanggal dihapus. */
export function infoItemSampah(item: SampahItem): { asal: string; ukuran: string; dihapus: string } {
  return {
    asal: labelAsalSampah(item.asal),
    ukuran: formatUkuran(item.ukuran),
    dihapus: `Dihapus ${formatTanggalId(item.dihapusPada)}`,
  };
}

/** True bila pratinjau ditampilkan sebagai gambar (selain itu dibuka sebagai dokumen di tab baru). */
export function isGambarSampah(item: Pick<SampahItem, "kategori" | "pratinjauUrl">): boolean {
  return item.kategori === "image" && item.pratinjauUrl !== null;
}

/** Jumlah halaman pagination; dibatasi jendela paging API (`page × limit` ≤ 5000). */
export function totalHalamanSampah(total: number, limit: number): number {
  return Math.min(Math.ceil(total / limit), Math.floor(SAMPAH_JENDELA_MAX / limit));
}

/** Halaman setelah satu item hilang dari daftar: mundur satu bila item itu satu-satunya di halaman > 1. */
export function halamanSetelahItemHilang(page: number, jumlahDiHalaman: number): number {
  return jumlahDiHalaman <= 1 && page > 1 ? page - 1 : page;
}

/** Teks modal hapus permanen satu item. */
export function teksKonfirmasiHapus(judul: string): string {
  return `"${judul}" akan dihapus permanen beserta berkasnya. Tindakan ini tidak bisa dibatalkan.`;
}

/** Teks modal kosongkan kelompok (menyebut jumlah item + nama kelompok). */
export function teksKonfirmasiKosongkan(jumlah: number, kelompok: SampahKelompok): string {
  const cakupan = kelompok.id === SAMPAH_KELOMPOK_SEMUA ? "seluruh Sampah" : `kelompok ${kelompok.nama}`;
  return `${jumlah} item di ${cakupan} akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.`;
}

/** Teks empty state per tab (beda bila sedang mencari). */
export function teksSampahKosong(namaKelompok: string, cari: string): string {
  if (cari) return `Tidak ada item yang cocok dengan "${cari}" di ${namaKelompok}`;
  return `Sampah ${namaKelompok} kosong`;
}
