import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { nanoid } from "nanoid";
import sharp from "sharp";
import minio, { MINIO_BUCKET } from "@/lib/minio";

const fileStorageCreate = async (context: Context) => {
  const body = (await context.body) as { name: string; file: File };

  const file = body.file;
  const name = body.name;

  if (!file) return { status: 400, body: "No file uploaded" };
  if (!name) return { status: 400, body: "No name provided" };

  const isImage = file.type.startsWith("image/");
  const isAudio = file.type.startsWith("audio/");
  const category = isImage ? "image" : isAudio ? "audio" : "document";
  const prefix = category === "image" ? "image" : category === "audio" ? "audio" : "documents";

  const buffer = Buffer.from(await file.arrayBuffer());
  let finalName = nanoid();
  let finalMimeType = file.type;

  if (isImage) {
    const mobileBuffer = await sharp(buffer)
      .resize({ width: 720 })
      .webp({ quality: 80 })
      .toBuffer();

    const desktopBuffer = await sharp(buffer)
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const mobileName = `${finalName}-mobile.webp`;
    const desktopName = `${finalName}-desktop.webp`;

    await minio.putObject(MINIO_BUCKET, `${prefix}/${mobileName}`, mobileBuffer, mobileBuffer.length, { "Content-Type": "image/webp" });
    await minio.putObject(MINIO_BUCKET, `${prefix}/${desktopName}`, desktopBuffer, desktopBuffer.length, { "Content-Type": "image/webp" });

    finalName = desktopName;
    finalMimeType = "image/webp";
  } else if (isAudio) {
    const ext = file.name.split(".").pop() || "mp3";
    finalName = `${finalName}.${ext}`;
    await minio.putObject(MINIO_BUCKET, `${prefix}/${finalName}`, buffer, buffer.length, { "Content-Type": file.type });
  } else {
    const ext = file.name.split(".").pop() || "bin";
    finalName = `${finalName}.${ext}`;
    await minio.putObject(MINIO_BUCKET, `${prefix}/${finalName}`, buffer, buffer.length, { "Content-Type": file.type });
  }

  const data = await prisma.fileStorage.create({
    data: {
      name: finalName,
      realName: file.name,
      path: prefix,
      mimeType: finalMimeType,
      category,
      link: isImage ? `/api/img/${finalName}` : `/api/fileStorage/findUnique/${finalName}`,
    },
  });

  return { data };
};

export default fileStorageCreate;
