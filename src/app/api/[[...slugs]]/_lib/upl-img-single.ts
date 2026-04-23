import { nanoid } from "nanoid";
import path from "path";
import _ from "lodash";
import minio, { MINIO_BUCKET } from "@/lib/minio";

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

  const ext = path.extname(fileName).toLowerCase();
  const fileNameWithoutExt = path.basename(fileName, ext);
  const fileNameKebabCase = _.kebabCase(fileNameWithoutExt) + ext;
  const objectName = `image/${fileNameKebabCase}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await minio.putObject(MINIO_BUCKET, objectName, buffer, buffer.length, {
      "Content-Type": file.type || "image/jpeg",
    });
    return objectName;
  } catch (error) {
    console.log(error);
    return "error";
  }
}
