// Jembatan browser ↔ API impor (UMKM dan Produk): bentuk body (tanpa nomor baris berkas) dan pemetaan hasil dry-run
// server (nomor = urutan baris yang dikirim + 1) kembali ke nomor baris berkas CSV. Fungsi murni.
import type { BarisDitolak } from "@/lib/csv/parse-impor";
import type { BarisUmkm } from "./umkm-impor-csv";
import type { BarisProduk } from "./produk-impor-csv";
import type { ModeImporUmkm } from "./umkm-impor.rules";

/** Hasil parsing berkas yang dibutuhkan pratinjau (sama untuk UMKM dan Produk). */
export type HasilBerkas = { rows: readonly { baris: number }[]; ditolak: readonly BarisDitolak[]; galat?: string | null };

/** Data `data` dari respons dry-run `POST /api/ekonomi/umkm/import` dan `/umkm/produk/import`. */
export type RespDryRun = {
  ditambah: number;
  diperbarui: number;
  dilewati: number;
  galat: { baris: number; alasan: string }[];
  totalGalat: number;
  peringatan: { baris: number; alasan: string }[];
  totalPeringatan: number;
  /** Hanya impor Produk (mode perbarui): jumlah produk yang daftar link tokonya diganti seluruhnya. */
  linkDiganti?: number;
};

/** Pratinjau gabungan: galat/peringatan memakai nomor baris berkas; galat berkas (ditolak di browser) ikut dihitung. */
export type Pratinjau = {
  ditambah: number;
  diperbarui: number;
  dilewati: number;
  galat: BarisDitolak[];
  totalGalat: number;
  peringatan: BarisDitolak[];
  totalPeringatan: number;
  linkDiganti?: number;
};

/** Body request: hanya enam kolom UMKM; `baris` (nomor berkas) tidak ikut terkirim. */
export function bodyImporUmkm(rows: readonly BarisUmkm[], mode: ModeImporUmkm, dryRun: boolean) {
  return {
    mode,
    dryRun,
    rows: rows.map(({ nama, pemilik, kategori, deskripsi, alamat, kontak }) => ({ nama, pemilik, kategori, deskripsi, alamat, kontak })),
  };
}

/** Body request impor Produk: hanya kolom yang dikenal; `baris` (nomor berkas) tidak ikut terkirim. */
export function bodyImporProduk(rows: readonly BarisProduk[], mode: ModeImporUmkm, dryRun: boolean) {
  return {
    mode,
    dryRun,
    rows: rows.map(({ nama, umkm, kategori, harga, pemilik, stok, satuan, deskripsi, unggulan, link }) => ({
      nama,
      umkm,
      kategori,
      harga,
      pemilik,
      stok,
      satuan,
      deskripsi,
      unggulan,
      link,
    })),
  };
}

/** Petakan nomor baris server (indeks + 1) ke nomor baris berkas, lalu gabungkan dengan baris yang sudah ditolak di browser. */
export function gabungPratinjau(hasil: HasilBerkas, resp: RespDryRun): Pratinjau {
  const keBerkas = (p: { baris: number; alasan: string }): BarisDitolak => ({
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
    ...(resp.linkDiganti !== undefined && { linkDiganti: resp.linkDiganti }),
  };
}

/** Pratinjau bila semua baris ditolak di browser (tidak ada yang dikirim ke server). */
export function pratinjauTanpaServer(hasil: HasilBerkas): Pratinjau {
  return {
    ditambah: 0,
    diperbarui: 0,
    dilewati: 0,
    galat: [...hasil.ditolak],
    totalGalat: hasil.ditolak.length,
    peringatan: [],
    totalPeringatan: 0,
  };
}

/** Tombol Impor aktif hanya bila tidak ada galat dan ada minimal satu baris yang ditambah/diperbarui. */
export function bolehImpor(p: Pratinjau | null): boolean {
  return !!p && p.totalGalat === 0 && p.ditambah + p.diperbarui > 0;
}
