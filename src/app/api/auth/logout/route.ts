// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { sessionDelete } from "../_lib/session_delete";

export async function POST() {
  try {
    const deleted = await sessionDelete({
      sessionKey: process.env.BASE_SESSION_KEY!,
    });

    if (deleted) {
      return NextResponse.json({
        success: true,
        message: "Logout berhasil",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Gagal logout",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Logout Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat logout",
      },
      { status: 500 }
    );
  }
}