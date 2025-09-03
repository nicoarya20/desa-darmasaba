'use client'

import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { useShallowEffect } from '@mantine/hooks';
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import stateDesaPengumuman from '@/app/admin/(dashboard)/_state/desa/pengumuman';

export default function DetailPengumuman() {
  const pengumumanState = useProxy(stateDesaPengumuman);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();

  useShallowEffect(() => {
    pengumumanState.pengumuman.findUnique.load(params?.id as string);
  }, []);

  const handleHapus = () => {
    if (selectedId) {
      pengumumanState.pengumuman.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push('/admin/desa/pengumuman/list-pengumuman');
    }
  };

  if (!pengumumanState.pengumuman.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = pengumumanState.pengumuman.findUnique.data;

  return (
    <Box py={10}>
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
        <Stack gap="md">
          <Text fz="2xl" fw="bold" c={colors['blue-button']}>
            Detail Pengumuman
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">
                  Kategori
                </Text>
                <Text fz="md" c="dimmed">
                  {data?.CategoryPengumuman?.name || '-'}
                </Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">
                  Judul
                </Text>
                <Text fz="md" c="dimmed">
                  {data?.judul || '-'}
                </Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">
                  Deskripsi
                </Text>
                <Text fz="md" c="dimmed">
                  {data?.deskripsi || '-'}
                </Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">
                  Konten
                </Text>
                <Text
                  fz="md"
                  c="dimmed"
                  dangerouslySetInnerHTML={{
                    __html: data?.content || '-',
                  }}
                />
              </Box>

              <Group gap="sm">
                <Tooltip label="Hapus Pengumuman" withArrow position="top">
                  <Button
                    color="red"
                    onClick={() => {
                      setSelectedId(data.id);
                      setModalHapus(true);
                    }}
                    variant="light"
                    radius="md"
                    size="md"
                  >
                    <IconTrash size={20} />
                  </Button>
                </Tooltip>

                <Tooltip label="Edit Pengumuman" withArrow position="top">
                  <Button
                    color="green"
                    onClick={() =>
                      router.push(
                        `/admin/desa/pengumuman/list-pengumuman/${data.id}/edit`
                      )
                    }
                    variant="light"
                    radius="md"
                    size="md"
                  >
                    <IconEdit size={20} />
                  </Button>
                </Tooltip>
              </Group>
            </Stack>
          </Paper>
        </Stack>
      </Paper>

      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah anda yakin ingin menghapus pengumuman ini?"
      />
    </Box>
  );
}
