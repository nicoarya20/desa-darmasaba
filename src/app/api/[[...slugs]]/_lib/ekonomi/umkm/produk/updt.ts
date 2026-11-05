import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { LINK_TOKO_INCLUDE, parseLinkBody } from "./_link";

async function produkUmkmUpdate(context: Context) {
  const body = context.body as any;
  const id = context.params.id;

  // undefined = klien lama tanpa field link → link tidak disentuh.
  const links = parseLinkBody(body);
  if (links && !links.ok) return { success: false, message: links.message };

  const produkData = {
    nama: body.nama,
    harga: body.harga,
    stok: body.stok,
    satuan: body.satuan || null,
    deskripsi: body.deskripsi,
    umkmId: body.umkmId,
    imageId: body.imageId,
    isActive: body.isActive,
    isUnggulan: body.isUnggulan, // undefined = flag lama tidak diubah (klien lama)
    kategoriProdukId: body.kategoriId, // Now editable via PasarDesa
  };
  const args = { where: { id }, data: produkData, include: { linkTokoOnline: LINK_TOKO_INCLUDE } };

  try {
    // Replace-semantik dalam satu transaksi: hapus link lama → tulis link baru → update produk.
    // Update produk di urutan terakhir agar id tak valid membatalkan (rollback) seluruh perubahan link.
    // Baris lama dihapus permanen (bukan soft-delete) supaya tabel tak menumpuk riwayat tiap simpan.
    const data = links?.ok
      ? await prisma.$transaction(async (tx) => {
          await tx.linkTokoOnline.deleteMany({ where: { produkId: id } });
          if (links.data.length > 0) {
            await tx.linkTokoOnline.createMany({
              data: links.data.map((l) => ({ ...l, produkId: id })),
            });
          }
          return tx.pasarDesa.update(args);
        })
      : await prisma.pasarDesa.update(args);

    return {
      success: true,
      message: "Berhasil memperbarui produk UMKM (PasarDesa)",
      data,
    };
  } catch (e) {
    console.error("Error di produkUmkmUpdate:", e);
    return {
      success: false,
      message: "Gagal memperbarui produk UMKM",
    };
  }
}

export default produkUmkmUpdate;
