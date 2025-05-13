import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import fs from "fs";

interface ProfilePPIDBody {
  id: string;
  file: Blob & { name: string; type: string };
}

export default async function editImageProfilePPID(context: Context<{ body: ProfilePPIDBody }>) {
  const { id, file } = context.body;

  if (!file || !id) {
    return {
      success: false,
      message: "File atau ID harus disertakan",
    };
  }

  // Validasi ekstensi file
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      message: "Tipe file tidak diizinkan. Hanya JPG, PNG, atau WEBP",
    };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `${id}_${Date.now()}_${file.name}`;
  const filePath = path.resolve("public", "assets", "images", "ppid", "profile-ppid", filename);

  // Simpan file baru
  await writeFile(filePath, buffer);

  const imageUrl = `/assets/images/ppid/profile-ppid/${filename}`;

  // Hapus file lama (opsional, kalau mau bersih)
  const oldData = await prisma.profilePPID.findUnique({ where: { id } });
  if (oldData?.imageUrl) {
    const oldPath = path.resolve("public", oldData.imageUrl.replace(/^\//, ""));
    if (fs.existsSync(oldPath)) {
      await unlink(oldPath).catch(() => {});
    }
  }

  // Update DB
  await prisma.profilePPID.update({
    where: { id },
    data: { imageUrl },
  });

  return {
    success: true,
    message: "Gambar berhasil diunggah",
    url: imageUrl,
  };
}
