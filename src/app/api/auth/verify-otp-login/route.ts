/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/auth/verify-otp-login/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sessionCreate } from "../_lib/session_create";
import { otpVerifyLimiter, rateLimitResponse } from "../_lib/rateLimiter";

export async function POST(req: Request) {
  try {
    const { nomor, otp, kodeId } = await req.json();

    if (!nomor || !otp || !kodeId) {
      return NextResponse.json(
        { success: false, message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const limit = otpVerifyLimiter.check(kodeId)
    if (!limit.allowed) return rateLimitResponse(limit.retryAfterMs)

    const otpRecord = await prisma.kodeOtp.findUnique({ where: { id: kodeId } });
    if (!otpRecord || !otpRecord.isActive || otpRecord.nomor !== nomor) {
      return NextResponse.json(
        { success: false, message: "Kode verifikasi tidak valid" },
        { status: 400 }
      );
    }

    const OTP_TTL_MS = 5 * 60 * 1000;
    if (Date.now() - otpRecord.createdAt.getTime() > OTP_TTL_MS) {
      await prisma.kodeOtp.update({ where: { id: kodeId }, data: { isActive: false } });
      return NextResponse.json(
        { success: false, message: "Kode OTP sudah kadaluarsa, silakan minta kode baru" },
        { status: 400 }
      );
    }

    const receivedOtp = Number(otp);
    if (isNaN(receivedOtp) || otpRecord.otp !== receivedOtp) {
      // Last allowed attempt — permanently invalidate the OTP session in DB
      if (limit.remaining === 0) {
        await prisma.kodeOtp.update({ where: { id: kodeId }, data: { isActive: false } })
      }
      return NextResponse.json(
        { success: false, message: "Kode OTP salah" },
        { status: 400 }
      );
    }

    // 🔍 CARI USER — JANGAN BUAT BARU!
    const user = await prisma.user.findUnique({
      where: { nomor },
      select: { id: true, nomor: true, username: true, roleId: true, isActive: true },
    });

    if (!user) {
      // ❌ Nomor belum terdaftar → suruh registrasi
      return NextResponse.json(
        { success: false, message: "Akun tidak ditemukan. Silakan registrasi terlebih dahulu." },
        { status: 404 }
      );
    }

    // ✅ Buat sesi
    const token = await sessionCreate({
      sessionKey: process.env.BASE_SESSION_KEY!,
      jwtSecret: process.env.BASE_TOKEN_KEY!,
      exp: "30 day",
      user: {
        id: user.id,
        nomor: user.nomor,
        username: user.username,
        roleId: user.roleId,
        isActive: user.isActive,
      },
    });

    await prisma.$transaction([
      prisma.kodeOtp.update({ where: { id: kodeId }, data: { isActive: false } }),
      prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } }),
    ]);

    const response = NextResponse.json({
      success: true,
      message: user.isActive ? "Berhasil login" : "Menunggu persetujuan",
      user: {
        id: user.id,
        name: user.username,
        roleId: user.roleId,
        isActive: user.isActive,
      },
    });

    response.cookies.set(process.env.BASE_SESSION_KEY!, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error("❌ Verify OTP Login Error:", error);
    if (error.message.includes("sessionKey") || error.message.includes("jwtSecret")) {
      return NextResponse.json(
        { success: false, message: "Konfigurasi server tidak lengkap" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat login" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}