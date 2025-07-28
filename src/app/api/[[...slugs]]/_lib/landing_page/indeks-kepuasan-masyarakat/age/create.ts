import { Context } from "elysia";
import prisma from "@/lib/prisma";

export const ageStatCreate = async (context: Context) => {
  const body = (await context.body) as {
    group: string;
    count: number;
    monthlyStatId: string;
  };

  try {
    const created = await prisma.ageStat.create({
      data: {
        group: body.group,
        count: body.count,
        monthlyStatId: body.monthlyStatId,
      },
    });

    return {
      success: true,
      message: "Age Stat berhasil dibuat",
      data: created,
    };
  } catch (error) {
    console.error("Gagal create age stat:", error);
    return {
      success: false,
      message: "Gagal membuat data age stat",
    };
  }
};
export default ageStatCreate;
