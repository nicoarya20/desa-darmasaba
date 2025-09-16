'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
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
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import grafikSektorUnggulan from '../../../_state/ekonomi/sektor-unggulan-desa';

function DetailSektorUnggulanDesa() {
  const stateGrafik = useProxy(grafikSektorUnggulan);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();

  useShallowEffect(() => {
    stateGrafik.findUnique.load(params?.id as string);
  }, []);

  const handleHapus = () => {
    if (selectedId) {
      stateGrafik.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push('/admin/ekonomi/sektor-unggulan-desa');
    }
  };

  if (!stateGrafik.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = stateGrafik.findUnique.data;

  return (
    <Box py={10}>
      {/* Tombol kembali */}
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
            Detail Sektor Unggulan Desa
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">Nama Sektor Unggulan</Text>
                <Text fz="md" c="dimmed">{data.name || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Deskripsi</Text>
                <Text ta={"justify"} fz="md" c="dimmed" dangerouslySetInnerHTML={{ __html: data.description || '-' }} />
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Jumlah</Text>
                <Text fz="md" c="dimmed">{data.value ?? '-'}</Text>
              </Box>

              {/* Tombol Aksi */}
              <Group gap="sm">
                <Tooltip label="Hapus Sektor Unggulan" withArrow position="top">
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

                <Tooltip label="Edit Sektor Unggulan" withArrow position="top">
                  <Button
                    color="green"
                    onClick={() =>
                      router.push(
                        `/admin/ekonomi/sektor-unggulan-desa/${data.id}/edit`
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

      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah anda yakin ingin menghapus sektor unggulan ini?"
      />
    </Box>
  );
}

export default DetailSektorUnggulanDesa;
