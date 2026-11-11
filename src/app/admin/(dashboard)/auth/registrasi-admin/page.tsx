// app/registrasi/page.tsx
'use client';

import { apiFetchRegister } from '@/app/api/auth/_lib/api_fetch_auth';
import BackButton from '@/app/(public)/(pages)/pemerintahan/layanan/_com/BackButto';
import colors from '@/con/colors';
import {
  Box, Button, Center, Checkbox, Image, Paper, Stack, Text, TextInput, Title,
} from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { toast } from 'react-toastify';

export default function Registrasi() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState(''); // ✅ tambahkan state untuk phone
  const [agree, setAgree] = useState(false)

  // Ambil data dari localStorage (dari login)
  useEffect(() => {
    const storedNomor = localStorage.getItem('auth_nomor');
    if (!storedNomor) {
      toast.error('Akses tidak valid');
      router.push('/login');
      return;
    }
    setPhone(storedNomor);
  }, [router]);

  const handleRegister = async () => {
    if (!username || username.trim().length < 5) {
      toast.error('Username minimal 5 karakter!');
      return;
    }
    if (username.includes(' ')) {
      toast.error('Username tidak boleh ada spasi!');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      toast.error('Nomor tidak valid!');
      return;
    }

    if (!agree) {
      toast.error("Anda harus menyetujui syarat dan ketentuan!");
      return;
    }

    try {
      setLoading(true);
      // ✅ Hanya kirim username & nomor → dapat kodeId
      const response = await apiFetchRegister({ username, nomor: cleanPhone });

      if (response.success) {
        // Simpan sementara
        localStorage.setItem('auth_kodeId', response.kodeId);
        localStorage.setItem('auth_username', username); // simpan username

        toast.success('Kode verifikasi dikirim!');
        router.push('/validasi'); // ✅ ke halaman validasi
      }
    } catch (error) {
      console.error('Error Registrasi:', error);
      toast.error('Gagal mengirim OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack pos="relative" bg={colors.Bg} gap="22" py="xl" h="100vh">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }}>
        <Stack justify="center" align="center" h="80vh">
          <Paper p="xl" radius="md" bg={colors['white-trans-1']} w={{ base: '100%', sm: 400 }}>
            <Stack align="center">
              <Title order={2} fw="bold" c={colors['blue-button']}>
                Registrasi
              </Title>
              <Center>
                <Image loading="lazy" src="/darmasaba-icon.png" alt="" w={80} />
              </Center>
              <Box w="100%">
                <TextInput
                  label="Username"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.currentTarget.value)}
                  error={
                    username.length > 0 && username.length < 5
                      ? 'Minimal 5 karakter!'
                      : username.includes(' ')
                        ? 'Tidak boleh ada spasi'
                        : ''
                  }
                  required
                />

                <Box pt="md">
                  <Text fz="sm">Nomor Telepon</Text>
                  <PhoneInput
                    defaultCountry="id"
                    value={phone}
                    disabled
                  />
                </Box>

                <Box pt="md">
                  <Checkbox
                    checked={agree}
                    onChange={(e) => setAgree(e.currentTarget.checked)}
                    label={
                      <Text fz="sm">
                        Saya menyetujui{" "}
                        <a
                          href="/terms-of-service"
                          target="_blank"
                          style={{
                            color: colors["blue-button"],
                            textDecoration: "underline",
                            fontWeight: 500,
                          }}
                        >
                          syarat dan ketentuan
                        </a>
                      </Text>
                    }
                  />
                </Box>


                <Box pt="xl">
                  <Button
                    fullWidth
                    bg={colors['blue-button']}
                    radius="xl"
                    onClick={handleRegister}
                    loading={loading}
                    disabled={username.length < 5}
                  >
                    Kirim Kode Verifikasi
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