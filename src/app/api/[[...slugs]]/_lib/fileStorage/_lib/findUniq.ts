import prisma from "@/lib/prisma";
import { Context } from "elysia";
import fs from "fs/promises";
import path from "path";

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

  console.log(data);

  const file = await fs.readFile(path.join(data.path, data.name));
  context.set.headers = {
    "Content-Type": data.mimeType,
    "Content-Length": file.length,
  };

  return file;
};

export default fileStorageFindUnique;
