// src/app/api/auth/resend-otp/route.ts
import prisma from "@/lib/prisma";

import { NextResponse } from "next/server";
import { randomOTP } from "../_lib/randomOTP";

export async function POST(req: Request) {
  try {
    const { nomor } = await req.json();

    if (!nomor || typeof nomor !== 'string') {
      return NextResponse.json(
        { success: false, message: "Nomor tidak valid" },
        { status: 400 }
      );
    }

    const codeOtp = randomOTP();
    const otpNumber = Number(codeOtp);

    // Kirim OTP via WhatsApp
    const waMessage = `Kode verifikasi Anda: ${codeOtp}`;
    const waUrl = `https://wa.wibudev.com/code?nom=${encodeURIComponent(nomor)}&text=${encodeURIComponent(waMessage)}`;
    const waRes = await fetch(waUrl);
    const waData = await waRes.json();

    if (waData.status !== "success") {
      return NextResponse.json(
        { success: false, message: "Gagal mengirim OTP via WhatsApp" },
        { status: 400 }
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