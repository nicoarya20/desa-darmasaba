// Jembatan browser ↔ API impor UMKM: bentuk body (tanpa nomor baris berkas) dan pemetaan hasil dry-run server
// (nomor = urutan baris yang dikirim + 1) kembali ke nomor baris berkas CSV. Fungsi murni.
import type { BarisUmkm, BarisUmkmDitolak, HasilCsvUmkm } from "./umkm-impor-csv";
import type { ModeImporUmkm } from "./umkm-impor.rules";

/** Data `data` dari respons dry-run `POST /api/ekonomi/umkm/import`. */
export type RespDryRun = {
  ditambah: number;
  diperbarui: number;
  dilewati: number;
  galat: { baris: number; alasan: string }[];
  totalGalat: number;
  peringatan: { baris: number; alasan: string }[];
  totalPeringatan: number;
};

/** Pratinjau gabungan: galat/peringatan memakai nomor baris berkas; galat berkas (ditolak di browser) ikut dihitung. */
export type Pratinjau = {
  ditambah: number;
  diperbarui: number;
  dilewati: number;
  galat: BarisUmkmDitolak[];
  totalGalat: number;
  peringatan: BarisUmkmDitolak[];
  totalPeringatan: number;
};

/** Body request: hanya enam kolom UMKM; `baris` (nomor berkas) tidak ikut terkirim. */
export function bodyImporUmkm(rows: readonly BarisUmkm[], mode: ModeImporUmkm, dryRun: boolean) {
  return {
    mode,
    dryRun,
    rows: rows.map(({ nama, pemilik, kategori, deskripsi, alamat, kontak }) => ({ nama, pemilik, kategori, deskripsi, alamat, kontak })),
  };
}

/** Petakan nomor baris server (indeks + 1) ke nomor baris berkas, lalu gabungkan dengan baris yang sudah ditolak di browser. */
export function gabungPratinjau(hasil: HasilCsvUmkm, resp: RespDryRun): Pratinjau {
  const keBerkas = (p: { baris: number; alasan: string }): BarisUmkmDitolak => ({
    baris: hasil.rows[p.baris - 1]?.baris ?? p.baris,
    alasan: p.alasan,
  });
  const galat = [...hasil.ditolak, ...resp.galat.map(keBerkas)].sort((a, b) => a.baris - b.baris);
  return {
    ditambah: resp.ditambah,
    diperbarui: resp.diperbarui,
    dilewati: resp.dilewati,
    galat,
    totalGalat: hasil.ditolak.length + resp.totalGalat,
    peringatan: resp.peringatan.map(keBerkas),
    totalPeringatan: resp.totalPeringatan,
  };
}

/** Pratinjau bila semua baris ditolak di browser (tidak ada yang dikirim ke server). */
export function pratinjauTanpaServer(hasil: HasilCsvUmkm): Pratinjau {
  return {
    ditambah: 0,
    diperbarui: 0,
    dilewati: 0,
    galat: hasil.ditolak,
    totalGalat: hasil.ditolak.length,
    peringatan: [],
    totalPeringatan: 0,
  };
}

/** Tombol Impor aktif hanya bila tidak ada galat dan ada minimal satu baris yang ditambah/diperbarui. */
export function bolehImpor(p: Pratinjau | null): boolean {
  return !!p && p.totalGalat === 0 && p.ditambah + p.diperbarui > 0;
}
