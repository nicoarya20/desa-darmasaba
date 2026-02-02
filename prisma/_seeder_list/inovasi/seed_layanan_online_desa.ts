import prisma from "@/lib/prisma";
import jenisLayanan from "../../data/inovasi/layanan-online-desa/jenis-layanan.json";
import administrasiOnline from "../../data/inovasi/layanan-online-desa/administrasi-online.json";
import jenisPengaduan from "../../data/inovasi/layanan-online-desa/jenis-pengaduan.json";
import pengaduanMasyarakat from "../../data/inovasi/layanan-online-desa/pengaduan-masyarakat.json";

export async function seedLayananOnlineDesa() {
  console.log("🔄 Seeding Jenis Layanan...");
  for (const j of jenisLayanan) {
    await prisma.jenisLayanan.upsert({
      where: {
        id: j.id,
      },
      update: {
        nama: j.nama,
        deskripsi: j.deskripsi,
      },
      create: {
        id: j.id,
        nama: j.nama,
        deskripsi: j.deskripsi,
      },
    });
  }
  console.log("✅ Jenis Layanan seeded successfully");
  console.log("🔄 Seeding Administrasi Online...");
  for (const d of administrasiOnline) {
    await prisma.administrasiOnline.upsert({
      where: {
        id: d.id,
      },
      update: {
        name: d.name,
        alamat: d.alamat,
        nomorTelepon: d.nomorTelepon,
        jenisLayananId: d.jenisLayananId,
      },
      create: {
        id: d.id,
        name: d.name,
        alamat: d.alamat,
        nomorTelepon: d.nomorTelepon,
        jenisLayananId: d.jenisLayananId,
      },
    });
  }
  console.log("✅ Administrasi Online seeded successfully");
  console.log("🔄 Seeding Jenis Pengaduan Masyarakat...");
  for (const d of jenisPengaduan) {
    await prisma.jenisPengaduan.upsert({
      where: {
        id: d.id,
      },
      update: {
        nama: d.nama,
      },
      create: {
        id: d.id,
        nama: d.nama,
      },
    });
  }
  console.log("✅ Jenis Pengaduan Masyarakat seeded successfully");
  console.log("🔄 Seeding Pengaduan Masyarakat...");
  for (const d of pengaduanMasyarakat) {
    await prisma.pengaduanMasyarakat.upsert({
      where: {
        id: d.id,
      },
      update: {
        name: d.name,
        email: d.email,
        nik: d.nik,
        nomorTelepon: d.nomorTelepon,
        judulPengaduan: d.judulPengaduan,
        lokasiKejadian: d.lokasiKejadian,
        imageId: d.imageId,
        deskripsiPengaduan: d.deskripsiPengaduan,
        jenisPengaduanId: d.jenisPengaduanId,
      },
      create: {
        id: d.id,
        name: d.name,
        email: d.email,
        nik: d.nik,
        nomorTelepon: d.nomorTelepon,
        judulPengaduan: d.judulPengaduan,
        lokasiKejadian: d.lokasiKejadian,
        imageId: d.imageId,
        deskripsiPengaduan: d.deskripsiPengaduan,
        jenisPengaduanId: d.jenisPengaduanId,
      },
    });
  }
  console.log("✅ Pengaduan Masyarakat seeded successfully");
}
