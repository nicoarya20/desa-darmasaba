// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // Terima langsung properti, bukan { data: { ... } }
    const { username, nomor } = await req.json();

    // Validasi input
    if (!username || !nomor) {
      return NextResponse.json(
        { success: false, message: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    // // Validasi OTP: pastikan berisi digit saja
    // const cleanOtp = otp.toString().trim();
    // if (!/^\d{4,6}$/.test(cleanOtp)) {
    //   return NextResponse.json(
    //     { success: false, message: 'Kode OTP tidak valid' },
    //     { status: 400 }
    //   );
    // }

    // const receivedOtp = parseInt(cleanOtp, 10);
    // if (isNaN(receivedOtp)) {
    //   return NextResponse.json(
    //     { success: false, message: 'Kode OTP tidak valid' },
    //     { status: 400 }
    //   );
    // }

    // // Cari OTP record
    // const otpRecord = await prisma.kodeOtp.findUnique({
    //   where: { id: kodeId },
    // });

    // if (!otpRecord) {
    //   return NextResponse.json(
    //     { success: false, message: 'Kode verifikasi tidak valid' },
    //     { status: 400 }
    //   );
    // }

    // if (!otpRecord.isActive) {
    //   return NextResponse.json(
    //     { success: false, message: 'Kode verifikasi sudah kadaluarsa' },
    //     { status: 400 }
    //   );
    // }

    // if (otpRecord.otp !== receivedOtp) {
    //   return NextResponse.json(
    //     { success: false, message: 'Kode OTP salah' },
    //     { status: 400 }
    //   );
    // }

    // if (otpRecord.nomor !== nomor) {
    //   return NextResponse.json(
    //     { success: false, message: 'Nomor tidak sesuai' },
    //     { status: 400 }
    //   );
    // }

    // Cek duplikat nomor
    const existingUser = await prisma.user.findUnique({
      where: { nomor },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Nomor sudah terdaftar' },
        { status: 409 }
      );
    }

    // Cek username unik (pastikan ada @unique di schema!)
    const existingByUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingByUsername) {
      return NextResponse.json(
        { success: false, message: 'Username sudah digunakan' },
        { status: 409 }
      );
    }

    // Buat user
    const newUser = await prisma.user.create({
      data: {
        username: username.trim(),
        nomor,
        isActive: false,
        // roleId default "1"
      },
    });

    // // Nonaktifkan OTP
    // await prisma.kodeOtp.update({
    //   where: { id: kodeId },
    //   data: { isActive: false },
    // });

    return NextResponse.json({
      success: true,
      message: 'Pendaftaran berhasil. Menunggu persetujuan admin.',
      userId: newUser.id,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat pendaftaran' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}