import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { randomOTP } from "../_lib/randomOTP";
import { sendWhatsAppOtp } from "@/lib/wa-service";

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

    // Kirim WA menggunakan API terautentikasi
    const waMessage = `Website Desa Darmasaba - Kode verifikasi Anda: ${codeOtp}`;
    const waResult = await sendWhatsAppOtp({
      nomor,
      message: waMessage,
    });

    if (!waResult.success) {
      return NextResponse.json(
        { success: false, message: waResult.message || 'Gagal mengirim OTP', debug: waResult.data },
        { status: 400 }
      );
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