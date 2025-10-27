import prisma from "@/lib/prisma";
import { randomOTP } from "../_lib/randomOTP";
import { NextResponse } from "next/server";

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
      `https://wa.wibudev.com/code?nom=${nomor}&text=HIPMI - Kode ini bersifat RAHASIA dan JANGAN DI BAGIKAN KEPADA SIAPAPUN, termasuk anggota ataupun pengurus HIPMI lainnya.
      \n
      >> Kode OTP anda: ${codeOtp}.
      `
    );

    const sendWa = await res.json();
    if (sendWa.status !== "success")
      return NextResponse.json(
        {
          success: false,
          message: "Nomor Whatsapp Tidak Aktif",
        },
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
        {
          success: false,
          message: "Gagal Membuat Kode OTP",
        },
        { status: 400 }
      );

    return NextResponse.json(
      {
        success: true,
        message: "Kode Verifikasi Dikirim",
        kodeId: createOtpId.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(" Error Resend OTP", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server Whatsapp Error !!",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
