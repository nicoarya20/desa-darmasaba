// app/api/health/otp/route.ts
import { NextResponse } from "next/server";
import { randomOTP } from "@/app/api/auth/_lib/randomOTP";
import { sendCodeOtp } from "@/app/api/auth/_lib/sendCodeOtp";

/**
 * Health check endpoint untuk OTP WhatsApp service
 * 
 * GET /api/health/otp?test=true&number=6281234567890
 * 
 * Query parameters:
 * - test: Set "true" untuk kirim test OTP (optional)
 * - number: Nomor tujuan test (required jika test=true)
 * 
 * Response:
 * - Status OTP service (available/unavailable)
 * - Token configuration status
 * - Test message results (jika test=true)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const isTest = searchParams.get("test") === "true";
    const testNumber = searchParams.get("number");

    // Check token configuration
    const tokenConfigured = Boolean(process.env.WA_SERVER_TOKEN);
    const isPlaceholder =
      process.env.WA_SERVER_TOKEN === "your_whatsapp_server_token";

    const healthCheck = {
      service: "OTP WhatsApp",
      status: "ok" as "ok" | "degraded" | "unavailable",
      token: {
        configured: tokenConfigured,
        isPlaceholder,
      },
      timestamp: new Date().toISOString(),
    };

    // If test mode, actually try to send OTP
    if (isTest) {
      if (!testNumber) {
        return NextResponse.json(
          {
            success: false,
            message: "Nomor diperlukan untuk test mode",
            error: "Tambahkan query parameter: ?number=6281234567890",
          },
          { status: 400 }
        );
      }

      const testOtp = randomOTP();

      console.log(`🧪 OTP HEALTH CHECK - Testing with number: ${testNumber}`);
      console.log(`🧪 Test OTP code: ${testOtp}`);

      try {
        const startTime = Date.now();
        const waResponse = await sendCodeOtp({
          nomor: testNumber,
          codeOtp: testOtp,
        });
        const responseTime = Date.now() - startTime;

        if (!waResponse.ok) {
          healthCheck.status = "unavailable";
          return NextResponse.json({
            success: false,
            message: "Gagal mengirim OTP test",
            health: healthCheck,
            test: {
              number: testNumber,
              httpStatus: waResponse.status,
              statusText: waResponse.statusText,
              responseTime: `${responseTime}ms`,
              note: "Cek apakah WA_SERVER_TOKEN sudah benar di Portainer",
            },
          });
        }

        const responseData = await waResponse.json();

        if (responseData.status !== "success") {
          healthCheck.status = "degraded";
          return NextResponse.json({
            success: false,
            message: "OTP test terkirim tapi service merespon error",
            health: healthCheck,
            test: {
              number: testNumber,
              httpStatus: waResponse.status,
              responseTime: `${responseTime}ms`,
              serviceResponse: responseData,
              note: "Cek apakah WA_SERVER_TOKEN sudah benar di Portainer",
            },
          });
        }

        // Success
        healthCheck.status = "ok";
        return NextResponse.json({
          success: true,
          message: "OTP test berhasil dikirim",
          health: healthCheck,
          test: {
            number: testNumber,
            httpStatus: waResponse.status,
            responseTime: `${responseTime}ms`,
            serviceResponse: responseData,
            otpCode: testOtp,
            note: "Gunakan kode ini untuk verifikasi test",
          },
        });
      } catch (error) {
        healthCheck.status = "unavailable";
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        return NextResponse.json({
          success: false,
          message: "Exception saat mengirim OTP test",
          health: healthCheck,
          test: {
            number: testNumber,
            error: errorMessage,
            note: "Cek network connectivity ke otp.wibudev.com",
          },
        });
      }
    }

    // Basic health check without sending OTP
    if (!tokenConfigured || isPlaceholder) {
      healthCheck.status = "unavailable";
    }

    return NextResponse.json({
      success: true,
      message:
        healthCheck.status === "ok"
          ? "OTP service tersedia"
          : "OTP service tidak tersedia - cek WA_SERVER_TOKEN",
      health: healthCheck,
      usage: "Tambahkan ?test=true&number=6281234567890 untuk test kirim OTP",
    });
  } catch (error) {
    console.error("❌ OTP Health Check Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Health check gagal",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
