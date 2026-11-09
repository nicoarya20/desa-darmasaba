import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { normalizeJuara } from "./juara";

type FormCreate = {
  name: string;
  deskripsi: string;
  juara?: string | null;
  imageId: string;
  kategoriId: string;
};

export default async function prestasiDesaCreate(context: Context) {
  const body = context.body as FormCreate;

  try {
    // Cegah duplikasi: tolak jika sudah ada prestasi dengan nama sama (case-insensitive)
    const duplikat = await prisma.prestasiDesa.findFirst({
      where: { name: { equals: body.name, mode: "insensitive" } },
      select: { id: true },
    });
    if (duplikat) {
      context.set.status = 409;
      return {
        success: false,
        message: `Prestasi "${body.name}" sudah terdaftar. Gunakan nama lain atau ubah data yang sudah ada.`,
      };
    }

    const result = await prisma.prestasiDesa.create({
      data: {
        name: body.name,
        deskripsi: body.deskripsi,
        juara: normalizeJuara(body.juara) ?? null,
        imageId: body.imageId,
        kategoriId: body.kategoriId,
      },
      include: {
        image: true,
        kategori: true,
      },
    });
    return {
      success: true,
      message: "Berhasil membuat Prestasi Desa",
      data: result,
    };
  } catch (error) {
    console.error("Error creating Prestasi Desa:", error);
    throw new Error(
      "Gagal membuat Prestasi Desa: " + (error as Error).message
    );
  }
}