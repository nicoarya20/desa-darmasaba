import prisma from "@/lib/prisma";
import { loadJsonData } from "../../load-json";

const kelahiranJson = loadJsonData("kesehatan/kelahiran/kelahiran.json");
const kematianJson = loadJsonData("kesehatan/kematian/kematian.json");
const dataKematianKelahiranJson = loadJsonData("kesehatan/kematian-kelahiran/data-kematian-kelahiran.json");

export async function seedKelahiranKematian() {
  console.log("Seeding Kelahiran...");
  for (const item of kelahiranJson) {
    await prisma.kelahiran.upsert({
      where: { id: item.id },
      update: {
        nama: item.nama,
        tanggal: new Date(item.tanggal),
        jenisKelamin: item.jenisKelamin,
        alamat: item.alamat,
      },
      create: {
        id: item.id,
        nama: item.nama,
        tanggal: new Date(item.tanggal),
        jenisKelamin: item.jenisKelamin,
        alamat: item.alamat,
      },
    });
    console.log(`  Kelahiran: ${item.nama}`);
  }

  console.log("Seeding Kematian...");
  for (const item of kematianJson) {
    await prisma.kematian.upsert({
      where: { id: item.id },
      update: {
        nama: item.nama,
        tanggal: new Date(item.tanggal),
        jenisKelamin: item.jenisKelamin,
        alamat: item.alamat,
        penyebab: item.penyebab,
      },
      create: {
        id: item.id,
        nama: item.nama,
        tanggal: new Date(item.tanggal),
        jenisKelamin: item.jenisKelamin,
        alamat: item.alamat,
        penyebab: item.penyebab,
      },
    });
    console.log(`  Kematian: ${item.nama}`);
  }

  console.log("Seeding Data Kematian-Kelahiran...");
  for (const item of dataKematianKelahiranJson) {
    await prisma.dataKematian_Kelahiran.upsert({
      where: { id: item.id },
      update: {
        kematianId: item.kematianId,
        kelahiranId: item.kelahiranId,
      },
      create: {
        id: item.id,
        kematianId: item.kematianId,
        kelahiranId: item.kelahiranId,
      },
    });
  }

  console.log("Kelahiran & Kematian seed selesai");
}
