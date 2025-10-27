import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
  name: string;
  deskripsi: string;
  fileId: string;
  kategoriId: string; // minimal satu kategori
};

export default async function desaAntiKorupsiCreate(context: Context) {
  const body = context.body as FormCreate;

  if (!body.kategoriId) {
    throw new Error("kategoriId wajib diisi");
  }

  try {
    // Create langsung data AdministrasiOnline
    const result = await prisma.desaAntiKorupsi.create({
      data: {
        name: body.name,
        deskripsi: body.deskripsi,
        fileId: body.fileId,
        kategoriId: body.kategoriId, // relasi ke JenisLayanan
      },
      include: {
        kategori: true, // Include data relasi
      },
    });

    return {
      success: true,
      message: "Berhasil membuat desa anti korupsi",
      data: result,
    };
  } catch (error) {
    console.error("Error creating desa anti korupsi:", error);
    throw new Error(
      "Gagal membuat desa anti korupsi: " + (error as Error).message
    );
  }
}
