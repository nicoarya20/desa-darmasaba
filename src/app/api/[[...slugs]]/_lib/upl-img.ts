import path from "path";
import fs from "fs/promises";
import { nanoid } from "nanoid";

async function uplImg({
  files,
  UPLOAD_DIR_IMAGE,
}: {
  files: File[];
  UPLOAD_DIR_IMAGE: string;
}) {
  // Validasi input
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error("Tidak ada file yang diunggah");
  }

  for (const file of files) {
    let fileName = file.name;

    // Validasi nama file
    if (!fileName || typeof fileName !== "string" || fileName.trim() === "") {
      console.warn(`Nama file tidak valid: ${fileName}`);
      fileName = nanoid() + ".jpg";
    }

    // Sanitasi nama file untuk mencegah path traversal
    const sanitizedFileName = sanitizeFileName(fileName);

    try {
      // Konversi file ke buffer
      const buffer = Buffer.from(await file.arrayBuffer());

      // Tulis file ke direktori uploads
      const filePath = path.join(UPLOAD_DIR_IMAGE, sanitizedFileName);
      await fs.writeFile(filePath, buffer);

      console.log(`File berhasil diunggah: ${sanitizedFileName}`);
    } catch (error) {
      console.error(`Gagal mengunggah file ${fileName}:`, error);
      throw new Error(`Gagal mengunggah file: ${fileName}`);
    }
  }

  return "ok";
}

// Fungsi untuk membersihkan nama file dari karakter yang tidak aman
function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export default uplImg;
