'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PROFILE_PATH, decideDevAccess, type DevAccessDecision } from '@/lib/auth-policy';
import { authStore } from '@/store/authStore';

export type DevSessionUser = { name: string | null; email: string | null };

const REDIRECT: Record<Exclude<DevAccessDecision, 'allow'>, string> = {
  login: '/login',
  admin: '/admin',
  profile: PROFILE_PATH,
};

/**
 * Muat sesi dari /api/auth/me (seperti layout admin). Mengembalikan user hanya bila
 * DEVELOPER aktif; selain itu null dan diarahkan keluar, jadi halaman /dev tidak pernah dirender.
 */
export function useDeveloperSession(): DevSessionUser | null {
  const router = useRouter();
  const [user, setUser] = useState<DevSessionUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        const { user: me } = await res.json();
        const decision = me ? decideDevAccess({ roleId: me.roleId, isActive: me.isActive }, true) : 'login';
        if (cancelled) return;

        if (decision === 'allow') {
          authStore.setUser({
            id: me.id,
            name: me.name,
            roleId: Number(me.roleId),
            menuIds: Array.isArray(me.menuIds) ? me.menuIds : null,
            isActive: me.isActive,
          });
          setUser({ name: me.name ?? null, email: me.email ?? null });
          return;
        }
        if (decision === 'login') authStore.setUser(null);
        router.replace(REDIRECT[decision]);
      } catch (error) {
        console.error('Gagal memuat sesi developer:', error);
        if (cancelled) return;
        authStore.setUser(null);
        router.replace('/login');
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return user;
}
