/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import daftarInformasiPublik from '@/app/admin/(dashboard)/_state/ppid/daftar_informasi_publik/daftarInformasiPublik';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Center,
  Divider,
  Paper,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';

export default function DetailInformasiPublikUser() {
  const state = useProxy(daftarInformasiPublik);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (params?.id) state.findUnique.load(params.id as string);
  }, [params?.id]);

  const data = state.findUnique.data;

  if (!state.findUnique.data) {
    return (
      <Center py="xl">
        <Skeleton height={500} radius="md" />
      </Center>
    );
  }

  if (!data) {
    return (
      <Center py="xl">
        <Stack align="center" gap="sm">
          <Text fz="lg" fw="bold">
            Informasi tidak ditemukan
          </Text>
          <Button variant="light" onClick={() => router.push('/informasi-publik')}>
            Kembali ke Daftar
          </Button>
        </Stack>
      </Center>
    );
  }

  return (
    <Box py="lg" px={{ base: 'md', md: 100 }} bg={colors.Bg}>
      {/* Tombol Kembali */}
      <Button
        variant="subtle"
        onClick={() => router.back()}
        leftSection={<IconArrowBack size={18} color={colors['blue-button']} />}
        mb="md"
        c={colors['blue-button']}
      >
        Kembali
      </Button>

      <Paper
        withBorder
        radius="lg"
        p={{ base: 'md', md: 'xl' }}
        mx="auto"
        maw={800}
        bg="white"
        shadow="xs"
      >
        <Stack gap="xl">
          <Text
            fz={{ base: 'xl', md: '2xl' }}
            fw="bold"
            ta="center"
            c={colors['blue-button']}
          >
            Detail Informasi Publik
          </Text>

          <Divider />

          <Stack gap="lg">
            <Box>
              <Text fz={{ base: 'md', md: 'lg' }} fw="bold" mb={4}>
                Jenis Informasi
              </Text>
              <Text fz={{ base: 'sm', md: 'md' }} c="dimmed">
                {data.jenisInformasi || '-'}
              </Text>
            </Box>

            <Box>
              <Text fz={{ base: 'md', md: 'lg' }} fw="bold" mb={4}>
                Tanggal Publikasi
              </Text>
              <Text fz={{ base: 'sm', md: 'md' }} c="dimmed">
                {data.tanggal
                  ? new Date(data.tanggal).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })
                  : '-'}
              </Text>
            </Box>

            <Box>
              <Text fz={{ base: 'md', md: 'lg' }} fw="bold" mb={4}>
                Deskripsi
              </Text>
              <Box
                className="prose max-w-none leading-relaxed"
                dangerouslySetInnerHTML={{ __html: data.deskripsi || '-' }}
                style={{wordBreak: "break-word", whiteSpace: "normal"}}
              />
            </Box>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}