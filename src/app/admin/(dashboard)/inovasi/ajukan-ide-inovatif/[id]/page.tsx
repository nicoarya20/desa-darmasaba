'use client'
import colors from '@/con/colors';
import { Box, Button, Flex, Paper, Skeleton, Stack, Text, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import ajukanIdeInovatifState from '../../../_state/inovasi/ajukan-ide-inovatif';

function DetailAjukanIdeInofativDesa() {
  const state = useProxy(ajukanIdeInovatifState);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();

  useShallowEffect(() => {
    state.findUnique.load(params?.id as string);
  }, []);

  const handleHapus = () => {
    if (selectedId) {
      state.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push("/admin/inovasi/ajukan-ide-inovatif");
    }
  };

  if (!state.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = state.findUnique.data;

  return (
    <Box py={10}>
      {/* Tombol Kembali */}
      <Button
        variant="subtle"
        onClick={() => router.back()}
        leftSection={<IconArrowBack size={24} color={colors['blue-button']} />}
        mb={15}
      >
        Kembali
      </Button>

      {/* Card Utama */}
      <Paper
        withBorder
        w={{ base: "100%", md: "80%", lg: "60%" }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          {/* Header */}
          <Flex justify="space-between" align="center">
            <Text fz="2xl" fw="bold" c={colors['blue-button']}>
              Detail Ajukan Ide Inovatif Desa
            </Text>

            <Tooltip label="Hapus Ide Inovatif" withArrow position="top">
              <Button
                color="red"
                onClick={() => {
                  setSelectedId(data.id);
                  setModalHapus(true);
                }}
                variant="light"
                radius="md"
                size="md"
                disabled={state.delete.loading}
              >
                <IconTrash size={20} />
              </Button>
            </Tooltip>
          </Flex>

          {/* Detail Data */}
          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">Nama</Text>
                <Text fz="md" c="dimmed">{data?.name || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Alamat</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data?.alamat || '-' }} />
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Nama Ide Inovatif</Text>
                <Text fz="md" c="dimmed">{data?.namaIde || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Deskripsi</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }}  dangerouslySetInnerHTML={{ __html: data?.deskripsi || '-' }} />
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Masalah</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }}>{data?.masalah || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Benefit</Text>
                <Text fz="md" c="dimmed">{data?.benefit || '-'}</Text>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Paper>

      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah anda yakin ingin menghapus ajukan ide inovatif ini?"
      />
    </Box>
  );
}

export default DetailAjukanIdeInofativDesa;
