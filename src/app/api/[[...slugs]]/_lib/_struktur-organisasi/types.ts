import type { Prisma } from "@prisma/client";
import type { PEGAWAI_SELECT, POSISI_SELECT } from "./http";

// Tipe kontrak respons, sama untuk semua struktur. Diturunkan dari model Perangkat Desa; tabel PPID/BUMDes
// punya kolom yang sama untuk field di select bersama, jadi bentuknya identik (type-only, tanpa kode server).

/** Jabatan seperti dikirim API (kontrak `Posisi`). */
export type StrukturPosisi = Prisma.PosisiPerangkatDesaGetPayload<{ select: typeof POSISI_SELECT }>;

/** Pegawai seperti dikirim API (kontrak `Pegawai`). */
export type StrukturPegawai = Prisma.PerangkatDesaGetPayload<{ select: typeof PEGAWAI_SELECT }>;
