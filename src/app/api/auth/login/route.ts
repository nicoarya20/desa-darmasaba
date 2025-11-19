// app/api/auth/login/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { randomOTP } from "../_lib/randomOTP";

export async function POST(req: Request) {
  if (req.method !== "POST") {
    return NextResponse.json(
      { success: false, message: "Method Not Allowed" },
      { status: 405 }
    );
  }

  try {
    const { nomor } = await req.json();

    if (!nomor || typeof nomor !== "string") {
      return NextResponse.json(
        { success: false, message: "Nomor tidak valid" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { nomor },
      select: { id: true, isActive: true },
    });

    const isRegistered = !!existingUser;

    if (isRegistered) {
      // ✅ User terdaftar → kirim OTP
      const codeOtp = randomOTP();
      const otpNumber = Number(codeOtp);

      const waMessage = `Website Desa Darmasaba - Kode verifikasi Anda: ${codeOtp}`;
      const waUrl = `https://wa.wibudev.com/code?nom=${encodeURIComponent(nomor)}&text=${encodeURIComponent(waMessage)}`;

      const res = await fetch(waUrl);
      const sendWa = await res.json();

      if (sendWa.status !== "success") {
        return NextResponse.json(
          { success: false, message: "Gagal mengirim OTP via WhatsApp" },
          { status: 400 }
        );
      }

      const createOtpId = await prisma.kodeOtp.create({
        data: { nomor, otp: otpNumber, isActive: true },
      });

      return NextResponse.json({
        success: true,
        message: "Kode verifikasi dikirim",
        kodeId: createOtpId.id,
        isRegistered: true,
      });
    } else {
      // ❌ User belum terdaftar → JANGAN kirim OTP
      return NextResponse.json({
        success: true,
        message: "Nomor belum terdaftar",
        isRegistered: false,
        // Tidak ada kodeId
      });
    }
  } catch (error) {
    console.error("Error Login:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat login" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}