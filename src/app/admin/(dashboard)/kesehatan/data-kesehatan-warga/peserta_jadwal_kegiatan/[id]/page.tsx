'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { ModalKonfirmasiHapus } from '../../../../_com/modalKonfirmasiHapus';
import pendaftaranJadwalKegiatanState from '../../../../_state/kesehatan/data_kesehatan_warga/pendafataranJadwalKegiatan';

function DetailPesertaJadwalKegiatan() {
  const state = useProxy(pendaftaranJadwalKegiatanState);
  const [modalHapus, setModalHapus] = useState(false);
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  useShallowEffect(() => {
    state.findUnique.load(id);
  }, []);

  const handleHapus = () => {
    state.delete.byId(id);
    setModalHapus(false);
    router.push("/admin/kesehatan/data-kesehatan-warga/peserta_jadwal_kegiatan");
  };

  if (!state.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={400} radius="md" />
      </Stack>
    );
  }

  const data = state.findUnique.data;

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
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
            Detail Peserta Kegiatan
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">Nama</Text>
                <Text fz="md" c="dimmed">{data.name || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Tanggal Lahir</Text>
                <Text fz="md" c="dimmed">{data.tanggal || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Nama Orang Tua/Wali</Text>
                <Text fz="md" c="dimmed">{data.namaOrangtua || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Nomor Telepon</Text>
                <Text fz="md" c="dimmed">{data.nomor || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Alamat</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word" }}>{data.alamat || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Catatan</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word" }}>{data.catatan || '-'}</Text>
              </Box>

              <Group gap="sm">
                <Button
                  color="red"
                  onClick={() => setModalHapus(true)}
                  variant="light"
                  radius="md"
                  size="md"
                  disabled={state.delete.loading}
                >
                  <IconTrash size={20} />
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Stack>
      </Paper>

      <ModalKonfirmasiHapus
        opened={modalHapus}
        loading={state.delete.loading}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah anda yakin ingin menghapus data peserta kegiatan ini?"
      />
    </Box>
  );
}

export default DetailPesertaJadwalKegiatan;
