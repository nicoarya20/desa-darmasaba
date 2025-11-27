'use client';

import colors from '@/con/colors';
import {
  Box,
  Button,
  Center,
  Loader,
  Paper,
  PinInput,
  Stack,
  Text,
  Title,
} from '@mantine/core';
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
  const [isRegistrationFlow, setIsRegistrationFlow] = useState(false);

  // ✅ Deteksi flow dari cookie via API
  useEffect(() => {
    const checkFlow = async () => {
      try {
        const res = await fetch('/api/auth/get-flow', {
          credentials: 'include'
        });
        const data = await res.json();
        
        if (data.success) {
          setIsRegistrationFlow(data.flow === 'register');
          console.log('🔍 Flow detected from cookie:', data.flow);
        }
      } catch (error) {
        console.error('❌ Error getting flow:', error);
        setIsRegistrationFlow(false);
      }
    };
    
    checkFlow();
  }, []);

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
        const res = await fetch(`/api/auth/otp-data?kodeId=${encodeURIComponent(storedKodeId)}`);
        const result = await res.json();

        if (res.ok && result.data?.nomor) {
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

  const handleVerify = async () => {
    if (!kodeId || !nomor || otp.length < 4) return;

    setLoading(true);
    try {
      if (isRegistrationFlow) {
        await handleRegistrationVerification();
      } else {
        await handleLoginVerification();
      }
    } catch (error) {
      console.error('Error saat verifikasi:', error);
      toast.error('Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationVerification = async () => {
    const username = localStorage.getItem('auth_username');
    if (!username) {
      toast.error('Data registrasi tidak ditemukan.');
      return;
    }

    const cleanNomor = nomor?.replace(/\D/g, '') ?? '';
    if (cleanNomor.length < 10 || username.trim().length < 5) {
      toast.error('Data tidak valid');
      return;
    }

    const verifyRes = await fetch('/api/auth/verify-otp-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nomor: cleanNomor, otp, kodeId }),
    });

    const verifyData = await verifyRes.json();
    if (!verifyRes.ok) {
      toast.error(verifyData.message || 'Verifikasi OTP gagal');
      return;
    }

    const finalizeRes = await fetch('/api/auth/finalize-registration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nomor, username, kodeId }),
      credentials: 'include'
    });

    const data = await finalizeRes.json();
    
    if (data.success || finalizeRes.redirected) {
      // ✅ Cleanup setelah registrasi sukses
      await cleanupStorage();
      window.location.href = '/waiting-room';
    } else {
      toast.error(data.message || 'Registrasi gagal');
    }
  };

  const handleLoginVerification = async () => {
    const loginRes = await fetch('/api/auth/verify-otp-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nomor, otp, kodeId }),
      credentials: 'include'
    });

    const loginData = await loginRes.json();

    if (!loginRes.ok) {
      toast.error(loginData.message || 'Verifikasi gagal');
      return;
    }

    const { id, name, roleId, isActive } = loginData.user;

    authStore.setUser({
      id,
      name: name || 'User',
      roleId: Number(roleId),
    });

    // ✅ Cleanup setelah login sukses
    await cleanupStorage();

    if (!isActive) {
      window.location.href = '/waiting-room';
      return;
    }

    const redirectPath = getRedirectPath(Number(roleId));
    router.replace(redirectPath);
  };

  const getRedirectPath = (roleId: number): string => {
    switch (roleId) {
      case 0:
      case 1:
      case 2:
        return '/admin/landing-page/profil/program-inovasi';
      case 3:
        return '/admin/kesehatan/posyandu';
      case 4:
        return '/admin/pendidikan/info-sekolah/jenjang-pendidikan';
      default:
        return '/admin';
    }
  };

  // ✅ CLEANUP FUNCTION - Hapus localStorage + Cookie
  const cleanupStorage = async () => {
    // Clear localStorage
    localStorage.removeItem('auth_kodeId');
    localStorage.removeItem('auth_nomor');
    localStorage.removeItem('auth_username');
    
    // Clear cookie
    try {
      await fetch('/api/auth/clear-flow', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error clearing flow cookie:', error);
    }
  };

  const handleResend = async () => {
    if (!nomor) return;
    try {
      const res = await fetch('/api/auth/resend', {
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
                  {isRegistrationFlow ? 'Verifikasi Registrasi' : 'Verifikasi Login'}
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
                  <Center>
                    <PinInput
                      length={4}
                      value={otp}
                      onChange={setOtp}
                      onComplete={handleVerify}
                      inputMode="numeric"
                      size="lg"
                    />
                  </Center>
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