// Pencocokan kategori produk UMKM by-nama untuk impor CSV (UMKM dan Produk) — fungsi murni.
import type { Validasi } from "@/lib/program-kemiskinan/penerima.rules";
import { normalNama } from "./umkm-impor.rules";

export type KategoriAktif = { id: string; nama: string };
export type PetaKategori = Map<string, string[]>;

/** Peta nama ternormalisasi → id kategori aktif (lebih dari satu id = nama kembar di DB). */
export function petaKategori(kategori: readonly KategoriAktif[]): PetaKategori {
  const peta: PetaKategori = new Map();
  for (const k of kategori) {
    const kunci = normalNama(k.nama);
    peta.set(kunci, [...(peta.get(kunci) ?? []), k.id]);
  }
  return peta;
}

/** Id kategori untuk `nama`; galat bila tak dikenal atau ambigu (pesan hanya menyebut nama kategori). */
export function cariKategori(peta: PetaKategori, nama: string): Validasi<string> {
  const kandidat = peta.get(normalNama(nama)) ?? [];
  if (kandidat.length === 0) {
    return { ok: false, alasan: `Kategori "${nama}" tidak dikenal. Buat dulu di tab Kategori Produk atau perbaiki penulisannya` };
  }
  if (kandidat.length > 1) {
    return { ok: false, alasan: `Kategori "${nama}" ambigu: ada ${kandidat.length} kategori aktif dengan nama yang sama` };
  }
  return { ok: true, value: kandidat[0] };
}
