import path from "path";
import fs from "fs/promises";
import sharp from "sharp";
import minio, { MINIO_BUCKET } from "@/lib/minio";

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

  if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
    console.warn(`Ekstensi file tidak didukung: ${ext}`);
    return new Response(await fs.readFile(noImage), {
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

    const metadata = await sharp(buffer).metadata();
    const resized = await sharp(buffer)
      .resize(size || metadata.width)
      .toBuffer();

    return new Response(resized, {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=600",
        "Content-Type": "image/jpeg",
      },
    });
  } catch (error) {
    console.error(`Gagal mengambil file dari MinIO: ${name}`, error);
    return new Response(await fs.readFile(noImage), {
      headers: { "Content-Type": "image/jpeg" },
    });
  }
}

export default img;
