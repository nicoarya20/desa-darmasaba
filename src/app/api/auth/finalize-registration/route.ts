// app/api/auth/finalize-registration/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sessionCreate } from "../_lib/session_create";

export async function POST(req: Request) {
  try {
    const { nomor, username, kodeId, roleId } = await req.json();

    // Validasi input
    if (!nomor || !username || !kodeId) {
      return NextResponse.json(
        { success: false, message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // Verifikasi OTP
    const otpRecord = await prisma.kodeOtp.findUnique({
      where: { id: kodeId },
    });

    if (!otpRecord?.isActive || otpRecord.nomor !== nomor) {
      return NextResponse.json(
        { success: false, message: "OTP tidak valid" },
        { status: 400 }
      );
    }

    // Cek apakah username sudah dipakai
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Username sudah digunakan" },
        { status: 400 }
      );
    }

    // Buat user baru
    const newUser = await prisma.user.create({
      data: {
        username,
        nomor,
        roleId: roleId || "1", // Default role
        isActive: false, // Menunggu approval
      },
    });

    // Nonaktifkan OTP
    await prisma.kodeOtp.update({
      where: { id: kodeId },
      data: { isActive: false },
    });

    // ✅ CREATE SESSION (JWT + Database)
    try {
      await sessionCreate({
        sessionKey: process.env.BASE_SESSION_KEY!,
        jwtSecret: process.env.BASE_TOKEN_KEY!,
        exp: "30 day",
        user: {
          id: newUser.id,
          nomor: newUser.nomor,
          username: newUser.username,
          roleId: newUser.roleId,
          isActive: false, // User baru belum aktif
        },
      });
    } catch (sessionError) {
      console.error("❌ Error creating session:", sessionError);
      return NextResponse.json(
        { success: false, message: "Gagal membuat session" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Registrasi berhasil. Menunggu persetujuan admin.",
      user: {
        id: newUser.id,
        name: newUser.username,
        roleId: newUser.roleId,
        isActive: false,
      },
    });

  } catch (error) {
    console.error("❌ Finalize Registration Error:", error);
    return NextResponse.json(
      { success: false, message: "Registrasi gagal" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}