'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import statepermohonanInformasiPublikForm from '../../../_state/ppid/permohonan_informasi_publik/permohonanInformasiPublik';

function DetailPermohonanInformasiPublik() {
  const state = useProxy(statepermohonanInformasiPublikForm.statepermohonanInformasiPublik)
  const router = useRouter()
  const params = useParams()

  useShallowEffect(() => {
    state.findUnique.load(params?.id as string)
  }, [params?.id])

  if (!state.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    )
  }

  const data = state.findUnique.data;

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
      <Button
        variant="subtle"
        onClick={() => router.back()}
        leftSection={<IconArrowBack size={24} color={colors['blue-button']} />}
        mb={15}
      >
        Kembali
      </Button>

      <Paper
        withBorder
        w={{ base: '100%', md: '70%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="xl">
          <Text fz="2xl" fw="bold" c={colors['blue-button']}>
            Detail Informasi Publik
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="lg">
            <Box>
                <Text fz="lg" fw="bold" mb={4}>Nama</Text>
                <Text fz="md" c="dimmed">{data.name || '-'}</Text>
              </Box>
              <Box>
                <Text fz="lg" fw="bold" mb={4}>NIK</Text>
                <Text fz="md" c="dimmed">{data.nik || '-'}</Text>
              </Box>
              <Box>
                <Text fz="lg" fw="bold" mb={4}>Telepon</Text>
                <Text fz="md" c="dimmed">{data.notelp || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold" mb={4}>Email</Text>
                <Text fz="md" c="dimmed">{data.email || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold" mb={4}>Jenis Informasi</Text>
                <Text fz="md" c="dimmed">{data.jenisInformasiDiminta?.name || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold" mb={4}>Cara Akses Informasi</Text>
                <Text fz="md" c="dimmed">{data.caraMemperolehInformasi?.name || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold" mb={4}>Cara Akses Salinan Informasi</Text>
                <Text fz="md" c="dimmed">{data.caraMemperolehSalinanInformasi?.name || '-'}</Text>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Paper>
    </Box>
  );
}

export default DetailPermohonanInformasiPublik;
