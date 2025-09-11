import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormUpdate = {
  id: string;
  nama: string;
  imageId?: string;
  kategoriId: string[];
};

export default async function kontakDaruratKeamananUpdate(context: Context) {
  const body = context.body as FormUpdate;

  if (!body.id) {
    throw new Error("ID pasar desa tidak boleh kosong");
  }

  if (!body.kategoriId || body.kategoriId.length === 0) {
    throw new Error("Minimal 1 kategori harus dipilih");
  }

  await prisma.kontakDaruratKeamanan.update({
    where: { id: body.id },
    data: {
      nama: body.nama,
      imageId: body.imageId,
      kategoriId: body.kategoriId[0],
    },
  });

  await prisma.kontakDaruratToItem.deleteMany({
    where: { kontakDaruratId: body.id },
  });

  await prisma.kontakDaruratToItem.createMany({
    data: body.kategoriId.map((kategoriId) => ({
      kontakDaruratId: body.id,
      kontakItemId: kategoriId,
    })),
  });

  const updated = await prisma.kontakDaruratKeamanan.findUnique({
    where: { id: body.id },
    include: {
      image: true,
      kategori: true,
      kontakItems: {
        include: {
          kontakItem: true,
        },
      },
    },
  });

  return {
    success: true,
    message: "Success update kontak darurat keamanan",
    data: updated,
  };
}
