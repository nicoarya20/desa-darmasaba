import prisma from "@/lib/prisma";
import Elysia, { t } from "elysia";

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
  })
  .get("/find-many", async ({ query }) => {
    try {
      const { page = 1, limit = 10, search = "" } = query;
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where = {
        isActive: true,
        deletedAt: null,
        nama: { contains: search, mode: 'insensitive' as const },
      };

      const [data, total] = await Promise.all([
        prisma.kategoriProduk.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.kategoriProduk.count({ where }),
      ]);

      return {
        success: true,
        message: "Berhasil mengambil data kategori produk",
        data,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / take),
      };
    } catch (e) {
      console.error("Error di KategoriProduk find-many:", e);
      return {
        success: false,
        message: "Gagal mengambil data kategori produk",
      };
    }
  }, {
    query: t.Object({
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
      search: t.Optional(t.String()),
    })
  })
  .post("/create", async ({ body }) => {
    try {
      const data = await prisma.kategoriProduk.create({
        data: {
          nama: body.nama,
          isActive: true,
        },
      });

      return {
        success: true,
        message: "Berhasil membuat kategori produk",
        data,
      };
    } catch (e) {
      console.error("Error di KategoriProduk create:", e);
      return {
        success: false,
        message: "Gagal membuat kategori produk",
      };
    }
  }, {
    body: t.Object({
      nama: t.String(),
    })
  })
  .put("/:id", async ({ params, body }) => {
    try {
      const data = await prisma.kategoriProduk.update({
        where: { id: params.id },
        data: {
          nama: body.nama,
        },
      });

      return {
        success: true,
        message: "Berhasil memperbarui kategori produk",
        data,
      };
    } catch (e) {
      console.error("Error di KategoriProduk update:", e);
      return {
        success: false,
        message: "Gagal memperbarui kategori produk",
      };
    }
  }, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      nama: t.String(),
    })
  })
  .delete("/del/:id", async ({ params }) => {
    try {
      const data = await prisma.kategoriProduk.update({
        where: { id: params.id },
        data: {
          isActive: false,
          deletedAt: new Date(),
        },
      });

      return {
        success: true,
        message: "Berhasil menghapus kategori produk",
        data,
      };
    } catch (e) {
      console.error("Error di KategoriProduk delete:", e);
      return {
        success: false,
        message: "Gagal menghapus kategori produk",
      };
    }
  }, {
    params: t.Object({
      id: t.String(),
    })
  });

export default KategoriProduk;
