import prisma from "@/lib/prisma";
import Elysia from "elysia";
import { MAX_FOTO_KEGIATAN_BANK_SAMPAH, MAX_PENGURUS_BANK_SAMPAH } from "@/lib/bank-sampah/bank-sampah.validation";
import { galeriConfig, pengurusConfig } from "../../../_konten-bersama/daftar-anak.config";
import { createDaftarAnakHandlers } from "../../../_konten-bersama/daftar-anak.handlers";
import { createDaftarAnakRoutes } from "../../../_konten-bersama/daftar-anak.routes";

/** True bila bank sampah induk ada. */
async function bankSampahAda(id: string): Promise<boolean> {
  return (await prisma.keteranganBankSampahTerdekat.findUnique({ where: { id }, select: { id: true } })) !== null;
}

const induk = {
  parentKey: "bankSampahId",
  parentExists: bankSampahAda,
  parentNotFound: "Bank sampah tidak ditemukan",
} as const;

/** Handler galeri foto kegiatan bank sampah (hapus permanen, tanpa Sampah). */
export const fotoKegiatanBankSampahHandlers = createDaftarAnakHandlers(
  galeriConfig({
    ...induk,
    delegate: () => prisma.fotoKegiatanBankSampah,
    fileOwner: "FotoKegiatanBankSampah",
    max: MAX_FOTO_KEGIATAN_BANK_SAMPAH,
  }),
);

/** Handler struktur pengurus bank sampah. */
export const pengurusBankSampahHandlers = createDaftarAnakHandlers(
  pengurusConfig({
    ...induk,
    delegate: () => prisma.pengurusBankSampah,
    fileOwner: "PengurusBankSampah",
    max: MAX_PENGURUS_BANK_SAMPAH,
  }),
);

const TAG = "Lingkungan/Pengelolaan Sampah/Keterangan Bank Sampah Terdekat";

/** Rute `/:id/foto-kegiatan…` dan `/:id/pengurus…` di bawah modul keterangan bank sampah. */
const BankSampahDaftarAnak = new Elysia()
  .use(createDaftarAnakRoutes("/foto-kegiatan", "galeri", fotoKegiatanBankSampahHandlers, { tag: `${TAG}/Foto Kegiatan`, logTag: "banksampah-foto" }))
  .use(createDaftarAnakRoutes("/pengurus", "pengurus", pengurusBankSampahHandlers, { tag: `${TAG}/Pengurus`, logTag: "banksampah-pengurus" }));

export default BankSampahDaftarAnak;
