import prisma from "@/lib/prisma";
import { loadJsonData } from "../../load-json";

const layananPolsek = loadJsonData("keamanan/polsek-terdekat/layanan-polsek.json");
const polsekTerdekat = loadJsonData("keamanan/polsek-terdekat/polsek-terdekat.json");
const layananToPolsek = loadJsonData("keamanan/polsek-terdekat/layanan-to-polsek.json");

export async function seedPolsekTerdekat() {
   console.log("🔄 Seeding Layanan Polsek...");
  for (const k of layananPolsek) {
    await prisma.layananPolsek.upsert({
      where: {
        id: k.id,
      },
      update: {
        nama: k.nama,
      },
      create: {
        id: k.id,
        nama: k.nama,
      },
    });
  }

  console.log("layanan polsek success ...");

  console.log("🔄 Seeding Polsek Terdekat...");
  for (const k of polsekTerdekat) {
    await prisma.polsekTerdekat.upsert({
      where: {
        id: k.id,
      },
      update: {
        nama: k.nama,
        jarakKeDesa: k.jarakKeDesa,
        alamat: k.alamat,
        nomorTelepon: k.nomorTelepon,
        jamOperasional: k.jamOperasional,
        embedMapUrl: k.embedMapUrl,
        namaTempatMaps: k.namaTempatMaps,
        alamatMaps: k.alamatMaps,
        linkPetunjukArah: k.linkPetunjukArah,
        layananPolsekId: k.layananPolsekId,
      },
      create: {
        id: k.id,
        nama: k.nama,
        jarakKeDesa: k.jarakKeDesa,
        alamat: k.alamat,
        nomorTelepon: k.nomorTelepon,
        jamOperasional: k.jamOperasional,
        embedMapUrl: k.embedMapUrl,
        namaTempatMaps: k.namaTempatMaps,
        alamatMaps: k.alamatMaps,
        linkPetunjukArah: k.linkPetunjukArah,
        layananPolsekId: k.layananPolsekId,
      },
    });
  }

  console.log("polsek terdekat success ...");

  console.log("🔄 Seeding Layanan To Polsek...");
  for (const k of layananToPolsek) {
    await prisma.layananToPolsek.upsert({
      where: {
        id: k.id,
      },
      update: {
        layananId: k.layananId,
        polsekTerdekatId: k.polsekTerdekatId,
      },
      create: {
        id: k.id,
        layananId: k.layananId,
        polsekTerdekatId: k.polsekTerdekatId,
      },
    });
  }

  console.log("layanan to polsek success ...");   
}