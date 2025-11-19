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
    const body = await req.json();
    const { nomor } = body;

    if (!nomor || typeof nomor !== "string") {
      return NextResponse.json(
        { success: false, message: "Nomor tidak valid" },
        { status: 400 }
      );
    }

    // Cek apakah user sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { nomor },
      select: { id: true }, // cukup cek ada/tidak
    });

    const isRegistered = !!existingUser;

    // Generate OTP
    const codeOtp = randomOTP(); // Pastikan ini menghasilkan number (sesuai tipe di KodeOtp.otp: Int)

    // Kirim OTP via WA
    const waRes = await fetch(
      `https://wa.wibudev.com/code?nom=${encodeURIComponent(nomor)}&text=Website Desa Darmasaba - Kode ini bersifat RAHASIA dan JANGAN DI BAGIKAN KEPADA SIAPAPUN, termasuk anggota ataupun Admin lainnya.%0A%0A>> Kode OTP anda: ${codeOtp}.`
    );

    const sendWa = await waRes.json();

    if (sendWa.status !== "success") {
      return NextResponse.json(
        { success: false, message: "Nomor WhatsApp tidak aktif" },
        { status: 400 }
      );
    }

    // Simpan OTP ke database
    const otpRecord = await prisma.kodeOtp.create({
      data: {
        nomor: nomor,
        otp: codeOtp, // Pastikan tipe ini number (Int di Prisma = number di TS)
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Kode verifikasi terkirim",
        kodeId: otpRecord.id,
        isRegistered, // 🔑 Ini kunci untuk frontend tahu harus ke register atau verifikasi
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error Login:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi masalah saat login",
        // Hindari mengirim error mentah ke client di production
        // reason: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}