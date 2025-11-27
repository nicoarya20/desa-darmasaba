// app/api/auth/login/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { randomOTP } from "../_lib/randomOTP";
import { cookies } from "next/headers";

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

      // ✅ PERBAIKAN: Gunakan format pesan yang lebih sederhana
      // Hapus karakter khusus yang bisa bikin masalah
      const waMessage = `Website Desa Darmasaba\nKode verifikasi Anda ${codeOtp}`;
      
      // // ✅ OPSI 1: Tanpa encoding (coba dulu ini)
      // const waUrl = `https://wa.wibudev.com/code?nom=${nomor}&text=${waMessage}`;
      
      // ✅ OPSI 2: Dengan encoding (kalau opsi 1 gagal)
      const waUrl = `https://wa.wibudev.com/code?nom=${nomor}&text=${encodeURIComponent(waMessage)}`;
      
      // ✅ OPSI 3: Encoding manual untuk URL-safe (alternatif terakhir)
      // const encodedMessage = waMessage.replace(/\n/g, '%0A').replace(/ /g, '%20');
      // const waUrl = `https://wa.wibudev.com/code?nom=${nomor}&text=${encodedMessage}`;

      console.log("🔍 Debug WA URL:", waUrl); // Untuk debugging
      
      const res = await fetch(waUrl);
      const sendWa = await res.json();

      console.log("📱 WA Response:", sendWa); // Debug response

      if (sendWa.status !== "success") {
        return NextResponse.json(
          { 
            success: false, 
            message: "Gagal mengirim OTP via WhatsApp",
            debug: sendWa // Tampilkan error detail
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