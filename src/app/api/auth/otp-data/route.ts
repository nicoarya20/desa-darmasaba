// app/api/auth/otp-data/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kodeId = searchParams.get("kodeId");

    if (!kodeId) {
      return NextResponse.json(
        { success: false, message: "Kode ID tidak diberikan" },
        { status: 400 }
      );
    }

    const otpRecord = await prisma.kodeOtp.findUnique({
      where: { id: kodeId },
      select: { nomor: true, isActive: true },
    });

    if (!otpRecord || !otpRecord.isActive) {
      return NextResponse.json(
        { success: false, message: "Kode verifikasi tidak valid atau sudah digunakan" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { nomor: otpRecord.nomor },
    });
  } catch (error) {
    console.error("❌ Gagal mengambil data OTP:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}