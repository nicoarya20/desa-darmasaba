import type { StrukturPegawai, StrukturPosisi } from "@/app/api/[[...slugs]]/_lib/_struktur-organisasi";

// Tipe diturunkan dari select API agar selalu sama dengan kontrak respons (type-only, tanpa kode server di bundle).
// Field tanggal bertipe Date karena Eden (ApiFetch) mem-parse string ISO menjadi Date.

/** Jabatan Struktur Perangkat Desa (kontrak `Posisi`). */
export type Posisi = StrukturPosisi;

/** Pegawai Struktur Perangkat Desa (kontrak `Pegawai`). */
export type Pegawai = StrukturPegawai;

/** Form admin jabatan; string kosong dikirim apa adanya dan disimpan server sebagai null. */
export type PosisiForm = {
  nama: string;
  deskripsi: string;
  hierarki: number | null;
  urutan: number | null;
  parentId: string;
  isActive: boolean;
};

/** Form admin pegawai; hanya `namaLengkap` + `posisiId` wajib, `tanggalMasuk` berformat YYYY-MM-DD. */
export type PegawaiForm = {
  namaLengkap: string;
  gelarAkademik: string;
  imageId: string;
  tanggalMasuk: string;
  email: string;
  telepon: string;
  alamat: string;
  posisiId: string;
  isActive: boolean;
};
