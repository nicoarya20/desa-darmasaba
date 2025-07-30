import { Context } from "elysia";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

type FormCreateUser = {
  nama: string;
  email: string;
  password: string;
  roleId: string;
  isActive?: boolean;
};

export default async function userCreate(context: Context) {
  const body = (await context.body) as FormCreateUser;

  if (!body.nama || !body.email || !body.password || !body.roleId) {
    throw new Error("Semua field wajib diisi");
  }

  try {
    // Cek apakah email sudah terdaftar
    const existing = await prisma.user.findUnique({
      where: { email: body.email },
    });
    if (existing) {
      throw new Error("Email sudah terdaftar");
    }

    // Hash password sebelum simpan
    const hashedPassword = await bcrypt.hash(body.password, 10);

    const result = await prisma.user.create({
      data: {
        nama: body.nama,
        email: body.email,
        password: hashedPassword,
        roleId: body.roleId,
        isActive: body.isActive ?? true,
      },
    });

    return {
      success: true,
      message: "User berhasil dibuat",
      data: result,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Gagal membuat user: " + (error as Error).message);
  }
}
