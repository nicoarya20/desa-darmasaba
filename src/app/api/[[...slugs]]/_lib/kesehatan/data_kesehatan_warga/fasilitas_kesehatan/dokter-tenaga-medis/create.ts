import prisma from "@/lib/prisma";
import type { Context } from "elysia";

type FormCreate = {
  name: string;
  specialist: string;
  jadwal: string;
  jadwalLibur: string;
  jamBukaOperasional: string;
  jamTutupOperasional: string;
  jamBukaLibur: string;
  jamTutupLibur: string;
};

export default async function dokterTenagaMedisCreate(context: Context) {
  const body = context.body as FormCreate;

  const created = await prisma.dokterdanTenagaMedis.create({
    data: {
      name: body.name,
      specialist: body.specialist,
      jadwal: body.jadwal,
      jadwalLibur: body.jadwalLibur,
      jamBukaOperasional: body.jamBukaOperasional,
      jamTutupOperasional: body.jamTutupOperasional,
      jamBukaLibur: body.jamBukaLibur,
      jamTutupLibur: body.jamTutupLibur,
    },
    select: {
      name: true,
      specialist: true,
      jadwal: true,
      jadwalLibur: true,
      jamBukaOperasional: true,
      jamTutupOperasional: true,
      jamBukaLibur: true,
      jamTutupLibur: true,
    }
  });

  return {
    success: true,
    message: "Sukses menambahkan dokter tenaga medis",
    data: created,
  };
}