// src/app/api/auth/_lib/sessionCreate.ts
import { cookies } from "next/headers";
import { encrypt } from "./encrypt";
import prisma from "@/lib/prisma";
import { add } from "date-fns";

export async function sessionCreate({
  sessionKey,
  exp = "30 day",
  jwtSecret,
  user,
  invalidatePrevious = true, // 🔑 kontrol apakah sesi lama di-nonaktifkan
}: {
  sessionKey: string;
  exp?: string;
  jwtSecret: string;
  user: Record<string, unknown> & { id: string };
  invalidatePrevious?: boolean; // default true untuk login, false untuk registrasi
}) {
  // ✅ Validasi env vars
  if (!sessionKey || sessionKey.length === 0) {
    throw new Error("sessionKey tidak boleh kosong");
  }
  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error("jwtSecret minimal 32 karakter");
  }

  const token = await encrypt({ exp, jwtSecret, user });
  if (!token) {
    throw new Error("Token generation failed");
  }

  // ✅ Hitung expiresAt
  let expiresAt = add(new Date(), { days: 30 });
  if (exp === "7 day") expiresAt = add(new Date(), { days: 7 });

  // 🔐 Hanya nonaktifkan sesi aktif sebelumnya jika diminta (misal: saat login ulang)
  if (invalidatePrevious) {
    await prisma.userSession.updateMany({
      where: { userId: user.id, active: true },
      data: { active: false },
    });
  }

  // ✅ Simpan sesi baru
  await prisma.userSession.create({
    data: {
      token,
      userId: user.id,
      active: true,
      expiresAt,
    },
  });

  // ✅ Set cookie
  (await cookies()).set(sessionKey, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60, // 30 hari dalam detik
  });

  return token;
}