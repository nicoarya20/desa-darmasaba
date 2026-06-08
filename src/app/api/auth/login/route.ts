// app/api/auth/login/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { randomOTP } from "../_lib/randomOTP";
import { sendCodeOtp } from "../_lib/sendCodeOtp";
import { cookies } from "next/headers";

export async function POST(req: Request) {
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
      const codeOtp = randomOTP();
      const otpNumber = Number(codeOtp);

      try {
        const waResponse = await sendCodeOtp({ nomor, codeOtp });

        if (!waResponse.ok) {
          return NextResponse.json(
            { success: false, message: 'Gagal mengirim kode verifikasi. Silakan coba lagi.' },
            { status: 503 }
          );
        }

        const sendWa = await waResponse.json();
        if (sendWa.status !== "success") {
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

      const createOtpId = await prisma.kodeOtp.create({
        data: { nomor, otp: otpNumber, isActive: true },
      });

      const cookieStore = await cookies();
      cookieStore.set("auth_flow", "login", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 5,
        path: "/",
      });

      return NextResponse.json({
        success: true,
        message: "Kode verifikasi dikirim",
        kodeId: createOtpId.id,
        isRegistered: true,
      });
    } else {
      return NextResponse.json({
        success: true,
        message: "Nomor belum terdaftar",
        isRegistered: false,
      });
    }
  } catch (error) {
    console.error("❌ Error Login:", error);

    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat login" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect(); 
  }
}