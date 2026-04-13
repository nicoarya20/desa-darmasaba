import prisma from "@/lib/prisma";
import { loadJsonData } from "../../load-json";

const jenisLayanan = loadJsonData("inovasi/layanan-online-desa/jenis-layanan.json");
const administrasiOnline = loadJsonData("inovasi/layanan-online-desa/administrasi-online.json");
const jenisPengaduan = loadJsonData("inovasi/layanan-online-desa/jenis-pengaduan.json");
const pengaduanMasyarakat = loadJsonData("inovasi/layanan-online-desa/pengaduan-masyarakat.json");

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
    let imageId: string | null = null;

    if (d.imageName) {
      const image = await prisma.fileStorage.findUnique({
        where: { name: d.imageName },
        select: { id: true },
      });

      if (!image) {
        console.warn(
          `⚠️ Image not found for pengaduan masyarakat "${d.name}": ${d.imageName}`,
        );
      } else {
        imageId = image.id;
      }
    }

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
        imageId: imageId,
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
        imageId: imageId,
        deskripsiPengaduan: d.deskripsiPengaduan,
        jenisPengaduanId: d.jenisPengaduanId,
      },
    });
  }
  console.log("✅ Pengaduan Masyarakat seeded successfully");
}
