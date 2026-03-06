import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormUpdate = {
  id: string;
  nama: string;
  harga: number;
  alamatUsaha: string;
  imageId: string;
  rating: number;
  kategoriId: string[]; // Array of KategoriProduk IDs
  kontak: string;
  deskripsi: string;
};

export default async function pasarDesaUpdate(context: Context) {
  const body = context.body as FormUpdate;

  if (!body.id) {
    throw new Error("ID pasar desa tidak boleh kosong");
  }

  if (!body.kategoriId || body.kategoriId.length === 0) {
    throw new Error("Minimal 1 kategori harus dipilih");
  }

  // 1. Update data utama pasar desa
  await prisma.pasarDesa.update({
    where: { id: body.id },
    data: {
      nama: body.nama,
      harga: Number(body.harga),
      alamatUsaha: body.alamatUsaha,
      imageId: body.imageId,
      rating: Number(body.rating),
      kontak: body.kontak,
      deskripsi: body.deskripsi
    },
  });

  // 2. Hapus semua relasi kategori lama
  await prisma.kategoriToPasar.deleteMany({
    where: { pasarDesaId: body.id },
  });

  // 3. Tambah relasi kategori yang baru
  await prisma.kategoriToPasar.createMany({
    data: body.kategoriId.map((kategoriProdukId) => ({
      pasarDesaId: body.id,
      kategoriId: kategoriProdukId,
    })),
  });

  // 4. Ambil data lengkap setelah update
  const updated = await prisma.pasarDesa.findUnique({
    where: { id: body.id },
    include: {
      image: true,
      KategoriToPasar: {
        include: {
          kategori: true,
        },
      },
    },
  });

  return {
    success: true,
    message: "Success update pasar desa",
    data: updated,
  };
}
