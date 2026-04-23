import prisma from "@/lib/prisma";
import { loadJsonData } from "../../../load-json";

const faskesJson = loadJsonData("kesehatan/fasilitas-kesehatan/fasilitas-kesehatan.json");
const infoUmumJson = loadJsonData("kesehatan/fasilitas-kesehatan/informasi-umum.json");
const layananUnggulanJson = loadJsonData("kesehatan/fasilitas-kesehatan/layanan-unggulan.json");
const dokterJson = loadJsonData("kesehatan/fasilitas-kesehatan/dokter-tenaga-medis.json");
const fasilitasPendukungJson = loadJsonData("kesehatan/fasilitas-kesehatan/fasilitas-pendukung.json");
const prosedurJson = loadJsonData("kesehatan/fasilitas-kesehatan/prosedur-pendaftaran.json");
const tarifJson = loadJsonData("kesehatan/fasilitas-kesehatan/tarif-layanan.json");

export async function seedFasilitasKesehatan() {
  console.log("Seeding Informasi Umum...");
  for (const item of infoUmumJson) {
    await prisma.informasiUmum.upsert({
      where: { id: item.id },
      update: {
        fasilitas: item.fasilitas,
        alamat: item.alamat,
        jamOperasional: item.jamOperasional,
      },
      create: {
        id: item.id,
        fasilitas: item.fasilitas,
        alamat: item.alamat,
        jamOperasional: item.jamOperasional,
      },
    });
    console.log(`  Informasi Umum: ${item.fasilitas}`);
  }

  console.log("Seeding Layanan Unggulan...");
  for (const item of layananUnggulanJson) {
    await prisma.layananUnggulan.upsert({
      where: { id: item.id },
      update: { content: item.content },
      create: { id: item.id, content: item.content },
    });
  }

  console.log("Seeding Fasilitas Pendukung...");
  for (const item of fasilitasPendukungJson) {
    await prisma.fasilitasPendukung.upsert({
      where: { id: item.id },
      update: { content: item.content },
      create: { id: item.id, content: item.content },
    });
  }

  console.log("Seeding Prosedur Pendaftaran...");
  for (const item of prosedurJson) {
    await prisma.prosedurPendaftaran.upsert({
      where: { id: item.id },
      update: { content: item.content },
      create: { id: item.id, content: item.content },
    });
  }

  console.log("Seeding Tarif dan Layanan...");
  for (const item of tarifJson) {
    await prisma.tarifDanLayanan.upsert({
      where: { id: item.id },
      update: { layanan: item.layanan, tarif: item.tarif },
      create: { id: item.id, layanan: item.layanan, tarif: item.tarif },
    });
    console.log(`  Tarif: ${item.layanan}`);
  }

  console.log("Seeding Dokter dan Tenaga Medis...");
  for (const item of dokterJson) {
    await prisma.dokterdanTenagaMedis.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        specialist: item.specialist,
        jadwal: item.jadwal,
        jadwalLibur: item.jadwalLibur,
        jamBukaOperasional: item.jamBukaOperasional,
        jamTutupOperasional: item.jamTutupOperasional,
        jamBukaLibur: item.jamBukaLibur,
        jamTutupLibur: item.jamTutupLibur,
      },
      create: {
        id: item.id,
        name: item.name,
        specialist: item.specialist,
        jadwal: item.jadwal,
        jadwalLibur: item.jadwalLibur,
        jamBukaOperasional: item.jamBukaOperasional,
        jamTutupOperasional: item.jamTutupOperasional,
        jamBukaLibur: item.jamBukaLibur,
        jamTutupLibur: item.jamTutupLibur,
      },
    });
    console.log(`  Dokter: ${item.name}`);
  }

  console.log("Seeding Fasilitas Kesehatan...");
  for (const item of faskesJson) {
    await prisma.fasilitasKesehatan.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        informasiUmumId: item.informasiUmumId,
        layananUnggulanId: item.layananUnggulanId,
        fasilitasPendukungId: item.fasilitasPendukungId,
        prosedurPendaftaranId: item.prosedurPendaftaranId,
      },
      create: {
        id: item.id,
        name: item.name,
        informasiUmumId: item.informasiUmumId,
        layananUnggulanId: item.layananUnggulanId,
        fasilitasPendukungId: item.fasilitasPendukungId,
        prosedurPendaftaranId: item.prosedurPendaftaranId,
      },
    });
    console.log(`  Fasilitas Kesehatan: ${item.name}`);
  }

  console.log("Fasilitas Kesehatan seed selesai");
}
