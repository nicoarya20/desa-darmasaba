// GET /api/auth/google/callback — terima redirect balik dari Google.
// Validasi state CSRF, tukar code→token, ambil profil, cari/link/buat user, buat sesi, redirect by role.
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sessionCreate } from "../../_lib/session_create";
import { exchangeCodeForToken, fetchUserInfo, OAUTH_STATE_COOKIE } from "../../_lib/google/oauth_client";
import { mapUserInfoToUser, resolveOrCreateUser } from "../../_lib/google/user_resolver";
import { redirectByRole } from "../../_lib/google/redirect_by_role";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const loginError = (reason: string) =>
    NextResponse.redirect(new URL(`/login?error=${reason}`, req.url));

  // Google bisa balik dengan ?error= (mis. user batal)
  if (url.searchParams.get("error")) return loginError("oauth_denied");

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = req.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${OAUTH_STATE_COOKIE}=`))
    ?.split("=")[1];

  if (!code || !state || !cookieState || state !== cookieState) {
    return loginError("oauth_state");
  }

  try {
    const { access_token } = await exchangeCodeForToken({
      code,
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectUri: process.env.GOOGLE_REDIRECT_URI!,
    });

    const info = await fetchUserInfo(access_token);
    const mapped = mapUserInfoToUser(info);
    const user = await resolveOrCreateUser(mapped);

    await sessionCreate({
      sessionKey: process.env.BASE_SESSION_KEY!,
      jwtSecret: process.env.BASE_TOKEN_KEY!,
      exp: "30 day",
      user: {
        id: user.id,
        nomor: user.nomor,
        username: user.username,
        roleId: user.roleId,
        isActive: user.isActive,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // sessionCreate sudah set cookie sesi via next/headers; tinggal redirect.
    const response = NextResponse.redirect(new URL(redirectByRole(user.roleId), req.url));
    response.cookies.delete(OAUTH_STATE_COOKIE);
    return response;
  } catch (error) {
    // jangan log token/PII; cukup pesan + context
    console.error("❌ Google OAuth callback gagal:", error instanceof Error ? error.message : error);
    return loginError("oauth_failed");
  }
}
