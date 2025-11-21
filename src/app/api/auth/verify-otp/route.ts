// app/api/auth/verify-otp/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sessionCreate } from "../_lib/session_create";

export async function POST(req: Request) {
  try {
    const { nomor, otp, kodeId } = await req.json();

    // Validasi input
    if (!nomor || !otp || !kodeId) {
      return NextResponse.json(
        { success: false, message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // Cari OTP record
    const otpRecord = await prisma.kodeOtp.findUnique({
      where: { id: kodeId },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: "Kode verifikasi tidak valid" },
        { status: 400 }
      );
    }

    if (!otpRecord.isActive) {
      return NextResponse.json(
        { success: false, message: "Kode verifikasi sudah digunakan" },
        { status: 400 }
      );
    }

    // Validasi OTP
    const receivedOtp = Number(otp);
    if (isNaN(receivedOtp) || otpRecord.otp !== receivedOtp) {
      return NextResponse.json(
        { success: false, message: "Kode OTP salah" },
        { status: 400 }
      );
    }

    if (otpRecord.nomor !== nomor) {
      return NextResponse.json(
        { success: false, message: "Nomor tidak sesuai" },
        { status: 400 }
      );
    }

    // Cek user berdasarkan nomor
    const user = await prisma.user.findUnique({
      where: { nomor },
      select: {
        id: true,
        nomor: true,
        username: true,
        roleId: true,
        isActive: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Akun tidak ditemukan" },
        { status: 404 }
      );
    }

    // ✅ CREATE SESSION (JWT + Database)
    try {
      await sessionCreate({
        sessionKey: process.env.BASE_SESSION_KEY!,
        jwtSecret: process.env.BASE_TOKEN_KEY!,
        exp: "30 day",
        user: {
          id: user.id,
          nomor: user.nomor,
          username: user.username,
          roleId: user.roleId,
          isActive: user.isActive,
        },
      });
    } catch (sessionError) {
      console.error("❌ Error creating session:", sessionError);
      return NextResponse.json(
        { success: false, message: "Gagal membuat session" },
        { status: 500 }
      );
    }

    // Nonaktifkan OTP
    await prisma.kodeOtp.update({
      where: { id: kodeId },
      data: { isActive: false },
    });

    // Update lastLogin
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: user.isActive ? "Berhasil login" : "Menunggu persetujuan",
      user: {
        id: user.id,
        name: user.username,
        roleId: user.roleId,
        isActive: user.isActive,
      },
    });

  } catch (error) {
    console.error("❌ Verify OTP Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat verifikasi" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}