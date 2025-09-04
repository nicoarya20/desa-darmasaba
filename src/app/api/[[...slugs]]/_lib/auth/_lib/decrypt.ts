/* eslint-disable @typescript-eslint/no-explicit-any */
import { jwtVerify } from "jose";

export async function decrypt({
  token,
  encodedKey,
}: {
  token: string;
  encodedKey: string;
}): Promise<Record<string, any> | null> {
  if (!token || !encodedKey) {
    console.error("Missing required parameters:", {
      hasToken: !!token,
      hasEncodedKey: !!encodedKey,
    });
    return null;
  }

  try {
    const enc = new TextEncoder().encode(encodedKey);
    const { payload } = await jwtVerify(token, enc, {
      algorithms: ["HS256"],
    });

    if (!payload || !payload.user) {
      console.error("Invalid payload structure:", {
        hasPayload: !!payload,
        hasUser: payload ? !!payload.user : false,
      });
      return null;
    }

    // Logging untuk debug
    // console.log("Decrypt successful:", {
    //   payloadExists: !!payload,
    //   userExists: !!payload.user,
    //   tokenPreview: token.substring(0, 10) + "...",
    // });

    return payload.user as Record<string, any>;
  } catch (error) {
    console.error("Token verification failed:", {
      error,
      tokenLength: token?.length,
      errorName: error instanceof Error ? error.name : "Unknown error",
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
