import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { randomOTP } from "../_lib/randomOTP";
import { sendWhatsAppOTP, formatOTPMessage } from "@/lib/whatsapp";
import { loginRequestSchema } from "@/lib/validations";

export async function POST(req: Request) {
  if (req.method !== "POST") {
    return NextResponse.json(
      { success: false, message: "Method Not Allowed" },
      { status: 405 }
    );
  }

  try {
    const body = await req.json();
    
    // Validate input with Zod schema
    const validated = loginRequestSchema.parse(body);
    const { nomor } = validated;

    // Cek apakah user sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { nomor },
      select: { id: true },
    });

    const isRegistered = !!existingUser;

    // Generate OTP
    const codeOtp = randomOTP();

    // Simpan OTP ke database terlebih dahulu untuk mendapatkan ID
    const otpRecord = await prisma.kodeOtp.create({
      data: {
        nomor: nomor,
        otp: codeOtp,
      },
    });

    // Kirim OTP via WhatsApp dengan POST request yang aman
    // OTP code tidak dikirim dalam URL query string
    const waResult = await sendWhatsAppOTP({
      nomor: nomor,
      otpId: otpRecord.id,
      message: formatOTPMessage(codeOtp),
    });

    if (waResult.status !== "success") {
      // Delete OTP record jika WhatsApp gagal
      await prisma.kodeOtp.delete({
        where: { id: otpRecord.id },
      }).catch(() => {}); // Ignore delete errors

      return NextResponse.json(
        { 
          success: false, 
          message: waResult.message || "Gagal mengirim kode verifikasi" 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Kode verifikasi terkirim",
        kodeId: otpRecord.id,
        isRegistered,
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof Error && error.constructor.name === 'ZodError') {
      const zodError = error as import('zod').ZodError;
      return NextResponse.json(
        { 
          success: false, 
          message: "Validasi gagal",
          errors: zodError.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          }))
        },
        { status: 400 }
      );
    }

    console.error("Error Login:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi masalah saat login",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}