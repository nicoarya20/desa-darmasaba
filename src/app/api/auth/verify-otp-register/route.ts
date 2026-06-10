// src/app/api/auth/verify-otp-register/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { otpVerifyLimiter, rateLimitResponse } from "../_lib/rateLimiter";

export async function POST(req: Request) {
  try {
    const { nomor, otp, kodeId } = await req.json();

    if (!nomor || !otp || !kodeId) {
      return NextResponse.json(
        { success: false, message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const limit = otpVerifyLimiter.check(kodeId)
    if (!limit.allowed) return rateLimitResponse(limit.retryAfterMs)

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

    const isExpired = otpRecord.expiresAt
      ? Date.now() > otpRecord.expiresAt.getTime()
      : Date.now() - otpRecord.createdAt.getTime() > 5 * 60 * 1000;
    if (isExpired) {
      await prisma.kodeOtp.update({ where: { id: kodeId }, data: { isActive: false } });
      return NextResponse.json(
        { success: false, message: "Kode OTP sudah kadaluarsa, silakan minta kode baru" },
        { status: 400 }
      );
    }

    const receivedOtp = Number(otp);
    if (isNaN(receivedOtp) || otpRecord.otp !== receivedOtp) {
      if (limit.remaining === 0) {
        await prisma.kodeOtp.update({ where: { id: kodeId }, data: { isActive: false } })
      }
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