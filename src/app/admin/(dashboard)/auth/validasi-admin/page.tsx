// app/validasi/page.tsx
'use client';

import { apiFetchOtpData, apiFetchVerifyOtp } from '@/app/api/auth/_lib/api_fetch_auth';
import colors from '@/con/colors';
import { Box, Button, Loader, Paper, PinInput, Stack, Text, Title } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function Validasi() {
  const router = useRouter();
  const [nomor, setNomor] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [kodeId, setKodeId] = useState<string | null>(null);

  useEffect(() => {
    const storedKodeId = localStorage.getItem('auth_kodeId');
    if (!storedKodeId) {
      toast.error('Akses tidak valid');
      router.push('/login');
      return;
    }

    setKodeId(storedKodeId);

    const fetchOtpData = async () => {
      try {
        const result = await apiFetchOtpData({ kodeId: storedKodeId });
        if (result.success && result.data?.nomor) {
          setNomor(result.data.nomor);
        } else {
          throw new Error('OTP tidak valid');
        }
      } catch (error) {
        console.error('Gagal muat OTP:', error);
        toast.error('Kode verifikasi tidak valid');
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOtpData();
  }, [router]);

  const handleVerify = async () => {
    if (!kodeId || !nomor || otp.length < 4) return;
  
    try {
      setLoading(true);
      const verifyResult = await apiFetchVerifyOtp({ nomor, otp, kodeId });
  
      if (verifyResult.success) {
        cleanupStorage();
        router.push('/admin/landing-page/profil/program-inovasi');
        return; // ✅ HENTIKAN eksekusi di sini
      }
  
      // Hanya coba registrasi jika akun tidak ditemukan
      if (verifyResult.status === 404 && verifyResult.message?.includes('Akun tidak ditemukan')) {
        const username = localStorage.getItem('auth_username');
        if (!username) {
          toast.error('Data registrasi hilang');
          return;
        }
  
        const regRes = await fetch('/api/auth/finalize-registration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nomor, username, otp, kodeId }),
        });
  
        const regData = await regRes.json();
        if (regData.success) {
          cleanupStorage();
          router.push('/waiting-room'); // ✅
        } else {
          toast.error(regData.message || 'Registrasi gagal');
        }
      } else {
        // Hanya tampilkan error jika bukan kasus "akun tidak ditemukan"
        toast.error(verifyResult.message || 'Verifikasi gagal');
      }
    } catch (error) {
      console.error('Verifikasi error:', error);
      toast.error('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const cleanupStorage = () => {
    localStorage.removeItem('auth_kodeId');
    localStorage.removeItem('auth_nomor');
    localStorage.removeItem('auth_username');
  };

  const handleResend = async () => {
    if (!nomor) return;
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomor }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('auth_kodeId', data.kodeId);
        toast.success('OTP baru dikirim');
      }
    } catch {
      toast.error('Gagal kirim ulang');
    }
  };

  if (isLoading) {
    return (
      <Stack pos="relative" bg={colors.Bg} align="center" justify="center" h="100vh">
        <Loader size="md" color={colors['blue-button']} />
      </Stack>
    );
  }

  if (!nomor) return null;

  return (
    <Stack pos="relative" bg={colors.Bg}>
      <Box px={{ base: 'md', md: 100 }} pb={50}>
        <Stack align="center" justify="center" h="100vh">
          <Paper p="xl" radius="md" bg={colors['white-trans-1']} w={{ base: '100%', sm: 400 }}>
            <Stack align="center" gap="lg">
              <Box>
                <Title ta="center" order={2} fw="bold" c={colors['blue-button']}>
                  Kode Verifikasi
                </Title>
                <Text ta="center" size="sm" c="dimmed" mt="xs">
                  Kami telah mengirim kode ke nomor <strong>{nomor}</strong>
                </Text>
              </Box>
              <Box>
                <Box mb={20}>
                  <Text c={colors['blue-button']} ta="center" fz="sm" fw="bold">
                    Masukkan Kode Verifikasi
                  </Text>
                  <PinInput
                    length={4}
                    value={otp}
                    onChange={setOtp}
                    onComplete={handleVerify}
                    inputMode="numeric"
                    size="lg"
                  />
                </Box>

                <Button
                  fullWidth
                  onClick={handleVerify}
                  loading={loading}
                  disabled={otp.length < 4}
                  bg={colors['blue-button']}
                  radius="xl"
                >
                  Verifikasi
                </Button>

                <Text ta="center" size="sm" mt="md">
                  Tidak menerima kode?{' '}
                  <Button variant="subtle" onClick={handleResend} size="xs" p={0} h="auto" color={colors['blue-button']}>
                    Kirim Ulang
                  </Button>
                </Text>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}