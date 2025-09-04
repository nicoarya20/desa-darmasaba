import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  if (req.method !== "POST") {
    return NextResponse.json(
      { success: false, message: "Method Not Allowed" },
      { status: 405 }
    );
  }

  try {
    const { data } = await req.json();

    const cekUsername = await prisma.user.findUnique({
      where: {
        username: data.username,
        nomor: data.nomor,
      },
    });

    if (cekUsername)
      return NextResponse.json({
        success: false,
        message: "Username sudah digunakan",
      });

    const createUser = await prisma.user.create({
      data: {
        username: data.username,
        nomor: data.nomor,
      },
    });

    if (!createUser)
      return NextResponse.json(
        { success: false, message: "Gagal Registrasi" },
        { status: 500 }
      );

    return NextResponse.json(
      {
        success: true,
        message: "Registrasi Berhasil, Anda Sedang Login",
        // data: createUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registrasi:", error);
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
