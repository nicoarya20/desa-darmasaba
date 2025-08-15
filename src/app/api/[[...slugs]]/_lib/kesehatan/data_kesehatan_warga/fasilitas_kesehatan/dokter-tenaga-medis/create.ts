import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
  name: string;
  specialist: string;
  jadwal: string;
};

export default async function dokterTenagaMedisCreate(context: Context) {
  const body = context.body as FormCreate;

  const created = await prisma.dokterdanTenagaMedis.create({
    data: {
      name: body.name,
      specialist: body.specialist,
      jadwal: body.jadwal,
    },
    select: {
      name: true,
      specialist: true,
      jadwal: true,
    }
  });

  return {
    success: true,
    message: "Success create dokter tenaga medis",
    data: created,
  };
}