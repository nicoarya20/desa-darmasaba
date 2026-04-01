import prisma from "@/lib/prisma";
import lowonganKerjaLokal from "../../data/ekonomi/lowongan-kerja-lokal/lowongan-kerja-lokal.json";

export async function seedLowonganKerjaLokal() {
  console.log("🔄 Seeding Lowongan Kerja Lokal...");
  for (const k of lowonganKerjaLokal) {
    await prisma.lowonganPekerjaan.upsert({
      where: {
        id: k.id,
      },
      update: {
        posisi: k.posisi,
        namaPerusahaan: k.namaPerusahaan,
        lokasi: k.lokasi,
        tipePekerjaan: k.tipePekerjaan,
        gaji: k.gaji,
        deskripsi: k.deskripsi,
        kualifikasi: k.kualifikasi,
        notelp: k.notelp,
      },
      create: {
        id: k.id,
        posisi: k.posisi,
        namaPerusahaan: k.namaPerusahaan,
        lokasi: k.lokasi,
        tipePekerjaan: k.tipePekerjaan,
        gaji: k.gaji,
        deskripsi: k.deskripsi,
        kualifikasi: k.kualifikasi,
        notelp: k.notelp,
      },
    });
  }
  console.log("✅ Lowongan Kerja Lokal seeded successfully");
}
