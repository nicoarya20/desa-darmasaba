import prisma from "@/lib/prisma";
import { Context } from "elysia";
import fs from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";

const UPLOAD_DIR = process.env.WIBU_UPLOAD_DIR;

const fileStorageCreate = async (context: Context) => {
  const body = (await context.body) as {
    name: string;
    file: File;
  };
  const file = body.file;
  const name = body.name;

  if (!file) {
    return {
      status: 400,
      body: "No file uploaded",
    };
  }

  if (!name) {
    return {
      status: 400,
      body: "No name provided",
    };
  }

  if (!UPLOAD_DIR) {
    return {
      status: 500,
      body: "UPLOAD_DIR is not defined",
    };
  }
  const pathName = "desa/ppid/profile-ppid";
  const rootPath = path.join(UPLOAD_DIR, pathName);
  await fs.mkdir(rootPath, { recursive: true });

  const ext = file.name.split(".").pop();
  const newName = nanoid() + "." + ext;

  const data = await prisma.fileStorage.create({
    data: {
      name: newName,
      path: rootPath,
      mimeType: file.type,
      link: `/api/fileStorage/findUnique/${newName}`,
    },
  });

  await fs.writeFile(
    path.join(rootPath, newName),
    Buffer.from(await file.arrayBuffer())
  );

  return {
    data,
  };
};

export default fileStorageCreate;
