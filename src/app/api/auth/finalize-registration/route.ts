// src/app/api/auth/finalize-registration/route.ts

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sessionCreate } from "../_lib/session_create";

export async function POST(req: Request) {
  try {
    const { nomor, username, kodeId } = await req.json();

    const cleanNomor = nomor.replace(/\D/g, "");

    if (!cleanNomor || !username || !kodeId) {
      return NextResponse.json(
        { success: false, message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // Di awal fungsi POST
    console.log("📦 Received payload:", { nomor, username, kodeId });

    // Validasi OTP
    const otpRecord = await prisma.kodeOtp.findUnique({
      where: { id: kodeId },
    });
    if (!otpRecord?.isActive || otpRecord.nomor !== cleanNomor) {
      return NextResponse.json(
        { success: false, message: "OTP tidak valid" },
        { status: 400 }
      );
    }

    // Cek duplikat username
    if (await prisma.user.findFirst({ where: { username } })) {
      return NextResponse.json(
        { success: false, message: "Username sudah digunakan" },
        { status: 409 }
      );
    }

    // ✅ Gunakan username dari input user
    const defaultRole = await prisma.role.findFirst({
      where: { name: "ADMIN DESA" },
      select: { id: true },
    });

    if (!defaultRole) {
      return NextResponse.json(
        { success: false, message: "Role default tidak ditemukan" },
        { status: 500 }
      );
    }

    // ✅ Buat user dengan username yang diinput
    const newUser = await prisma.user.create({
      data: {
        username, // ✅ Ini yang benar
        nomor,
        roleId: defaultRole.id,
        isActive: false,
      },
    });

    // Nonaktifkan OTP
    await prisma.kodeOtp.update({
      where: { id: kodeId },
      data: { isActive: false },
    });

    // ✅ BUAT SESI untuk user baru (meski isActive = false)
    const token = await sessionCreate({
      sessionKey: process.env.BASE_SESSION_KEY!,
      jwtSecret: process.env.BASE_TOKEN_KEY!,
      exp: "30 day",
      user: {
        id: newUser.id,
        nomor: newUser.nomor,
        username: newUser.username, // ✅ Pastikan sesuai
        roleId: newUser.roleId,
        isActive: false,
      },
    });

    // Set cookie
    const response = NextResponse.json({
      success: true,
      message: "Registrasi berhasil. Menunggu persetujuan admin.",
      user: {
        id: newUser.id,
        name: newUser.username,
        roleId: newUser.roleId,
        isActive: false,
      },
    });

    response.cookies.set(process.env.BASE_SESSION_KEY!, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("❌ Finalize Registration Error:", error);
    return NextResponse.json(
      { success: false, message: "Registrasi gagal" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
