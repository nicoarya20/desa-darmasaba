'use client';
import { apiFetchLogin } from '@/app/api/auth/_lib/api_fetch_auth';
import colors from '@/con/colors';
import { Box, Button, Center, Divider, Image, Paper, Stack, Text, Title } from '@mantine/core';
import { IconBrandGoogle } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { toast } from 'react-toastify';

// Toggle UI login OTP. Backend OTP (/api/auth/*) tetap utuh — ini hanya
// menyembunyikan form phone/OTP di tampilan. Set true untuk memunculkan lagi.
const SHOW_OTP_LOGIN = false;

function Login() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  // Mulai alur Google OAuth. Pakai full-page navigation (bukan router.push)
  // karena OAuth butuh redirect HTTP ke Google, bukan client-side nav.
  function onGoogleLogin() {
    window.location.href = '/api/auth/google';
  }

  // Login.tsx
  async function onLogin() {

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      toast.error('Nomor telepon tidak valid');
      return;
    }

    try {
      setLoading(true);
      const response = await apiFetchLogin({ nomor: cleanPhone });

      if (!response.success) {
        toast.error(response.message || 'Gagal memproses login');
        return;
      }

      // Simpan nomor untuk register
      localStorage.setItem('auth_nomor', cleanPhone);
      if (response.isRegistered) {
        // ✅ User lama: simpan kodeId
        localStorage.setItem('auth_kodeId', response.kodeId);

        // ✅ Cookie sudah di-set oleh API, langsung redirect
        router.push('/validasi'); // Clean URL
      } else {
        // ❌ User baru: langsung ke registrasi (tanpa kodeId)
        router.push('/registrasi');
      }
    } catch (error) {
      console.error('Error Login:', error);
      toast.error('Terjadi kesalahan saat login');
    } finally {
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
                {SHOW_OTP_LOGIN && (
                  <>
                    <PhoneInput
                      countrySelectorStyleProps={{
                        buttonStyle: {
                          backgroundColor: colors['blue-button'],
                        },
                      }}
                      inputStyle={{ width: '100%' }}
                      defaultCountry="id"
                      value={phone}
                      onChange={(val) => setPhone(val)}
                    />

                    <Box py={20}>
                      <Button
                        fullWidth
                        bg={colors['blue-button']}
                        radius="xl"
                        onClick={onLogin}
                        loading={loading}
                      >
                        Masuk
                      </Button>
                    </Box>

                    <Divider my="sm" label="atau" labelPosition="center" />
                  </>
                )}

                <Button
                  fullWidth
                  variant="default"
                  radius="xl"
                  leftSection={<IconBrandGoogle size={18} />}
                  onClick={onGoogleLogin}
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