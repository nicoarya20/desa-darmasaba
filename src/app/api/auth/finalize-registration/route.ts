// app/api/auth/finalize-registration/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sessionCreate } from "../_lib/session_create";

export async function POST(req: Request) {
  try {
    const { nomor, username, kodeId } = await req.json();

    // Verifikasi OTP (sama seperti verify-otp)
    const otpRecord = await prisma.kodeOtp.findUnique({ where: { id: kodeId } });
    if (!otpRecord?.isActive || otpRecord.nomor !== nomor) {
      return NextResponse.json({ success: false, message: 'OTP tidak valid' }, { status: 400 });
    }

    // Buat user
    const user = await prisma.user.create({
      data: { username, nomor, isActive: true }
    });

    // Nonaktifkan OTP
    await prisma.kodeOtp.update({ where: { id: kodeId }, data: { isActive: false } });

    // Buat session
    const token = await sessionCreate({
      sessionKey: process.env.BASE_SESSION_KEY!,
      jwtSecret: process.env.BASE_TOKEN_KEY!,
      user: { id: user.id, nomor: user.nomor, username: user.username, roleId: user.roleId, isActive: true },
    });

    const response = NextResponse.json({ success: true, roleId: user.roleId });
    response.cookies.set(process.env.BASE_SESSION_KEY!, token, { /* options */ });
    return response;
  } catch (error) {
    console.error('Finalize Registration Error:', error);
    return NextResponse.json({ success: false, message: 'Registrasi gagal' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}