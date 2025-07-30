import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Context } from "elysia";

export default async function userRegister(context: Context) {
  const body = (await context.body) as {
    nama: string;
    email: string;
    password: string;
  };

  const existingUser = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (existingUser) {
    return {
      success: false,
      message: "Email sudah terdaftar",
    };
  }

  const role = await prisma.role.findFirst({ where: { name: "warga" } });

  if (!role) throw new Error("Role warga tidak ditemukan");

  const hashedPassword = await bcrypt.hash(body.password, 10);

  const user = await prisma.user.create({
    data: {
      nama: body.nama,
      email: body.email,
      password: hashedPassword,
      roleId: role.id,
    },
  });

  return {
    success: true,
    message: "Berhasil daftar sebagai warga",
    data: user,
  };
}
