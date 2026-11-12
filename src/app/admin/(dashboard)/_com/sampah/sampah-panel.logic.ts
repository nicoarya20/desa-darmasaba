// Panel Sampah per fitur (APBDes, Galeri BUMDes, Dokumen Perencanaan) — tipe kontrak `/api/sampah/:sumber`
// dan fungsi tampilan murni (tanpa I/O): label sisa hari, info item, teks konfirmasi, pagination.
import { formatUkuran } from '@/lib/desa-anti-korupsi-sort';
import type { SampahItem, SampahListData } from '@/lib/sampah/sampah-item';
import { SAMPAH_RETENSI_HARI } from '@/lib/sampah/sampah-retensi';
import { formatTanggalId } from '../../landing-page/desa-anti-korupsi/_lib/detail-view';

// Tipe kontrak API satu sumber dengan backend (`src/lib/sampah/sampah-item.ts`) — jangan didefinisikan ulang di sini.
export type { SampahSumber } from '@/lib/sampah/sampah-item';

/** Cakupan panel: `scopeId` wajib untuk dokumen APBDes (= apbdesId), diabaikan sumber lain. */
export type SampahPanelTarget =
  | { sumber: 'dokumen-apbdes'; scopeId: string }
  | { sumber: 'foto-bumdes' | 'dokumen-perencanaan'; scopeId?: undefined };

/** Satu item di Sampah fitur (= `SampahItem` kontrak API). */
export type SampahPanelItem = SampahItem;

/** Isi `data` respons GET `/api/sampah/:sumber` (= `SampahListData`). */
export type SampahPanelHalaman = SampahListData;

/** Jumlah item per halaman panel. */
export const SAMPAH_PANEL_LIMIT = 20;

/** Sisa hari yang dianggap mendesak: badge berwarna peringatan. */
export const SAMPAH_PANEL_SISA_PERINGATAN = 7;

/** Warna badge sisa hari: oranye bila ≤ batas mendesak. */
export function warnaSisaHariPanel(sisaHari: number): 'orange' | 'gray' {
  return sisaHari <= SAMPAH_PANEL_SISA_PERINGATAN ? 'orange' : 'gray';
}

/** Teks badge sisa hari sebelum terhapus permanen otomatis. */
export function labelSisaHariPanel(sisaHari: number): string {
  return sisaHari <= 0 ? 'Terhapus hari ini' : `Sisa ${sisaHari} hari`;
}

/** Baris keterangan item: folder asal (bila ada), ukuran (bila diketahui), tanggal dihapus. */
export function infoItemSampahPanel(item: Pick<SampahPanelItem, 'folderNama' | 'ukuran' | 'dihapusPada'>): string {
  const bagian = [
    item.folderNama ? `Folder ${item.folderNama}` : null,
    item.ukuran === null ? null : formatUkuran(item.ukuran),
    `Dihapus ${formatTanggalId(item.dihapusPada)}`,
  ];
  return bagian.filter((b): b is string => b !== null).join(' · ');
}

/** True bila thumbnail item ditampilkan sebagai gambar. */
export function isGambarSampahPanel(item: Pick<SampahPanelItem, 'kategori' | 'pratinjauUrl'>): boolean {
  return item.kategori === 'image' && item.pratinjauUrl !== null;
}

/** Judul bagian lipat: "Sampah", atau "Sampah (n)" setelah jumlahnya diketahui. */
export function judulSampahPanel(total: number | null): string {
  return total === null ? 'Sampah' : `Sampah (${total})`;
}

/** Teks empty state, menyebut lama retensi dari API. */
export function teksSampahPanelKosong(retensiHari: number): string {
  return `Sampah kosong. Item yang dihapus disimpan di sini selama ${retensiHari} hari.`;
}

/** Teks modal hapus permanen satu item. */
export function teksKonfirmasiHapusPermanenPanel(judul: string): string {
  return `"${judul}" akan dihapus permanen beserta berkasnya. Tindakan ini tidak bisa dibatalkan.`;
}

/** Teks konfirmasi tombol hapus di fitur: item dipindah ke Sampah, bukan dihapus permanen. */
export function teksKonfirmasiPindahKeSampah(jenis: 'Dokumen' | 'Foto'): string {
  return `${jenis} dipindah ke Sampah dan bisa dipulihkan dalam ${SAMPAH_RETENSI_HARI} hari.`;
}

/** Jumlah halaman pagination (minimal 1). */
export function totalHalamanSampahPanel(total: number, limit: number): number {
  return Math.max(1, Math.ceil(total / limit));
}

/** Halaman setelah satu item hilang dari daftar: mundur satu bila item itu satu-satunya di halaman > 1. */
export function halamanSetelahItemHilangPanel(page: number, jumlahDiHalaman: number): number {
  return jumlahDiHalaman <= 1 && page > 1 ? page - 1 : page;
}
