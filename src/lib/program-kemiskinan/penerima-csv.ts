// Parser CSV impor penerima Program Kemiskinan — fungsi murni (jalan di browser untuk pratinjau).
// Hanya kolom nama & alamat yang diambil; kolom lain (NIK, tanggal lahir, nomor KK, ...) dibuang
// saat parsing sehingga tidak pernah ikut terkirim ke server.
import { IMPOR_MAKS_BARIS, validasiPenerima, type PenerimaInput } from "./penerima.rules";

/** Satu baris valid dari CSV beserta nomor barisnya di berkas (1 = header). */
export type BarisPenerima = PenerimaInput & { baris: number };
/** Baris yang ditolak beserta alasannya (tanpa isi data warga). */
export type BarisDitolak = { baris: number; alasan: string };

/** Hasil parsing CSV penerima: baris valid, baris ditolak, dan galat berkas (header/ukuran) bila ada. */
export type HasilCsvPenerima = { rows: BarisPenerima[]; ditolak: BarisDitolak[]; galat: string | null };

// Header dinormalkan: huruf kecil, selain huruf/angka → spasi. "NAMA_PENERIMA" → "nama penerima".
const ALIAS_NAMA = ["nama", "nama penerima", "nama kepala keluarga", "nama krt", "nama kpm"];
const ALIAS_ALAMAT = ["alamat", "alamat penerima"];

const normalHeader = (h: string) => h.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** Pemisah kolom baris pertama: ";" (ekspor Excel lokal Indonesia) bila lebih banyak dari ",". */
function deteksiPemisah(teks: string): "," | ";" {
  const barisPertama = teks.split(/\r?\n/, 1)[0] ?? "";
  const hitung = (c: string) => barisPertama.split(c).length - 1;
  return hitung(";") > hitung(",") ? ";" : ",";
}

/** Pecah teks CSV (RFC 4180: kutip ganda, "" di dalam kutip, CRLF) menjadi baris sel. */
export function parseCsv(teks: string, pemisah: "," | ";" = deteksiPemisah(teks)): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let dalamKutip = false;
  const src = teks.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (dalamKutip) {
      if (c === '"' && src[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') dalamKutip = false;
      else cell += c;
    } else if (c === '"') dalamKutip = true;
    else if (c === pemisah) {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

/** Indeks kolom pertama yang header-nya cocok dengan alias (urutan alias = prioritas). */
function cariKolom(headers: string[], alias: string[]): number {
  for (const a of alias) {
    const i = headers.indexOf(a);
    if (i >= 0) return i;
  }
  return -1;
}

const barisKosong = (cells: string[]) => cells.every((c) => c.trim() === "");

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
