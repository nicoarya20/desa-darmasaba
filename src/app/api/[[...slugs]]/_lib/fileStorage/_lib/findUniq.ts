import prisma from "@/lib/prisma";
import { Context } from "elysia";
import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = process.env.WIBU_UPLOAD_DIR;

const fileStorageFindUnique = async (context: Context) => {
  const { name } = context.params;

  const data = await prisma.fileStorage.findUnique({
    where: {
      name,
    },
  });

  if (!data) {
    context.set.status = "No Content";
    return {
      status: 404,
      message: "File not found",
    };
  }

  if (!UPLOAD_DIR) {
    context.set.status = "Internal Server Error";
    return {
      status: 500,
      message: "UPLOAD_DIR is not defined",
    };
  }

  console.log(data);

  const file = await fs.readFile(path.join(UPLOAD_DIR, data.path, data.name));
  context.set.headers = {
    "Content-Type": data.mimeType,
    "Content-Length": file.length,
  };

  return file;
};

export default fileStorageFindUnique;
