import prisma from "@/lib/prisma";

type FormUpdate = {
  nama: string;
  icon: string;
  kategoriId: string[];
};

export default async function kontakDaruratKeamananUpdate(context: {
  params: { id: string };
  body: FormUpdate;
}) {
  const { id } = context.params;
  const body = context.body;

  if (!body.kategoriId || body.kategoriId.length === 0) {
    throw new Error("Minimal 1 kategori harus dipilih");
  }

  await prisma.kontakDaruratKeamanan.update({
    where: { id },
    data: {
      nama: body.nama,
      icon: body.icon,
      kategoriId: body.kategoriId[0],
    },
  });

  await prisma.kontakDaruratToItem.deleteMany({
    where: { kontakDaruratId: id },
  });

  await prisma.kontakDaruratToItem.createMany({
    data: body.kategoriId.map((kategoriId) => ({
      kontakDaruratId: id,
      kontakItemId: kategoriId,
    })),
  });

  const updated = await prisma.kontakDaruratKeamanan.findUnique({
    where: { id },
    include: {
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
