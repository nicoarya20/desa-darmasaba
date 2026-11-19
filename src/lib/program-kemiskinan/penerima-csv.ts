// Parser CSV impor penerima Program Kemiskinan — fungsi murni (jalan di browser untuk pratinjau).
// Hanya kolom nama & alamat yang diambil; kolom lain (NIK, tanggal lahir, nomor KK, ...) dibuang
// saat parsing sehingga tidak pernah ikut terkirim ke server.
import { barisKosong, cariKolom, normalHeader, parseCsv } from "@/lib/csv/parse-csv";
import { IMPOR_MAKS_BARIS, validasiPenerima, type PenerimaInput } from "./penerima.rules";

// Parser CSV generik ada di @/lib/csv/parse-csv; diekspor ulang agar pemakai lama tetap jalan.
export { parseCsv };

/** Satu baris valid dari CSV beserta nomor barisnya di berkas (1 = header). */
export type BarisPenerima = PenerimaInput & { baris: number };
/** Baris yang ditolak beserta alasannya (tanpa isi data warga). */
export type BarisDitolak = { baris: number; alasan: string };

/** Hasil parsing CSV penerima: baris valid, baris ditolak, dan galat berkas (header/ukuran) bila ada. */
export type HasilCsvPenerima = { rows: BarisPenerima[]; ditolak: BarisDitolak[]; galat: string | null };

const ALIAS_NAMA = ["nama", "nama penerima", "nama kepala keluarga", "nama krt", "nama kpm"];
const ALIAS_ALAMAT = ["alamat", "alamat penerima"];

/**
 * Parse CSV penerima: baris pertama header (wajib memuat kolom `nama` dan `alamat`, alias umum BNBA
 * seperti `NAMA_PENERIMA` diterima), baris kosong dilewati, baris tanpa nama/alamat ditolak.
 */
export function parseCsvPenerima(teks: string): HasilCsvPenerima {
  const [header, ...data] = parseCsv(teks);
  if (!header || barisKosong(header)) return { rows: [], ditolak: [], galat: "Berkas CSV kosong" };
  const headers = header.map(normalHeader);
  const iNama = cariKolom(headers, ALIAS_NAMA);
  const iAlamat = cariKolom(headers, ALIAS_ALAMAT);
  if (iNama < 0 || iAlamat < 0) {
    return { rows: [], ditolak: [], galat: "Header CSV wajib memuat kolom 'nama' dan 'alamat'" };
  }
  const rows: BarisPenerima[] = [];
  const ditolak: BarisDitolak[] = [];
  data.forEach((cells, idx) => {
    if (barisKosong(cells)) return;
    const baris = idx + 2;
    const v = validasiPenerima({ nama: cells[iNama], alamat: cells[iAlamat] });
    if (v.ok) rows.push({ ...v.value, baris });
    else ditolak.push({ baris, alasan: v.alasan });
  });
  if (rows.length > IMPOR_MAKS_BARIS) {
    return { rows: [], ditolak, galat: `Maksimal ${IMPOR_MAKS_BARIS} baris per impor (berkas berisi ${rows.length})` };
  }
  return { rows, ditolak, galat: null };
}
