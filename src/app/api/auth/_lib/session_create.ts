// app/api/auth/_lib/session_create.ts
import { cookies } from "next/headers";
import { encrypt } from "./encrypt";
import prisma from "@/lib/prisma";
import { add } from "date-fns";

export async function sessionCreate({
  sessionKey,
  exp = "30 day",
  jwtSecret,
  user,
}: {
  sessionKey: string;
  exp?: string;
  jwtSecret: string;
  user: Record<string, unknown> & { id: string };
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

  // ✅ Hitung expiresAt sesuai exp
  let expiresAt = add(new Date(), { days: 30 });
  if (exp === "7 day") expiresAt = add(new Date(), { days: 7 });
  // tambahkan opsi lain jika perlu

  // Sebelum create session baru, nonaktifkan session aktif sebelumnya
  await prisma.userSession.updateMany({
    where: { userId: user.id, active: true },
    data: { active: false },
  });

  // ✅ Simpan ke database
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
    maxAge: 30 * 24 * 60 * 60, // seconds
  });

  return token;
}
