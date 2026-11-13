import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { serveStoredFile } from "./serveStoredFile";

/** GET publik isi berkas berdasarkan nama (Range didukung); baris tidak ada → 404. */
const fileStorageFindUnique = async (context: Context) => {
  const { name } = context.params;

  const data = await prisma.fileStorage.findUnique({ where: { name } });

  if (!data) {
    context.set.status = "Not Found";
    return { status: 404, message: "File not found" };
  }

  return serveStoredFile(context, data);
};

export default fileStorageFindUnique;
