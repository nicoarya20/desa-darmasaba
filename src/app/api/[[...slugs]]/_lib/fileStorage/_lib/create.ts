import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { nanoid } from "nanoid";
import zlib from "zlib";
import minio, { MINIO_BUCKET } from "@/lib/minio";
import { PDF_MAX_SIZE_BYTES, PDF_TOO_LARGE_MESSAGE } from "@/lib/pdf-upload.limits";
import { storeImageAsWebp } from "./storeImage";

const fileStorageCreate = async (context: Context) => {
  const body = (await context.body) as {
    name: string;
    file: File;
  };

  const file = body.file;
  const name = body.name;

  if (!file) return { status: 400, body: "No file uploaded" };
  if (!name) return { status: 400, body: "No name provided" };

  // Tolak PDF terlalu besar sebelum dibaca ke memori (file.size sudah diketahui dari multipart).
  if (file.type === "application/pdf" && file.size > PDF_MAX_SIZE_BYTES) {
    context.set.status = 413;
    return { success: false, message: PDF_TOO_LARGE_MESSAGE };
  }

  const isImage = file.type.startsWith("image/");
  const isAudio = file.type.startsWith("audio/");
  const category = isImage ? "image" : isAudio ? "audio" : "document";

  const pathName = category === "image" ? "image" : category === "audio" ? "audio" : "document";

  if (isImage) {
    // Simpan sebagai WebP (logika di-share dengan upload publik pengaduan).
    const data = await storeImageAsWebp(file);
    return { data };
  }

  // Convert File ke Buffer (audio/dokumen)
  const buffer = Buffer.from(await file.arrayBuffer());
  let finalName = nanoid();
  let finalMimeType = file.type;

  if (isAudio) {
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
      // Ukuran asli (sebelum gzip) = ukuran yang diterima pengguna saat unduh/ZIP.
      size: file.size,
      category,
      link: category === "image" ? `/api/img/${finalName}` : `/api/fileStorage/findUnique/${finalName}`,
    },
  });

  return { data };
};

export default fileStorageCreate;
