import prisma from "../../seed-prisma";
import { loadJsonData } from "../../load-json";

const kategoriProduk = loadJsonData("ekonomi/pasar-desa/kategori-produk.json");
const pasarDesa = loadJsonData("ekonomi/pasar-desa/pasar-desa.json");
const kategoriToPasar = loadJsonData("ekonomi/pasar-desa/kategori-to-pasar.json");

export async function seedKategoriProduk() {
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
}

export async function seedPasarDesa() {
  // Ensure KategoriProduk is seeded first
  await seedKategoriProduk();

  console.log("🔄 Seeding Pasar Desa...");
  
    let i = 1;
    for (const p of pasarDesa) {
      let imageId: string | null = null;
      const umkmId = `umkm-${i}`; // Map to umkm-1, umkm-2, etc.
      i = (i % 4) + 1;
  
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
          satuan: p.satuan ?? null,
          rating: p.rating,
          alamatUsaha: p.alamatUsaha,
          kontak: p.kontak,
          imageId,
          kategoriProdukId: p.kategoriProdukId,
          umkmId: umkmId,
          // isUnggulan hanya ditimpa jika ada di JSON, agar tanda yang diubah admin tidak hilang tanpa sengaja.
          ...(p.isUnggulan !== undefined && { isUnggulan: p.isUnggulan }),
        },
        create: {
          id: p.id,
          nama: p.nama,
          deskripsi: p.deskripsi,
          harga: p.harga,
          satuan: p.satuan ?? null,
          rating: p.rating,
          alamatUsaha: p.alamatUsaha,
          kontak: p.kontak,
          imageId,
          kategoriProdukId: p.kategoriProdukId,
          umkmId: umkmId,
          isUnggulan: p.isUnggulan ?? false,
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
