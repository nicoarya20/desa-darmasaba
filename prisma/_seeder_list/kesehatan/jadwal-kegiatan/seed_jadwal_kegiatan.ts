import prisma from "@/lib/prisma";
import { loadJsonData } from "../../../load-json";

const jadwalJson = loadJsonData("kesehatan/jadwal-kegiatan/jadwal-kegiatan.json");
const infoJadwalJson = loadJsonData("kesehatan/jadwal-kegiatan/informasi-jadwal.json");
const deskJadwalJson = loadJsonData("kesehatan/jadwal-kegiatan/deskripsi-jadwal.json");
const layananJadwalJson = loadJsonData("kesehatan/jadwal-kegiatan/layanan-jadwal.json");
const syaratJadwalJson = loadJsonData("kesehatan/jadwal-kegiatan/syarat-ketentuan.json");
const dokumenJadwalJson = loadJsonData("kesehatan/jadwal-kegiatan/dokumen-jadwal.json");
const daftarJadwalJson = loadJsonData("kesehatan/jadwal-kegiatan/pendaftaran-jadwal.json");

export async function seedJadwalKegiatan() {
  console.log("Seeding Informasi Jadwal Kegiatan...");
  for (const item of infoJadwalJson) {
    await prisma.informasiJadwalKegiatan.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        tanggal: item.tanggal,
        waktu: item.waktu,
        lokasi: item.lokasi,
      },
      create: {
        id: item.id,
        name: item.name,
        tanggal: item.tanggal,
        waktu: item.waktu,
        lokasi: item.lokasi,
      },
    });
    console.log(`  Informasi: ${item.name}`);
  }

  console.log("Seeding Deskripsi Jadwal Kegiatan...");
  for (const item of deskJadwalJson) {
    await prisma.deskripsiJadwalKegiatan.upsert({
      where: { id: item.id },
      update: { deskripsi: item.deskripsi },
      create: { id: item.id, deskripsi: item.deskripsi },
    });
  }

  console.log("Seeding Layanan Jadwal Kegiatan...");
  for (const item of layananJadwalJson) {
    await prisma.layananJadwalKegiatan.upsert({
      where: { id: item.id },
      update: { content: item.content },
      create: { id: item.id, content: item.content },
    });
  }

  console.log("Seeding Syarat & Ketentuan Jadwal...");
  for (const item of syaratJadwalJson) {
    await prisma.syaratKetentuanJadwalKegiatan.upsert({
      where: { id: item.id },
      update: { content: item.content },
      create: { id: item.id, content: item.content },
    });
  }

  console.log("Seeding Dokumen Jadwal Kegiatan...");
  for (const item of dokumenJadwalJson) {
    await prisma.dokumenJadwalKegiatan.upsert({
      where: { id: item.id },
      update: { content: item.content },
      create: { id: item.id, content: item.content },
    });
  }

  console.log("Seeding Pendaftaran Jadwal Kegiatan...");
  for (const item of daftarJadwalJson) {
    await prisma.pendaftaranJadwalKegiatan.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        tanggal: item.tanggal,
        namaOrangtua: item.namaOrtu,
        nomor: item.nomor,
        alamat: item.alamat,
        catatan: item.catatan,
      },
      create: {
        id: item.id,
        name: item.name,
        tanggal: item.tanggal,
        namaOrangtua: item.namaOrtu,
        nomor: item.nomor,
        alamat: item.alamat,
        catatan: item.catatan,
      },
    });
    console.log(`  Pendaftaran: ${item.name}`);
  }

  console.log("Seeding Jadwal Kegiatan...");
  for (const item of jadwalJson) {
    await prisma.jadwalKegiatan.upsert({
      where: { id: item.id },
      update: {
        content: item.content,
        informasiJadwalKegiatanId: item.informasiJadwalKegiatanId,
        deskripsiJadwalKegiatanId: item.deskripsiJadwalKegiatanId,
        layananJadwalKegiatanId: item.layananJadwalKegiatanId,
        syaratKetentuanJadwalKegiatanId: item.syaratKetentuanJadwalKegiatanId,
        dokumenJadwalKegiatanId: item.dokumenJadwalKegiatanId,
        pendaftaranJadwalKegiatanId: item.pendaftaranJadwalKegiatanId,
      },
      create: {
        id: item.id,
        content: item.content,
        informasiJadwalKegiatanId: item.informasiJadwalKegiatanId,
        deskripsiJadwalKegiatanId: item.deskripsiJadwalKegiatanId,
        layananJadwalKegiatanId: item.layananJadwalKegiatanId,
        syaratKetentuanJadwalKegiatanId: item.syaratKetentuanJadwalKegiatanId,
        dokumenJadwalKegiatanId: item.dokumenJadwalKegiatanId,
        pendaftaranJadwalKegiatanId: item.pendaftaranJadwalKegiatanId,
      },
    });
    console.log(`  Jadwal Kegiatan seeded`);
  }

  console.log("Jadwal Kegiatan seed selesai");
}
