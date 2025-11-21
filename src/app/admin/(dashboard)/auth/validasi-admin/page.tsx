// 

'use client';

import { apiFetchOtpData, apiFetchVerifyOtp } from '@/app/api/auth/_lib/api_fetch_auth';
import colors from '@/con/colors';
import { Box, Button, Loader, Paper, PinInput, Stack, Text, Title } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { authStore } from '@/store/authStore';

export default function Validasi() {
  const router = useRouter();
  const [nomor, setNomor] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [kodeId, setKodeId] = useState<string | null>(null);

  // Inisialisasi data OTP
  useEffect(() => {
    const storedKodeId = localStorage.getItem('auth_kodeId');
    if (!storedKodeId) {
      toast.error('Akses tidak valid');
      router.replace('/login');
      return;
    }

    setKodeId(storedKodeId);

    const loadOtpData = async () => {
      try {
        const result = await apiFetchOtpData({ kodeId: storedKodeId });
        if (result.success && result.data?.nomor) {
          setNomor(result.data.nomor);
        } else {
          throw new Error('Data OTP tidak valid');
        }
      } catch (error) {
        console.error('Gagal memuat data OTP:', error);
        toast.error('Kode verifikasi tidak valid');
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadOtpData();
  }, [router]);

  // Verifikasi OTP
  const handleVerify = async () => {
    if (!kodeId || !nomor || otp.length < 4) return;

    setLoading(true);
    try {
      const verifyResult = await apiFetchVerifyOtp({ nomor, otp, kodeId });

      if (!verifyResult.success) {
        // Registrasi baru?
        if (
          verifyResult.status === 404 &&
          verifyResult.message?.includes('Akun tidak ditemukan')
        ) {
          await handleNewRegistration();
          return;
        }

        // Error lain
        toast.error(verifyResult.message || 'Verifikasi gagal');
        return;
      }

      // ✅ Verifikasi sukses → simpan user ke store
      const user = verifyResult.user;
      console.log('=== DEBUG USER ===');
      console.log('Full user object:', user);

      if (!user || !user.id) {
        toast.error('Data pengguna tidak lengkap');
        return;
      }

      const roleId = Number(user.roleId);
      authStore.setUser({
        id: user.id,
        name: user.name || user.username || 'User',
        roleId: roleId,
      });

      cleanupStorage();

      const isUserActive = user.isActive ?? user.is_active ?? true;

      // Redirect berdasarkan status approval
      if (!isUserActive) {
        router.replace('/waiting-room');
        return;
      }
      
      // ✅ Switch statement lebih clean
      let redirectPath: string;
      
      switch (roleId) {
        case 0:
        case 1:
          redirectPath = '/admin/landing-page/profil/program-inovasi';
          break;
        case 2:
          redirectPath = '/admin/kesehatan/posyandu';
          break;
        case 3:
          redirectPath = '/admin/pendidikan/info-sekolah/jenjang-pendidikan';
          break;
        default:
          redirectPath = '/admin';
          console.warn('Unknown roleId:', roleId);
      }
      
      console.log('Redirecting to:', redirectPath);
      router.replace(redirectPath);

    } catch (error) {
      console.error('Error saat verifikasi:', error);
      toast.error('Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  // Registrasi baru
  const handleNewRegistration = async () => {
    const username = localStorage.getItem('auth_username');
    if (!username) {
      toast.error('Data registrasi tidak ditemukan');
      return;
    }

    try {
      const res = await fetch('/api/auth/finalize-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomor, username, otp, kodeId }),
      });

      const data = await res.json();

      if (data.success) {
        // Set user sementara (tanpa roleId, akan diisi saat approve)
        authStore.setUser({
          id: 'pending',
          name: username,
        });
        cleanupStorage();
        router.replace('/waiting-room');
      } else {
        toast.error(data.message || 'Registrasi gagal');
      }
    } catch (error) {
      console.error('Error registrasi:', error);
      toast.error('Gagal menyelesaikan registrasi');
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
      } else {
        toast.error(data.message || 'Gagal mengirim ulang OTP');
      }
    } catch {
      toast.error('Gagal menghubungi server');
    }
  };

  // Loading
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
              <Box w="100%">
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
                  <Button
                    variant="subtle"
                    onClick={handleResend}
                    size="xs"
                    p={0}
                    h="auto"
                    color={colors['blue-button']}
                  >
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