import { Context } from "elysia";
import prisma from "@/lib/prisma";

export const genderStatUpdate = async (context: Context) => {
  const { id } = context.params as { id: string };
  const body = (await context.body) as {
    laki?: number;
    perempuan?: number;
    monthlyStatId?: string;
  };

  const total = (body.laki ?? 0) + (body.perempuan ?? 0);
  const percentLaki = total > 0 ? Number(((body.laki ?? 0) / total) * 100).toFixed(2) : 0;
  const percentPerempuan = total > 0 ? Number(((body.perempuan ?? 0) / total) * 100).toFixed(2) : 0;

  try {
    const updated = await prisma.genderStat.update({
      where: { id },
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
      message: "Data gender berhasil diperbarui",
      data: updated,
    };
  } catch (error) {
    console.error("Gagal update Gender Stat:", error);
    return {
      success: false,
      message: "Gagal memperbarui data gender stat",
    };
  }
};
export default genderStatUpdate;
