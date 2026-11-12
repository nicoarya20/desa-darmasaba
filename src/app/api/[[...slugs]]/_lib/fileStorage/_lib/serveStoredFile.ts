import { Context } from "elysia";
import minio, { MINIO_BUCKET } from "@/lib/minio";
import { parseRangeHeader } from "./parseRange";

/** Data berkas yang dibutuhkan untuk mengalirkan isinya dari MinIO. */
export type ServableFile = { path: string; name: string; mimeType: string };

/** Cache publik default (berkas aktif); pratinjau Sampah memakai `private, no-store`. */
export const PUBLIC_FILE_CACHE = "public, max-age=3600, stale-while-revalidate=600";

async function readAll(stream: AsyncIterable<Buffer | Uint8Array | string>): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

/** Kirim isi berkas MinIO (mendukung Range untuk seek audio/video); objek tidak ada → 404. */
export async function serveStoredFile(context: Context, data: ServableFile, cacheControl: string = PUBLIC_FILE_CACHE) {
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
        const file = await readAll(await minio.getPartialObject(MINIO_BUCKET, objectPath, start, chunkSize));

        context.set.status = 206;
        context.set.headers = {
          "Content-Type": data.mimeType,
          "Content-Length": String(chunkSize),
          "Content-Range": `bytes ${start}-${end}/${stat.size}`,
          "Accept-Ranges": "bytes",
          "Cache-Control": cacheControl,
        };

        return file;
      }
      // Header Range ada tapi tidak bisa di-parse — lanjut ke full response di bawah.
    }

    const file = await readAll(await minio.getObject(MINIO_BUCKET, objectPath));

    context.set.headers = {
      "Content-Type": data.mimeType,
      "Content-Length": String(file.length),
      // Wajib ada supaya browser tahu resource ini bisa di-seek via Range request.
      "Accept-Ranges": "bytes",
      "Cache-Control": cacheControl,
    };

    return file;
  } catch (error) {
    console.error(`[serveStoredFile] Gagal membaca objek MinIO ${objectPath}:`, error);
    context.set.status = "Not Found";
    return { status: 404, message: "File not found in storage" };
  }
}
