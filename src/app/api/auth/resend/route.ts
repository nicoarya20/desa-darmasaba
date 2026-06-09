// src/app/api/auth/resend-otp/route.ts
import prisma from "@/lib/prisma";

import { NextResponse } from "next/server";
import { randomOTP } from "../_lib/randomOTP";
import { otpSendLimiter, rateLimitResponse } from "../_lib/rateLimiter";

export async function POST(req: Request) {
  try {
    const { nomor } = await req.json();

    if (!nomor || typeof nomor !== 'string') {
      return NextResponse.json(
        { success: false, message: "Nomor tidak valid" },
        { status: 400 }
      );
    }

    const limit = otpSendLimiter.check(nomor)
    if (!limit.allowed) return rateLimitResponse(limit.retryAfterMs)

    const codeOtp = randomOTP();
    const otpNumber = Number(codeOtp);

    // Kirim OTP via WhatsApp
    const waMessage = `Website Desa Darmasaba - Kode ini bersifat RAHASIA dan JANGAN DI BAGIKAN KEPADA SIAPAPUN, termasuk anggota ataupun Admin lainnya.\n\n>> Kode OTP anda: ${codeOtp}.`;
    const waUrl = `https://wa.wibudev.com/code?nom=${encodeURIComponent(nomor)}&text=${encodeURIComponent(waMessage)}`;

    try {
      const waRes = await fetch(waUrl);
      if (!waRes.ok) {
        return NextResponse.json(
          { success: false, message: 'Gagal mengirim kode verifikasi. Silakan coba lagi.' },
          { status: 503 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, message: 'Gagal mengirim kode verifikasi. Silakan coba lagi.' },
        { status: 503 }
      );
    }

    // Simpan OTP ke database
    const otpRecord = await prisma.kodeOtp.create({
      data: {
        nomor,
        otp: otpNumber,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "OTP baru dikirim",
      kodeId: otpRecord.id,
    });

  } catch (error) {
    console.error("Error Resend OTP:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengirim ulang OTP" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}