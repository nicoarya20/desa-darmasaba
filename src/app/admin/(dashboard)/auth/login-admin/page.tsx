'use client';
import { authClient } from '@/lib/auth-client';
import colors from '@/con/colors';
import { Box, Button, Center, Image, Paper, Stack, Text, Title } from '@mantine/core';
import { IconBrandGoogle } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

function Login() {
  const [loading, setLoading] = useState(false);

  // Mulai alur Google OAuth via Better Auth. Redirect ke consent Google,
  // callback ke /api/auth/callback/google, lalu kembali ke callbackURL.
  async function onGoogleLogin() {
    try {
      setLoading(true);
      // callbackURL → gateway yang redirect sesuai role user (admin/profil).
      await authClient.signIn.social({ provider: 'google', callbackURL: '/auth/callback' });
    } catch (error) {
      console.error('Error Google login:', error);
      toast.error('Gagal memulai login Google');
      setLoading(false);
    }
  }

  return (
    <Stack pos="relative" bg={colors.Bg}>
      <Box px={{ base: 'md', md: 100 }} pb={50}>
        <Stack align="center" justify="center" h="100vh">
          <Paper p="xl" radius="md" bg={colors['white-trans-1']} w={{ base: '100%', sm: 400 }}>
            <Stack align="center" gap="lg">
              <Box>
                <Title ta="center" order={2} fw="bold" c={colors['blue-button']}>
                  Login
                </Title>
                <Center>
                  <Image
                    loading="lazy"
                    src="/darmasaba-icon.png"
                    alt="Logo"
                    w={80}
                    h={80}
                  />
                </Center>
              </Box>
              <Box w="100%">
                <Button
                  fullWidth
                  variant="default"
                  radius="xl"
                  leftSection={<IconBrandGoogle size={18} />}
                  onClick={onGoogleLogin}
                  loading={loading}
                >
                  Login dengan Google
                </Button>

                <Text ta="center" size="xs" c="dimmed" mt="sm">
                  Masuk menggunakan akun Google Anda
                </Text>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Login;
