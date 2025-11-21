// app/api/auth/_lib/session_create.ts
import { cookies } from "next/headers";
import { encrypt } from "./encrypt";
import prisma from "@/lib/prisma";

export async function sessionCreate({
  sessionKey,
  exp = "30 day",
  jwtSecret,
  user,
}: {
  sessionKey: string;
  exp?: string;
  jwtSecret: string;
  user: Record<string, unknown>;
}) {
  // 🔒 Validasi kunci tidak kosong
  if (!sessionKey || sessionKey.length === 0) {
    throw new Error("sessionKey tidak boleh kosong");
  }
  if (!jwtSecret || jwtSecret.length === 0) {
    throw new Error("jwtSecret tidak boleh kosong");
  }

  const token = await encrypt({
    exp,
    jwtSecret,
    user,
  });

  if (token === null) {
    throw new Error("Token generation failed");
  }

  // ✅ HYBRID: Simpan token ke database UserSession
  const userId = user.id as string;
  
  if (userId) {
    try {
      // Hapus session lama user ini (logout device lain)
      await prisma.userSession.deleteMany({
        where: { userId },
      });

      // Parse expiration
      const expiresDate = new Date();
      const expMatch = exp.match(/(\d+)\s*(day|year)/);
      
      if (expMatch) {
        const [, num, unit] = expMatch;
        const amount = parseInt(num);
        
        if (unit === 'year') {
          expiresDate.setFullYear(expiresDate.getFullYear() + amount);
        } else if (unit === 'day') {
          expiresDate.setDate(expiresDate.getDate() + amount);
        }
      } else {
        // Default 30 hari
        expiresDate.setDate(expiresDate.getDate() + 30);
      }

      // Buat session baru di database
      await prisma.userSession.create({
        data: {
          userId,
          token, // JWT token disimpan
          expires: expiresDate,
          active: true,
        },
      });

      console.log(`✅ Session created for user ${userId}`);
    } catch (dbError) {
      console.error("⚠️ Error menyimpan session ke database:", dbError);
      // Tetap lanjut meski gagal simpan ke DB (fallback ke JWT only)
    }
  }

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set(sessionKey, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60, // 30 hari dalam detik
  });

  return token;
}