import { z } from "zod";
import { linkGoogleMapsSchema } from "@/lib/konten-bersama/lokasi.logic";
import { mediaSosialListSchema } from "@/lib/konten-bersama/media-sosial.validation";
import { teksOpsional, teksOpsionalParsial } from "@/lib/konten-bersama/teks.validation";
import type { JadwalPustuItem, LayananUnggulanItem } from "./pustu.types";

/** Batas jumlah pengurus per PUSTU. */
export const MAX_PENGURUS_PUSTU = 50;
/** Batas jumlah foto galeri per PUSTU (lokasi, fasilitas, kegiatan). */
export const MAX_FOTO_PUSTU = 60;
/** Batas baris jam operasional (satu baris per rentang hari). */
export const MAX_JADWAL_PUSTU = 7;
/** Batas jumlah layanan unggulan. */
export const MAX_LAYANAN_PUSTU = 20;
export const MAX_NAMA_PUSTU = 150;
export const MAX_ALAMAT_PUSTU = 255;
export const MAX_HARI_JADWAL = 60;
export const MAX_JAM_JADWAL = 80;
export const MAX_JUDUL_LAYANAN = 120;
export const MAX_DESKRIPSI_LAYANAN = 500;
export const MAX_KONTAK_PUSTU = 100;
/** Batas HTML teks kaya (prosedur, tarif) sebelum sanitasi. */
export const MAX_TEKS_KAYA_PUSTU = 20000;

const teksWajib = (label: string, max: number) =>
  z
    .string({ required_error: `${label} wajib diisi`, invalid_type_error: `${label} harus berupa teks` })
    .trim()
    .min(1, `${label} wajib diisi`)
    .max(max, `${label} maksimal ${max} karakter`);

/** Skema satu baris jam operasional: rentang hari + jam (teks bebas, mis. "08.00 – 14.00 WITA" / "Tutup"). */
export const jadwalPustuItemSchema = z.object({
  hari: teksWajib("Hari", MAX_HARI_JADWAL),
  jam: teksWajib("Jam", MAX_JAM_JADWAL),
});

/** Skema daftar jam operasional. */
export const jadwalPustuListSchema = z
  .array(jadwalPustuItemSchema)
  .max(MAX_JADWAL_PUSTU, `Maksimal ${MAX_JADWAL_PUSTU} baris jam operasional`);

/** Skema satu layanan unggulan: judul wajib, deskripsi opsional. */
export const layananUnggulanItemSchema = z.object({
  judul: teksWajib("Judul layanan", MAX_JUDUL_LAYANAN),
  deskripsi: teksOpsional({ label: "Deskripsi layanan", max: MAX_DESKRIPSI_LAYANAN }),
});

/** Skema daftar layanan unggulan. */
export const layananUnggulanListSchema = z
  .array(layananUnggulanItemSchema)
  .max(MAX_LAYANAN_PUSTU, `Maksimal ${MAX_LAYANAN_PUSTU} layanan unggulan`);

// HTML editor admin; disanitasi di API saat simpan. `undefined` = tidak diubah (PUT).
const teksKaya = (label: string) =>
  z
    .string({ invalid_type_error: `${label} harus berupa teks` })
    .max(MAX_TEKS_KAYA_PUSTU, `${label} terlalu panjang`)
    .nullable()
    .optional();

const idOpsional = z
  .string()
  .trim()
  .nullable()
  .optional()
  .transform((v) => (v === undefined ? undefined : v || null));

const emailOpsional = teksOpsionalParsial({ label: "Email", max: MAX_KONTAK_PUSTU }).refine(
  (v) => !v || z.string().email().safeParse(v).success,
  "Format email tidak valid",
);

/**
 * Skema body POST/PUT PUSTU. Nama & alamat wajib; field lain opsional: `undefined` = tidak diubah (PUT),
 * null/"" = dikosongkan. `kontak.kontakUGD` = kontak darurat / ambulans.
 */
export const pustuBodySchema = z.object({
  name: teksWajib("Nama PUSTU", MAX_NAMA_PUSTU),
  alamat: teksWajib("Alamat", MAX_ALAMAT_PUSTU),
  imageId: idOpsional,
  jadwal: jadwalPustuListSchema.nullable().optional(),
  kontak: z
    .object({
      kontakPuskesmas: teksOpsionalParsial({ label: "Telepon", max: MAX_KONTAK_PUSTU }),
      email: emailOpsional,
      kontakUGD: teksOpsionalParsial({ label: "Kontak darurat", max: MAX_KONTAK_PUSTU }),
    })
    .optional(),
  mediaSosial: mediaSosialListSchema.nullable().optional(),
  layananUnggulan: layananUnggulanListSchema.nullable().optional(),
  linkPetunjukArah: linkGoogleMapsSchema,
  prosedurPendaftaran: teksKaya("Prosedur pendaftaran"),
  tarifBpjs: teksKaya("Tarif BPJS"),
  tarifUmum: teksKaya("Tarif umum"),
  fotoBaganStrukturId: idOpsional,
});

export type PustuBody = z.infer<typeof pustuBodySchema>;

const teksTerisi = (v: unknown): v is string => typeof v === "string" && v.trim() !== "";

/** Baca kolom `Json` jam operasional; entri rusak dibuang (data lama/terketik manual tidak merusak tampilan). */
export function bacaJadwal(raw: unknown): JadwalPustuItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item): JadwalPustuItem[] => {
    const { hari, jam } = (item ?? {}) as Record<string, unknown>;
    return teksTerisi(hari) && teksTerisi(jam) ? [{ hari: hari.trim(), jam: jam.trim() }] : [];
  });
}

/** Baca kolom `Json` layanan unggulan; entri tanpa judul dibuang, deskripsi kosong → null. */
export function bacaLayananUnggulan(raw: unknown): LayananUnggulanItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item): LayananUnggulanItem[] => {
    const { judul, deskripsi } = (item ?? {}) as Record<string, unknown>;
    if (!teksTerisi(judul)) return [];
    return [{ judul: judul.trim(), deskripsi: teksTerisi(deskripsi) ? deskripsi.trim() : null }];
  });
}
