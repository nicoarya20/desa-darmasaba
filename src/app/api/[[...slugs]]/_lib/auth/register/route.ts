// import prisma from "@/lib/prisma";
// import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//   if (req.method !== "POST") {
//     return NextResponse.json(
//       { success: false, message: "Method Not Allowed" },
//       { status: 405 }
//     );
//   }

//   try {
//     const { username, nomor, otp, kodeId } = await req.json();

//     // Validasi input
//     if (!username || !nomor || !otp || !kodeId) {
//       return NextResponse.json(
//         { success: false, message: "Data tidak lengkap" },
//         { status: 400 }
//       );
//     }

//     // 1. Verifikasi OTP
//     const otpRecord = await prisma.kodeOtp.findUnique({
//       where: { id: kodeId },
//     });

//     if (!otpRecord) {
//       return NextResponse.json(
//         { success: false, message: "Kode verifikasi tidak valid" },
//         { status: 400 }
//       );
//     }

//     if (!otpRecord.isActive) {
//       return NextResponse.json(
//         { success: false, message: "Kode verifikasi sudah digunakan atau kadaluarsa" },
//         { status: 400 }
//       );
//     }

//     if (otpRecord.otp !== otp) {
//       return NextResponse.json(
//         { success: false, message: "Kode OTP salah" },
//         { status: 400 }
//       );
//     }

//     if (otpRecord.nomor !== nomor) {
//       return NextResponse.json(
//         { success: false, message: "Nomor tidak sesuai dengan kode verifikasi" },
//         { status: 400 }
//       );
//     }

//     // 3. Cek apakah nomor sudah terdaftar
//     const existingUserByNomor = await prisma.user.findUnique({
//       where: { nomor },
//     });

//     if (existingUserByNomor) {
//       return NextResponse.json(
//         { success: false, message: "Nomor sudah terdaftar" },
//         { status: 409 }
//       );
//     }

//     // 4. Buat user
//     const newUser = await prisma.user.create({
//       data: {
//         username,
//         nomor,
//         // roleId default "1" (sesuai model)
//       },
//     });

//     // 5. Nonaktifkan OTP agar tidak bisa dipakai lagi
//     await prisma.kodeOtp.update({
//       where: { id: kodeId },
//       data: { isActive: false },
//     });

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Registrasi berhasil",
//         userId: newUser.id,
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Error registrasi:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Terjadi kesalahan saat registrasi",
//         // reason: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
//       },
//       { status: 500 }
//     );
//   } finally {
//     await prisma.$disconnect();
//   }
// }