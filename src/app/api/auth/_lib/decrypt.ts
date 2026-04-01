import { jwtVerify } from "jose";

export async function decrypt({
  token,
  jwtSecret,
}: {
  token: string;
  jwtSecret: string;
}): Promise<Record<string, unknown> | null> {
  if (!token || !jwtSecret) return null;

  try {
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    if (
      typeof payload !== "object" ||
      payload === null ||
      !("user" in payload) ||
      typeof payload.user !== "object"
    ) {
      return null;
    }

    return payload.user as Record<string, unknown>;
  } catch (error) {
    console.error("JWT Decrypt failed:", error);
    return null;
  }
}