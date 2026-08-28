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
  format,
}: {
  name: string;
  ROOT: string;
  size?: number;
  format?: string;
}) {
  const noImage = path.join(ROOT, "public/no-image.jpg");
  const ext = path.extname(name).toLowerCase();
  const mimeType = MIME_MAP[ext];

  if (!mimeType) {
    console.warn(`Ekstensi file tidak didukung: ${ext}`);
    const buffer = await fs.readFile(noImage);
    return new Response(new Uint8Array(buffer), {
      headers: { "Content-Type": "image/jpeg" },
    });
  }

  // Safari lama (pra-Safari 14) tidak bisa decode WebP sama sekali — beda
  // dari masalah retry SSL/QUIC (lihat imageErrorRetry.ts), ini kegagalan
  // yang deterministic. Browser lawas mendeteksi sendiri ketidakmampuannya
  // (feature-detect via canvas, lihat supportsWebp() di imageErrorRetry.ts)
  // lalu minta ulang dengan ?format=jpeg. Opt-in murni lewat query param —
  // browser modern tidak pernah kirim param ini, jadi tidak ada perubahan
  // perilaku/performa buat mereka.
  const convertToJpeg = format === "jpeg" && ext === ".webp";

  try {
    const stream = await minio.getObject(MINIO_BUCKET, `image/${name}`);
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    let output: Buffer;
    let responseContentType = mimeType;

    if (convertToJpeg) {
      let pipeline = sharp(buffer);
      if (size) pipeline = pipeline.resize(size);
      const metadata = await pipeline.metadata();
      if (metadata.hasAlpha) {
        output = await pipeline.png().toBuffer();
        responseContentType = "image/png";
      } else {
        output = await pipeline.jpeg({ quality: 82 }).toBuffer();
        responseContentType = "image/jpeg";
      }
    } else if (size) {
      output = await sharp(buffer).resize(size).toBuffer();
    } else {
      output = buffer;
    }

    return new Response(new Uint8Array(output), {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=600",
        "Content-Type": responseContentType,
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
