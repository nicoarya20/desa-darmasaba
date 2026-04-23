import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { nanoid } from "nanoid";
import sharp from "sharp";
import zlib from "zlib";
import minio, { MINIO_BUCKET } from "@/lib/minio";

const fileStorageCreate = async (context: Context) => {
  const body = (await context.body) as {
    name: string;
    file: File;
  };

  const file = body.file;
  const name = body.name;

  if (!file) return { status: 400, body: "No file uploaded" };
  if (!name) return { status: 400, body: "No name provided" };

  const isImage = file.type.startsWith("image/");
  const isAudio = file.type.startsWith("audio/");
  const category = isImage ? "image" : isAudio ? "audio" : "document";

  const pathName = category === "image" ? "image" : category === "audio" ? "audio" : "document";

  // Convert File ke Buffer
  const buffer = Buffer.from(await file.arrayBuffer());
  let finalName = nanoid();
  let finalMimeType = file.type;

  if (isImage) {
    // Simpan sebagai WebP untuk kompresi maksimal
    const desktopBuffer = await sharp(buffer)
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const desktopName = `${finalName}-desktop.webp`;

    // Upload to MinIO
    await minio.putObject(MINIO_BUCKET, `${pathName}/${desktopName}`, desktopBuffer, desktopBuffer.length, {
      "Content-Type": "image/webp",
    });

    // Simpan metadata untuk versi desktop sebagai default
    finalName = desktopName;
    finalMimeType = "image/webp";
  } else if (isAudio) {
    // Simpan file audio tanpa kompresi
    const ext = file.name.split(".").pop() || "mp3";
    finalName = `${finalName}.${ext}`;
    await minio.putObject(MINIO_BUCKET, `${pathName}/${finalName}`, buffer, buffer.length, {
      "Content-Type": finalMimeType,
    });
  } else {
    // Jika file adalah PDF, simpan tanpa kompresi
    if (file.type === "application/pdf") {
      await minio.putObject(MINIO_BUCKET, `${pathName}/${finalName}`, buffer, buffer.length, {
        "Content-Type": finalMimeType,
      });
    }
    // Jika file lain, kompres dengan gzip
    else {
      const gzBuffer = zlib.gzipSync(buffer);
      const compressedName = `${finalName}.gz`;
      await minio.putObject(MINIO_BUCKET, `${pathName}/${compressedName}`, gzBuffer, gzBuffer.length, {
        "Content-Type": "application/gzip",
      });
      finalName = compressedName;
      finalMimeType = "application/gzip";
    }
  }

  const data = await prisma.fileStorage.create({
    data: {
      name: finalName,
      realName: file.name,
      path: pathName,
      mimeType: finalMimeType,
      category,
      link: category === "image" ? `/api/img/${finalName}` : `/api/fileStorage/findUnique/${finalName}`,
    },
  });

  return { data };
};

export default fileStorageCreate;
