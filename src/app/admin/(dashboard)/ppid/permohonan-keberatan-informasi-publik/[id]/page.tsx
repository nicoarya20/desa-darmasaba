'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import statePermohonanKeberatan from '../../../_state/ppid/permohonan_keberatan_informasi_publik/permohonanKeberatanInformasi'


function DetailPermohonanKeberatanInformasiPublik() {
  const state = useProxy(statePermohonanKeberatan)
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
    <Box py="md">
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
        w={{ base: '100%', md: '60%' }}
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
                <Text fz="lg" fw="bold" mb={4}>Telepon</Text>
                <Text fz="md" c="dimmed">{data.notelp || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold" mb={4}>Email</Text>
                <Text fz="md" c="dimmed">{data.email || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold" mb={4}>Alasan</Text>
                <Text fz="md" c="dimmed" dangerouslySetInnerHTML={{ __html: data.alasan || '-' }}></Text>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Paper>
    </Box>
  );
}

export default DetailPermohonanKeberatanInformasiPublik;
