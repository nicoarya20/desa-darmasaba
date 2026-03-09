/**
 * Session helper menggunakan iron-session
 *
 * Usage:
 * import { getSession } from "@/lib/session";
 *
 * const session = await getSession();
 * if (session?.user) {
 *   // User authenticated
 * }
 */

import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export type SessionData = {
  user?: {
    id: string;
    name: string;
    roleId: number;
    menuIds?: string[] | null;
    isActive?: boolean;
  };
};

export type Session = SessionData & {
  save: () => Promise<void>;
  destroy: () => Promise<void>;
};

// Validate SESSION_PASSWORD environment variable
if (!process.env.SESSION_PASSWORD) {
  throw new Error(
    'SESSION_PASSWORD environment variable is required. ' +
    'Please set a strong password (min 32 characters) in your .env file.'
  );
}

// Validate password length for security
if (process.env.SESSION_PASSWORD.length < 32) {
  throw new Error(
    'SESSION_PASSWORD must be at least 32 characters long for security. ' +
    'Please use a strong random password.'
  );
}

const SESSION_OPTIONS = {
  cookieName: 'desa-session',
  password: process.env.SESSION_PASSWORD,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  },
};

export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(
      cookieStore,
      SESSION_OPTIONS
    );
    
    return session;
  } catch (error) {
    console.error('Session error:', error);
    return null;
  }
}

export async function destroySession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(
      cookieStore,
      SESSION_OPTIONS
    );
    await session.destroy();
  } catch (error) {
    console.error('Destroy session error:', error);
  }
}
