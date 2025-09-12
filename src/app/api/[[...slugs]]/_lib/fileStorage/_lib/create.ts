import prisma from "@/lib/prisma";
import { Context } from "elysia";
import fs from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import sharp from "sharp";
import zlib from "zlib";

const UPLOAD_DIR = process.env.WIBU_UPLOAD_DIR;

const fileStorageCreate = async (context: Context) => {
  const body = (await context.body) as {
    name: string;
    file: File;
  };

  const file = body.file;
  const name = body.name;

  if (!file) return { status: 400, body: "No file uploaded" };
  if (!name) return { status: 400, body: "No name provided" };
  if (!UPLOAD_DIR) return { status: 500, body: "UPLOAD_DIR is not defined" };

  const isImage = file.type.startsWith("image/");
  const category = isImage ? "image" : "document";

  const pathName = category === "image" ? "images" : "documents";
  const rootPath = path.join(UPLOAD_DIR, pathName);
  await fs.mkdir(rootPath, { recursive: true });

  // Convert File ke Buffer
  const buffer = Buffer.from(await file.arrayBuffer());
  let finalName = nanoid();
  let finalMimeType = file.type;

  if (isImage) {
    // Simpan sebagai WebP untuk kompresi maksimal
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

    await fs.writeFile(path.join(rootPath, mobileName), mobileBuffer);
    await fs.writeFile(path.join(rootPath, desktopName), desktopBuffer);

    // Simpan metadata untuk versi desktop sebagai default
    finalName = desktopName;
    finalMimeType = "image/webp";
  } else {
    // Kompres dokumen (opsional pakai gzip)
    const gzBuffer = zlib.gzipSync(buffer);
    const docName = `${finalName}.gz`;

    await fs.writeFile(path.join(rootPath, docName), gzBuffer);

    finalName = docName;
    finalMimeType = "application/gzip";
  }

  const data = await prisma.fileStorage.create({
    data: {
      name: finalName,
      realName: file.name,
      path: rootPath,
      mimeType: finalMimeType,
      category,
      link: `/api/fileStorage/findUnique/${finalName}`,
    },
  });

  return { data };
};

export default fileStorageCreate;
