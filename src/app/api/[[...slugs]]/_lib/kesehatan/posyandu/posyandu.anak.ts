import prisma from "@/lib/prisma";
import Elysia from "elysia";
import { MAX_FOTO_KEGIATAN_POSYANDU } from "@/lib/posyandu/posyandu-konten.validation";
import { galeriConfig } from "../../_konten-bersama/daftar-anak.config";
import { createDaftarAnakHandlers } from "../../_konten-bersama/daftar-anak.handlers";
import { createDaftarAnakRoutes } from "../../_konten-bersama/daftar-anak.routes";

/** True bila posyandu induk ada. */
async function posyanduAda(id: string): Promise<boolean> {
  return (await prisma.posyandu.findUnique({ where: { id }, select: { id: true } })) !== null;
}

/** Handler galeri foto lokasi & kader posyandu banjar (hapus permanen, tanpa Sampah). */
export const fotoKegiatanPosyanduHandlers = createDaftarAnakHandlers(
  galeriConfig({
    parentKey: "posyanduId",
    parentExists: posyanduAda,
    parentNotFound: "Posyandu tidak ditemukan",
    delegate: () => prisma.fotoKegiatanPosyandu,
    fileOwner: "FotoKegiatanPosyandu",
    max: MAX_FOTO_KEGIATAN_POSYANDU,
  }),
);

/** Rute `/:id/foto-kegiatan…` di bawah modul posyandu. */
const PosyanduDaftarAnak = new Elysia().use(
  createDaftarAnakRoutes("/foto-kegiatan", "galeri", fotoKegiatanPosyanduHandlers, {
    tag: "Kesehatan/Posyandu/Foto Kegiatan",
    logTag: "posyandu-foto",
  }),
);

export default PosyanduDaftarAnak;
