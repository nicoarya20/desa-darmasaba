import path from "path";
import fs from "fs/promises";
import sharp from "sharp";
import minio, { MINIO_BUCKET } from "@/lib/minio";

const MIME_MAP: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
};

async function img({
  name,
  ROOT,
  size,
}: {
  name: string;
  ROOT: string;
  size?: number;
}) {
  const noImage = path.join(ROOT, "public/no-image.jpg");
  const ext = path.extname(name).toLowerCase();
  const contentType = MIME_MAP[ext];

  if (!contentType) {
    console.warn(`Ekstensi file tidak didukung: ${ext}`);
    const buffer = await fs.readFile(noImage);
    return new Response(new Uint8Array(buffer), {
      headers: { "Content-Type": "image/jpeg" },
    });
  }

  try {
    const stream = await minio.getObject(MINIO_BUCKET, `image/${name}`);
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    let resized: Buffer;
    if (size) {
      resized = await sharp(buffer).resize(size).toBuffer();
    } else {
      resized = buffer;
    }

    return new Response(new Uint8Array(resized), {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=600",
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    console.error(`Gagal mengambil file dari MinIO: ${name}`, error);
    const buffer = await fs.readFile(noImage);
    return new Response(new Uint8Array(buffer), {
      headers: { "Content-Type": "image/jpeg" },
    });
  }
}

export default img;
