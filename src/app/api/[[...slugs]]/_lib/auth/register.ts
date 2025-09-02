import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Context } from "elysia";

interface RegisterBody {
  nama: string;
  email: string;
  password: string;
}

export default async function userRegister(context: Context) {
  try {
    const body = (await context.body) as RegisterBody;

    // Validasi input
    if (!body.nama || !body.email || !body.password) {
      context.set.status = 400;
      return {
        success: false,
        message: "Semua field harus diisi",
        data: null
      };
    }

    // Cek email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      context.set.status = 400;
      return {
        success: false,
        message: "Email sudah terdaftar",
        data: null
      };
    }

    // Dapatkan role warga
    const role = await prisma.role.findFirst({ 
      where: { name: "warga" } 
    });

    if (!role) {
      context.set.status = 500;
      return {
        success: false,
        message: "Role warga tidak ditemukan",
        data: null
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Buat user baru
    const user = await prisma.user.create({
      data: {
        nama: body.nama,
        email: body.email,
        password: hashedPassword,
        roleId: role.id,
      },
      select: {
        id: true,
        nama: true,
        email: true,
        roleId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return {
      success: true,
      message: "Berhasil mendaftar",
      data: user,
    };
  } catch (error) {
    console.error("Registration error:", error);
    context.set.status = 500;
    return {
      success: false,
      message: "Terjadi kesalahan saat mendaftar",
      data: null
    };
  }
}
