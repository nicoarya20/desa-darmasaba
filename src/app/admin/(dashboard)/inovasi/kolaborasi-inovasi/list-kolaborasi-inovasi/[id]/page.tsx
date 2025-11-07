'use client'
import { Box, Button, Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import kolaborasiInovasiState from '@/app/admin/(dashboard)/_state/inovasi/kolaborasi-inovasi';
import colors from '@/con/colors';

function DetailKolaborasiInovasi() {
  const kolaborasiState = useProxy(kolaborasiInovasiState);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();

  useShallowEffect(() => {
    kolaborasiState.findUnique.load(params?.id as string);
  }, []);

  const handleHapus = () => {
    if (selectedId) {
      kolaborasiState.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push("/admin/inovasi/kolaborasi-inovasi/list-kolaborasi-inovasi");
    }
  };

  if (!kolaborasiState.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = kolaborasiState.findUnique.data;

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

      {/* Card utama */}
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
            Detail Kolaborasi Inovasi
          </Text>

          {/* Isi detail */}
          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">Nama Kolaborasi Inovasi</Text>
                <Text fz="md" c="dimmed">{data?.name || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Tahun</Text>
                <Text fz="md" c="dimmed">{data?.tahun || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Deskripsi Singkat</Text>
                <Text fz="md" style={{ wordBreak: "break-word", whiteSpace: "normal" }} c="dimmed">{data?.slug || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Deskripsi</Text>
                <Text fz="md" style={{ wordBreak: "break-word", whiteSpace: "normal" }} c="dimmed" dangerouslySetInnerHTML={{ __html: data?.deskripsi || '-' }} />
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Kolaborator</Text>
                <Text fz="md" c="dimmed">{data?.kolaborator || '-'}</Text>
              </Box>

              {/* Tombol aksi */}
              <Group gap="sm">
                <Button
                  color="red"
                  onClick={() => {
                    setSelectedId(data.id);
                    setModalHapus(true);
                  }}
                  variant="light"
                  radius="md"
                  size="md"
                  disabled={kolaborasiState.delete.loading}
                >
                  <IconTrash size={20} />
                </Button>

                <Button
                  color="green"
                  onClick={() => router.push(`/admin/inovasi/kolaborasi-inovasi/list-kolaborasi-inovasi/${data.id}/edit`)}
                  variant="light"
                  radius="md"
                  size="md"
                >
                  <IconEdit size={20} />
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Stack>
      </Paper>

      {/* Modal konfirmasi hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah anda yakin ingin menghapus kolaborasi inovasi ini?"
      />
    </Box>
  );
}

export default DetailKolaborasiInovasi;
