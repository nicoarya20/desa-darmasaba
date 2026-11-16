import prisma from "@/lib/prisma";
import Elysia from "elysia";
import { MAX_FOTO_KEGIATAN_LEMBAGA, MAX_PENGURUS_LEMBAGA } from "@/lib/lembaga-pendidikan/lembaga.validation";
import { galeriConfig, pengurusConfig } from "../../../_konten-bersama/daftar-anak.config";
import { createDaftarAnakHandlers } from "../../../_konten-bersama/daftar-anak.handlers";
import { createDaftarAnakRoutes } from "../../../_konten-bersama/daftar-anak.routes";

/** True bila lembaga induk ada dan aktif (lembaga nonaktif = sudah dihapus admin). */
async function lembagaAda(id: string): Promise<boolean> {
  return (await prisma.lembaga.findFirst({ where: { id, isActive: true }, select: { id: true } })) !== null;
}

const induk = {
  parentKey: "lembagaId",
  parentExists: lembagaAda,
  parentNotFound: "Lembaga pendidikan tidak ditemukan",
} as const;

/** Handler galeri foto kegiatan lembaga (hapus permanen, tanpa Sampah). */
export const fotoKegiatanLembagaHandlers = createDaftarAnakHandlers(
  galeriConfig({
    ...induk,
    delegate: () => prisma.fotoKegiatanLembaga,
    fileOwner: "FotoKegiatanLembaga",
    max: MAX_FOTO_KEGIATAN_LEMBAGA,
  }),
);

/** Handler struktur pengurus lembaga (opsional; desa mengisi untuk TK). */
export const pengurusLembagaHandlers = createDaftarAnakHandlers(
  pengurusConfig({
    ...induk,
    delegate: () => prisma.pengurusLembaga,
    fileOwner: "PengurusLembaga",
    max: MAX_PENGURUS_LEMBAGA,
  }),
);

const TAG = "Pendidikan/Info Sekolah PAUD/Lembaga Pendidikan";

/** Rute `/:id/foto-kegiatan…` dan `/:id/pengurus…` di bawah modul lembaga pendidikan. */
const LembagaDaftarAnak = new Elysia()
  .use(createDaftarAnakRoutes("/foto-kegiatan", "galeri", fotoKegiatanLembagaHandlers, { tag: `${TAG}/Foto Kegiatan`, logTag: "lembaga-foto" }))
  .use(createDaftarAnakRoutes("/pengurus", "pengurus", pengurusLembagaHandlers, { tag: `${TAG}/Pengurus`, logTag: "lembaga-pengurus" }));

export default LembagaDaftarAnak;
