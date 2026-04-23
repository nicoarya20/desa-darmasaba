import { nanoid } from "nanoid";
import minio, { MINIO_BUCKET } from "@/lib/minio";

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

    const sanitized = sanitizeFileName(fileName);
    const objectName = `image/${sanitized}`;

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      await minio.putObject(MINIO_BUCKET, objectName, buffer, buffer.length, {
        "Content-Type": file.type || "image/jpeg",
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
