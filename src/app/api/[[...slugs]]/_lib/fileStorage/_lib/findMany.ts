import prisma from "@/lib/prisma";
import { Context } from "elysia";

export const fileStorageFindMany = async (context: Context) => {
  const category = context.query?.category as string | undefined;

  const data = await prisma.fileStorage.findMany({
    where: category ? { category } : {},
  });

  return { data };
};
