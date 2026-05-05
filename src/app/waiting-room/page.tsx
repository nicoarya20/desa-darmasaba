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
  Progress,
  Group,
} from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authStore } from '@/store/authStore';

// ⚙️ Configuration
const CONFIG = {
  POLL_INTERVAL: 3000,        // 3 detik
  MAX_RETRIES: 2,              // 2x retry
  TIMEOUT_DURATION: 5 * 60 * 1000, // 5 menit (300 detik)
};

async function fetchUser() {
  const res = await fetch('/api/auth/me', {
    credentials: 'include'
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function WaitingRoom() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // ⏱️ Countdown timer
  const [timeLeft, setTimeLeft] = useState(CONFIG.TIMEOUT_DURATION / 1000); // dalam detik
  const [hasTimedOut, setHasTimedOut] = useState(false);

  // ⏱️ Countdown effect
  useEffect(() => {
    if (isRedirecting || hasTimedOut) return;

    const countdownInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setHasTimedOut(true);
          setError('Waktu tunggu habis. Silakan hubungi administrator atau coba login ulang nanti.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [isRedirecting, hasTimedOut]);

  // 🔄 Polling effect
  useEffect(() => {
    let isMounted = true;
    let interval: ReturnType<typeof setInterval>;

    const poll = async () => {
      if (isRedirecting || !isMounted || hasTimedOut) return;

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

        // ✅ Check if approved
        if (currentUser?.isActive === true) {
          setIsRedirecting(true);
          clearInterval(interval);

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

          // Force session refresh
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
                  redirectPath = '/admin/kesehatan/posyandu/list-posyandu';
                  break;
                case "4":
                  redirectPath = '/admin/pendidikan/info-sekolah/jenjang-pendidikan';
                  break;
              }
              window.location.href = redirectPath;
            }
          } catch (error) {
            console.error('Error refreshing session:', error);
            router.refresh();
          }
        }
      } catch (err: any) {
        if (!isMounted) return;

        if (err.message.includes('401')) {
          if (retryCount < CONFIG.MAX_RETRIES) {
            setRetryCount((prev) => prev + 1);
            setTimeout(() => {
              if (isMounted) interval = setInterval(poll, CONFIG.POLL_INTERVAL);
            }, 800);
          } else {
            setError('Sesi tidak valid. Silakan login ulang.');
            clearInterval(interval);
            authStore.setUser(null);
          }
        } else {
          console.error('Error polling:', err);
        }
      }
    };

    interval = setInterval(poll, CONFIG.POLL_INTERVAL);
    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [router, isRedirecting, retryCount, hasTimedOut]);

  // 🚨 Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      authStore.setUser(null);
      localStorage.clear();
      router.push('/login');
    }
  };

  // ❌ UI Error / Timeout
  if (error || hasTimedOut) {
    return (
      <Center h="100vh" bg={colors.Bg}>
        <Paper p="xl" radius="md" bg={colors['white-trans-1']} w={{ base: '90%', sm: 400 }}>
          <Stack align="center" gap="md">
            <Title order={3} c="red" ta="center">
              {hasTimedOut ? '⏱️ Waktu Habis' : '❌ Sesi Tidak Valid'}
            </Title>
            <Text ta="center" size="sm">
              {error || 'Waktu tunggu persetujuan telah habis.'}
            </Text>
            <Text ta="center" size="xs" c="dimmed">
              Silakan hubungi Superadmin atau coba login ulang nanti.
            </Text>
            <Group gap="sm" w="100%">
              <Button
                fullWidth
                variant="outline"
                onClick={handleLogout}
              >
                Kembali ke Login
              </Button>
            </Group>
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

  // ⏳ UI Default (MENUNGGU)
  const progressValue = ((CONFIG.TIMEOUT_DURATION / 1000 - timeLeft) / (CONFIG.TIMEOUT_DURATION / 1000)) * 100;

  return (
    <Center h="100vh" bg={colors.Bg}>
      <Paper p="xl" radius="md" bg={colors['white-trans-1']} w={{ base: '90%', sm: 400 }}>
        <Stack align="center" gap="lg">
          <Title order={2} c={colors['blue-button']} ta="center">
            ⏳ Menunggu Persetujuan
          </Title>

          <Text ta="center" c="dimmed">
            Akun Anda sedang dalam proses verifikasi oleh Superadmin.
          </Text>

          <Text ta="center" size="sm" fw={500}>
            Nomor: {user?.nomor || '...'}
          </Text>

          {/* ⏱️ Countdown Timer */}
          <Stack w="100%" gap="xs">
            <Group justify="space-between" w="100%">
              <Text size="sm" c="dimmed">Sisa waktu:</Text>
              <Text size="sm" fw={600} c={timeLeft < 60 ? 'red' : colors['blue-button']}>
                {formatTime(timeLeft)}
              </Text>
            </Group>
            <Progress
              value={progressValue}
              color={timeLeft < 60 ? 'red' : colors['blue-button']}
              size="sm"
              animated
            />
          </Stack>

          <Loader size="sm" color={colors['blue-button']} />

          <Text ta="center" size="xs" c="dimmed">
            Jangan tutup halaman ini. Anda akan dialihkan otomatis setelah disetujui.
          </Text>

          {/* 🚪 Tombol Keluar */}
          <Button
            variant="subtle"
            size="xs"
            onClick={handleLogout}
            c="dimmed"
          >
            Keluar dari Halaman Ini
          </Button>
        </Stack>
      </Paper>
    </Center>
  );
}