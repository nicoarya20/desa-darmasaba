import path from "path";
import fs from "fs/promises";
import sharp from "sharp";
import minio, { MINIO_BUCKET } from "@/lib/minio";

/**
 * Cache gambar yang berhasil dibaca. Nama berkas selalu unik (`nanoid()` di semua jalur unggah) dan tidak pernah
 * ditimpa, jadi isinya tak berubah: browser boleh menyimpan setahun (`immutable`). Cloudflare (tepi) sengaja hanya
 * sehari (`s-maxage`) supaya gambar yang dihapus admin tidak bertahan lama di tepi. Juknis lomba 5.4: audit
 * "cache lifetimes" menandai 1,4-1,8 MB gambar yang masa cache-nya hanya 1-4 jam. Jawaban cadangan (no-image) TIDAK
 * memakai ini: bisa muncul karena galat MinIO sesaat, jadi tak boleh tersimpan lama.
 */
export const IMAGE_CACHE_CONTROL = "public, max-age=31536000, s-maxage=86400, immutable";

/** Jawaban cadangan (no-image): tidak disimpan di Cloudflare maupun browser, agar galat sesaat tak menempel berjam-jam. */
export const IMAGE_FALLBACK_CACHE_CONTROL = "no-store";

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
      headers: { "Content-Type": "image/jpeg", "Cache-Control": IMAGE_FALLBACK_CACHE_CONTROL },
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
        "Cache-Control": IMAGE_CACHE_CONTROL,
        "Content-Type": responseContentType,
      },
    });
  } catch (error) {
    console.error(`Gagal mengambil file dari MinIO: ${name}`, error);
    const buffer = await fs.readFile(noImage);
    return new Response(new Uint8Array(buffer), {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": IMAGE_FALLBACK_CACHE_CONTROL },
    });
  }
}

export default img;
