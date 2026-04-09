import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = process.env.WIBU_UPLOAD_DIR;

const fileStorageDelete = async (context: Context) => {
  const { params } = context;

  const id = params?.id as string;

  if (!id) {
    return {
      status: 400,
      body: "ID file tidak ditemukan",
    };
  }

  if (!UPLOAD_DIR) {
    return {
      status: 500,
      body: "UPLOAD_DIR belum dikonfigurasi",
    };
  }

  // Cek file dari database
  const file = await prisma.fileStorage.findUnique({
    where: { id },
  });

  if (!file) {
    return {
      status: 404,
      body: "File tidak ditemukan di database",
    };
  }

  const filePath = path.join(file.path, file.name);

  try {
    // Hapus file dari filesystem
    await fs.unlink(filePath);
  } catch (err) {
    console.error("Gagal hapus file:", err);
    // Tetap lanjutkan hapus dari database meskipun file fisik tidak ditemukan
  }

  // Hapus dari database
  await prisma.fileStorage.delete({
    where: { id },
  });

  return {
    message: "File berhasil dihapus",
    deletedId: id,
  };
};

export default fileStorageDelete;
