/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import colors from '@/con/colors';
import { Center, Loader, Paper, Stack, Text, Title } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

async function fetchUser() {
  const res = await fetch('/api/auth/me');
  if (!res.ok) {
    // Jangan throw error — biarkan handle status code
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

  useEffect(() => {
    let isMounted = true;
    const interval = setInterval(async () => {
      if (isRedirecting || !isMounted) return;

      try {
        const data = await fetchUser();
        if (!isMounted) return;

        const currentUser = data.user;
        setUser(currentUser);

        // ✅ Periksa isActive dan redirect
        if (currentUser?.isActive === true) {
          setIsRedirecting(true);
          clearInterval(interval);

          // ✅ roleId adalah STRING → gunakan string literal
          let redirectPath = '/admin';

          switch (currentUser.roleId) {
            case "0": // DEVELOPER
            case "1": // SUPERADMIN
            case "2": // ADMIN_DESA
              redirectPath = '/admin/landing-page/profil/program-inovasi';
              break;
            case "3": // ADMIN_KESEHATAN
              redirectPath = '/admin/kesehatan/posyandu';
              break;
            case "4": // ADMIN_PENDIDIKAN
              redirectPath = '/admin/pendidikan/info-sekolah/jenjang-pendidikan';
              break;
          }

          setTimeout(() => router.push(redirectPath), 500);
        }
      } catch (err: any) {
        if (!isMounted) return;

        // ❌ Hanya redirect ke /login jika benar-benar tidak ada sesi
        if (err.message.includes('401')) {
          setError('Sesi tidak valid');
          clearInterval(interval);
          router.push('/login');
        } else {
          console.error('Error polling:', err);
        }
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [router, isRedirecting]);

  if (error) {
    return (
      <Center h="100vh">
        <Paper p="xl" radius="md" bg={colors['white-trans-1']} w={400}>
          <Stack align="center" gap="md">
            <Title order={3} c="red">Error</Title>
            <Text>{error}</Text>
          </Stack>
        </Paper>
      </Center>
    );
  }

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