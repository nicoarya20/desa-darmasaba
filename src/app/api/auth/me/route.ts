// app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { verifySession } from '../_lib/session_verify';

export async function GET() {
  try {
    // ✅ Verify session (hybrid: JWT + Database)
    const user = await verifySession();

    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          message: "Session tidak valid",
          user: null 
        },
        { status: 401 }
      );
    }

    // Data user sudah fresh dari database (via verifySession)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.username,
        username: user.username,
        nomor: user.nomor,
        roleId: user.roleId,
        isActive: user.isActive,
      },
    });

  } catch (error) {
    console.error("❌ Error in /api/auth/me:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "Terjadi kesalahan",
        user: null 
      },
      { status: 500 }
    );
  }
}