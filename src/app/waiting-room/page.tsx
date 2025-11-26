/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import colors from '@/con/colors';
import {
  Button,
  Center,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authStore } from '@/store/authStore'; // ✅ integrasi authStore

async function fetchUser() {
  const res = await fetch('/api/auth/me');
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

export default function WaitingRoom() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;

  useEffect(() => {
    let isMounted = true;
    let interval: ReturnType<typeof setInterval>;

    const poll = async () => {
      if (isRedirecting || !isMounted) return;

      try {
        const data = await fetchUser();
        if (!isMounted) return;

        const currentUser = data.user;
        setUser(currentUser);

        // ✅ Update authStore
        if (currentUser) {
          authStore.setUser({
            id: currentUser.id,
            name: currentUser.name,
            roleId: Number(currentUser.roleId),
            menuIds: currentUser.menuIds || null,
          });
        }

        // In the poll function
        if (currentUser?.isActive === true) {
          setIsRedirecting(true);
          clearInterval(interval);

          // Update authStore with the current user data
          authStore.setUser({
            id: currentUser.id,
            name: currentUser.name || 'User',
            roleId: Number(currentUser.roleId),
            menuIds: currentUser.menuIds || null,
            isActive: true
          });

          // Clean up storage
          localStorage.removeItem('auth_kodeId');
          localStorage.removeItem('auth_nomor');
          localStorage.removeItem('auth_username');

          // Force a session refresh
          try {
            const res = await fetch('/api/auth/refresh-session', {
              method: 'POST',
              credentials: 'include'
            });

            if (res.ok) {
              // Redirect based on role
              let redirectPath = '/admin';
              switch (String(currentUser.roleId)) {
                case "0": case "1": case "2":
                  redirectPath = '/admin/landing-page/profil/program-inovasi';
                  break;
                case "3":
                  redirectPath = '/admin/kesehatan/posyandu';
                  break;
                case "4":
                  redirectPath = '/admin/pendidikan/info-sekolah/jenjang-pendidikan';
                  break;
              }
              window.location.href = redirectPath; // Use window.location to force full page reload
            }
          } catch (error) {
            console.error('Error refreshing session:', error);
            router.refresh(); // Fallback to client-side refresh
          }
        }
      } catch (err: any) {
        if (!isMounted) return;

        if (err.message.includes('401')) {
          if (retryCount < MAX_RETRIES) {
            setRetryCount((prev) => prev + 1);
            setTimeout(() => {
              if (isMounted) interval = setInterval(poll, 3000);
            }, 800);
          } else {
            setError('Sesi tidak valid. Silakan login ulang.');
            clearInterval(interval);
            authStore.setUser(null); // ✅ clear sesi
          }
        } else {
          console.error('Error polling:', err);
        }
      }
    };

    interval = setInterval(poll, 3000);
    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [router, isRedirecting, retryCount]);

  // ✅ UI Error
  if (error) {
    return (
      <Center h="100vh">
        <Paper p="xl" radius="md" bg={colors['white-trans-1']} w={400}>
          <Stack align="center" gap="md">
            <Title order={3} c="red">
              Sesi Tidak Valid
            </Title>
            <Text>{error}</Text>
            <Button onClick={() => router.push('/login')}>
              Login Ulang
            </Button>
          </Stack>
        </Paper>
      </Center>
    );
  }

  // ✅ UI Redirecting
  if (isRedirecting) {
    return (
      <Center h="100vh" bg={colors.Bg}>
        <Paper p="xl" radius="md" bg={colors['white-trans-1']} w={{ base: '90%', sm: 400 }}>
          <Stack align="center" gap="lg">
            <Title order={2} c={colors['blue-button']} ta="center">
              Akun Disetujui! ✅
            </Title>
            <Text ta="center" c="green">
              Mengalihkan ke dashboard...
            </Text>
            <Loader size="sm" color="green" />
          </Stack>
        </Paper>
      </Center>
    );
  }

  // ✅ UI Default (MENUNGGU) — INI YANG KAMU HILANGKAN!
  return (
    <Center h="100vh" bg={colors.Bg}>
      <Paper p="xl" radius="md" bg={colors['white-trans-1']} w={{ base: '90%', sm: 400 }}>
        <Stack align="center" gap="lg">
          <Title order={2} c={colors['blue-button']} ta="center">
            Menunggu Persetujuan
          </Title>
          <Text ta="center" c="dimmed">
            Akun Anda sedang dalam proses verifikasi oleh Superadmin.
          </Text>
          <Text ta="center" size="sm" c="dimmed">
            Nomor: {user?.nomor || '...'}
          </Text>
          <Loader size="sm" color={colors['blue-button']} />
          <Text ta="center" size="xs" c="dimmed">
            Jangan tutup halaman ini. Anda akan dialihkan otomatis setelah disetujui.
          </Text>
        </Stack>
      </Paper>
    </Center>
  );
}