import prisma from "@/lib/prisma";
import { PENGUMUMAN_DETAIL_INCLUDE } from "@/lib/pengumuman-lampiran";
import { Context } from "elysia";

const pengumumanFindById = async (context: Context) => {
  const id = context.params?.id as string;

  if (!id) {
    return {
      status: 400,
      body: "ID tidak diberikan",
    };
  }

  const pengumuman = await prisma.pengumuman.findUnique({
    where: { id },
    include: PENGUMUMAN_DETAIL_INCLUDE,
  });

  if (!pengumuman) {
    return {
      status: 404,
      body: "Pengumuman tidak ditemukan",
    };
  }

  return {
    status: 200,
    success: true,
    message: "Success fetch pengumuman by ID",
    data: pengumuman,
  };
};

export default pengumumanFindById;

