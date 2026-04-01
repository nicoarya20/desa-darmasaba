import { NextResponse } from 'next/server';
import { verifySession } from '../_lib/session_verify';
import { sessionCreate } from '../_lib/session_create';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    const sessionUser = await verifySession();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get fresh user data
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        username: true,
        roleId: true,
        isActive: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Create new session with updated data
    await sessionCreate({
      sessionKey: process.env.BASE_SESSION_KEY!,
      jwtSecret: process.env.BASE_TOKEN_KEY!,
      user: {
        id: user.id,
        username: user.username,
        roleId: user.roleId,
        isActive: user.isActive,
      },
      invalidatePrevious: false, // Keep existing sessions
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error refreshing session:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}