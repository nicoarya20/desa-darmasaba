import prisma from "@/lib/prisma";

import { NextResponse } from "next/server";
import { randomOTP } from "../_lib/randomOTP";

export async function POST(req: Request) {
  if (req.method !== "POST") {
    return NextResponse.json(
      { success: false, message: "Method Not Allowed" },
      { status: 405 }
    );
  }

  try {
    const codeOtp = randomOTP();
    const body = await req.json();
    const { nomor } = body;
    const res = await fetch(
      `https://wa.wibudev.com/code?nom=${nomor}&text=Website Desa Darmasaba - Kode ini bersifat RAHASIA dan JANGAN DI BAGIKAN KEPADA SIAPAPUN, termasuk anggota ataupun Admin lainnya. 
      \n 
      >> Kode OTP anda: ${codeOtp}.
      `
    );

    const sendWa = await res.json();

    if (sendWa.status !== "success")
      return NextResponse.json(
        { success: false, message: "Nomor Whatsapp Tidak Aktif" },
        { status: 400 }
      );

    const createOtpId = await prisma.kodeOtp.create({
      data: {
        nomor: nomor,
        otp: codeOtp,
      },
    });

    if (!createOtpId)
      return NextResponse.json(
        { success: false, message: "Gagal mengirim kode OTP" },
        { status: 400 }
      );

    return NextResponse.json(
      {
        success: true,
        message: "Kode verifikasi terkirim",
        kodeId: createOtpId.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error Login", error);
    return NextResponse.json(
      { success: false, message: "Terjadi masalah saat login" , reason: error as Error },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
