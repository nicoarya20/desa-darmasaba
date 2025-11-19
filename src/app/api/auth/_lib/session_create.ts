import { cookies } from "next/headers";
import { encrypt } from "./encrypt";

export async function sessionCreate({
  sessionKey,
  exp = "7 year",
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

  const cookieStore = await cookies();
  cookieStore.set(sessionKey, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });

  return token;
}