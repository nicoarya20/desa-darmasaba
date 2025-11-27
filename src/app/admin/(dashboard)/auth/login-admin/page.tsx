'use client';
import { apiFetchLogin } from '@/app/api/auth/_lib/api_fetch_auth';
import colors from '@/con/colors';
import { Box, Button, Center, Image, Paper, Stack, Title } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { toast } from 'react-toastify';

function Login() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  // Login.tsx
  async function onLogin() {

    const cleanPhone = phone.replace(/\D/g, '');
    console.log(cleanPhone);
    if (cleanPhone.length < 10) {
      toast.error('Nomor telepon tidak valid');
      return;
    }

    try {
      setLoading(true);
      const response = await apiFetchLogin({ nomor: cleanPhone });

      console.log(response);

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
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Login;