/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

const kategoriProdukDelete = async (context: Context) => {
    const id = context.params.id;
    if (!id) {
        return {
            success: false,
            message: "ID is required",
        };
    }

    try {
        // Precheck FK: kategori tidak boleh dihapus bila masih dipakai.
        // Tiga relasi memakai id kategori ini (KategoriProduk & KategoriProdukUmkm
        // berbagi id sejak migration rename), dengan ON DELETE berbeda:
        //  - Umkm.kategoriId            → RESTRICT  (hard delete akan lempar P2003/500)
        //  - KategoriToPasar.kategoriId → RESTRICT  (hard delete akan lempar P2003/500)
        //  - PasarDesa.kategoriProdukId → SET NULL  (produk diam-diam ter-orphan)
        // Blokir bila salah satu > 0 agar tidak 500 dan produk tidak ter-orphan.
        const [umkmCount, produkCount, pivotCount] = await Promise.all([
            prisma.umkm.count({ where: { kategoriId: id, deletedAt: null } }),
            prisma.pasarDesa.count({ where: { kategoriProdukId: id, deletedAt: null } }),
            prisma.kategoriToPasar.count({ where: { kategoriId: id } }),
        ]);

        const produkTerkait = produkCount + pivotCount;
        if (umkmCount > 0 || produkTerkait > 0) {
            const bagian: string[] = [];
            if (umkmCount > 0) bagian.push(`${umkmCount} UMKM`);
            if (produkTerkait > 0) bagian.push(`${produkTerkait} produk`);
            return {
                success: false,
                message: `Kategori masih dipakai oleh ${bagian.join(" dan ")}. Ubah atau hapus data terkait dulu sebelum menghapus kategori ini.`,
            };
        }

        const kategoriProduk = await prisma.kategoriProduk.delete({
            where: { id },
        });

        return {
            success: true,
            message: "Sukses Menghapus kategori produk",
            data: kategoriProduk,
        };
    } catch (e: any) {
        // Jaring pengaman: record hilang, atau FK leftover (mis. referensi soft-deleted).
        if (e?.code === "P2025") {
            return { success: false, message: "Kategori Produk tidak ditemukan" };
        }
        if (e?.code === "P2003") {
            return { success: false, message: "Kategori masih dipakai dan tidak dapat dihapus." };
        }
        console.error("Error menghapus kategori produk:", e);
        return { success: false, message: "Gagal menghapus kategori produk" };
    }
};

export default kategoriProdukDelete;
