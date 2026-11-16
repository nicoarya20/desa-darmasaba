// Jumlah partisipan Kegiatan Desa bersifat opsional. Kolom `KegiatanDesa.partisipan` tetap
// Int NOT NULL, jadi "tidak diisi" disimpan 0 dan 0 diperlakukan sebagai "tidak ada data"
// (disembunyikan di publik, "-" di admin). Fungsi murni, dipakai admin & halaman publik.
import { z } from "zod";

/** Nilai partisipan dari input form; kosong (`''`/null/undefined) atau bukan angka → 0. */
export function toPartisipan(value: unknown): number {
  if (value === "" || value === null || value === undefined) return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Skema zod partisipan form admin: opsional (kosong → 0), selain itu bilangan bulat ≥ 0. */
export const partisipanSchema = z.preprocess(
  toPartisipan,
  z.number().int("Partisipan harus bilangan bulat").min(0, "Partisipan tidak boleh negatif"),
);

/** Benar bila partisipan layak ditampilkan (> 0); 0/null = tidak dicatat. */
export function hasPartisipan(value: number | null | undefined): value is number {
  return typeof value === "number" && value > 0;
}

/** Nilai NumberInput admin: 0/kosong ditampilkan sebagai kolom kosong. */
export function partisipanInputValue(value: number | null | undefined): number | "" {
  return hasPartisipan(value) ? value : "";
}

/** Teks partisipan di detail admin: "-" bila tidak dicatat. */
export function formatPartisipanAdmin(value: number | null | undefined): string {
  return hasPartisipan(value) ? `${value} orang` : "-";
}
