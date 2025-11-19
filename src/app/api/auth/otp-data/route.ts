// app/api/auth/otp-data/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { kodeId } = await req.json();

    if (!kodeId) {
      return NextResponse.json(
        { success: false, message: "Kode ID tidak diberikan" },
        { status: 400 }
      );
    }

    const otpRecord = await prisma.kodeOtp.findUnique({
      where: { id: kodeId },
      select: { id: true, nomor: true, isActive: true, createdAt: true },
    });

    if (!otpRecord || !otpRecord.isActive) {
      return NextResponse.json(
        { success: false, message: "Kode verifikasi tidak valid atau sudah digunakan" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: otpRecord,
    });
  } catch (error) {
    console.error("Error fetching OTP data:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data OTP" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}