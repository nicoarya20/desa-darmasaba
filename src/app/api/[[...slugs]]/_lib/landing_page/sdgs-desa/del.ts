import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeReleasedFiles from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeReleasedFiles";

export default async function sdgsDesaDelete(context: Context) {
  const { params } = context;
  const id = params?.id as string;

  if (!id) {
    throw new Error("ID tidak ditemukan dalam parameter");
  }

  const deleted = await prisma.sdgsDesa.delete({
    where: { id },
  });
  await removeReleasedFiles("SdgsDesa", [deleted.imageId]);

  return {
    success: true,
    message: "Berhasil menghapus SDGS Desa",
    data: deleted,
  };
}
