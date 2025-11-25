// app/api/auth/_lib/session_create.ts
import { cookies } from "next/headers";
import { encrypt } from "./encrypt";

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

  // Set cookie
  (await cookies()).set(sessionKey, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60,
  });

  console.log("✅ BASE_SESSION_KEY loaded:", !!process.env.BASE_SESSION_KEY);
  console.log("✅ BASE_TOKEN_KEY loaded:", !!process.env.BASE_TOKEN_KEY);

  return token;
}
