import { Context } from "elysia";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ENV atau secret key untuk token
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key"; // ganti di env production

type LoginForm = {
  email: string;
  password: string;
};

export default async function userLogin(context: Context) {
  const body = (await context.body) as LoginForm;

  try {
    // 1. Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email: body.email },
      include: { role: true }, // include role untuk otorisasi
    });

    // 2. Jika tidak ada user
    if (!user) {
      return {
        success: false,
        message: "Email tidak ditemukan",
      };
    }

    // 3. Cek apakah user aktif
    if (!user.isActive) {
      return {
        success: false,
        message: "Akun tidak aktif",
      };
    }

    // 4. Verifikasi password
    const isMatch = await bcrypt.compare(body.password, user.password);
    if (!isMatch) {
      return {
        success: false,
        message: "Password salah",
      };
    }

    // 5. Buat JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role.name,
      },
      JWT_SECRET,
      { expiresIn: "7d" } // expire 7 hari
    );

    // 6. Kirim response
    return {
      success: true,
      message: "Login berhasil",
      data: {
        user: {
          id: user.id,
          nama: user.nama,
          email: user.email,
          role: user.role.name,
        },
        token,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat login",
    };
  }
}
