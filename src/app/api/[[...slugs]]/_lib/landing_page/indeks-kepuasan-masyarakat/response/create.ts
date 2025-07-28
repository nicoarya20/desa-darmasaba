import { Context } from "elysia";
import prisma from "@/lib/prisma";

export const responseStatCreate = async (context: Context) => {
  const body = (await context.body) as {
    label: string;
    count: number;
    monthlyStatId: string;
  };

  try {
    const created = await prisma.responseStat.create({
      data: {
        label: body.label,
        count: body.count,
        monthlyStatId: body.monthlyStatId,
      },
    });

    return {
      success: true,
      message: "Response Stat berhasil dibuat",
      data: created,
    };
  } catch (error) {
    console.error("Gagal create response stat:", error);
    return {
      success: false,
      message: "Gagal membuat data response stat",
    };
  }
};
export default responseStatCreate;
