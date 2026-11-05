import prisma from "@/lib/prisma";
import { WILAYAH_DESA_ID } from "./validation";

/** Kolom yang diekspos ke klien (kontrak output; hanya boleh bertambah). */
export const WILAYAH_DESA_SELECT = {
  id: true,
  batasUtara: true,
  batasSelatan: true,
  batasTimur: true,
  batasBarat: true,
  luasWilayah: true,
  keterangan: true,
  petaEmbedUrl: true,
  updatedAt: true,
} as const;

/** GET publik: data wilayah desa; `data: null` (200) bila admin belum mengisi. */
export default async function wilayahDesaFind() {
  try {
    const data = await prisma.wilayahDesa.findFirst({
      where: { id: WILAYAH_DESA_ID, isActive: true, deletedAt: null },
      select: WILAYAH_DESA_SELECT,
    });

    return Response.json(
      {
        success: true,
        message: data ? "Data ditemukan" : "Data wilayah desa belum diisi",
        data,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Gagal mengambil data wilayah desa:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat mengambil data wilayah desa" },
      { status: 500 },
    );
  }
}
