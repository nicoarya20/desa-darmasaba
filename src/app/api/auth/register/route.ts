import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { randomOTP } from '../_lib/randomOTP';
import { sendWhatsAppOtp } from '@/lib/wa-service';

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

    // Send OTP via WhatsApp using authenticated API
    const waResult = await sendWhatsAppOtp({
      nomor,
      message: waMessage,
    });

    if (!waResult.success) {
      return NextResponse.json(
        { success: false, message: waResult.message || 'Gagal mengirim OTP via WhatsApp', debug: waResult.data },
        { status: 400 }
      );
    }

    // ✅ Simpan OTP ke database
    const otpRecord = await prisma.kodeOtp.create({
      data: { nomor, otp: otpNumber, isActive: true }
    });

    // ✅ Set cookie flow=register (Next.js 15+ syntax)
    const cookieStore = await cookies();
    cookieStore.set('auth_flow', 'register', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 5, // 5 menit
      path: '/'
    });

    // ✅ Kembalikan kodeId
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