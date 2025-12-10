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
  Title,
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
          <Title order={4} fz={{ base: 'lg', md: 'xl' }} lh={1.3}>
            Informasi tidak ditemukan
          </Title>
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
          {/* MAIN TITLE */}
          <Title
            order={2}
            lh={1.2}
            ta="center"
            c={colors['blue-button']}
          >
            Detail Informasi Publik
          </Title>

          <Divider />

          {/* CONTENT */}
          <Stack gap="lg">
            {/* Jenis Informasi */}
            <Box px="lg">
              <Title order={5} fz={{ base: 'lg', md: 'xl' }} lh={1.3} mb={4}>
                Jenis Informasi
              </Title>
              <Text fz={{ base: 'sm', md: 'md' }} lh={1.5} c="black">
                {data.jenisInformasi || '-'}
              </Text>
            </Box>

            {/* Tanggal Publikasi */}
            <Box px="lg">
              <Title order={5} fz={{ base: 'lg', md: 'xl' }} lh={1.3} mb={4}>
                Tanggal Publikasi
              </Title>
              <Text fz={{ base: 'sm', md: 'md' }} lh={1.5} c="black">
                {data.tanggal
                  ? new Date(data.tanggal).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '-'}
              </Text>
            </Box>

            {/* Deskripsi */}
            <Box px="lg">
              <Title order={5} fz={{ base: 'lg', md: 'xl' }} lh={1.3} mb={4}>
                Deskripsi
              </Title>

              <Box>
                <Text
                  ta="justify"
                  dangerouslySetInnerHTML={{ __html: data.deskripsi || '-' }}
                  fz={{ base: 'sm', md: 'md' }}
                  lh={1.6}
                  style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                  className="prose max-w-none"
                />
              </Box>
            </Box>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
