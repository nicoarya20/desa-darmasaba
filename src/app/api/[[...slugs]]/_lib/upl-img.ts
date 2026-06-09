import { nanoid } from "nanoid";
import minio, { MINIO_BUCKET } from "@/lib/minio";

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp"]);
const ALLOWED_MIMES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._\-]/g, "_");
}

async function uplImg({ files }: { files: File[] }) {
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error("Tidak ada file yang diunggah");
  }

  for (const file of files) {
    let fileName = file.name;

    if (!fileName || typeof fileName !== "string" || fileName.trim() === "") {
      console.warn(`Nama file tidak valid: ${fileName}`);
      fileName = nanoid() + ".jpg";
    }

    const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      throw new Error(`Ekstensi file tidak diizinkan: .${ext}`);
    }

    const mime = file.type.toLowerCase();
    if (!ALLOWED_MIMES.has(mime)) {
      throw new Error(`Tipe file tidak diizinkan: ${mime}`);
    }

    const sanitized = sanitizeFileName(fileName);
    const objectName = `image/${sanitized}`;

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      await minio.putObject(MINIO_BUCKET, objectName, buffer, buffer.length, {
        "Content-Type": mime,
      });
      console.log(`File berhasil diunggah ke MinIO: ${objectName}`);
    } catch (error) {
      console.error(`Gagal mengunggah file ${fileName}:`, error);
      throw new Error(`Gagal mengunggah file: ${fileName}`);
    }
  }

  return "ok";
}

export default uplImg;
