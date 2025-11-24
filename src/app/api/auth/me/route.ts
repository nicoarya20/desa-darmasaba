// src/app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { verifySession } from '../_lib/session_verify';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const user = await verifySession();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Session tidak valid", user: null },
        { status: 401 }
      );
    }

    // ✅ Ambil menu akses kustom
    const menuAccess = await prisma.userMenuAccess.findMany({
      where: { userId: user.id },
      select: { menuId: true },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.username,
        username: user.username,
        nomor: user.nomor,
        roleId: user.roleId,
        isActive: user.isActive,
        menuIds: menuAccess.map(m => m.menuId), // ✅ tambahkan ini
      },
    });
  } catch (error) {
    console.error("❌ Error in /api/auth/me:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan", user: null },
      { status: 500 }
    );
  }
}