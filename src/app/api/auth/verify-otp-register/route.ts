// src/app/api/auth/verify-otp-register/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { nomor, otp, kodeId } = await req.json();

    if (!nomor || !otp || !kodeId) {
      return NextResponse.json(
        { success: false, message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const otpRecord = await prisma.kodeOtp.findUnique({
      where: { id: kodeId },
    });

    if (!otpRecord || !otpRecord.isActive) {
      return NextResponse.json(
        { success: false, message: "Kode verifikasi tidak valid atau sudah kadaluarsa" },
        { status: 400 }
      );
    }

    if (otpRecord.nomor !== nomor) {
      return NextResponse.json(
        { success: false, message: "Nomor tidak sesuai dengan kode verifikasi" },
        { status: 400 }
      );
    }

    const receivedOtp = Number(otp);
    if (isNaN(receivedOtp) || otpRecord.otp !== receivedOtp) {
      return NextResponse.json(
        { success: false, message: "Kode OTP salah" },
        { status: 400 }
      );
    }

    // ✅ Hanya validasi — jangan update isActive!
    return NextResponse.json({
      success: true,
      message: "OTP valid. Lanjutkan ke finalisasi registrasi.",
      data: {
        nomor,
        kodeId,
      },
    });

  } catch (error) {
    console.error("❌ Verify OTP Register Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat verifikasi OTP" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}