import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function programKemiskinanDelete(context: Context) {
  const id = context.params.id as string;

  await prisma.programKemiskinan.delete({
    where: { id },
    include: {
        statistik: true,
    }
  });

  return {
    status: 200,
    success: true,
    message: "Sukses Menghapus program kemiskinan",
  };
}
