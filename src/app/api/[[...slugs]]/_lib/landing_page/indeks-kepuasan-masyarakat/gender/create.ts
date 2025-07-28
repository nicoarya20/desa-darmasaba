import { Context } from "elysia";
import prisma from "@/lib/prisma";

export const genderStatCreate = async (context: Context) => {
  const body = (await context.body) as {
    laki: number;
    perempuan: number;
    monthlyStatId: string;
  };

  const total = body.laki + body.perempuan;
  const percentLaki = total > 0 ? Number(((body.laki / total) * 100).toFixed(2)) : 0;
const percentPerempuan = total > 0 ? Number(((body.perempuan / total) * 100).toFixed(2)) : 0;

  try {
    const created = await prisma.genderStat.create({
    data: {
      laki: body.laki,
      perempuan: body.perempuan,
      total,
      percentLaki: Number(percentLaki),
      percentPerempuan: Number(percentPerempuan),
      monthlyStatId: body.monthlyStatId,
    },
  });

    return {
      success: true,
      message: "Gender Stat berhasil dibuat",
      data: created,
    };
  } catch (error) {
    console.error("Gagal create gender stat:", error);
    return {
      success: false,
      message: "Gagal membuat data gender stat",
    };
  }
};
export default genderStatCreate;
