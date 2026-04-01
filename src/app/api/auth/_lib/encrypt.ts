import { SignJWT } from "jose";

export async function encrypt({
  user,
  exp = "7d",
  jwtSecret,
}: {
  user: Record<string, unknown>;
  exp?: string | number;
  jwtSecret: string;
}): Promise<string | null> {
  try {
    const secret = new TextEncoder().encode(jwtSecret);
    return new SignJWT({ user })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(exp)
      .sign(secret);
  } catch (error) {
    console.error("JWT Encrypt failed:", error);
    return null;
  }
}