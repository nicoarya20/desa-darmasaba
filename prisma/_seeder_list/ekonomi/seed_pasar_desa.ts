import prisma from "@/lib/prisma";
import kategoriProduk from "../../data/ekonomi/pasar-desa/kategori-produk.json";
import pasarDesa from "../../data/ekonomi/pasar-desa/pasar-desa.json";
import kategoriToPasar from "../../data/ekonomi/pasar-desa/kategori-to-pasar.json";

export async function seedPasarDesa() {
  console.log("🔄 Seeding Kategori Produk...");
  for (const k of kategoriProduk) {
    await prisma.kategoriProduk.upsert({
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
  console.log("✅ Kategori Produk seeded successfully");

  console.log("🔄 Seeding Pasar Desa...");
  
    for (const p of pasarDesa) {
      let imageId: string | null = null;
  
      if (p.imageName) {
        const image = await prisma.fileStorage.findUnique({
          where: { name: p.imageName },
          select: { id: true },
        });
  
        if (!image) {
          console.warn(
            `⚠️ Image not found for pasar desa "${p.nama}": ${p.imageName}`,
          );
        } else {
          imageId = image.id;
        }
      }
  
      await prisma.pasarDesa.upsert({
        where: { id: p.id },
        update: {
          nama: p.nama,
          deskripsi: p.deskripsi,
          harga: p.harga,
          rating: p.rating,
          alamatUsaha: p.alamatUsaha,
          kontak: p.kontak,
          imageId,
          kategoriProdukId: p.kategoriProdukId,
        },
        create: {
          id: p.id,
          nama: p.nama,
          deskripsi: p.deskripsi,
          harga: p.harga,
          rating: p.rating,
          alamatUsaha: p.alamatUsaha,
          kontak: p.kontak,
          imageId,
          kategoriProdukId: p.kategoriProdukId,
        },
      });
  
      console.log(`✅ Pasar desa seeded: ${p.nama}`);
    }
  
    console.log("🎉 Pasar desa seed selesai");

  console.log("🔄 Seeding Kategori To Pasar...");
  for (const p of kategoriToPasar) {
    await prisma.kategoriToPasar.upsert({
      where: {
        id: p.id,
      },
      update: {
        kategoriId: p.kategoriId,
        pasarDesaId: p.pasarDesaId,
      },
      create: {
        id: p.id,
        kategoriId: p.kategoriId,
        pasarDesaId: p.pasarDesaId,
      },
    });
  }
}
