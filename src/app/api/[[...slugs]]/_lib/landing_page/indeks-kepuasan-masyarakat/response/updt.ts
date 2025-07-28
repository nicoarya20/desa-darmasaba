import { Context } from "elysia";
import prisma from "@/lib/prisma";

export const responseStatUpdate = async (context: Context) => {
  const { id } = context.params as { id: string };
  const body = (await context.body) as {
    label?: string;
    count?: number;
    monthlyStatId?: string;
  };

  try {
    const updated = await prisma.responseStat.update({
      where: { id },
      data: {
        label: body.label,
        count: body.count,
        monthlyStatId: body.monthlyStatId,
      },
    });

    return {
      success: true,
      message: "Data response berhasil diperbarui",
      data: updated,
    };
  } catch (error) {
    console.error("Gagal update Response Stat:", error);
    return {
      success: false,
      message: "Gagal memperbarui data response stat",
    };
  }
};
export default responseStatUpdate;
