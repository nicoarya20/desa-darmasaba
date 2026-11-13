import type { StrukturPegawai, StrukturPosisi } from "@/app/api/[[...slugs]]/_lib/_struktur-organisasi";
import type ApiFetch from "@/lib/api-fetch";

// Tipe diturunkan dari kontrak API bersama agar selalu sama dengan respons (type-only, tanpa kode server di bundle).
// Field tanggal bertipe Date karena Eden (ApiFetch) mem-parse string ISO menjadi Date.

/** Jabatan struktur organisasi (kontrak `Posisi`, sama untuk Perangkat Desa/PPID/BUMDes). */
export type Posisi = StrukturPosisi;

/** Pegawai struktur organisasi (kontrak `Pegawai`). */
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

/** Form admin pegawai: hanya `namaLengkap` (sudah termasuk gelar) + `posisiId` wajib; foto/email/telepon opsional. */
export type PegawaiForm = {
  namaLengkap: string;
  imageId: string;
  email: string;
  telepon: string;
  posisiId: string;
  isActive: boolean;
};

// Semua struktur dibangun dari factory API yang sama (`_lib/_struktur-organisasi`), jadi bentuk Eden-nya identik;
// rute Perangkat Desa dipakai sebagai acuan tipe.
/** Node Eden rute jabatan satu struktur, mis. `ApiFetch.api.ppid.strukturppid.posisiorganisasi`. */
export type StrukturPosisiApi = typeof ApiFetch.api.desa.strukturperangkat.posisi;
/** Node Eden rute pegawai satu struktur, mis. `ApiFetch.api.ppid.strukturppid.pegawai`. */
export type StrukturPegawaiApi = typeof ApiFetch.api.desa.strukturperangkat.pegawai;

export type StrukturStateConfig = {
  /** Penanda log galat, mis. "strukturPerangkat". */
  logTag: string;
  /** Sebutan pegawai di awal kalimat toast, mis. "Perangkat desa". */
  pegawaiLabel: string;
  /** Sebutan pegawai di tengah kalimat toast, mis. "perangkat desa". */
  pegawaiLabelLower: string;
  /** Node Eden API struktur ini; dibaca saat dipakai (lazy) agar mock ApiFetch di test ikut terpakai. */
  api: { posisi: () => StrukturPosisiApi; pegawai: () => StrukturPegawaiApi };
};
