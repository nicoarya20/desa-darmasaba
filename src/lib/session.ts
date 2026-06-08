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

const sessionPassword = process.env.SESSION_PASSWORD;
if (!sessionPassword) {
  throw new Error('SESSION_PASSWORD env var is not set. Set it to a random string of at least 32 characters.');
}

const SESSION_OPTIONS = {
  cookieName: 'desa-session',
  password: sessionPassword,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
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
