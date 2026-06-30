// Klien Google OAuth 2.0 (Authorization Code Flow) — manual, tanpa library.
// buildConsentUrl murni (testable). exchangeCodeForToken & fetchUserInfo melakukan I/O.
// PENTING: jangan pernah log access_token / id_token / email penuh.

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

export const DEFAULT_SCOPE = "openid email profile";

// Nama cookie httpOnly short-lived untuk state CSRF antara /google dan /callback.
export const OAUTH_STATE_COOKIE = "g_oauth_state";

export type GoogleUserInfo = {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
  verified_email?: boolean;
};

/** Bangun URL halaman consent Google. Fungsi murni — dipakai route /api/auth/google. */
export function buildConsentUrl({
  clientId,
  redirectUri,
  state,
  scope = DEFAULT_SCOPE,
}: {
  clientId: string;
  redirectUri: string;
  state: string;
  scope?: string;
}): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope,
    state,
    access_type: "offline",
    prompt: "select_account",
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/** Tukar authorization code dengan access token (server-to-server). */
export async function exchangeCodeForToken({
  code,
  clientId,
  clientSecret,
  redirectUri,
}: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}): Promise<{ access_token: string; id_token?: string }> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }).toString(),
  });

  if (!res.ok) {
    // sertakan status sebagai context, jangan ekspos body (bisa mengandung detail sensitif)
    throw new Error(`Google token exchange gagal: HTTP ${res.status}`);
  }

  const data = (await res.json()) as { access_token?: string; id_token?: string };
  if (!data.access_token) {
    throw new Error("Google token exchange: access_token tidak ada di respons");
  }
  return { access_token: data.access_token, id_token: data.id_token };
}

/** Ambil profil user dari Google userinfo endpoint. */
export async function fetchUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Google userinfo gagal: HTTP ${res.status}`);
  }

  const info = (await res.json()) as GoogleUserInfo;
  if (!info.id) {
    throw new Error("Google userinfo: id tidak ada di respons");
  }
  return info;
}
