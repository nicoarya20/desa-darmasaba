'use client';

import colors from '@/con/colors';
import { Avatar, Button, Center, Loader, Paper, Stack, Text } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

type ProfileUser = {
  id: string;
  name: string;
  email: string | null;
  avatar: string | null;
  roleId: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        const data = await res.json();
        if (!res.ok || !data.success || !data.user) {
          window.location.href = '/login';
          return;
        }
        setUser(data.user);
      } catch {
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onLogout() {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      window.location.href = '/login';
    } catch {
      toast.error('Gagal logout, coba lagi');
      setLoggingOut(false);
    }
  }

  return (
    <Center mih="100vh" bg={colors.Bg} p="md">
      {loading ? (
        <Loader color={colors['blue-button']} />
      ) : user ? (
        <Paper
          bg={colors['white-1']}
          p="xl"
          radius="lg"
          shadow="sm"
          withBorder
          w={{ base: '100%', xs: 380 }}
        >
          <Stack align="center" gap="md">
            <Avatar src={user.avatar} alt={user.name} size={96} radius="50%" color="blue">
              {user.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Stack align="center" gap={4}>
              <Text fz="xl" fw={700} c={colors['blue-button']}>
                {user.name}
              </Text>
              {user.email && (
                <Text fz="sm" c="dimmed">
                  {user.email}
                </Text>
              )}
            </Stack>
            <Button
              leftSection={<IconLogout size={18} />}
              color="red"
              variant="light"
              radius="xl"
              onClick={onLogout}
              loading={loggingOut}
            >
              Keluar
            </Button>
          </Stack>
        </Paper>
      ) : null}
    </Center>
  );
}
