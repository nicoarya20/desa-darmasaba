// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function POST() {
  try {
    // Hapus sesi Better Auth (Redis-less: hapus row session + clear cookie).
    await auth.api.signOut({ headers: await headers() });

    return NextResponse.json({
      success: true,
      message: "Logout berhasil",
    });
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