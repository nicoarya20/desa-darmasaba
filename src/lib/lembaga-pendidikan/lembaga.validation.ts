import { z } from "zod";
import { imageIdOpsional } from "@/lib/konten-bersama/daftar-anak.validation";
import {
  bujurSchema,
  koordinatBerpasangan,
  lintangSchema,
  linkGoogleMapsSchema,
  PESAN_KOORDINAT_TIDAK_LENGKAP,
} from "@/lib/konten-bersama/lokasi.logic";
import { mediaSosialListSchema } from "@/lib/konten-bersama/media-sosial.validation";
import { teksOpsionalParsial } from "@/lib/konten-bersama/teks.validation";

/** Batas jumlah pengurus per lembaga (struktur sekolah sederhana). */
export const MAX_PENGURUS_LEMBAGA = 50;
/** Batas jumlah foto kegiatan per lembaga (galeri tampil utuh di halaman detail publik). */
export const MAX_FOTO_KEGIATAN_LEMBAGA = 50;
/** Deskripsi sekolah dari desa bisa beberapa paragraf panjang. */
export const MAX_DESKRIPSI_LEMBAGA = 10000;
export const MAX_ALAMAT_LEMBAGA = 255;
export const MAX_KONTAK_LEMBAGA = 255;

const teksWajib = (pesan: string) => z.string({ required_error: pesan, invalid_type_error: pesan }).trim().min(1, pesan);

// Field detail (semua opsional): `undefined` = tidak diubah (PUT), null/"" = dikosongkan.
const detail = {
  deskripsi: teksOpsionalParsial({ label: "Deskripsi", max: MAX_DESKRIPSI_LEMBAGA }),
  alamat: teksOpsionalParsial({ label: "Alamat", max: MAX_ALAMAT_LEMBAGA }),
  kontak: teksOpsionalParsial({ label: "Kontak", max: MAX_KONTAK_LEMBAGA }),
  mediaSosial: mediaSosialListSchema.nullable().optional(),
  lat: lintangSchema.nullable().optional(),
  lng: bujurSchema.nullable().optional(),
  linkGoogleMaps: linkGoogleMapsSchema,
  fotoSekolahId: imageIdOpsional,
  fotoBaganStrukturId: imageIdOpsional,
};

const PESAN_NAMA = "Nama lembaga wajib diisi";
const PESAN_JENJANG = "Jenjang pendidikan wajib dipilih";

/** Skema body POST lembaga: nama + jenjang wajib (seperti sebelumnya), detail sekolah opsional. */
export const lembagaCreateSchema = z
  .object({ nama: teksWajib(PESAN_NAMA), jenjangId: teksWajib(PESAN_JENJANG), ...detail })
  .refine(koordinatBerpasangan, { message: PESAN_KOORDINAT_TIDAK_LENGKAP, path: ["lat"] });

/** Skema body PUT lembaga: semua field opsional; field yang dikirim divalidasi sama dengan POST. */
export const lembagaUpdateSchema = z
  .object({ nama: teksWajib(PESAN_NAMA).optional(), jenjangId: teksWajib(PESAN_JENJANG).optional(), ...detail })
  .refine(koordinatBerpasangan, { message: PESAN_KOORDINAT_TIDAK_LENGKAP, path: ["lat"] });

export type LembagaCreateBody = z.infer<typeof lembagaCreateSchema>;
export type LembagaUpdateBody = z.infer<typeof lembagaUpdateSchema>;
