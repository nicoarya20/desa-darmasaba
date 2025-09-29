'use client'

import { Box, Button, Group, Paper, Skeleton, Stack, Text, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

import colors from '@/con/colors';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import lowonganKerjaState from '../../../_state/ekonomi/lowongan-kerja';

function DetailLowonganKerjaLokal() {
  const lowonganState = useProxy(lowonganKerjaState);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();

  useShallowEffect(() => {
    lowonganState.findUnique.load(params?.id as string);
  }, []);

  const handleHapus = () => {
    if (selectedId) {
      lowonganState.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push("/admin/ekonomi/lowongan-kerja-lokal");
    }
  };

  if (!lowonganState.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = lowonganState.findUnique.data;

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
        w={{ base: "100%", md: "70%" }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          <Text fz="2xl" fw="bold" c={colors['blue-button']}>
            Detail Lowongan Kerja Lokal
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">Bekerja Sebagai</Text>
                <Text fz="md" c="dimmed">{data.posisi || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Nama Usaha</Text>
                <Text fz="md" c="dimmed">{data.namaPerusahaan || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Lokasi</Text>
                <Text fz="md" c="dimmed">{data.lokasi || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Tipe Pekerjaan</Text>
                <Text fz="md" c="dimmed">{data.tipePekerjaan || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Gaji</Text>
                <Text fz="md" c="dimmed">{data.gaji || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Deskripsi</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data.deskripsi || '-' }} />
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Kualifikasi</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data.kualifikasi || '-' }} />
              </Box>

              <Group gap="sm" mt="sm">
                <Tooltip label="Hapus Lowongan" withArrow position="top">
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

                <Tooltip label="Edit Lowongan" withArrow position="top">
                  <Button
                    color="green"
                    onClick={() => router.push(`/admin/ekonomi/lowongan-kerja-lokal/${data.id}/edit`)}
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
        text="Apakah Anda yakin ingin menghapus lowongan kerja ini?"
      />
    </Box>
  );
}

export default DetailLowonganKerjaLokal;
