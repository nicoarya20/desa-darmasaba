import prisma from "@/lib/prisma";
import { Context } from "elysia";
import minio, { MINIO_BUCKET } from "@/lib/minio";
import { parseRangeHeader } from "./parseRange";

const fileStorageFindUnique = async (context: Context) => {
  const { name } = context.params;

  const data = await prisma.fileStorage.findUnique({ where: { name } });

  if (!data) {
    context.set.status = "Not Found";
    return { status: 404, message: "File not found" };
  }

  const objectPath = `${data.path}/${data.name}`;

  try {
    // Range request dipakai browser untuk seek audio/video (mis. drag slider
    // durasi musik). Tanpa dukungan ini, audio.currentTime tidak bisa lompat
    // ke posisi yang belum ter-buffer — browser diam-diam mengabaikan seek.
    const rangeHeader = context.headers.range;

    if (rangeHeader) {
      const stat = await minio.statObject(MINIO_BUCKET, objectPath);
      const parsed = parseRangeHeader(rangeHeader, stat.size);

      if (parsed) {
        const { start, end, chunkSize } = parsed;
        const stream = await minio.getPartialObject(MINIO_BUCKET, objectPath, start, chunkSize);
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
          chunks.push(Buffer.from(chunk));
        }
        const file = Buffer.concat(chunks);

        context.set.status = 206;
        context.set.headers = {
          "Content-Type": data.mimeType,
          "Content-Length": String(chunkSize),
          "Content-Range": `bytes ${start}-${end}/${stat.size}`,
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=600",
        };

        return file;
      }
      // Header Range ada tapi tidak bisa di-parse — lanjut ke full response di bawah.
    }

    const stream = await minio.getObject(MINIO_BUCKET, objectPath);
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const file = Buffer.concat(chunks);

    context.set.headers = {
      "Content-Type": data.mimeType,
      "Content-Length": String(file.length),
      // Wajib ada supaya browser tahu resource ini bisa di-seek via Range request.
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=600",
    };

    return file;
  } catch {
    context.set.status = "Not Found";
    return { status: 404, message: "File not found in storage" };
  }
};

export default fileStorageFindUnique;
