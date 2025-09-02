'use client'
import { useProxy } from 'valtio/utils';
import { Box, Button, Group, Paper, Skeleton, Stack, Text, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import colors from '@/con/colors';
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import infoSekolahPaud from '@/app/admin/(dashboard)/_state/pendidikan/info-sekolah-paud';

function DetailLembaga() {
  const detailState = useProxy(infoSekolahPaud.lembagaPendidikan);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();

  useShallowEffect(() => {
    detailState.findUnique.load(params?.id as string);
  }, []);

  const handleHapus = () => {
    if (selectedId) {
      detailState.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push("/admin/pendidikan/info-sekolah/lembaga");
    }
  };

  if (!detailState.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = detailState.findUnique.data;

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
        w={{ base: "100%", md: "60%" }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          <Text fz="2xl" fw="bold" c={colors['blue-button']}>
            Detail Lembaga
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">Nama</Text>
                <Text fz="md" c="dimmed">{data?.nama || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Jenjang Pendidikan</Text>
                <Text fz="md" c="dimmed">{data?.jenjangPendidikan?.nama || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Jumlah Siswa</Text>
                <Text fz="md" c="dimmed">{data?.siswa?.length ?? 0}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Jumlah Pengajar</Text>
                <Text fz="md" c="dimmed">{data?.pengajar?.length ?? 0}</Text>
              </Box>

              <Group gap="sm">
                <Tooltip label="Hapus Lembaga" withArrow position="top">
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

                <Tooltip label="Edit Lembaga" withArrow position="top">
                  <Button
                    color="green"
                    onClick={() =>
                      router.push(`/admin/pendidikan/info-sekolah/lembaga/${data.id}/edit`)
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
        text="Apakah anda yakin ingin menghapus lembaga ini?"
      />
    </Box>
  );
}

export default DetailLembaga;
