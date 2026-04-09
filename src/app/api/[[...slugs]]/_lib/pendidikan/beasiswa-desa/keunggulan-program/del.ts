import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function keunggulanProgramDelete(context: Context) {
  const id = context.params.id as string;

  await prisma.keunggulanProgram.delete({
    where: { id },
  });

  return {
    status: 200,
    success: true,
    message: "Sukses Menghapus keunggulan program",
  };
}
