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

    const otpRecord = await prisma.kodeOtp.findUnique({ where: { id: kodeId } });
    if (!otpRecord?.isActive || otpRecord.nomor !== cleanNomor) {
      return NextResponse.json(
        { success: false, message: "OTP tidak valid" },
        { status: 400 }
      );
    }

    if (await prisma.user.findFirst({ where: { username } })) {
      return NextResponse.json(
        { success: false, message: "Username sudah digunakan" },
        { status: 409 }
      );
    }

    // 🔥 Tentukan roleId sebagai STRING
    const targetRoleId = "1"; // ✅ string, bukan number

    // Validasi role (gunakan string)
    const roleExists = await prisma.role.findUnique({
      where: { id: targetRoleId }, // ✅ id bertipe string
      select: { id: true }
    });

    if (!roleExists) {
      return NextResponse.json(
        { success: false, message: "Role tidak valid" },
        { status: 400 }
      );
    }

    // Buat user dengan roleId string
    const newUser = await prisma.user.create({
      data: {
        username,
        nomor,
        roleId: targetRoleId, // ✅ string
        isActive: false,
      },
    });

    // Berikan akses menu
    const menuIds = DEFAULT_MENUS_BY_ROLE[targetRoleId] || [];
    if (menuIds.length > 0) {
      await prisma.userMenuAccess.createMany({
        data: menuIds.map(menuId => ({
          userId: newUser.id,
          menuId,
        })),
      });
    }

    await prisma.kodeOtp.update({
      where: { id: kodeId },
      data: { isActive: false },
    });

    const token = await sessionCreate({
      sessionKey: process.env.BASE_SESSION_KEY!,
      jwtSecret: process.env.BASE_TOKEN_KEY!,
      exp: "30 day",
      user: {
        id: newUser.id,
        nomor: newUser.nomor,
        username: newUser.username,
        roleId: newUser.roleId, // string
        isActive: false,
      },
      invalidatePrevious: false,
    });

    const response = NextResponse.redirect(new URL('/waiting-room', req.url));
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