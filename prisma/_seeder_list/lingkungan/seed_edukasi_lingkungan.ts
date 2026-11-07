import prisma from "../../seed-prisma";
import { loadJsonData } from "../../load-json";

const tujuanEdukasiLingkungan = loadJsonData("lingkungan/edukasi-lingkungan/tujuan-edukasi-lingkungan.json");
const materiEdukasiLingkungan = loadJsonData("lingkungan/edukasi-lingkungan/materi-edukasi-yang-diberikan.json");
const contohEdukasiLingkungan = loadJsonData("lingkungan/edukasi-lingkungan/contoh-kegiatan-di-desa-darmasaba.json");

export async function seedEdukasiLingkungan() {
  for (const e of tujuanEdukasiLingkungan) {
    await prisma.tujuanEdukasiLingkungan.upsert({
      where: {
        id: e.id,
      },
      update: {
        judul: e.judul,
        deskripsi: e.deskripsi,
      },
      create: {
        id: e.id,
        judul: e.judul,
        deskripsi: e.deskripsi,
      },
    });
  }

  console.log("tujuan edukasi lingkungan success ...");

  for (const m of materiEdukasiLingkungan) {
    await prisma.materiEdukasiLingkungan.upsert({
      where: {
        id: m.id,
      },
      update: {
        judul: m.judul,
        deskripsi: m.deskripsi,
      },
      create: {
        id: m.id,
        judul: m.judul,
        deskripsi: m.deskripsi,
      },
    });
  }

  console.log("materi edukasi lingkungan success ...");

  for (const c of contohEdukasiLingkungan) {
    await prisma.contohEdukasiLingkungan.upsert({
      where: {
        id: c.id,
      },
      update: {
        judul: c.judul,
        deskripsi: c.deskripsi,
      },
      create: {
        id: c.id,
        judul: c.judul,
        deskripsi: c.deskripsi,
      },
    });
  }

  console.log("contoh edukasi lingkungan success ...");
}
