import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { randomOTP } from '../_lib/randomOTP'; // pastikan ada

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

    // ✅ Generate dan kirim OTP
    const codeOtp = randomOTP();
    const otpNumber = Number(codeOtp);

    const waMessage = `Website Desa Darmasaba - Kode verifikasi Anda: ${codeOtp}`;
    const waUrl = `https://wa.wibudev.com/code?nom=${encodeURIComponent(nomor)}&text=${encodeURIComponent(waMessage)}`;
    const waRes = await fetch(waUrl);
    const waData = await waRes.json();

    if (waData.status !== "success") {
      return NextResponse.json({ success: false, message: 'Gagal mengirim OTP via WhatsApp' }, { status: 400 });
    }

    // ✅ Simpan OTP ke database
    const otpRecord = await prisma.kodeOtp.create({
      data: { nomor, otp: otpNumber, isActive: true }
    });

    // ✅ Kembalikan kodeId (jangan buat user di sini!)
    return NextResponse.json({
      success: true,
      message: 'Kode verifikasi dikirim',
      kodeId: otpRecord.id,
    });
  } catch (error) {
    console.error('Register OTP Error:', error);
    return NextResponse.json({ success: false, message: 'Gagal mengirim OTP' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}