import prisma from "@/lib/prisma";
import { loadJsonData } from "../../load-json";

const beasiswaJson = loadJsonData("pendidikan/beasiswa-pendaftar/beasiswa-pendaftar.json");

export async function seedBeasiswaPendaftar() {
  console.log("Seeding Beasiswa Pendaftar...");

  for (const item of beasiswaJson) {
    await prisma.beasiswaPendaftar.upsert({
      where: { id: item.id },
      update: {
        namaLengkap: item.namaLengkap,
        nis: item.nis,
        kelas: item.kelas,
        jenisKelamin: item.jenisKelamin,
        alamatDomisili: item.alamatDomisili,
        tempatLahir: item.tempatLahir,
        tanggalLahir: new Date(item.tanggalLahir),
        namaOrtu: item.namaOrtu,
        nik: item.nik,
        pekerjaanOrtu: item.pekerjaanOrtu,
        penghasilan: item.penghasilan,
        noHp: item.noHp,
        kewarganegaraan: item.kewarganegaraan,
        agama: item.agama,
        alamatKTP: item.alamatKTP,
        email: item.email,
        statusPernikahan: item.statusPernikahan,
        ukuranBaju: item.ukuranBaju,
      },
      create: {
        id: item.id,
        namaLengkap: item.namaLengkap,
        nis: item.nis,
        kelas: item.kelas,
        jenisKelamin: item.jenisKelamin,
        alamatDomisili: item.alamatDomisili,
        tempatLahir: item.tempatLahir,
        tanggalLahir: new Date(item.tanggalLahir),
        namaOrtu: item.namaOrtu,
        nik: item.nik,
        pekerjaanOrtu: item.pekerjaanOrtu,
        penghasilan: item.penghasilan,
        noHp: item.noHp,
        kewarganegaraan: item.kewarganegaraan,
        agama: item.agama,
        alamatKTP: item.alamatKTP,
        email: item.email,
        statusPernikahan: item.statusPernikahan,
        ukuranBaju: item.ukuranBaju,
      },
    });
    console.log(`  Beasiswa: ${item.namaLengkap} (NIS: ${item.nis})`);
  }

  console.log("Beasiswa Pendaftar seed selesai");
}
