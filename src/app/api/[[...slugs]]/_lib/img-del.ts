import fs from "fs/promises";
import path from "path";

async function imgDel({
  name,
  UPLOAD_DIR_IMAGE,
}: {
  name: string;
  UPLOAD_DIR_IMAGE: string;
}) {
  try {
    await fs.unlink(path.join(UPLOAD_DIR_IMAGE, name));
    return "ok";
  } catch (error) {
    console.log(error);
    return "error";
  }
}

export default imgDel;
