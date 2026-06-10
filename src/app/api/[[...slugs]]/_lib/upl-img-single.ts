import { nanoid } from "nanoid";
import path from "path";
import _ from "lodash";
import minio, { MINIO_BUCKET } from "@/lib/minio";

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp"]);
const ALLOWED_MIMES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

export async function uplImgSingle({
  fileName,
  file,
}: {
  fileName: string;
  file: File;
}) {
  if (!fileName || typeof fileName !== "string" || fileName.trim() === "") {
    console.warn(`Nama file tidak valid: ${fileName}`);
    fileName = nanoid() + ".jpg";
  }

  const ext = path.extname(fileName).replace(".", "").toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error(`Ekstensi file tidak diizinkan: .${ext}`);
  }

  const mime = (file.type || "").toLowerCase();
  if (!ALLOWED_MIMES.has(mime)) {
    throw new Error(`Tipe file tidak diizinkan: ${mime}`);
  }

  const fileNameWithoutExt = path.basename(fileName, `.${ext}`);
  const fileNameKebabCase = _.kebabCase(fileNameWithoutExt) + `.${ext}`;
  const objectName = `image/${fileNameKebabCase}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await minio.putObject(MINIO_BUCKET, objectName, buffer, buffer.length, {
      "Content-Type": mime,
    });
    return objectName;
  } catch (error) {
    console.error(`Gagal mengunggah file ${fileName}:`, error);
    throw new Error(`Gagal mengunggah file: ${fileName}`);
  }
}
