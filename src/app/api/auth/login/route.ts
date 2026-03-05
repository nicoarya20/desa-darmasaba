// app/api/auth/login/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { randomOTP } from "../_lib/randomOTP";
import { cookies } from "next/headers";
import { sendWhatsAppOtp } from "@/lib/wa-service";

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
      const codeOtp = randomOTP();
      const otpNumber = Number(codeOtp);

      const waMessage = `Website Desa Darmasaba - Kode ini bersifat RAHASIA dan JANGAN DI BAGIKAN KEPADA SIAPAPUN, termasuk anggota ataupun Admin lainnya.\n\n>> Kode OTP anda: ${codeOtp}.`;

      // Send OTP via WhatsApp using authenticated API
      const waResult = await sendWhatsAppOtp({
        nomor,
        message: waMessage,
      });

      if (!waResult.success) {
        console.error("❌ WA Service Error:", waResult);
        return NextResponse.json(
          {
            success: false,
            message: waResult.message || "Gagal mengirim OTP via WhatsApp",
            debug: waResult.data
          },
          { status: 400 }
        );
      }

      const createOtpId = await prisma.kodeOtp.create({
        data: { nomor, otp: otpNumber, isActive: true },
      });

      const cookieStore = await cookies();
      cookieStore.set('auth_flow', 'login', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 5, // 5 menit
        path: '/'
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