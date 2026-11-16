import prisma from "@/lib/prisma";
import Elysia from "elysia";
import { MAX_FOTO_PUSTU, MAX_PENGURUS_PUSTU } from "@/lib/pustu/pustu.validation";
import { galeriConfig, pengurusConfig } from "../../_konten-bersama/daftar-anak.config";
import { createDaftarAnakHandlers } from "../../_konten-bersama/daftar-anak.handlers";
import { createDaftarAnakRoutes } from "../../_konten-bersama/daftar-anak.routes";

/** True bila PUSTU induk ada. */
async function pustuAda(id: string): Promise<boolean> {
  return (await prisma.puskesmas.findUnique({ where: { id }, select: { id: true } })) !== null;
}

const induk = {
  parentKey: "pustuId",
  parentExists: pustuAda,
  parentNotFound: "PUSTU tidak ditemukan",
} as const;

/** Handler galeri foto PUSTU (hapus permanen, tanpa Sampah). */
export const fotoKegiatanPustuHandlers = createDaftarAnakHandlers(
  galeriConfig({ ...induk, delegate: () => prisma.fotoKegiatanPustu, fileOwner: "FotoKegiatanPustu", max: MAX_FOTO_PUSTU }),
);

/** Handler struktur pengurus PUSTU. */
export const pengurusPustuHandlers = createDaftarAnakHandlers(
  pengurusConfig({ ...induk, delegate: () => prisma.pengurusPustu, fileOwner: "PengurusPustu", max: MAX_PENGURUS_PUSTU }),
);

const TAG = "Kesehatan/Puskesmas";

/** Rute `/:id/foto-kegiatan…` dan `/:id/pengurus…` di bawah modul PUSTU. */
const PustuDaftarAnak = new Elysia()
  .use(createDaftarAnakRoutes("/foto-kegiatan", "galeri", fotoKegiatanPustuHandlers, { tag: `${TAG}/Galeri`, logTag: "pustu-foto" }))
  .use(createDaftarAnakRoutes("/pengurus", "pengurus", pengurusPustuHandlers, { tag: `${TAG}/Pengurus`, logTag: "pustu-pengurus" }));

export default PustuDaftarAnak;
