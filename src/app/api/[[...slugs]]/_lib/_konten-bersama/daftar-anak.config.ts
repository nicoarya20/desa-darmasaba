// Konfigurasi helper CRUD daftar anak (galeri foto kegiatan, pengurus) milik satu entri domain
// (mis. satu bank sampah). Tiap domain punya tabel sendiri; kode handler sama.
import type { Prisma } from "@prisma/client";
import type { ZodType, ZodTypeDef } from "zod";
import { buatSkemaGaleri } from "@/lib/konten-bersama/galeri.validation";
import { buatSkemaPengurus } from "@/lib/konten-bersama/pengurus.validation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- delegate Prisma beda model tidak punya supertipe bersama
type Args = any;

/** Operasi delegate Prisma tabel anak yang dipakai handler (mis. `prisma.fotoKegiatanBankSampah`). */
export type DaftarAnakDelegate = {
  findMany(args: Args): Promise<unknown>;
  findFirst(args: Args): Promise<unknown>;
  count(args: Args): Promise<number>;
  aggregate(args: Args): Promise<unknown>;
  create(args: Args): Prisma.PrismaPromise<unknown>;
  update(args: Args): Prisma.PrismaPromise<unknown>;
  delete(args: Args): Promise<unknown>;
};

type Skema<T> = ZodType<T, ZodTypeDef, unknown>;

export type DaftarAnakConfig = {
  /** Delegate tabel anak; dibaca saat request (lazy) agar mock prisma di test ikut terpakai. */
  delegate: () => DaftarAnakDelegate;
  /** Kolom FK ke induk, mis. "bankSampahId". */
  parentKey: string;
  /** True bila induk ada (dicek sebelum tambah agar 404 jelas, bukan FK error). */
  parentExists: (parentId: string) => Promise<boolean>;
  /** Pesan 404 induk, mis. "Bank sampah tidak ditemukan". */
  parentNotFound: string;
  /** Sebutan item di awal kalimat, mis. "Foto kegiatan" / "Pengurus". */
  label: string;
  /** Sebutan item di tengah kalimat, mis. "foto" / "pengurus". */
  labelLower: string;
  /** Batas jumlah item per induk. */
  max: number;
  /** Field yang dikirim ke klien. */
  select: Record<string, unknown>;
  /** Kolom yang merujuk FileStorage; berkas yang dilepas (ganti/hapus) dihapus permanen. */
  fileFields: readonly string[];
  /** Nama model untuk konteks log hapus berkas. */
  fileOwner: string;
  schemas: {
    create: Skema<{ items: Record<string, unknown>[] }>;
    update: Skema<Record<string, unknown>>;
    reorder: Skema<{ ids: string[] }>;
  };
};

/** Bagian config yang sama untuk semua domain; domain cukup mengisi induk, delegate, dan label. */
type ConfigDomain = Pick<DaftarAnakConfig, "delegate" | "parentKey" | "parentExists" | "parentNotFound" | "fileOwner" | "max">;

const GAMBAR_SELECT = { select: { id: true, name: true, link: true } } as const;

/** Field foto galeri yang dikirim ke klien (kontrak `FotoGaleriItem`). */
export const GALERI_SELECT = { id: true, imageId: true, keterangan: true, urutan: true, image: GAMBAR_SELECT } as const;

/** Field pengurus yang dikirim ke klien (kontrak `PengurusItem`). */
export const PENGURUS_SELECT = { id: true, nama: true, jabatan: true, urutan: true, imageId: true, image: GAMBAR_SELECT } as const;

/** Urutan tampil daftar anak: `urutan` lalu waktu dibuat (stabil untuk urutan sama). */
export const URUTAN_ANAK = [{ urutan: "asc" }, { createdAt: "asc" }] as const;

/** Config galeri foto kegiatan satu domain (skema & select bersama). */
export function galeriConfig(domain: ConfigDomain): DaftarAnakConfig {
  return {
    ...domain,
    label: "Foto kegiatan",
    labelLower: "foto",
    select: GALERI_SELECT,
    fileFields: ["imageId"],
    schemas: buatSkemaGaleri({ max: domain.max }),
  };
}

/** Config struktur pengurus satu domain (skema & select bersama). */
export function pengurusConfig(domain: ConfigDomain): DaftarAnakConfig {
  return {
    ...domain,
    label: "Pengurus",
    labelLower: "pengurus",
    select: PENGURUS_SELECT,
    fileFields: ["imageId"],
    schemas: buatSkemaPengurus({ max: domain.max }),
  };
}
