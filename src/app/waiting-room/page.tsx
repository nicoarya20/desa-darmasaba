/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import colors from '@/con/colors';
import { Center, Loader, Paper, Stack, Text, Title } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Ganti ini jika tidak pakai next-auth
async function fetchUser() {
  const res = await fetch('/api/auth/me');
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

export default function WaitingRoom() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  // const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


useEffect(() => {
  let isMounted = true;
  const interval = setInterval(async () => {
    try {
      const data = await fetchUser();
      if (!isMounted) return;

      const currentUser = data.user;
      setUser(currentUser);

      // ✅ Sekarang isActive tersedia!
      if (currentUser?.isActive) {
        clearInterval(interval);
        // Redirect ke halaman admin sesuai role
        if (currentUser.roleId === 0) {
          router.push('/admin/landing-page/profil/program-inovasi');
        } else {
          router.push('/admin'); // atau halaman default role
        }
      }
    } catch (err: any) {
      if (!isMounted) return;
      setError(err.message || 'Gagal memuat status');
      clearInterval(interval);
      if (err.message === 'Unauthorized') {
        router.push('/login');
      }
    }
  }, 2000);

  return () => {
    isMounted = false;
    clearInterval(interval);
  };
}, [router]);

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