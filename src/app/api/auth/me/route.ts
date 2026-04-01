// src/app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { verifySession } from '../_lib/session_verify';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const sessionUser = await verifySession();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized", user: null },
        { status: 401 }
      );
    }
    

    const [dbUser, menuAccess] = await Promise.all([
      prisma.user.findUnique({
        where: { id: sessionUser.id },
        select: {
          id: true,
          username: true,
          nomor: true,
          roleId: true,   // STRING!
          isActive: true, // BOOLEAN!
        },
      }),
      prisma.userMenuAccess.findMany({
        where: { userId: sessionUser.id },
        select: { menuId: true },
      }),
    ]);

    if (!dbUser) {
      return NextResponse.json(
        { success: false, message: "User not found", user: null },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        name: dbUser.username,
        username: dbUser.username,
        nomor: dbUser.nomor,
        roleId: dbUser.roleId,     // STRING!
        isActive: dbUser.isActive, // BOOLEAN!
        menuIds: menuAccess.map(m => m.menuId),
      },
    });
  } catch (error) {
    console.error("❌ Error in /api/auth/me:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", user: null },
      { status: 500 }
    );
  }
}