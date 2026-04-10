import prisma from "@/lib/prisma";
import { loadJsonData } from "../../../load-json";

const daftarInformasiPublik = loadJsonData("ppid/daftar-informasi-publik-desa-darmasaba/daftarInformasi.json");
const jenisInformasiDiminta = loadJsonData("list-jenisInfromasi.json");
const caraMemperolehInformasi = loadJsonData("list-caraMemperolehInformasi.json");
const caraMemperolehSalinanInformasi = loadJsonData("list-caraMemperolehSalinanInformasi.json");

export async function seedDaftarInformasiPublikPpid() {

    for (const v of daftarInformasiPublik) {
    // Convert string date to Date object
    const tanggal = new Date(v.tanggal);

    await prisma.daftarInformasiPublik.upsert({
      where: {
        id: v.id,
      },
      update: {
        jenisInformasi: v.jenisInformasi,
        deskripsi: v.deskripsi,
        tanggal: tanggal,
      },
      create: {
        id: v.id,
        jenisInformasi: v.jenisInformasi,
        deskripsi: v.deskripsi,
        tanggal: tanggal,
      },
    });
  }
  console.log("daftar informasi publik PPID success ...");

    for (const j of jenisInformasiDiminta) {
    await prisma.jenisInformasiDiminta.upsert({
      where: {
        name: j.name,
      },
      update: {
        name: j.name,
      },
      create: {
        name: j.name,
      },
    });
  }
  console.log("jenis informasi diminta success ...");

  for (const c of caraMemperolehInformasi) {
    await prisma.caraMemperolehInformasi.upsert({
      where: {
        name: c.name,
      },
      update: {
        name: c.name,
      },
      create: {
        name: c.name,
      },
    });
  }
  console.log("cara memperoleh informasi success ...");

  for (const c of caraMemperolehSalinanInformasi) {
    await prisma.caraMemperolehSalinanInformasi.upsert({
      where: {
        name: c.name,
      },
      update: {
        name: c.name,
      },
      create: {
        name: c.name,
      },
    });
  }
  console.log("cara memperoleh salinan informasi success ...");
}