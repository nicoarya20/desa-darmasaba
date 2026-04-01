import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { randomOTP } from "../_lib/randomOTP";

export async function POST(req: Request) {
  try {
    const { username, nomor } = await req.json();

    if (!username || !nomor) {
      return NextResponse.json({ success: false, message: 'Data tidak lengkap' }, { status: 400 });
    }

    // Cek duplikat
    if (await prisma.user.findUnique({ where: { nomor } })) {
      return NextResponse.json({ success: false, message: 'Nomor sudah terdaftar' }, { status: 409 });
    }
    if (await prisma.user.findFirst({ where: { username } })) {
      return NextResponse.json({ success: false, message: 'Username sudah digunakan' }, { status: 409 });
    }

    // Generate OTP
    const codeOtp = randomOTP();
    const otpNumber = Number(codeOtp);
    console.log(`🔑 DEBUG SEND-OTP-REGISTER [${nomor}]: ${codeOtp}`);

    // Kirim WA
    const waUrl = `https://wa.wibudev.com/code?nom=${encodeURIComponent(nomor)}&text=Website Desa Darmasaba - Kode verifikasi Anda: ${codeOtp}`;
    
    try {
      const res = await fetch(waUrl);
      if (!res.ok) {
        console.warn(`⚠️ WA Service HTTP Error (SendOTPRegister): ${res.status} ${res.statusText}. Continuing since OTP is logged.`);
      } else {
        const sendWa = await res.json();
        console.log("📱 WA Response (SendOTPRegister):", sendWa);
      }
    } catch (waError: any) {
      console.warn("⚠️ WA Connection Exception (SendOTPRegister). Continuing since OTP is logged.", waError.message);
    }

    // Simpan OTP
    const otpRecord = await prisma.kodeOtp.create({
      data: { nomor, otp: otpNumber, isActive: true }
    });

    return NextResponse.json({
      success: true,
      message: 'Kode verifikasi dikirim',
      kodeId: otpRecord.id,
      nomor,
    });
  } catch (error) {
    console.error('Send OTP for Register Error:', error);
    return NextResponse.json({ success: false, message: 'Gagal mengirim OTP' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}