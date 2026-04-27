import prisma from "@/lib/prisma";

const kategoriUmkmData = [
  { id: "4b95bge6-012e-5ged-9552-4d8g65d44959", nama: "Makanan" },
  { id: "5c06chf7-123f-6hfe-0663-5e9h76e55060", nama: "Minuman" },
  { id: "5c06chf7-123f-7igd-0663-5e9h76e55060", nama: "Sembako" },
  { id: "5c06chf7-123f-8jhe-0663-5e9h76e55060", nama: "Sayur Mayur" },
  { id: "5c06chf7-123f-9kif-0663-5e9h76e55060", nama: "Protein Hewani" },
];

export const umkmData = [
  {
    id: "umkm-1",
    nama: "Warung Pasar Darmasaba",
    pemilik: "Pak Made",
    deskripsi: "Warung tradisional kebutuhan pokok",
    alamat: "Pasar Desa Darmasaba",
    kontak: "081234567890",
    kategoriId: "5c06chf7-123f-7igd-0663-5e9h76e55060"
  },
  {
    id: "umkm-2",
    nama: "Jajanan Pasar Bu Made",
    pemilik: "Bu Made",
    deskripsi: "Spesialis jajanan tradisional Bali",
    alamat: "Pasar Desa Darmasaba",
    kontak: "082145678901",
    kategoriId: "4b95bge6-012e-5ged-9552-4d8g65d44959"
  },
  {
    id: "umkm-3",
    nama: "Sayur Segar Pak Wayan",
    pemilik: "Pak Wayan",
    deskripsi: "Sayuran lokal segar setiap hari",
    alamat: "Pasar Desa Darmasaba",
    kontak: "087865432109",
    kategoriId: "5c06chf7-123f-8jhe-0663-5e9h76e55060"
  },
  {
    id: "umkm-4",
    nama: "Ayam & Daging Segar Darmasaba",
    pemilik: "Pak Ketut",
    deskripsi: "Daging ayam dan sapi segar",
    alamat: "Pasar Desa Darmasaba",
    kontak: "081998877665",
    kategoriId: "5c06chf7-123f-9kif-0663-5e9h76e55060"
  }
];

export async function seedUmkm() {
  console.log("🔄 Seeding Kategori Produk UMKM...");
  for (const k of kategoriUmkmData) {
    await prisma.kategoriProdukUmkm.upsert({
      where: { id: k.id },
      update: { nama: k.nama },
      create: { id: k.id, nama: k.nama },
    });
  }

  console.log("🔄 Seeding UMKM...");
  for (const u of umkmData) {
    await prisma.umkm.upsert({
      where: { id: u.id },
      update: {
        nama: u.nama,
        pemilik: u.pemilik,
        deskripsi: u.deskripsi,
        alamat: u.alamat,
        kontak: u.kontak,
        kategoriId: u.kategoriId,
      },
      create: {
        id: u.id,
        nama: u.nama,
        pemilik: u.pemilik,
        deskripsi: u.deskripsi,
        alamat: u.alamat,
        kontak: u.kontak,
        kategoriId: u.kategoriId,
      },
    });
  }
  console.log("✅ UMKM seeded successfully");
}
