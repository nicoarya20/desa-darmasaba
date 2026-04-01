// app/api/auth/_lib/session_verify.ts
import { cookies } from "next/headers";
import { decrypt } from "./decrypt";
import prisma from "@/lib/prisma";

export async function verifySession() {
  try {
    const sessionKey = process.env.BASE_SESSION_KEY;
    const jwtSecret = process.env.BASE_TOKEN_KEY;
    if (!sessionKey || !jwtSecret) throw new Error('Env tidak lengkap');

    const token = (await cookies()).get(sessionKey)?.value;
    if (!token) return null;

    const jwtUser = await decrypt({ token, jwtSecret });
    if (!jwtUser?.id) return null;

    // Cari session di DB berdasarkan token
    const dbSession = await prisma.userSession.findFirst({
      where: { 
        token, 
        active: true,
        expiresAt: { gte: new Date() }
      },
      include: { user: true }
    });

    if (!dbSession) {
      console.log('⚠️ Session tidak ditemukan di DB');
      return null;
    }

    // Don't check isActive here, let the frontend handle it
    return dbSession.user;
  } catch (error) {
    console.warn('Session verification failed:', error);
    return null;
  }
}