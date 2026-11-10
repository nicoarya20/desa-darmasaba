import prisma from "@/lib/prisma";
import { nanoid } from "nanoid";
import sharp from "sharp";
import minio, { MINIO_BUCKET } from "@/lib/minio";

// Simpan File gambar sebagai WebP terkompresi ke MinIO + catat di FileStorage.
// Di-share oleh fileStorage/create (admin) & endpoint upload publik pengaduan
// supaya logika kompresi/penyimpanan tidak terduplikasi (AI-CONTRACT §4).
export async function storeImageAsWebp(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());

  const desktopBuffer = await sharp(buffer)
    // Foto dari kamera HP disimpan dengan piksel mentah (orientasi sensor)
    // + tag EXIF Orientation. sharp tidak auto-baca EXIF ini saat resize, dan
    // .toBuffer() default membuang metadata — tanpa .rotate() (no-arg, auto-
    // orient dari EXIF) hasilnya piksel mentah tersimpan miring permanen.
    .rotate()
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const finalName = `${nanoid()}-desktop.webp`;

  await minio.putObject(
    MINIO_BUCKET,
    `image/${finalName}`,
    desktopBuffer,
    desktopBuffer.length,
    { "Content-Type": "image/webp" },
  );

  return prisma.fileStorage.create({
    data: {
      name: finalName,
      realName: file.name,
      path: "image",
      mimeType: "image/webp",
      size: desktopBuffer.length, // ukuran WebP tersimpan (yang dilayani /api/img)
      category: "image",
      link: `/api/img/${finalName}`,
    },
  });
}
