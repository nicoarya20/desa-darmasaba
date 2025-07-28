import { Context } from "elysia";
import prisma from "@/lib/prisma";

export const ageStatUpdate = async (context: Context) => {
  const { id } = context.params as { id: string };
  const body = (await context.body) as {
    group?: string;
    count?: number;
    monthlyStatId?: string;
  };

  try {
    const updated = await prisma.ageStat.update({
      where: { id },
      data: {
        group: body.group,
        count: body.count,
        monthlyStatId: body.monthlyStatId,
      },
    });

    return {
      success: true,
      message: "Data age berhasil diperbarui",
      data: updated,
    };
  } catch (error) {
    console.error("Gagal update Age Stat:", error);
    return {
      success: false,
      message: "Gagal memperbarui data age stat",
    };
  }
};
export default ageStatUpdate;
