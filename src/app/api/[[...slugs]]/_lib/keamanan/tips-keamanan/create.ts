import prisma from "@/lib/prisma";
import type { Context } from "elysia";

type MenuTipsKeamananInput = {
  judul: string;
  deskripsi: string;
  imageId: string;
};

const menuTipsKeamananCreate = async (context: Context) => {
  const { judul, deskripsi, imageId } = await context.body as MenuTipsKeamananInput;

  const createdMenuTipsKeamanan = await prisma.menuTipsKeamanan.create({
    data: {
      judul,
      deskripsi,
      imageId,
    },
    include: {
      image: true,
    },
  });

  return {
    success: true,
    data: createdMenuTipsKeamanan,
  };
};
export default menuTipsKeamananCreate;