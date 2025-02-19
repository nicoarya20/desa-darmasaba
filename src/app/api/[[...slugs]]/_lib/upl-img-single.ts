import { nanoid } from "nanoid";
import fs from "fs/promises";
import path from "path";
import _ from "lodash";

export async function uplImgSingle({
  fileName,
  file,
  UPLOAD_DIR_IMAGE,
}: {
  fileName: string;
  file: File;
  UPLOAD_DIR_IMAGE: string;
}) {
  if (!fileName || typeof fileName !== "string" || fileName.trim() === "") {
    console.warn(`Nama file tidak valid: ${fileName}`);
    fileName = nanoid() + ".jpg";
  }
  const ext = path.extname(fileName).toLowerCase();
  const fileNameWithoutExt = path.basename(fileName, ext);
  const fileNameKebabCase = _.kebabCase(fileNameWithoutExt) + ext;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(UPLOAD_DIR_IMAGE, fileNameKebabCase);
    await fs.writeFile(filePath, buffer);
    return filePath;
  } catch (error) {
    console.log(error);
    return "error";
  }
}
