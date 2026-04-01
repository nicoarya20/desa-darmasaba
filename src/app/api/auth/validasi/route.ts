/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sessionCreate } from "../_lib/session_create";

export async function POST(req: Request) {
  if (req.method !== "POST") {
    return NextResponse.json(
      { success: false, message: "Method Not Allowed" },
      { status: 405 }
    );
  }

  try {
    const { nomor } = await req.json();
    const dataUser = await prisma.user.findUnique({
      where: {
        nomor: nomor,
      },
      select: {
        id: true,
        nomor: true,
        username: true,
        roleId: true,
      },
    });

    if (dataUser == null)
      return NextResponse.json(
        { success: false, message: "Nomor Belum Terdaftar" },
        { status: 200 }
      );

    const token = await sessionCreate({
      sessionKey: process.env.BASE_SESSION_KEY!,
      jwtSecret: process.env.BASE_TOKEN_KEY!,
      user: dataUser as any,
    });

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Gagal membuat session" },
        { status: 500 }
      );
    }
    // Buat response dengan token dalam cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "Berhasil Login",
        roleId: dataUser.roleId,
      },
      { status: 200 }
    );

    // Set cookie dengan token yang sudah dipastikan tidak null
    response.cookies.set(process.env.NEXT_PUBLIC_BASE_SESSION_KEY!, token, {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60, // 30 hari dalam detik (1 bulan)
    });

    return response;
  } catch (error) {
    console.error("API Error or Server Error", error);
    return NextResponse.json(
      {
        success: false,
        message: "Maaf, Terjadi Keselahan",
        reason: (error as Error).message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
