// app/api/auth/login/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { randomOTP } from "../_lib/randomOTP";
import { sendCodeOtp } from "../_lib/sendCodeOtp";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { nomor } = await req.json();

    if (!nomor || typeof nomor !== "string") {
      return NextResponse.json(
        { success: false, message: "Nomor tidak valid" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { nomor },
      select: { id: true, isActive: true },
    });

    const isRegistered = !!existingUser;

    if (isRegistered) {
      const codeOtp = randomOTP();
      const otpNumber = Number(codeOtp);

      console.log(`🔑 DEBUG OTP [${nomor}]: ${codeOtp}`);

      let waSuccess = false;
      let waErrorMessage = "";

      try {
        const waResponse = await sendCodeOtp({
          nomor,
          codeOtp,
        });

        if (!waResponse.ok) {
          waErrorMessage = `WA Service HTTP Error: ${waResponse.status} ${waResponse.statusText}`;
          console.error(`⚠️ ${waErrorMessage}. Continuing since OTP is logged.`);
          console.log(`💡 Use this OTP to login: ${codeOtp}`);
        } else {
          const sendWa = await waResponse.json();
          console.log("📱 WA Response:", sendWa);

          if (sendWa.status !== "success") {
            waErrorMessage = `WA Service Logic Error: ${JSON.stringify(sendWa)}`;
            console.error("⚠️", waErrorMessage);
          } else {
            waSuccess = true;
          }
        }
      } catch (waError: unknown) {
        const errorMessage =
          waError instanceof Error ? waError.message : String(waError);

        waErrorMessage = `WA Connection Exception: ${errorMessage}`;
        console.error(
          "⚠️",
          waErrorMessage,
          ". Continuing since OTP is logged."
        );
      }

      const createOtpId = await prisma.kodeOtp.create({
        data: { nomor, otp: otpNumber, isActive: true },
      });

      const cookieStore = await cookies();
      cookieStore.set("auth_flow", "login", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 5,
        path: "/",
      });

      // Include debug info for non-production environments when WA fails
      const isNonProd = process.env.NODE_ENV !== "production";
      const includeDebug = isNonProd && !waSuccess;

      return NextResponse.json({
        success: true,
        message: waSuccess
          ? "Kode verifikasi dikirim"
          : "Kode verifikasi dibuat (WhatsApp gagal terkirim)",
        kodeId: createOtpId.id,
        isRegistered: true,
        waSuccess,
        ...(includeDebug && {
          debug: {
            codeOtp,
            waErrorMessage,
            note: "Hanya muncul di development/staging. Hapus di production.",
          },
        }),
      });
    } else {
      return NextResponse.json({
        success: true,
        message: "Nomor belum terdaftar",
        isRegistered: false,
      });
    }
  } catch (error) {
    console.error("❌ Error Login:", error);

    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat login" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect(); 
  }
}