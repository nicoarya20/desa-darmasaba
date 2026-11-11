import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { LINK_TOKO_INCLUDE, parseLinkBody } from "./_link";

async function produkUmkmCreate(context: Context) {
  const body = context.body as any;

  // Validasi di boundary sebelum menyentuh DB; link ditulis atomik bersama produk (nested create).
  const links = parseLinkBody(body);
  if (links && !links.ok) return { success: false, message: links.message };

  try {
    const data = await prisma.pasarDesa.create({
      data: {
        nama: body.nama,
        harga: body.harga,
        stok: body.stok ?? 0,
        satuan: body.satuan || null,
        deskripsi: body.deskripsi,
        umkmId: body.umkmId,
        imageId: body.imageId,
        isActive: body.isActive ?? true,
        isUnggulan: body.isUnggulan ?? false,
        rating: 0, // Default for UMKM products
        kategoriProdukId: body.kategoriId, // Now required via PasarDesa
        ...(links?.ok && links.data.length > 0 ? { linkTokoOnline: { create: links.data } } : {}),
      },
      include: { linkTokoOnline: LINK_TOKO_INCLUDE },
    });

    return {
      success: true,
      message: "Berhasil membuat produk UMKM baru (PasarDesa)",
      data,
    };
  } catch (e) {
    console.error("Error di produkUmkmCreate:", e);
    return {
      success: false,
      message: "Gagal membuat produk UMKM baru",
    };
  }
}

export default produkUmkmCreate;
