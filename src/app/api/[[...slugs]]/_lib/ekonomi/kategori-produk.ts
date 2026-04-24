import prisma from "@/lib/prisma";
import Elysia from "elysia";

const KategoriProduk = new Elysia({
  prefix: "/kategoriproduk",
})
  .get("/find-many-all", async () => {
    try {
      const data = await prisma.kategoriProduk.findMany({
        where: {
          isActive: true,
          deletedAt: null,
        },
        orderBy: { nama: 'asc' },
      });

      return {
        success: true,
        message: "Berhasil mengambil semua kategori produk",
        data,
      };
    } catch (e) {
      console.error("Error di KategoriProduk find-many-all:", e);
      return {
        success: false,
        message: "Gagal mengambil data kategori produk",
      };
    }
  });

export default KategoriProduk;
