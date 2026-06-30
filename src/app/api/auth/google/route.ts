// GET /api/auth/google — mulai Google OAuth.
// Generate state CSRF, simpan di cookie httpOnly short-lived, redirect ke halaman consent Google.
import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { buildConsentUrl, OAUTH_STATE_COOKIE } from "../_lib/google/oauth_client";

export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    console.error("❌ Google OAuth: GOOGLE_CLIENT_ID / GOOGLE_REDIRECT_URI belum di-set");
    // base URL diambil dari origin request (req.url) — NEXT_PUBLIC_BASE_URL bisa "/" yang
    // membuat new URL() melempar TypeError → 500 buram. Origin selalu absolut & aman.
    return NextResponse.redirect(new URL("/login?error=oauth_config", req.url));
  }

  const state = randomBytes(16).toString("hex");
  const consentUrl = buildConsentUrl({ clientId, redirectUri, state });

  const response = NextResponse.redirect(consentUrl);
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600, // 10 menit, cukup untuk satu alur consent
  });
  return response;
}
