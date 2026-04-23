import prisma from "@/lib/prisma";
import { Context } from "elysia";
import minio, { MINIO_BUCKET } from "@/lib/minio";

const fileStorageFindUnique = async (context: Context) => {
  const { name } = context.params;

  const data = await prisma.fileStorage.findUnique({ where: { name } });

  if (!data) {
    context.set.status = "Not Found";
    return { status: 404, message: "File not found" };
  }

  try {
    const stream = await minio.getObject(MINIO_BUCKET, `${data.path}/${data.name}`);
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const file = Buffer.concat(chunks);

    context.set.headers = {
      "Content-Type": data.mimeType,
      "Content-Length": String(file.length),
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=600",
    };

    return file;
  } catch {
    context.set.status = "Not Found";
    return { status: 404, message: "File not found in storage" };
  }
};

export default fileStorageFindUnique;
