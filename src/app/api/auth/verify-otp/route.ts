// app/api/auth/verify-otp/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sessionCreate } from "../_lib/session_create";

export async function POST(req: Request) {
  if (req.method !== "POST") {
    return NextResponse.json(
      { success: false, message: "Method Not Allowed" },
      { status: 405 }
    );
  }

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

    // Pastikan tipe data cocok (OTP di DB = number)
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

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: "Akun belum disetujui oleh admin" },
        { status: 403 }
      );
    }

    // Buat session
    const token = await sessionCreate({
      sessionKey: process.env.BASE_SESSION_KEY!,
      jwtSecret: process.env.BASE_TOKEN_KEY!, // ✅
      user: {
        id: user.id,
        nomor: user.nomor,
        username: user.username,
        roleId: user.roleId,
        isActive: user.isActive,
      },
    });
    if (!token) {
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

    // Set cookie & respons
    const response = NextResponse.json(
      {
        success: true,
        message: "Berhasil login",
        roleId: user.roleId,
      },
      { status: 200 }
    );

    response.cookies.set(process.env.BASE_SESSION_KEY!, token, {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true, // 🔒 lebih aman
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat verifikasi" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}