import path from "path";
import fs from "fs/promises";
import sharp from "sharp";
import minio, { MINIO_BUCKET } from "@/lib/minio";
import { pickImageFormat } from "./img.format";

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
  accept,
}: {
  name: string;
  ROOT: string;
  size?: number;
  accept?: string;
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

  try {
    const stream = await minio.getObject(MINIO_BUCKET, `image/${name}`);
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    const { transcodeToJpeg, contentType: negotiatedType } = pickImageFormat(ext, accept);
    const contentType = negotiatedType ?? mimeType;

    let output: Buffer;
    if (transcodeToJpeg && size) {
      output = await sharp(buffer).resize(size).jpeg({ quality: 82 }).toBuffer();
    } else if (transcodeToJpeg) {
      output = await sharp(buffer).jpeg({ quality: 82 }).toBuffer();
    } else if (size) {
      output = await sharp(buffer).resize(size).toBuffer();
    } else {
      output = buffer;
    }

    return new Response(new Uint8Array(output), {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=600",
        "Content-Type": contentType,
        "Vary": "Accept",
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
