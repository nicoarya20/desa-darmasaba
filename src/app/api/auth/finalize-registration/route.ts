// src/app/api/auth/finalize-registration/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sessionCreate } from "../_lib/session_create";

// ✅ Gunakan STRING untuk roleId
const DEFAULT_MENUS_BY_ROLE: Record<string, string[]> = {
  "0": [
    "Landing Page", "PPID", "Desa", "Kesehatan", "Keamanan",
    "Ekonomi", "Inovasi", "Lingkungan", "Pendidikan", "User & Role"
  ],
  "1": [
    "Landing Page", "PPID", "Desa", "Keamanan",
    "Ekonomi", "Inovasi", "Lingkungan", "User & Role"
  ],
  "2": ["Landing Page", "Desa", "Ekonomi", "Inovasi", "Lingkungan"],
  "3": ["Kesehatan"],
  "4": ["Pendidikan"],
};

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

    // Verify OTP
    const otpRecord = await prisma.kodeOtp.findUnique({ 
      where: { id: kodeId },
      select: { nomor: true, isActive: true }
    });

    if (!otpRecord?.isActive || otpRecord.nomor !== cleanNomor) {
      return NextResponse.json(
        { success: false, message: "OTP tidak valid" },
        { status: 400 }
      );
    }

    // Check duplicate username
    if (await prisma.user.findFirst({ where: { username } })) {
      return NextResponse.json(
        { success: false, message: "Username sudah digunakan" },
        { status: 409 }
      );
    }

    // Check duplicate nomor
    if (await prisma.user.findUnique({ where: { nomor: cleanNomor } })) {
      return NextResponse.json(
        { success: false, message: "Nomor sudah terdaftar" },
        { status: 409 }
      );
    }

    // 🔥 Tentukan roleId sebagai STRING
    const targetRoleId = "2"; // ✅ Default ADMIN_DESA (roleId "2")

    // Validasi role exists
    const roleExists = await prisma.role.findUnique({
      where: { id: targetRoleId },
      select: { id: true }
    });

    if (!roleExists) {
      return NextResponse.json(
        { success: false, message: "Role tidak valid" },
        { status: 400 }
      );
    }

    // ✅ Create user (inactive, waiting approval)
    const newUser = await prisma.user.create({
      data: {
        username,
        nomor: cleanNomor,
        roleId: targetRoleId,
        isActive: false, // Waiting for admin approval
      },
    });

    // ✅ Berikan akses menu default based on role
    const menuIds = DEFAULT_MENUS_BY_ROLE[targetRoleId] || [];
    if (menuIds.length > 0) {
      await prisma.userMenuAccess.createMany({
        data: menuIds.map(menuId => ({
          userId: newUser.id,
          menuId,
        })),
        skipDuplicates: true, // ✅ Avoid duplicate errors
      });
    }

    // ✅ Mark OTP as used
    await prisma.kodeOtp.update({
      where: { id: kodeId },
      data: { isActive: false },
    });

    // ✅ Create session token
    const token = await sessionCreate({
      sessionKey: process.env.BASE_SESSION_KEY!,
      jwtSecret: process.env.BASE_TOKEN_KEY!,
      exp: "30 day",
      user: {
        id: newUser.id,
        nomor: newUser.nomor,
        username: newUser.username,
        roleId: newUser.roleId,
        isActive: false, // User belum aktif
      },
      invalidatePrevious: false,
    });

    // ✅ PENTING: Return JSON response (bukan redirect)
    const response = NextResponse.json({
      success: true,
      message: "Registrasi berhasil. Menunggu persetujuan admin.",
      userId: newUser.id,
    });

    // ✅ Set session cookie
    const cookieName = process.env.BASE_SESSION_KEY || 'session';
    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax',
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;

  } catch (error) {
    console.error("❌ Finalize Registration Error:", error);
    return NextResponse.json(
      { success: false, message: "Registrasi gagal. Silakan coba lagi." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}